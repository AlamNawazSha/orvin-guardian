"""Comprehensive End-to-End Workflow & Test Suite for ORVIN Guardian.

Executes and verifies every process flow across:
1. Health & Server Metadata
2. Episodic Memory Bank Persistence (Retain, Recall, Filter)
3. Episodic Reflection (Cluster Synthesis)
4. Multi-Factor Change Intelligence & Blast Radius (All 6 Scenarios)
5. Isolated Patch Sandbox AST & Rule Verification
6. GitHub Webhook CI/CD Gating & Markdown Review Generation
7. Authentication & Security Boundary Enforcement
8. Frontend Next.js Endpoint Availability
"""

import sys
import os
import json
import httpx

BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:3000"

class TestSuiteRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []

    def assert_test(self, name: str, condition: bool, details: str = ""):
        if condition:
            self.passed += 1
            print(f"  ✅ PASS: {name}")
            self.results.append({"name": name, "status": "PASS", "details": details})
        else:
            self.failed += 1
            print(f"  ❌ FAIL: {name} - {details}")
            self.results.append({"name": name, "status": "FAIL", "details": details})

    def run_all(self):
        print("=" * 70)
        print("🛡️  ORVIN GUARDIAN — COMPREHENSIVE END-TO-END PROCESSFLOW VERIFICATION")
        print("=" * 70)

        with httpx.Client(timeout=15.0) as client:
            # ─────────────────────────────────────────────────────────────
            # SECTION 1: HEALTH & SYSTEM STATUS
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 1: Core System & Health Verification]")
            try:
                r = client.get(f"{BASE_URL}/health")
                self.assert_test("Backend Health Endpoint", r.status_code == 200, f"Status: {r.status_code}")
                data = r.json()
                self.assert_test("Health Engine Status", data.get("status") == "healthy" and "Hindsight" in data.get("engine", ""))
            except Exception as e:
                self.assert_test("Backend Health Endpoint", False, str(e))

            try:
                r = client.get(f"{BASE_URL}/")
                self.assert_test("Root Metadata Endpoint", r.status_code == 200 and r.json().get("app") == "ORVIN Guardian")
            except Exception as e:
                self.assert_test("Root Metadata Endpoint", False, str(e))

            # ─────────────────────────────────────────────────────────────
            # SECTION 2: SCENARIOS & STORY MODE TIMELINE
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 2: Enterprise Scenarios & Story Mode Verification]")
            try:
                r = client.get(f"{BASE_URL}/api/v1/devops-agent/scenarios")
                self.assert_test("Fetch Scenarios Endpoint", r.status_code == 200)
                scenarios = r.json()
                self.assert_test("Scenarios Count >= 3", len(scenarios) >= 3, f"Found {len(scenarios)} scenarios")
                has_numpy = any(s["id"] == "scenario-numpy2" for s in scenarios)
                has_cuda = any(s["id"] == "scenario-cuda-oom" for s in scenarios)
                has_secret = any(s["id"] == "scenario-secret-drift" for s in scenarios)
                self.assert_test("All Core Scenarios Present (NumPy, CUDA OOM, Secret Drift)", has_numpy and has_cuda and has_secret)
            except Exception as e:
                self.assert_test("Fetch Scenarios Endpoint", False, str(e))

            try:
                r = client.get(f"{BASE_URL}/api/v1/devops-agent/story-mode")
                self.assert_test("Story Mode Timeline Endpoint", r.status_code == 200)
                steps = r.json()
                self.assert_test("Story Steps Count == 3 (Day 1, 14, 60)", len(steps) == 3)
                self.assert_test("Day 1 Has Amnesia Risk (15%)", steps[0]["risk_score"] == 15 and "APPROVED" in steps[0]["action_taken"])
                self.assert_test("Day 14 Blocks Merge (92%)", steps[1]["risk_score"] >= 80 and "BLOCKED" in steps[1]["action_taken"])
                self.assert_test("Day 60 Has Auto-Patch Available", steps[2]["auto_patch_available"] is True)
            except Exception as e:
                self.assert_test("Story Mode Timeline Endpoint", False, str(e))

            # ─────────────────────────────────────────────────────────────
            # SECTION 3: EPISODIC MEMORY BANK (RETAIN, RECALL, SEARCH)
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 3: Persistent Episodic Memory Operations]")
            initial_count = 0
            try:
                r = client.get(f"{BASE_URL}/api/v1/devops-agent/memories")
                self.assert_test("Retrieve Memories Endpoint", r.status_code == 200)
                mems = r.json()
                initial_count = len(mems)
                self.assert_test("Memory Bank Seeded with Enterprise Incidents", initial_count >= 3)
            except Exception as e:
                self.assert_test("Retrieve Memories Endpoint", False, str(e))

            # Test Retaining a New Post-Mortem Incident
            new_id = None
            try:
                retain_payload = {
                    "title": "Incident #120: Kubernetes OOM on High Concurrency LLM Batch",
                    "description": "Allocating batch_size=128 on A10G GPU pods caused CUDA out of memory kernel panics.",
                    "category": "hardware_oom",
                    "severity": "CRITICAL",
                    "service": "batch-infer-worker",
                    "prevention_rule": "Limit MAX_BATCH_SIZE=32 and enforce VRAM memory quota ceiling."
                }
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/retain", json=retain_payload)
                self.assert_test("Retain New Incident Endpoint", r.status_code == 200)
                data = r.json()
                new_id = data.get("id")
                self.assert_test("Retained Incident Has Valid ID & High Recall Score", bool(new_id) and data.get("recall_score") == 0.99)

                # Verify Memory Count Incremented in Database
                r2 = client.get(f"{BASE_URL}/api/v1/devops-agent/memories")
                mems_after = r2.json()
                self.assert_test("Database Persisted New Incident Count", len(mems_after) == initial_count + 1)
            except Exception as e:
                self.assert_test("Retain New Incident Endpoint", False, str(e))

            # Test Search Filter
            try:
                r = client.get(f"{BASE_URL}/api/v1/devops-agent/memories?query=numpy")
                self.assert_test("Filter Memories by Query 'numpy'", r.status_code == 200 and len(r.json()) >= 1)
            except Exception as e:
                self.assert_test("Filter Memories by Query", False, str(e))

            # ─────────────────────────────────────────────────────────────
            # SECTION 4: EPISODIC REFLECTION
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 4: Episodic Reflection & Architectural Rule Synthesis]")
            try:
                r = client.get(f"{BASE_URL}/api/v1/devops-agent/reflect")
                self.assert_test("Episodic Reflection Endpoint", r.status_code == 200)
                refl = r.json()
                self.assert_test("Reflection Analyzed All Incidents", refl.get("total_incidents_analyzed", 0) >= 3)
                self.assert_test("Reflection Synthesized Prevention Rules", len(refl.get("synthesized_rules", [])) >= 3)
                self.assert_test("Reflection Has Category Distribution", "dependency" in refl.get("category_distribution", {}))
            except Exception as e:
                self.assert_test("Episodic Reflection Endpoint", False, str(e))

            # ─────────────────────────────────────────────────────────────
            # SECTION 5: CHANGE INTELLIGENCE & BLAST RADIUS (6 TEST CASES)
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 5: Change Intelligence Engine & Risk Blast Radius]")

            # Test Case 5.1: Dependency ABI Clash (NumPy 2.0 bump)
            try:
                numpy_diff = """--- a/backend/requirements.txt
+++ b/backend/requirements.txt
@@ -12,4 +12,4 @@
-numpy>=1.24.0,<2.0.0
+numpy>=2.0.0
-pydantic>=1.10.0
+pydantic>=2.7.0"""
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/analyze-pr", json={"diff": numpy_diff, "mode": "day60"})
                self.assert_test("Analyze PR (NumPy 2.0 ABI Clash)", r.status_code == 200)
                res = r.json()
                self.assert_test("NumPy ABI Risk >= 80% (CRITICAL)", res["risk_score"] >= 80 and res["risk_level"] == "CRITICAL")
                self.assert_test("NumPy Gate Decision == BLOCKED", res["gate_decision"] == "BLOCKED")
                self.assert_test("NumPy Recalled Incident #104 Memory", any("104" in m["id"] or "NumPy" in m["title"] for m in res["recalled_memories"]))
                self.assert_test("NumPy Suggested Auto-Patch Generated", bool(res.get("suggested_patch")))
                self.assert_test("NumPy Patch Sandbox Verified Safe", (res.get("patch_verification") or {}).get("is_verified") is True)
            except Exception as e:
                self.assert_test("Analyze PR (NumPy ABI Clash)", False, str(e))

            # Test Case 5.2: Concurrency & GPU VRAM Overcommit (K8s)
            try:
                cuda_diff = """--- a/k8s/deployment.yaml
+++ b/k8s/deployment.yaml
@@ -24,4 +24,4 @@
         env:
-          - name: WORKER_CONCURRENCY
-            value: "2"
+          - name: WORKER_CONCURRENCY
+            value: "8" """
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/analyze-pr", json={"diff": cuda_diff, "mode": "day60"})
                res = r.json()
                self.assert_test("CUDA Concurrency Spike Detected", res["risk_score"] >= 75 and res["gate_decision"] in ["BLOCKED", "REQUIRES_CHANGES"])
                self.assert_test("Identified hardware_oom Evidence Factor", any(f["category"] == "hardware_oom" for f in res["evidence_factors"]))
            except Exception as e:
                self.assert_test("CUDA Concurrency Spike Detected", False, str(e))

            # Test Case 5.3: Secret & Config Drift (Missing REDIS_AUTH_TOKEN)
            try:
                secret_diff = """--- a/backend/app/config.py
+++ b/backend/app/config.py
@@ -8,3 +8,4 @@
     DATABASE_URL: str
+    REDIS_URL: str = "redis://redis-cluster:6379"
+    REDIS_AUTH_TOKEN: str = os.getenv("REDIS_AUTH_TOKEN") # Missing in k8s prod secret!"""
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/analyze-pr", json={"diff": secret_diff, "mode": "day60"})
                res = r.json()
                self.assert_test("Secret Drift Risk Detected", res["risk_score"] >= 70)
                self.assert_test("Identified secret_drift Evidence Factor", any(f["category"] == "secret_drift" for f in res["evidence_factors"]))
            except Exception as e:
                self.assert_test("Secret Drift Risk Detected", False, str(e))

            # Test Case 5.4: Database Destructive Migration (DROP COLUMN)
            try:
                db_diff = """--- a/alembic/versions/migration_002.py
+++ b/alembic/versions/migration_002.py
@@ -10,3 +10,3 @@
-    pass
+    op.drop_column('users', 'stripe_customer_id')"""
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/analyze-pr", json={"diff": db_diff, "mode": "day60"})
                res = r.json()
                self.assert_test("Destructive Database Drop Detected", any(f["category"] == "destructive_database_change" for f in res["evidence_factors"]))
            except Exception as e:
                self.assert_test("Destructive Database Drop Detected", False, str(e))

            # Test Case 5.5: Day 1 Amnesia Mode (Generic CI/CD without memory)
            try:
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/analyze-pr", json={"diff": numpy_diff, "mode": "day1"})
                res = r.json()
                self.assert_test("Day 1 Amnesia Approves Dangerous PR (False Negative)", res["risk_score"] == 15 and res["gate_decision"] == "APPROVED")
            except Exception as e:
                self.assert_test("Day 1 Amnesia Approves Dangerous PR", False, str(e))

            # Test Case 5.6: Harmless Documentation/Refactor PR (Zero False Positives)
            try:
                doc_diff = """--- a/README.md
+++ b/README.md
@@ -1,3 +1,3 @@
-# Old Title
+# New Title
+Clear usage guide and examples."""
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/analyze-pr", json={"diff": doc_diff, "mode": "day60"})
                res = r.json()
                self.assert_test("Harmless PR Approved with Clean 10% Risk (No False Positive)", res["risk_score"] == 10 and res["gate_decision"] == "APPROVED")
            except Exception as e:
                self.assert_test("Harmless PR Approved with Clean Risk", False, str(e))

            # ─────────────────────────────────────────────────────────────
            # SECTION 6: ISOLATED PATCH SANDBOX VALIDATION
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 6: Isolated Patch Sandbox Engine]")
            try:
                patch_test_payload = {
                    "diff": numpy_diff,
                    "patch": """--- a/backend/requirements.txt
+++ b/backend/requirements.txt
@@ -12,4 +12,4 @@
-numpy>=2.0.0
+numpy>=1.24.0,<2.0.0""",
                    "prevention_rule": "Pin numpy<2.0.0 in requirements.txt",
                    "category": "dependency"
                }
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/verify-patch", json=patch_test_payload)
                self.assert_test("Verify Patch Endpoint", r.status_code == 200)
                v = r.json()
                self.assert_test("Patch Syntax Validated", v["syntax_valid"] is True)
                self.assert_test("Patch Prevention Rule Satisfied", v["rule_satisfied"] is True)
                self.assert_test("Patch Status == VERIFIED_SAFE", v["verification_status"] == "VERIFIED_SAFE")
            except Exception as e:
                self.assert_test("Verify Patch Endpoint", False, str(e))

            # ─────────────────────────────────────────────────────────────
            # SECTION 7: GITHUB WEBHOOK CI GATE & MARKDOWN REVIEW
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 7: GitHub Webhook CI/CD Gating]")
            try:
                webhook_payload = {
                    "action": "opened",
                    "pull_request": {
                        "title": "Upgrade ML worker dependencies for speed",
                        "html_url": "https://github.com/enterprise/ml-repo/pull/402",
                        "diff_url": ""
                    }
                }
                r = client.post(f"{BASE_URL}/api/v1/devops-agent/github/webhook", json=webhook_payload)
                self.assert_test("GitHub Webhook Listener Endpoint", r.status_code == 200)
                wh_data = r.json()
                self.assert_test("Webhook Calculated Gate Decision", bool(wh_data.get("gate_decision")))
                self.assert_test("Webhook Formatted Markdown Comment with Badge", "ORVIN Guardian" in wh_data.get("github_markdown_comment", ""))
            except Exception as e:
                self.assert_test("GitHub Webhook Listener Endpoint", False, str(e))

            # ─────────────────────────────────────────────────────────────
            # SECTION 8: SECURITY & AUTHENTICATION HARDENING
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 8: Security & Authentication Hardening]")
            try:
                # Valid demo login
                login_payload = {"username": "demo@automlops.ai", "password": "demopassword123"}
                r = client.post(f"{BASE_URL}/api/v1/auth/login", json=login_payload)
                self.assert_test("Authorized Demo Login", r.status_code == 200 and "access_token" in r.json())
                token = r.json().get("access_token")

                # Test /me with token
                r_me = client.get(f"{BASE_URL}/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
                self.assert_test("Authenticated /me with JWT Token", r_me.status_code == 200 and r_me.json()["email"] == "demo@automlops.ai")

                # Test /me WITHOUT token (Should be rejected with 401)
                r_unauth = client.get(f"{BASE_URL}/api/v1/auth/me")
                self.assert_test("Unauthenticated /me Strictly Rejected (401)", r_unauth.status_code == 401)

                # Test invalid password rejection (No accidental account creation)
                r_bad = client.post(f"{BASE_URL}/api/v1/auth/login", json={"username": "attacker@fake.com", "password": "wrongpassword"})
                self.assert_test("Invalid Login Rejected without Auto-Registration (401)", r_bad.status_code == 401)
            except Exception as e:
                self.assert_test("Security & Auth Hardening", False, str(e))

            # ─────────────────────────────────────────────────────────────
            # SECTION 9: FRONTEND RUNTIME AVAILABILITY
            # ─────────────────────────────────────────────────────────────
            print("\n[SECTION 9: Frontend Next.js Runtime Verification]")
            try:
                r = client.get(FRONTEND_URL)
                self.assert_test("Frontend Landing Page Responds 200", r.status_code == 200)

                r_gate = client.get(f"{FRONTEND_URL}/projects/p-101/devops-agent")
                self.assert_test("Frontend DevOps Agent Console Responds 200", r_gate.status_code == 200)

                r_dash = client.get(f"{FRONTEND_URL}/dashboard")
                self.assert_test("Frontend Dashboard Responds 200", r_dash.status_code == 200)
            except Exception as e:
                self.assert_test("Frontend Runtime Verification", False, str(e))

        # ─────────────────────────────────────────────────────────────
        # SUMMARY REPORT
        # ─────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        total = self.passed + self.failed
        pass_rate = round((self.passed / total) * 100, 1) if total > 0 else 0
        print(f"📊 TEST SUITE SUMMARY: {self.passed}/{total} Passed ({pass_rate}%) | {self.failed} Failed")
        print("=" * 70)

        if self.failed == 0:
            print("🏆 ALL TEST CASES AND END-TO-END WORKFLOWS VERIFIED 100% OPERATIONAL!")
            return 0
        else:
            print(f"⚠️ {self.failed} test(s) failed. Check details above.")
            return 1

if __name__ == "__main__":
    runner = TestSuiteRunner()
    sys.exit(runner.run_all())

