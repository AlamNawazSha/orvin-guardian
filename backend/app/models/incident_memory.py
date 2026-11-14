import uuid
from sqlalchemy import Column, String, Text, DateTime, Float, Integer, func
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class IncidentMemory(Base):
    __tablename__ = 'incident_memories'

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False, default="dependency")  # dependency, hardware_oom, secret_drift, schema_migration, runtime_crash
    severity = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    summary = Column(Text, nullable=False)
    stack_trace = Column(Text, nullable=True)
    prevention_rule = Column(Text, nullable=False)
    affected_service = Column(String, default="ml-inference-service")
    environment = Column(String, default="production")  # production, staging, development, all
    status = Column(String, default="active")  # active, superseded, retired
    superseded_by = Column(String, nullable=True)
    retirement_reason = Column(Text, nullable=True)
    failed_fixes = Column(Text, nullable=True)  # JSON-encoded list of unsuccessful remedy attempts to avoid
    max_workers = Column(Integer, nullable=True)  # Hardware-tested concurrency bound if applicable
    recall_score = Column(Float, default=0.95)
    recall_count = Column(Integer, default=0)
    source = Column(String, default="enterprise_postmortem")  # enterprise_postmortem, github_pr, manual_retention
    tags = Column(String, nullable=True)  # comma-separated tags
    remediation_patch = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

