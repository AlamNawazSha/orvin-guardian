"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { RiskGauge } from '@/components/devops/RiskGauge';
import { StoryModeStepper } from '@/components/devops/StoryModeStepper';
import { MemoryBankViewer } from '@/components/devops/MemoryBankViewer';
import { IncidentDiffViewer } from '@/components/devops/IncidentDiffViewer';
import { 
  BrainCircuit, ShieldAlert, Sparkles, Play, RefreshCw, 
  PlusCircle, Database, CheckCircle2, Layers, Zap, GitPullRequest,
  AlertTriangle, ShieldCheck, ArrowRight, Eye, Code, Terminal
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function DevOpsAgentPage() {
  const params = useParams();
  const projectId = (params?.id as string) || 'p-101';

  const [activeTab, setActiveTab] = useState<'story' | 'inspector' | 'github' | 'memory_bank' | 'retain'>('story');
  
  // Story Mode State
  const [storySteps, setStorySteps] = useState<any[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  // PR Inspector & Scenario State
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-numpy2');
  const [customDiff, setCustomDiff] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Live A/B Comparison Toggle (Amnesia vs ORVIN Guardian)
  const [comparisonMode, setComparisonMode] = useState<'memory' | 'amnesia'>('memory');

  // GitHub PR Ingestion State
  const [githubPrUrl, setGithubPrUrl] = useState('');
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Memory Bank State
  const [memories, setMemories] = useState<any[]>([]);

  // Retain Form State
  const [retainTitle, setRetainTitle] = useState('');
  const [retainCategory, setRetainCategory] = useState('dependency');
  const [retainSeverity, setRetainSeverity] = useState('CRITICAL');
  const [retainService, setRetainService] = useState('ml-inference-service');
  const [retainDesc, setRetainDesc] = useState('');
  const [retainRule, setRetainRule] = useState('');
  const [retaining, setRetaining] = useState(false);
  const [retainSuccess, setRetainSuccess] = useState(false);

  // Core analysis runner wrapped in useCallback for React hook stability
  const runPRAnalysis = useCallback(async (mode = 'auto', diffOverride?: string) => {
    setLoadingAnalysis(true);
    try {
      const activeMode = comparisonMode === 'amnesia' ? 'day1' : mode;
      const res = await fetch(`${API_BASE_URL}/devops-agent/analyze-pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diff: diffOverride || customDiff,
          scenario_id: selectedScenarioId,
          mode: activeMode
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      }
    } catch (e) {
      console.error("PR Analysis error:", e);
    } finally {
      setLoadingAnalysis(false);
    }
  }, [customDiff, selectedScenarioId, comparisonMode]);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;

    const fetchStoryMode = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/devops-agent/story-mode`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setStorySteps(data);
        }
      } catch (e) {
        console.error("Story mode fetch error:", e);
      }
    };

    const fetchScenarios = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/devops-agent/scenarios`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setScenarios(data);
          if (data.length > 0) {
            setCustomDiff(data[0].diff);
          }
        }
      } catch (e) {
        console.error("Scenarios fetch error:", e);
      }
    };

    const fetchMemories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/devops-agent/memories`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setMemories(data);
        }
      } catch (e) {
        console.error("Memories fetch error:", e);
      }
    };

    fetchStoryMode();
    fetchScenarios();
    fetchMemories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Trigger analysis when story step or comparison mode changes
  useEffect(() => {
    if (activeTab === 'story' && storySteps.length > 0) {
      const modes = ['day1', 'day14', 'day60'];
      runPRAnalysis(modes[activeStoryIdx]);
    }
  }, [activeStoryIdx, activeTab, storySteps.length, runPRAnalysis, comparisonMode]);

  const handleScenarioSelect = (sc: any) => {
    setSelectedScenarioId(sc.id);
    setCustomDiff(sc.diff);
    runPRAnalysis('day60', sc.diff);
  };

  const handleFetchGithubPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubPrUrl.trim()) return;
    setLoadingGithub(true);
    setGithubError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/devops-agent/analyze-github-pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pr_url: githubPrUrl.trim(),
          mode: 'day60'
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to analyze GitHub PR");
      }
      const data = await res.json();
      setAnalysisResult(data);
      if (data.suggested_patch || data.diff) {
        setCustomDiff(data.diff || "");
      }
    } catch (err: any) {
      setGithubError(err.message || "Failed to connect to GitHub");
    } finally {
      setLoadingGithub(false);
    }
  };

  const handleRetainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retainTitle || !retainRule) return;
    setRetaining(true);
    try {
      const res = await fetch(`${API_BASE_URL}/devops-agent/retain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: retainTitle,
          description: retainDesc,
          category: retainCategory,
          severity: retainSeverity,
          service: retainService,
          prevention_rule: retainRule
        })
      });
      if (res.ok) {
        setRetainSuccess(true);
        setRetainTitle('');
        setRetainDesc('');
        setRetainRule('');
        const memoriesRes = await fetch(`${API_BASE_URL}/devops-agent/memories`);
        if (memoriesRes.ok) {
          const updated = await memoriesRes.json();
          setMemories(updated);
        }
        setTimeout(() => setRetainSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Retain incident error:", e);
    } finally {
      setRetaining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in text-[#1F2937]">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 bg-[#FFFDF9] rounded-3xl border border-[#E5E0D8] shadow-sm relative overflow-hidden">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF] flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-700" />
              Episodic Memory Engine
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-700" />
              Llama 3.3 70B & Sandbox Proof
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              Deterministic AST Analysis
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight font-heading">
            ORVIN Guardian: Don't Just Review Code. Remember What Went Wrong Before.
          </h1>
          <p className="text-sm font-semibold text-[#6B7280]">
            Autonomous Pre-Flight CI/CD Gate powered by Episodic Memory (Retain, Recall, Reflect) and Change Intelligence
          </p>
          <p className="text-xs text-[#4B5563] leading-relaxed pt-1">
            Intercepts catastrophic production outages before merge by evaluating PR diffs, recalling semantic incident post-mortems, and generating compiler-safe, verified git patches.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F9F6F0] p-1.5 rounded-2xl border border-[#E5E0D8] shrink-0 self-start lg:self-center">
          <button
            onClick={() => setActiveTab('story')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'story'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#EFEBE0]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Story Mode
          </button>
          <button
            onClick={() => { setActiveTab('inspector'); runPRAnalysis('day60'); }}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inspector'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#EFEBE0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            PR Inspector
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#EFEBE0]'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-blue-400" />
            GitHub Live
          </button>
          <button
            onClick={() => setActiveTab('memory_bank')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'memory_bank'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#EFEBE0]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Memory Bank ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('retain')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'retain'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#EFEBE0]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Retain Incident
          </button>
        </div>
      </div>

      {/* ── TAB 1: STORY MODE ── */}
      {activeTab === 'story' && (
        <div className="space-y-6">
          <StoryModeStepper
            steps={storySteps}
            activeStepIndex={activeStoryIdx}
            onSelectStep={(idx) => setActiveStoryIdx(idx)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Risk Gauge & Gate Decision */}
            <div className="space-y-4">
              <RiskGauge
                score={analysisResult?.risk_score ?? 15}
                level={analysisResult?.risk_level ?? 'LOW'}
              />

              <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E5E0D8] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Pipeline Gate Decision</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Mode: {storySteps[activeStoryIdx]?.day || 'Day 1'}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  (analysisResult?.risk_score ?? 0) >= 80
                    ? 'bg-rose-100/90 text-rose-950 border-rose-300'
                    : 'bg-emerald-100/90 text-emerald-950 border-emerald-300'
                }`}>
                  {(analysisResult?.risk_score ?? 0) >= 80 ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>MERGE BLOCKED (Pre-Flight Gate Intercepted Outage)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{activeStoryIdx === 0 ? 'MERGE APPROVED (False Negative Outage!)' : 'MERGE APPROVED'}</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {analysisResult?.explanation || "Evaluating PR code diff..."}
                </p>

                {/* Evidence Factors Pills */}
                {analysisResult?.evidence_factors && analysisResult.evidence_factors.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E0D8] space-y-2">
                    <div className="text-[11px] font-bold text-[#111827] uppercase tracking-wider">Identified Risk Factors:</div>
                    <div className="space-y-1.5">
                      {analysisResult.evidence_factors.map((factor: any, i: number) => (
                        <div key={i} className="p-2 bg-[#F9F6F0] rounded-lg border border-[#E5E0D8] text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className={factor.severity === 'CRITICAL' ? 'text-rose-700' : 'text-amber-800'}>
                              {factor.severity}
                            </span>
                            <span className="text-slate-500 font-mono">+{factor.risk_points}% Risk</span>
                          </div>
                          <div className="text-[#374151] leading-tight">{factor.issue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed Historical Fixes to Avoid */}
                {analysisResult?.failed_fixes_warned && analysisResult.failed_fixes_warned.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E0D8] space-y-1.5">
                    <div className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1">
                      <span>⚠️ Failed Historical Remedies (Do Not Repeat):</span>
                    </div>
                    <div className="space-y-1">
                      {analysisResult.failed_fixes_warned.map((fix: string, idx: number) => (
                        <div key={idx} className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900">
                          {fix}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why Other Memories Were Rejected */}
                {analysisResult?.rejected_memories && analysisResult.rejected_memories.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E0D8] space-y-1">
                    <details className="text-[11px] text-slate-600">
                      <summary className="font-semibold cursor-pointer hover:text-slate-900">
                        🔍 Why other memories were rejected ({analysisResult.rejected_memories.length})
                      </summary>
                      <div className="mt-1 space-y-1 pl-2 max-h-32 overflow-y-auto">
                        {analysisResult.rejected_memories.map((rm: any, idx: number) => (
                          <div key={idx} className="text-[10px] text-slate-500">
                            <span className="font-medium text-slate-700">{rm.title}:</span> {rm.reason}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Code Diff & Auto Patch */}
            <div className="lg:col-span-2 space-y-4">
              <IncidentDiffViewer
                diff={customDiff}
                suggestedPatch={analysisResult?.suggested_patch}
                rule={analysisResult?.prevention_rule}
                patchVerification={analysisResult?.patch_verification}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PR INSPECTOR & SCENARIO TESTING ── */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          {/* Live A/B Toggle Bar */}
          <div className="flex items-center justify-between p-4 bg-[#FFFDF9] rounded-2xl border border-[#E5E0D8] shadow-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-[#111827]">Live Comparison Mode:</span>
            </div>
            <div className="flex items-center gap-2 bg-[#F9F6F0] p-1 rounded-xl border border-[#E5E0D8]">
              <button
                onClick={() => { setComparisonMode('amnesia'); runPRAnalysis('day1'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  comparisonMode === 'amnesia'
                    ? 'bg-rose-700 text-white shadow'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Generic CI/CD (No Memory)
              </button>
              <button
                onClick={() => { setComparisonMode('memory'); runPRAnalysis('day60'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  comparisonMode === 'memory'
                    ? 'bg-[#0F172A] text-white shadow'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                ORVIN Guardian (Episodic Memory)
              </button>
            </div>
          </div>

          {/* Scenario Buttons */}
          <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E5E0D8] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Select Enterprise Test Scenario:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleScenarioSelect(sc)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedScenarioId === sc.id
                      ? 'bg-[#FEF3C7] border-[#D97706] text-[#111827] shadow-sm font-semibold'
                      : 'bg-[#F9F6F0] border-[#E5E0D8] text-[#4B5563] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-800 mb-1">{sc.category.toUpperCase()}</div>
                  <div className="font-semibold text-xs text-[#111827] mb-1">{sc.title}</div>
                  <div className="text-[11px] text-[#6B7280] line-clamp-2">{sc.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Diff Input */}
          <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E5E0D8] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111827]">Custom Git PR Diff Input:</label>
              <button
                onClick={() => runPRAnalysis('day60')}
                disabled={loadingAnalysis}
                className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {loadingAnalysis ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Evaluate PR Diff
              </button>
            </div>
            <textarea
              value={customDiff}
              onChange={(e) => setCustomDiff(e.target.value)}
              rows={6}
              className="w-full p-3 bg-[#0F172A] border border-[#1E293B] rounded-xl font-mono text-xs text-[#E2E8F0] focus:outline-none focus:border-amber-500"
              placeholder="Paste unified git diff here..."
            />
          </div>

          {/* Analysis Output */}
          {analysisResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <RiskGauge
                  score={analysisResult.risk_score}
                  level={analysisResult.risk_level}
                />
                <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E5E0D8] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Pipeline Gate Decision</h4>
                  <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    analysisResult.risk_score >= 80
                      ? 'bg-rose-100/90 text-rose-950 border-rose-300'
                      : 'bg-emerald-100/90 text-emerald-950 border-emerald-300'
                  }`}>
                    {analysisResult.risk_score >= 80 ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                        <span>MERGE BLOCKED (High Outage Risk)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>MERGE APPROVED</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    {analysisResult.explanation}
                  </p>
                  {analysisResult.failed_fixes_warned && analysisResult.failed_fixes_warned.length > 0 && (
                    <div className="pt-2 border-t border-[#E5E0D8] space-y-1">
                      <div className="text-[10px] font-bold text-rose-900 uppercase">⚠️ Failed Remedies (Do Not Repeat):</div>
                      <ul className="list-disc pl-3 text-[10px] text-rose-800 space-y-0.5">
                        {analysisResult.failed_fixes_warned.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2">
                <IncidentDiffViewer
                  diff={customDiff}
                  suggestedPatch={analysisResult.suggested_patch}
                  rule={analysisResult.prevention_rule}
                  patchVerification={analysisResult.patch_verification}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: GITHUB LIVE INGESTION ── */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#E5E0D8] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E5E0D8]">
              <GitPullRequest className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-[#111827]">Live GitHub Pull Request Evaluation</h3>
                <p className="text-xs text-[#6B7280]">
                  Enter any public GitHub pull request link. ORVIN Guardian fetches the unified diff and executes the Pre-Flight Gate check.
                </p>
              </div>
            </div>

            <form onSubmit={handleFetchGithubPR} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={githubPrUrl}
                onChange={(e) => setGithubPrUrl(e.target.value)}
                placeholder="e.g. https://github.com/facebook/react/pull/28000"
                className="flex-1 p-3 bg-[#F9F6F0] border border-[#E5E0D8] rounded-xl text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-blue-600 font-mono"
              />
              <button
                type="submit"
                disabled={loadingGithub}
                className="px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loadingGithub ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Fetch & Analyze PR
              </button>
            </form>

            {githubError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{githubError}</span>
              </div>
            )}

            <div className="p-3 bg-[#F9F6F0] rounded-xl border border-[#E5E0D8] text-[11px] text-[#4B5563] space-y-1">
              <div className="font-bold text-[#111827]">⚡ GitHub Webhook Gating:</div>
              <div>ORVIN Guardian also listens on <code className="bg-white px-1 py-0.5 rounded border border-[#E5E0D8]">POST /api/v1/devops-agent/github/webhook</code> to post automated commit status checks and review comments.</div>
            </div>
          </div>

          {analysisResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <RiskGauge
                  score={analysisResult.risk_score}
                  level={analysisResult.risk_level}
                />
                <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E5E0D8] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Pipeline Gate Decision</h4>
                  <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    analysisResult.risk_score >= 80
                      ? 'bg-rose-100/90 text-rose-950 border-rose-300'
                      : 'bg-emerald-100/90 text-emerald-950 border-emerald-300'
                  }`}>
                    {analysisResult.risk_score >= 80 ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                        <span>MERGE BLOCKED (Status: Failure)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>MERGE APPROVED (Status: Success)</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    {analysisResult.explanation}
                  </p>
                  {analysisResult.failed_fixes_warned && analysisResult.failed_fixes_warned.length > 0 && (
                    <div className="pt-2 border-t border-[#E5E0D8] space-y-1">
                      <div className="text-[10px] font-bold text-rose-900 uppercase">⚠️ Failed Remedies (Do Not Repeat):</div>
                      <ul className="list-disc pl-3 text-[10px] text-rose-800 space-y-0.5">
                        {analysisResult.failed_fixes_warned.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2">
                <IncidentDiffViewer
                  diff={customDiff}
                  suggestedPatch={analysisResult.suggested_patch}
                  rule={analysisResult.prevention_rule}
                  patchVerification={analysisResult.patch_verification}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: EPISODIC MEMORY BANK ── */}
      {activeTab === 'memory_bank' && (
        <MemoryBankViewer memories={memories} />
      )}

      {/* ── TAB 5: RETAIN NEW INCIDENT FORM ── */}
      {activeTab === 'retain' && (
        <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#E5E0D8] shadow-sm max-w-2xl mx-auto space-y-5">
          <div className="space-y-1 pb-3 border-b border-[#E5E0D8]">
            <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Ingest Post-Mortem into Episodic Memory
            </h3>
            <p className="text-xs text-[#6B7280]">
              Add real incident traces and prevention rules. ORVIN Guardian immediately persists this memory to database storage and Hindsight Cloud.
            </p>
          </div>

          {retainSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Incident successfully retained and persisted in Episodic Memory Bank!
            </div>
          )}

          <form onSubmit={handleRetainSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">Incident Title / Summary:</label>
              <input
                type="text"
                required
                value={retainTitle}
                onChange={(e) => setRetainTitle(e.target.value)}
                placeholder="e.g. Incident #108: Redis Auth Secret Missing in K8s Prod"
                className="w-full p-2.5 bg-[#F9F6F0] border border-[#E5E0D8] rounded-xl text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Category:</label>
                <select
                  value={retainCategory}
                  onChange={(e) => setRetainCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#F9F6F0] border border-[#E5E0D8] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-indigo-600"
                >
                  <option value="dependency">Dependency ABI Break</option>
                  <option value="hardware_oom">GPU VRAM OOM</option>
                  <option value="secret_drift">Secret Drift</option>
                  <option value="schema_migration">DB Migration</option>
                  <option value="runtime_crash">Runtime Crash</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Severity:</label>
                <select
                  value={retainSeverity}
                  onChange={(e) => setRetainSeverity(e.target.value)}
                  className="w-full p-2.5 bg-[#F9F6F0] border border-[#E5E0D8] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-indigo-600"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Affected Service:</label>
                <input
                  type="text"
                  value={retainService}
                  onChange={(e) => setRetainService(e.target.value)}
                  className="w-full p-2.5 bg-[#F9F6F0] border border-[#E5E0D8] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">Detailed Description & Stack Trace:</label>
              <textarea
                rows={3}
                value={retainDesc}
                onChange={(e) => setRetainDesc(e.target.value)}
                placeholder="Paste root cause, stack trace, or failure details..."
                className="w-full p-2.5 bg-[#F9F6F0] border border-[#E5E0D8] rounded-xl text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">Synthesized Prevention Rule:</label>
              <input
                type="text"
                required
                value={retainRule}
                onChange={(e) => setRetainRule(e.target.value)}
                placeholder="e.g. Always validate REDIS_AUTH_TOKEN in secrets manifest before merge."
                className="w-full p-2.5 bg-[#F9F6F0] border border-[#E5E0D8] rounded-xl text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={retaining}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {retaining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Retain Incident in Memory Bank
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
