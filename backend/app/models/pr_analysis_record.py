import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, func, JSON
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class PRAnalysisRecord(Base):
    __tablename__ = 'pr_analysis_records'

    id = Column(String, primary_key=True, default=generate_uuid)
    pr_title = Column(String, nullable=True)
    pr_url = Column(String, nullable=True)
    scenario_id = Column(String, nullable=True)
    diff = Column(Text, nullable=False)
    mode = Column(String, default="auto")  # day1, day14, day60, live
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    gate_decision = Column(String, nullable=False)  # APPROVED, BLOCKED, WARNING
    recalled_memories = Column(JSON, nullable=True)
    issues_found = Column(JSON, nullable=True)
    evidence_breakdown = Column(JSON, nullable=True)
    prevention_rule = Column(Text, nullable=True)
    suggested_patch = Column(Text, nullable=True)
    patch_verified = Column(Boolean, default=False)
    patch_verification_log = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    memory_used = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

