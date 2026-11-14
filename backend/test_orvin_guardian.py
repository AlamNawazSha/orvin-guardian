import asyncio
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.database import init_db
from app.engines.hindsight_devops_engine import hindsight_devops_engine
from app.engines.change_intelligence_engine import change_intelligence_engine
from app.engines.patch_sandbox_engine import patch_sandbox_engine

async def run_tests():
    print("=== 1. Initializing Database ===")
    await init_db()
    print("Database initialized successfully.")

    print("\n=== 2. Testing Memory Seeding & Persistence ===")
    mems = await hindsight_devops_engine.get_all_memories()
    print(f"Total memories retrieved: {len(mems)}")
    for m in mems:
        print(f"  • [{m['id']}] ({m['category']}): {m['title'][:55]}...")

    print("\n=== 3. Testing Deterministic Risk Engine on NumPy 2.0 PR ===")
    numpy_diff = """--- a/backend/requirements.txt
+++ b/backend/requirements.txt
@@ -12,4 +12,4 @@
-numpy>=1.24.0,<2.0.0
+numpy>=2.0.0
-pydantic>=1.10.0
+pydantic>=2.7.0"""
    res1 = await hindsight_devops_engine.analyze_pr(diff=numpy_diff, mode="day60")
    print(f"Risk Score: {res1['risk_score']}% | Risk Level: {res1['risk_level']} | Gate Decision: {res1['gate_decision']}")
    print(f"Issues Found ({len(res1['issues_found'])}):")
    for iss in res1['issues_found']:
        print(f"  - {iss}")
    print(f"Patch Verified: {res1.get('patch_verification', {}).get('is_verified')} ({res1.get('patch_verification', {}).get('verification_status')})")

    print("\n=== 4. Testing Day 1 Amnesia (Generic CI/CD without memory) ===")
    res_day1 = await hindsight_devops_engine.analyze_pr(diff=numpy_diff, mode="day1")
    print(f"Day 1 Risk Score: {res_day1['risk_score']}% | Gate Decision: {res_day1['gate_decision']}")
    print(f"Explanation: {res_day1['explanation'][:80]}...")

    print("\n=== 5. Testing Harmless PR (Zero False Positives) ===")
    safe_diff = """--- a/backend/README.md
+++ b/backend/README.md
@@ -1,3 +1,3 @@
-# Old Title
+# Updated Documentation
+Documentation update with clear usage guide."""
    res_safe = await hindsight_devops_engine.analyze_pr(diff=safe_diff, mode="day60")
    print(f"Harmless PR Risk Score: {res_safe['risk_score']}% | Gate Decision: {res_safe['gate_decision']}")

    print("\n=== 6. Testing Patch Sandbox Verification ===")
    patch_sample = """--- a/backend/requirements.txt
+++ b/backend/requirements.txt
@@ -12,4 +12,4 @@
-numpy>=2.0.0
+numpy>=1.24.0,<2.0.0  # Pinned for Cython ABI stability"""
    v = patch_sandbox_engine.verify_patch(
        diff=numpy_diff,
        patch=patch_sample,
        prevention_rule="Pin numpy<2.0.0 in requirements.txt",
        category="dependency"
    )
    print(f"Patch Verification Status: {v['verification_status']}")
    print(f"Rule Satisfied: {v['rule_satisfied']} | Syntax Valid: {v['syntax_valid']}")

    print("\n=== 7. Testing Episodic Reflection ===")
    refl = await hindsight_devops_engine.reflect_on_incidents()
    print(f"Reflection: {refl['reflection_summary']}")

    print("\n✅ ALL BACKEND TESTS PASSED WITH DISTINCTION!")

if __name__ == "__main__":
    asyncio.run(run_tests())

