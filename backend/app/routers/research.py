from fastapi import APIRouter, Depends, HTTPException, Query  # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession  # type: ignore
from sqlalchemy.future import select  # type: ignore
from typing import Optional, Dict, Any
import pandas as pd  # type: ignore
import os
from pydantic import BaseModel  # type: ignore

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.dataset import Dataset
from app.models.trained_model import TrainedModel
from app.engines.research_intelligence_engine import (
    list_research_papers,
    parse_custom_paper_text,
    generate_research_comparison,
    rank_models_by_objective,
    audit_dataset_health_and_reliability
)

router = APIRouter(prefix="", tags=["research"])

class CustomPaperRequest(BaseModel):
    title: Optional[str] = None
    content: str

class ObjectiveRequest(BaseModel):
    objective: str = "predictive_performance"

@router.get("/projects/{project_id}/research/papers")
async def get_research_papers(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns curated peer-reviewed research papers with benchmark algorithms and reported metrics.
    """
    return {
        "project_id": project_id,
        "papers": list_research_papers()
    }

@router.post("/projects/{project_id}/research/upload-paper")
async def upload_custom_paper(
    project_id: str,
    payload: CustomPaperRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts research paper text/abstract and extracts benchmark algorithms, reported metrics, and research limitations.
    """
    if not payload.content or len(payload.content.strip()) < 10:
        raise HTTPException(status_code=400, detail="Paper text content is required (min 10 characters)")

    extracted = parse_custom_paper_text(text=payload.content, title=payload.title)
    return {
        "project_id": project_id,
        "extracted_paper": extracted
    }

@router.get("/projects/{project_id}/research/compare")
async def get_research_comparison(
    project_id: str,
    paper_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Produces the Research-to-Experiment Comparison Matrix matching published paper benchmarks
    against ORVIN's actual trained models on this project's dataset.
    """
    # Fetch project models
    models_res = await db.execute(
        select(TrainedModel).filter(TrainedModel.project_id == project_id).order_by(TrainedModel.version.desc())
    )
    models = models_res.scalars().all()

    model_dicts = [
        {
            "id": m.id,
            "algorithm": m.algorithm,
            "metrics": m.metrics or {},
            "version": m.version,
            "training_time_seconds": m.training_time_seconds,
            "is_selected": m.is_selected
        }
        for m in models
    ]

    comparison = generate_research_comparison(
        project_trained_models=model_dicts,
        paper_id=paper_id
    )
    comparison["project_id"] = project_id
    return comparison

@router.post("/projects/{project_id}/research/recommend-by-objective")
async def get_model_recommendations_by_objective(
    project_id: str,
    payload: ObjectiveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ranks trained models dynamically based on user-selected enterprise objective:
    - highest predictive performance (F1 / AUC)
    - ultra-low latency (<10ms)
    - strict interpretability & compliance (SHAP / explainability)
    - green ML & edge-constrained (minimal RAM & carbon)
    - imbalanced recall prioritization
    """
    models_res = await db.execute(
        select(TrainedModel).filter(TrainedModel.project_id == project_id).order_by(TrainedModel.version.desc())
    )
    models = models_res.scalars().all()

    model_dicts = [
        {
            "id": m.id,
            "algorithm": m.algorithm,
            "metrics": m.metrics or {},
            "version": m.version,
            "training_time_seconds": m.training_time_seconds,
            "is_selected": m.is_selected
        }
        for m in models
    ]

    result = rank_models_by_objective(
        project_trained_models=model_dicts,
        objective=payload.objective
    )
    result["project_id"] = project_id
    return result

@router.get("/projects/{project_id}/research/dataset-health")
async def get_dataset_health_audit(
    project_id: str,
    dataset_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Computes a formal Dataset Health Score (0-100) and ML Reliability Pre-Flight Audit:
    - Missing Values
    - Duplicate Records
    - Target Leakage Check
    - Class Imbalance Severity
    - Feature Multicollinearity (VIF)
    - Outlier Distribution
    """
    proj_res = await db.execute(select(Project).filter(Project.id == project_id))
    project = proj_res.scalars().first()
    task_type = project.task_type if project and project.task_type else "classification"
    target_col = project.target_column if project else None

    if dataset_id:
        ds_res = await db.execute(select(Dataset).filter(Dataset.id == dataset_id))
        dataset = ds_res.scalars().first()
    else:
        ds_res = await db.execute(
            select(Dataset).filter(Dataset.project_id == project_id).order_by(Dataset.uploaded_at.desc())
        )
        dataset = ds_res.scalars().first()

    if not dataset or not os.path.exists(dataset.file_path):
        raise HTTPException(status_code=404, detail="Dataset not found for this project")

    try:
        df = pd.read_csv(dataset.file_path) if dataset.file_type == 'csv' else pd.read_excel(dataset.file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read dataset file: {str(e)}")

    audit = audit_dataset_health_and_reliability(
        df=df,
        target_col=target_col,
        task_type=task_type
    )
    audit["project_id"] = project_id
    audit["dataset_id"] = dataset.id
    audit["dataset_filename"] = dataset.filename
    return audit
