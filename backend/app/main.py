import sys
import os

# Guarantee current backend directory is at front of Python path for reliable imports on Render/Linux
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request  # type: ignore
from fastapi.responses import JSONResponse  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
import traceback

try:
    from app.config import settings
    from app.database import init_db
    from app.routers import (
        auth, projects, datasets, analysis, cleaning, features,
        training, explain, api_gen, assistant, decision, simulator,
        self_healing, cost_carbon, readiness, experiments,
        version_lineage, devops_agent
    )
except (ImportError, ModuleNotFoundError):
    from .config import settings  # type: ignore
    from .database import init_db  # type: ignore
    from .routers import (  # type: ignore
        auth, projects, datasets, analysis, cleaning, features,
        training, explain, api_gen, assistant, decision, simulator,
        self_healing, cost_carbon, readiness, experiments,
        version_lineage, devops_agent
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    try:
        from app.database import AsyncSessionLocal
        from app.seed import seed_demo_data
        async with AsyncSessionLocal() as session:
            await seed_demo_data(session)
    except Exception as e:
        print(f"[STARTUP] Seeding check info: {e}")
    yield

app = FastAPI(
    title="ORVIN Guardian — Pre-Flight CI/CD Gate & Memory Engine",
    description="Persistent Memory Engineering Intelligence Agent that intercepts production outages before merge.",
    version="2.0.0",
    lifespan=lifespan
)

# Standardized, secure CORS middleware
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if hasattr(settings, "CORS_ORIGINS") and settings.CORS_ORIGINS:
    for o in settings.CORS_ORIGINS:
        if o not in allowed_origins and o != "*":
            allowed_origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.onrender\.com)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[API ERROR] 500 on {request.method} {request.url.path}: {exc}")
    traceback.print_exc()
    error_msg = str(exc) if getattr(settings, "DEBUG", True) else "Internal Server Error"
    return JSONResponse(
        status_code=500,
        content={"detail": error_msg}
    )

# Dual-mount all routers at both /api/v1 and /api for zero-configuration URL compatibility
routers = [
    auth.router, projects.router, datasets.router, analysis.router,
    cleaning.router, features.router, training.router, explain.router,
    api_gen.router, assistant.router, decision.router, simulator.router,
    self_healing.router, cost_carbon.router, readiness.router, experiments.router,
    version_lineage.router, devops_agent.router
]

for pfx in ["/api/v1", "/api"]:
    for r in routers:
        app.include_router(r, prefix=pfx)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ORVIN Guardian",
        "engine": "Hindsight Episodic Memory + Change Intelligence"
    }

@app.get("/")
async def root():
    return {
        "app": "ORVIN Guardian",
        "tagline": "Don't just review the code. Remember what went wrong before.",
        "version": "2.0.0",
        "build": "2026-hackathon-champion-ready",
        "status": "healthy",
        "docs": "/docs"
    }
