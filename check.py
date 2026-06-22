import os
import sys

# Add backend to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import SessionLocal
from app import models

db = SessionLocal()
insights = db.query(models.Insight).all()
print(f"Total insights: {len(insights)}")
for i, ins in enumerate(insights):
    print(f"--- Insight {i} ---")
    print("TITLE:", ins.title)
    print("CONTENT:", ins.content)
