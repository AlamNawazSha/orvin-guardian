import httpx

def main():
    with httpx.Client(base_url='http://127.0.0.1:8000') as client:
        # 1. Health
        r1 = client.get('/health')
        assert r1.status_code == 200, f'Health failed: {r1.status_code}'
        print('1. Health Check: OK ->', r1.json())

        # 2. Scenarios
        r2 = client.get('/api/v1/devops-agent/scenarios')
        assert r2.status_code == 200, f'Scenarios failed: {r2.status_code}'
        scenarios = r2.json()
        print(f'2. Scenarios Loaded: {len(scenarios)} available')

        # 3. Analyze PR Day 1 (Amnesia)
        r3 = client.post('/api/v1/devops-agent/analyze-pr', json={'diff': scenarios[0]['diff'], 'mode': 'day1'})
        assert r3.status_code == 200
        res3 = r3.json()
        assert res3['risk_score'] == 15
        assert res3['gate_decision'] == 'APPROVED'
        print(f"3. Day 1 (Amnesia) PR Check: Passed (Risk: {res3['risk_score']}%, Gate: {res3['gate_decision']})")

        # 4. Analyze PR Day 60 (With Hindsight Memory)
        r4 = client.post('/api/v1/devops-agent/analyze-pr', json={'diff': scenarios[0]['diff'], 'mode': 'day60'})
        assert r4.status_code == 200
        res4 = r4.json()
        assert res4['risk_score'] >= 80
        assert res4['gate_decision'] == 'BLOCKED'
        assert res4['patch_verification']['is_verified'] is True
        print(f"4. Day 60 (Memory) PR Check: Intercepted (Risk: {res4['risk_score']}%, Gate: {res4['gate_decision']}, Patch Verified: {res4['patch_verification']['verification_status']})")

        # 5. Episodic Reflection
        r5 = client.get('/api/v1/devops-agent/reflect')
        assert r5.status_code == 200
        print('5. Episodic Reflection: OK ->', r5.json()['reflection_summary'])

        # 6. Retain New Incident
        new_inc = {
            'title': 'Incident #115: FastAPI Unhandled Event Loop Starvation',
            'description': 'Blocking synchronous CPU-bound operations in route handler starved async event loop.',
            'category': 'runtime_crash',
            'severity': 'HIGH',
            'service': 'api-gateway',
            'prevention_rule': 'Always offload CPU-intensive operations to ThreadPoolExecutor or Celery background workers.'
        }
        r6 = client.post('/api/v1/devops-agent/retain', json=new_inc)
        assert r6.status_code == 200
        print(f"6. Retain Incident: OK -> (New Incident ID: {r6.json()['id']})")

    print('\n🎉 ALL LIVE END-TO-END VERIFICATION FLOWS EXECUTED WITH ZERO ERRORS!')

if __name__ == '__main__':
    main()

