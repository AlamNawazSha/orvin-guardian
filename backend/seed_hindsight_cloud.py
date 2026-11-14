"""Seed initial enterprise post-mortems into Vectorize Hindsight Cloud."""

import os
from hindsight_client import Hindsight

API_KEY = os.getenv("HINDSIGHT_API_KEY", "")
BASE_URL = "https://api.hindsight.vectorize.io"
BANK_ID = "orvin_devops_postmortems"

def seed():
    client = Hindsight(base_url=BASE_URL, api_key=API_KEY)

    incidents = [
        {
            "id": "inc-104",
            "title": "Incident #104: NumPy 2.0.0 ABI Breaking Change in Cython/PyTorch Extensions",
            "content": "Upgrading numpy>=2.0.0 without un-pinning caused C-API ABI incompatible binary mismatches in Cython extensions during model inference, producing silent segmentation faults and model server crashes. Prevention Rule: Pin numpy<2.0.0 in requirements.txt or recompile Cython extensions against NumPy 2.x ABI headers.",
            "category": "dependency"
        },
        {
            "id": "inc-88",
            "title": "Incident #88: CUDA 12.2 GPU Out-Of-Memory (OOM) Kubernetes Pod Eviction",
            "content": "Increasing worker concurrency from 2 to 8 in microservice deployment caused VRAM overcommit on NVIDIA A10G GPUs (24GB), leading to K8s OOMKilled evictions during peak batch prediction traffic. Prevention Rule: Limit worker concurrency to max 4 per GPU or implement batch queue throttling with explicit CUDA memory ceiling (MAX_VRAM_MB=18000).",
            "category": "hardware_oom"
        },
        {
            "id": "inc-62",
            "title": "Incident #62: Staging vs Production Redis Auth Secret Drift",
            "content": "Adding a Redis caching layer to backend models without declaring REDIS_AUTH_TOKEN in Production Kubernetes Secret manifests caused silent connection dropouts and 500 errors upon production rollout. Prevention Rule: Enforce explicit Secret manifest validation: REDIS_AUTH_TOKEN must be defined in both staging and prod secret templates before merging deployment changes.",
            "category": "secret_drift"
        }
    ]

    for inc in incidents:
        try:
            res = client.retain(
                bank_id=BANK_ID,
                content=f"{inc['title']}\n{inc['content']}",
                metadata={"category": inc["category"], "id": inc["id"]},
                tags=[inc["category"], "enterprise_postmortem"]
            )
            print(f"✅ Retained {inc['title'][:45]}... ID: {getattr(res, 'id', 'retained')}")
        except Exception as e:
            print(f"Note on {inc['id']}: {e}")

    # Test Recall
    print("\n--- Testing Hindsight Cloud Recall ---")
    query = "What happens if we upgrade numpy to 2.0.0 without recompiling Cython?"
    try:
        recall_res = client.recall(bank_id=BANK_ID, query=query)
        print(f"Query: '{query}'")
        if hasattr(recall_res, "results") and recall_res.results:
            for item in recall_res.results[:2]:
                print(f"  • [{getattr(item, 'type', 'fact')}] {getattr(item, 'text', '')}")
        else:
            print("Recall response:", recall_res)
    except Exception as e:
        print(f"Recall note: {e}")

if __name__ == "__main__":
    seed()

