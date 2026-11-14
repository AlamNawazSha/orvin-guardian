from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PRAnalysisRequest(BaseModel):
    diff: str = Field(..., description="Git diff or configuration change text to analyze")
    scenario_id: Optional[str] = Field(None, description="Pre-loaded scenario ID if selecting a preset")
    mode: str = Field("auto", description="Execution mode: 'day1' (no memory), 'day14' (recall), 'day60' (reflect & patch)")
    pr_title: Optional[str] = Field(None, description="Optional PR title")
    pr_url: Optional[str] = Field(None, description="Optional GitHub PR URL")
    service: Optional[str] = Field("ml-inference-service", description="Target service scope")
    environment: Optional[str] = Field("production", description="Target environment (production, staging, etc.)")

class IncidentRetentionRequest(BaseModel):
    title: str = Field(..., description="Short incident summary or post-mortem title")
    description: str = Field(..., description="Detailed failure description, stack trace, or root cause")
    category: str = Field("dependency", description="Category: dependency, hardware_oom, secret_drift, runtime_crash, schema_migration, concurrency")
    prevention_rule: str = Field(..., description="Synthesized rule or patch guideline")
    service: Optional[str] = Field("ml-inference-service", description="Affected microservice or component")
    environment: Optional[str] = Field("production", description="Affected environment")
    severity: Optional[str] = Field("HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    failed_fixes: Optional[List[str]] = Field(default_factory=list, description="Remedies that were attempted and FAILED during the incident")
    max_workers: Optional[int] = Field(None, description="Hardware-tested concurrency bound if applicable")

class MemoryItem(BaseModel):
    id: str
    timestamp: str
    title: str
    category: str
    summary: str
    prevention_rule: str
    severity: str = "HIGH"
    recall_score: Optional[float] = 0.95
    affected_service: Optional[str] = None
    environment: Optional[str] = "production"
    status: Optional[str] = "active"
    superseded_by: Optional[str] = None
    failed_fixes: Optional[List[str]] = Field(default_factory=list)
    max_workers: Optional[int] = None
    source: Optional[str] = None

class EvidenceFactor(BaseModel):
    category: str
    severity: str
    risk_points: int
    issue: str
    recommendation: Optional[str] = None

class PatchVerificationResult(BaseModel):
    is_verified: bool
    syntax_valid: bool
    rule_satisfied: bool
    checks_run: List[str]
    verification_status: str
    verification_log: str

class PRAnalysisResponse(BaseModel):
    mode: str
    risk_score: int = Field(..., ge=0, le=100, description="Blast radius / risk score (0-100%)")
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    gate_decision: Optional[str] = Field("BLOCKED", description="APPROVED, BLOCKED, WARNING, REQUIRES_CHANGES")
    recalled_memories: List[MemoryItem] = []
    rejected_memories: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Memories considered but rejected (e.g. wrong service/env or superseded)")
    failed_fixes_warned: Optional[List[str]] = Field(default_factory=list, description="Historical remediation attempts that FAILED in recalled incidents")
    issues_found: List[str] = []
    evidence_factors: List[Dict[str, Any]] = []
    prevention_rule: Optional[str] = None
    suggested_patch: Optional[str] = None
    patch_verification: Optional[Dict[str, Any]] = None
    explanation: str
    memory_used: bool

class DraftIncidentFromLogsRequest(BaseModel):
    logs: str = Field(..., description="Raw failure logs, error traces, or terminal output")
    service: Optional[str] = Field("ml-inference-service", description="Service where failure occurred")
    environment: Optional[str] = Field("production", description="Environment where failure occurred")

class DraftIncidentFromLogsResponse(BaseModel):
    title: str
    description: str
    root_cause: str
    prevention: str
    category: str
    failed_fixes: List[str] = []
    service: str
    environment: str
    status: str = "draft"
    notice: str

class SupersedeIncidentRequest(BaseModel):
    old_incident_id: str = Field(..., description="ID of incident being superseded")
    new_title: str
    new_prevention_rule: str
    new_max_workers: Optional[int] = None
    reason: str = Field(..., description="Reason for superseding (e.g., infrastructure upgrade)")

class StoryModeStep(BaseModel):
    day: str
    stage_name: str
    description: str
    risk_score: int
    risk_level: str
    recalled_count: int
    summary: str
    action_taken: str
    auto_patch_available: bool

class ScenarioPreset(BaseModel):
    id: str
    title: str
    category: str
    diff: str
    expected_risk_day1: int
    expected_risk_hindsight: int
    description: str

class ReflectionResponse(BaseModel):
    total_incidents_analyzed: int
    category_distribution: Dict[str, int]
    synthesized_rules: List[str]
    reflection_summary: str
    timestamp: str

class GitHubPRAnalyzeRequest(BaseModel):
    pr_url: str = Field(..., description="Public GitHub PR URL, e.g. https://github.com/owner/repo/pull/123")
    mode: str = Field("day60", description="Analysis mode")

class VerifyCustomPatchRequest(BaseModel):
    diff: str
    patch: str
    prevention_rule: Optional[str] = None
    category: Optional[str] = None

class PropagateAntibodyRequest(BaseModel):
    service_id: Optional[str] = Field(None, description="Specific service ID to vaccinate, or None to vaccinate all vulnerable services")
    antibody_id: Optional[str] = Field(None, description="Specific antibody ID to propagate, or None to match automatically")

