"""FastAPI Router for ORVIN Guardian - Autonomous Pre-Flight Gate & Memory Agent."""

import re
import httpx
from fastapi import APIRouter, HTTPException, Query, Request, status  # type: ignore
from typing import List, Optional, Dict, Any

from app.schemas.devops_agent import (
    PRAnalysisRequest,
    PRAnalysisResponse,
    IncidentRetentionRequest,
    MemoryItem,
    StoryModeStep,
    ScenarioPreset,
    ReflectionResponse,
    GitHubPRAnalyzeRequest,
    VerifyCustomPatchRequest
)
from app.engines.hindsight_devops_engine import hindsight_devops_engine
from app.engines.patch_sandbox_engine import patch_sandbox_engine

router = APIRouter(prefix="/devops-agent", tags=["ORVIN Guardian (DevOps Gate & Memory)"])

@router.post("/analyze-pr", response_model=PRAnalysisResponse)
async def analyze_pr_diff(request: PRAnalysisRequest):
    """Analyze a git PR diff or configuration change using Episodic Memory & Change Intelligence."""
    try:
        res = await hindsight_devops_engine.analyze_pr(
            diff=request.diff,
            scenario_id=request.scenario_id,
            mode=request.mode,
            pr_title=request.pr_title,
            pr_url=request.pr_url
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DevOps Agent analysis failed: {str(e)}")

@router.post("/analyze-github-pr", response_model=PRAnalysisResponse)
async def analyze_github_pr(request: GitHubPRAnalyzeRequest):
    """Fetch live unified diff from a public GitHub PR URL and evaluate blast radius."""
    pr_url = request.pr_url.strip()
    match = re.search(r"github\.com/([^/]+)/([^/]+)/pull/(\d+)", pr_url)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GitHub PR URL. Expected format: https://github.com/owner/repo/pull/123"
        )
    
    owner, repo, pr_number = match.group(1), match.group(2), match.group(3)
    diff_url = f"https://patch-diff.githubusercontent.com/raw/{owner}/{repo}/pull/{pr_number}.diff"
    
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(diff_url, headers={"User-Agent": "Orvin-Guardian-Agent"})
            if resp.status_code != 200:
                # Try GitHub API directly
                api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
                api_resp = await client.get(
                    api_url,
                    headers={"Accept": "application/vnd.github.v3.diff", "User-Agent": "Orvin-Guardian-Agent"}
                )
                if api_resp.status_code == 200:
                    raw_diff = api_resp.text
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Could not retrieve diff for PR #{pr_number} from GitHub. Status: {resp.status_code}"
                    )
            else:
                raw_diff = resp.text

        if not raw_diff.strip():
            raise HTTPException(status_code=400, detail="Retrieved empty diff from GitHub PR.")

        res = await hindsight_devops_engine.analyze_pr(
            diff=raw_diff,
            mode=request.mode,
            pr_title=f"{owner}/{repo} PR #{pr_number}",
            pr_url=pr_url
        )
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch and analyze GitHub PR: {str(e)}")

@router.post("/github/webhook")
async def github_webhook_listener(request: Request):
    """Receive GitHub webhook pull_request event, calculate blast radius, and format review comment."""
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    action = payload.get("action", "")
    pull_request = payload.get("pull_request")

    if not pull_request:
        return {"status": "ignored", "reason": "No pull_request object in webhook payload"}

    pr_title = pull_request.get("title", "Untitled PR")
    pr_url = pull_request.get("html_url", "")
    diff_url = pull_request.get("diff_url", "")

    raw_diff = ""
    if diff_url:
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                d_resp = await client.get(diff_url, headers={"User-Agent": "Orvin-Guardian-CI"})
                if d_resp.status_code == 200:
                    raw_diff = d_resp.text
        except Exception as e:
            print(f"[GITHUB WEBHOOK] Diff fetch note: {e}")

    if not raw_diff:
        raw_diff = f"# PR Title: {pr_title}\n# No diff retrieved from diff_url: {diff_url}"

    analysis = await hindsight_devops_engine.analyze_pr(
        diff=raw_diff,
        mode="day60",
        pr_title=pr_title,
        pr_url=pr_url
    )

    # Format automated GitHub Markdown review comment
    gate_badge = "🔴 **MERGE BLOCKED**" if analysis["risk_score"] >= 80 else "🟢 **MERGE APPROVED**"
    comment_body = f"""### 🛡️ ORVIN Guardian — Pre-Flight CI/CD Gate Report

| Metric | Assessment |
|---|---|
| **Pipeline Gate Decision** | {gate_badge} |
| **Blast Radius Risk Score** | **{analysis['risk_score']}%** ({analysis['risk_level']}) |
| **Recalled Memories** | {len(analysis['recalled_memories'])} past incident(s) |

#### ⚠️ Issues Identified:
{chr(10).join([f"- {issue}" for issue in analysis['issues_found']])}

#### 🧠 Enforced Prevention Rule:
> {analysis['prevention_rule']}

"""
    if analysis.get("suggested_patch"):
        comment_body += f"""<details>
<summary><b>🛠️ 1-Click Verified Auto-Patch Diff</b></summary>

```diff
{analysis['suggested_patch']}
```
</details>
"""

    return {
        "status": "evaluated",
        "action": action,
        "pr_title": pr_title,
        "pr_url": pr_url,
        "gate_decision": analysis["gate_decision"],
        "risk_score": analysis["risk_score"],
        "github_markdown_comment": comment_body
    }

@router.post("/verify-patch")
async def verify_custom_patch(request: VerifyCustomPatchRequest):
    """Validate a patch in an isolated sandbox with AST & syntax checks."""
    try:
        result = patch_sandbox_engine.verify_patch(
            diff=request.diff,
            patch=request.patch,
            prevention_rule=request.prevention_rule,
            category=request.category
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Patch verification failed: {str(e)}")

@router.post("/retain", response_model=MemoryItem)
async def retain_incident(request: IncidentRetentionRequest):
    """Ingest a new post-mortem or failure incident into persistent Episodic Memory."""
    try:
        memory = await hindsight_devops_engine.retain_incident(
            title=request.title,
            description=request.description,
            category=request.category,
            prevention_rule=request.prevention_rule,
            service=request.service or "ml-inference-service",
            severity=request.severity or "HIGH"
        )
        return memory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Incident retention failed: {str(e)}")

@router.get("/memories", response_model=List[MemoryItem])
async def get_memory_bank(query: Optional[str] = Query(None, description="Optional search filter")):
    """Query the active persistent Hindsight Memory Bank."""
    try:
        memories = await hindsight_devops_engine.get_all_memories()
        if query:
            q = query.lower()
            memories = [
                m for m in memories 
                if q in m["title"].lower() or q in m["summary"].lower() or q in m["category"].lower()
            ]
        return memories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory bank retrieval failed: {str(e)}")

@router.get("/reflect", response_model=ReflectionResponse)
async def episodic_reflection(category: Optional[str] = Query(None, description="Category to reflect on")):
    """Synthesize high-level architectural prevention rules from all retained post-mortems."""
    try:
        reflection = await hindsight_devops_engine.reflect_on_incidents(category=category)
        return reflection
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Episodic reflection failed: {str(e)}")

@router.get("/story-mode", response_model=List[StoryModeStep])
async def get_story_mode_timeline():
    """Retrieve 3-Stage Temporal Evolution Timeline for demo story mode."""
    return hindsight_devops_engine.get_story_mode_timeline()

@router.get("/scenarios", response_model=List[ScenarioPreset])
async def get_scenarios():
    """Retrieve pre-loaded enterprise scenarios for 1-click demo testing."""
    return hindsight_devops_engine.get_scenarios()
