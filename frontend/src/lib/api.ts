/**
 * AutoMLOps API Client
 * 
 * Centralized API client for communicating with the FastAPI backend.
 * Handles authentication, error handling, CORS fallbacks, and all API endpoints.
 */

const DEFAULT_CLOUD_API_URL = 'https://mlops-ckjk.onrender.com/api/v1';

function normalizeBaseURL(url: string): string {
  let u = url.trim().replace(/\/+$/, '');
  if (!u.endsWith('/api/v1') && !u.endsWith('/api')) {
    u = `${u}/api/v1`;
  }
  return u;
}

function getCandidateBaseURLs(): string[] {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return [normalizeBaseURL(process.env.NEXT_PUBLIC_API_URL), DEFAULT_CLOUD_API_URL, '/api/v1'];
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host.includes('vercel.app')) {
      return [DEFAULT_CLOUD_API_URL, '/api/v1'];
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return ['http://127.0.0.1:8000/api/v1', 'http://localhost:8000/api/v1', DEFAULT_CLOUD_API_URL, '/api/v1'];
    }
    return [DEFAULT_CLOUD_API_URL, '/api/v1'];
  }
  return [DEFAULT_CLOUD_API_URL];
}

async function ensureAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem('token');
  if (token) return token;
  try {
    const baseURL = getCandidateBaseURLs()[0];
    const res = await fetch(`${baseURL}/auth/demo-token`, {
      method: 'POST',
      headers: { 'x-demo-mode': 'true', 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        return data.access_token;
      }
    }
  } catch {
    // fallback gracefully
  }
  return null;
}

/**
 * Core fetch wrapper with auth token, CORS error handling, resilience, and retry.
 */
async function fetchAPI(endpoint: string, options: RequestInit & { _isRetry?: boolean } = {}): Promise<any> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
    if (!token && !endpoint.includes('/auth/')) {
      token = await ensureAuthToken();
    }
  }

  const headers: Record<string, string> = {
    'x-demo-mode': 'true',
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseURLs = getCandidateBaseURLs();
  let lastError: any = null;

  for (const baseURL of baseURLs) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined' && !options._isRetry) {
          localStorage.removeItem('token');
          const freshToken = await ensureAuthToken();
          if (freshToken) {
            return fetchAPI(endpoint, { ...options, _isRetry: true });
          }
        }

        const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        const message = error.detail || error.message || `API Error: ${response.status}`;
        throw new Error(message);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return response;
    } catch (err: any) {
      lastError = err;
      // If the server answered with an error response (or client aborted), fail immediately rather than probing sleeping cloud URLs
      const isNetworkDown = !err.message || err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('ECONNREFUSED');
      if (!isNetworkDown) {
        throw err;
      }
      continue;
    }
  }

  throw new Error(lastError?.message || `Unable to connect to AutoMLOps backend server at ${baseURLs[0]}. Please ensure backend is running.`);
}

/**
 * Download helper for file responses (ZIP archives, models, etc.)
 */
async function downloadFile(endpoint: string, filename: string): Promise<void> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers: Record<string, string> = {
    'x-demo-mode': 'true',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseURL = getCandidateBaseURLs()[0];
  const response = await fetch(`${baseURL}${endpoint}`, { headers });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ─────────────────────────────────────────────────
// API Namespace
// ─────────────────────────────────────────────────
export const api = {
  // ── Authentication ──
  auth: {
    register: (data: { email: string; username: string; password: string }) =>
      fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    getMe: () =>
      fetchAPI('/auth/me'),
  },

  // ── Projects ──
  projects: {
    list: () =>
      fetchAPI('/projects'),

    create: (data: { name: string; description?: string; task_type?: string; target_column?: string }) =>
      fetchAPI('/projects', { method: 'POST', body: JSON.stringify(data) }),

    get: (id: string) =>
      fetchAPI(`/projects/${id}`),

    update: (id: string, data: Record<string, any>) =>
      fetchAPI(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
      fetchAPI(`/projects/${id}`, { method: 'DELETE' }),
  },

  // ── Datasets ──
  datasets: {
    upload: (projectId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchAPI(`/projects/${projectId}/datasets`, {
        method: 'POST',
        body: formData,
      });
    },

    list: (projectId: string) =>
      fetchAPI(`/projects/${projectId}/datasets`),

    get: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}`),

    preview: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}/preview`),

    delete: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}`, { method: 'DELETE' }),
  },

  // ── Analysis ──
  analysis: {
    analyze: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}/analyze`, { method: 'POST' }),

    getReport: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}/analysis`),
  },

  // ── Cleaning ──
  cleaning: {
    suggest: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}/clean/suggest`, { method: 'POST' }),

    apply: (datasetId: string, config: Record<string, boolean>) =>
      fetchAPI(`/datasets/${datasetId}/clean/apply`, {
        method: 'POST',
        body: JSON.stringify(config),
      }),

    history: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}/clean/history`),
  },

  // ── Feature Engineering ──
  features: {
    engineer: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}/features/engineer`, { method: 'POST' }),

    get: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}/features`),

    importance: (datasetId: string) =>
      fetchAPI(`/datasets/${datasetId}/features/importance`),
  },

  // ── Training ──
  training: {
    start: (projectId: string, config?: Record<string, any>) =>
      fetchAPI(`/projects/${projectId}/train`, {
        method: 'POST',
        body: JSON.stringify(config || {}),
      }),

    leaderboard: (projectId: string) =>
      fetchAPI(`/projects/${projectId}/leaderboard`),

    getModel: (modelId: string) =>
      fetchAPI(`/models/${modelId}`),

    getPipelineRecipe: (modelId: string) =>
      fetchAPI(`/models/${modelId}/pipeline`),

    getPipelineRecipeByVersion: (projectId: string, version: number) =>
      fetchAPI(`/projects/${projectId}/pipeline/v${version}`),

    selectModel: (modelId: string) =>
      fetchAPI(`/models/${modelId}/select`, { method: 'POST' }),
  },

  // ── Explainability ──
  explain: {
    getReport: (modelId: string) =>
      fetchAPI(`/models/${modelId}/explain`),

    getShap: (modelId: string) =>
      fetchAPI(`/models/${modelId}/shap`),
  },

  // ── API Generation ──
  apiGen: {
    generate: (modelId: string) =>
      fetchAPI(`/models/${modelId}/generate-api`, { method: 'POST' }),

    getCode: (modelId: string) =>
      fetchAPI(`/models/${modelId}/api-code`),

    download: (modelId: string, modelName: string) =>
      downloadFile(`/models/${modelId}/download-api`, `${modelName}_api.zip`),
  },

  // ── AI Assistant ──
  assistant: {
    ask: (projectId: string, question: string) =>
      fetchAPI(`/projects/${projectId}/assistant/ask`, {
        method: 'POST',
        body: JSON.stringify({ question }),
      }),

    suggestions: (projectId: string) =>
      fetchAPI(`/projects/${projectId}/assistant/suggestions`),
  },

  // ── AI Decision Engine ──
  decision: {
    get: (projectId: string, datasetId?: string) => {
      const q = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
      return fetchAPI(`/projects/${projectId}/decisions${q}`);
    },

    generate: (projectId: string, datasetId?: string) => {
      const q = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
      return fetchAPI(`/projects/${projectId}/decisions/generate${q}`, { method: 'POST' });
    },
  },

  // ── What-If Model Simulator ──
  simulator: {
    getSchema: (projectId: string, datasetId?: string) => {
      const q = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
      return fetchAPI(`/projects/${projectId}/simulator/schema${q}`);
    },

    run: (projectId: string, payload: Record<string, any>) =>
      fetchAPI(`/projects/${projectId}/simulator/run`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // ── Self-Healing Pipeline ──
  selfHealing: {
    getStatus: (projectId: string) =>
      fetchAPI(`/projects/${projectId}/self-healing/status`),

    trigger: (projectId: string, failureType: string) =>
      fetchAPI(`/projects/${projectId}/self-healing/trigger`, {
        method: 'POST',
        body: JSON.stringify({ failure_type: failureType, simulation_mode: true }),
      }),

    resetCircuitBreaker: (projectId: string) =>
      fetchAPI(`/projects/${projectId}/self-healing/circuit-breaker/reset`, {
        method: 'POST',
      }),
  },

  // ── Cost & Carbon Optimizer ──
  costCarbon: {
    getEstimate: (projectId: string, datasetId?: string) => {
      const q = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
      return fetchAPI(`/projects/${projectId}/cost-carbon/estimate${q}`);
    },

    calculate: (projectId: string, payload: Record<string, any>) =>
      fetchAPI(`/projects/${projectId}/cost-carbon/calculate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // ── Model Health & Production Readiness Score ──
  readiness: {
    getScore: (projectId: string, datasetId?: string) => {
      const q = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
      return fetchAPI(`/projects/${projectId}/readiness/score${q}`);
    },
  },

  // ── Experiment Tracking (MLflow-style) ──
  experiments: {
    list: (projectId: string, params?: { algorithm?: string; model_version?: number }) => {
      const sp = new URLSearchParams();
      if (params?.algorithm) sp.append('algorithm', params.algorithm);
      if (params?.model_version) sp.append('model_version', String(params.model_version));
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return fetchAPI(`/projects/${projectId}/experiments${q}`);
    },

    get: (runId: string) =>
      fetchAPI(`/experiments/${runId}`),

    compare: (projectId: string, runIds: string[]) =>
      fetchAPI(`/projects/${projectId}/experiments/compare`, {
        method: 'POST',
        body: JSON.stringify({ run_ids: runIds }),
      }),

    delete: (runId: string) =>
      fetchAPI(`/experiments/${runId}`, { method: 'DELETE' }),
  },

  // ── Centralized Version Lineage & Rollback ──
  versionLineage: {
    getHistory: (projectId: string) =>
      fetchAPI(`/projects/${projectId}/version-history`),

    rollback: (projectId: string, targetVersion: number, modelId?: string) =>
      fetchAPI(`/projects/${projectId}/rollback`, {
        method: 'POST',
        body: JSON.stringify({ target_version: targetVersion, model_id: modelId }),
      }),
  },

  // ── Research-to-Experiment & Objective-Based Intelligence ──
  research: {
    getPapers: (projectId: string) =>
      fetchAPI(`/projects/${projectId}/research/papers`),

    uploadPaper: (projectId: string, payload: { title?: string; content: string }) =>
      fetchAPI(`/projects/${projectId}/research/upload-paper`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getComparison: (projectId: string, paperId?: string) => {
      const q = paperId ? `?paper_id=${encodeURIComponent(paperId)}` : '';
      return fetchAPI(`/projects/${projectId}/research/compare${q}`);
    },

    recommendByObjective: (projectId: string, objective: string) =>
      fetchAPI(`/projects/${projectId}/research/recommend-by-objective`, {
        method: 'POST',
        body: JSON.stringify({ objective }),
      }),

    getDatasetHealth: (projectId: string, datasetId?: string) => {
      const q = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
      return fetchAPI(`/projects/${projectId}/research/dataset-health${q}`);
    },
  },
};