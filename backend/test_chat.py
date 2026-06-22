from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("POST /api/chat/")
res = client.post("/api/chat/", json={"message": "How much did I spend on food?"})
print(res.status_code)
if res.status_code != 200:
    print(res.text)
else:
    print(res.json())
