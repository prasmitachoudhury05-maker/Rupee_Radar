from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("GET /api/metrics/summary")
res1 = client.get("/api/metrics/summary")
print(res1.status_code)
if res1.status_code != 200:
    print(res1.text)

print("GET /api/metrics/insights")
res2 = client.get("/api/metrics/insights")
print(res2.status_code)
if res2.status_code != 200:
    print(res2.text)
