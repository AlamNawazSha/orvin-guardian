# ORVIN Guardian — Memory-Powered Engineering Risk Intelligence & CI/CD Pre-Flight Gate

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-brightgreen.svg)](https://python.org)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.1.0-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal.svg)](https://fastapi.tiangolo.com)
[![Hindsight Memory](https://img.shields.io/badge/Memory-Vectorize%20Hindsight-purple.svg)](https://hindsight.vectorize.io/)
[![Groq Llama 3.3](https://img.shields.io/badge/LLM-Groq%20Llama%203.3%2070B-orange.svg)](https://groq.com)

> **"Don't just review the code. Remember what went wrong before."**

**ORVIN Guardian** is an autonomous engineering risk intelligence agent and pre-flight CI/CD gate powered by **Vectorize Hindsight Episodic Memory (Retain, Recall, Reflect)** and **Groq Llama 3.3 70B**. It intercepts catastrophic production outages, ABI dependency mismatches, GPU memory overcommits, and secret drift before pull requests are merged.

---

## 🛡️ The Problem: CI/CD Amnesia

In modern software and machine learning engineering:
- **Stateless CI/CD**: Standard deployment gates test syntax and unit tests in isolation. They have zero memory of past outages.
- **Recurring Disasters**: Engineering teams spend hours debugging an outage (e.g. NumPy 2.0 C-API ABI mismatch breaking compiled Cython extensions), write an extensive post-mortem, and weeks later another developer innocently submits a similar change and triggers the exact same failure.
- **The ORVIN Solution**: By embedding **persistent episodic memory**, ORVIN Guardian remembers every past post-mortem, failure trace, and remediation rule. It calculates an evidence-based blast radius and automatically generates verified, compiler-safe unified git `.patch` files in seconds.

---

## ⚡ Core Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                             ORVIN GUARDIAN                             │
│       Memory-Powered Pre-Flight CI/CD Gate & Risk Intelligence         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│   Episodic Memory Bank  │ │ Change Intelligence Engine│ │ Isolated Patch Sandbox  │
├─────────────────────────┤ ├─────────────────────────┤ ├─────────────────────────┤
│ • Vectorize Hindsight   │ │ • Dependency SemVer ABI │ │ • Unified Diff Syntax   │
│ • Persistent DB Store   │ │ • GPU / VRAM Overcommit │ │ • Python AST Parse      │
│ • Hybrid Semantic Recall│ │ • Secret & Config Drift │ │ • YAML Indentation Test │
│ • Cross-Cluster Reflect │ │ • Database Migration AST│ │ • Prevention Rule Check │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

### 1. Vectorize Hindsight Memory (Retain, Recall, Reflect)
- **Retain**: Ingests production failure traces and post-mortems via the official `hindsight-client` Python SDK into persistent storage.
- **Recall**: Queries multi-strategy hybrid memory with strict relevance thresholds (>0.65) to eliminate false associations.
- **Reflect**: Synthesizes enterprise-wide prevention guidelines from cluster analysis across stored incidents.

### 2. Deterministic Change Intelligence Engine
- Static AST and SemVer analysis calculates an evidence-based blast radius score ($0\text{--}100\%$) itemizing critical risk factors.
- Detects NumPy 2.0+ ABI incompatibilities, Kubernetes worker concurrency spikes (>4 workers causing GPU VRAM OOM evictions), undeclared production secrets, and destructive SQL schema drops.

### 3. Isolated Patch Sandbox Verification
- Proposed AI auto-patches are validated in a sandbox using Python AST parsing (`ast.parse`) and YAML structure checking to ensure they compile cleanly and satisfy prevention rules before presentation.

### 4. Live GitHub PR Ingestion & Webhook Gating
- Analyze live GitHub PR diffs directly by URL (`https://github.com/owner/repo/pull/123`).
- Listens on `POST /api/v1/devops-agent/github/webhook` to post automated GitHub Markdown review comments and commit status checks (`SUCCESS` vs `FAILURE`).

### 5. Interactive "Memory Evolution" Story Mode
- Live A/B toggle between **"Generic CI/CD (No Memory)"** (False Negative Outage) and **"ORVIN Guardian (Episodic Memory)"** (Interception + Auto-Patch).

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Node.js 18+ & npm

### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
pip install hindsight-client
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- **Web Console**: `http://localhost:3000`
- **ORVIN Guardian Pre-Flight Gate**: `http://localhost:3000/projects/p-101/devops-agent`

### 3. Run Automated Verification Suite
To verify database persistence, deterministic risk analysis, memory recall, and patch sandbox checks:
```bash
python backend/test_orvin_guardian.py
```

---

## 🧪 Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Episodic Memory** | Vectorize Hindsight Client (`hindsight-client`), Persistent SQLite / PostgreSQL |
| **Change Intelligence** | Python AST, SemVer analysis, Regex pattern engines |
| **Patch Validation** | Isolated Sandbox Runner (`ast.parse`, `pyyaml`) |
| **LLM Reasoning** | Groq API (`llama-3.3-70b-versatile`) / Gemini API |
| **Backend API** | FastAPI, SQLAlchemy AsyncIO, Pydantic v2, Uvicorn |
| **Frontend UI** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Design System** | Microsoft Light Cream Palette (`#FAF7F2` canvas, `#FFFDF9` surfaces, `#0F172A` slate) |

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
