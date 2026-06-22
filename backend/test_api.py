from fastapi.testclient import TestClient
from app.main import app
import json
import os

# Ensure we run from the backend directory context
client = TestClient(app)

print("Sending CSV to /api/upload endpoint...")
with open("../sample_statement.csv", "rb") as f:
    response = client.post("/api/upload/", files={"file": ("sample_statement.csv", f, "text/csv")})

print(f"Status Code: {response.status_code}")
print("Response JSON:")
print(json.dumps(response.json(), indent=2))
