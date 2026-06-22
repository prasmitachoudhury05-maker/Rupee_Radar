from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..database import get_db
from .. import models
import json

from ..utils.llm import client

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    income_val = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.type == "credit").scalar() or 0.0
    spend_val = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.type == "debit").scalar() or 0.0
    
    spend_val = abs(spend_val)
    savings_val = income_val - spend_val
    
    top_cats = db.query(
        models.Category.name,
        func.sum(func.abs(models.Transaction.amount)).label('total')
    ).join(models.Transaction.category).filter(
        models.Transaction.type == "debit"
    ).group_by(models.Category.name).order_by(func.sum(func.abs(models.Transaction.amount)).desc()).limit(5).all()

    formatted_cats = [{"name": row[0], "value": float(row[1])} for row in top_cats]

    return {
        "income": income_val,
        "spend": spend_val,
        "savings": savings_val,
        "top_categories": formatted_cats
    }

@router.get("/budgets")
def get_budgets(db: Session = Depends(get_db)):
    budgets = db.query(models.Budget).all()
    results = []
    
    for b in budgets:
        spent = db.query(func.sum(func.abs(models.Transaction.amount))).filter(
            models.Transaction.category_id == b.category_id,
            models.Transaction.type == "debit"
        ).scalar() or 0.0
        
        results.append({
            "id": b.id,
            "category": b.category.name,
            "limit": b.limit_amount,
            "spent": float(spent),
            "remaining": max(0, b.limit_amount - float(spent))
        })
        
    return results

from pydantic import BaseModel
class BudgetCreate(BaseModel):
    category_name: str
    limit_amount: float

@router.post("/budgets")
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    """Creates or updates a budget limit for a category."""
    cat = db.query(models.Category).filter(models.Category.name == budget.category_name).first()
    if not cat:
        return {"error": "Category not found"}
        
    existing = db.query(models.Budget).filter(models.Budget.category_id == cat.id).first()
    if existing:
        existing.limit_amount = budget.limit_amount
    else:
        new_b = models.Budget(category_id=cat.id, limit_amount=budget.limit_amount)
        db.add(new_b)
        
    db.commit()
    return {"status": "success", "message": "Budget updated"}

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Returns a list of all distinct categories in the DB."""
    cats = db.query(models.Category).all()
    return [{"id": c.id, "name": c.name} for c in cats]

@router.get("/subscriptions")
def get_subscriptions(db: Session = Depends(get_db)):
    """Returns all detected active recurring subscriptions and their yearly impact."""
    subs = db.query(
        models.Transaction.description,
        models.Category.name.label('category'),
        func.max(func.abs(models.Transaction.amount)).label('monthly_cost')
    ).join(models.Transaction.category).filter(
        models.Transaction.is_recurring == True,
        models.Transaction.type == "debit"
    ).group_by(models.Transaction.description, models.Category.name).all()
    
    results = []
    total_yearly = 0
    for row in subs:
        yearly = float(row[2]) * 12
        total_yearly += yearly
        results.append({
            "name": row[0],
            "category": row[1],
            "monthly": float(row[2]),
            "yearly": yearly
        })
        
    # Sort by highest yearly impact
    results.sort(key=lambda x: x['yearly'], reverse=True)
    
    return {
        "subscriptions": results,
        "total_yearly_impact": total_yearly
    }

@router.get("/insights")
def get_insights(db: Session = Depends(get_db)):
    today = date.today()
    existing = db.query(models.Insight).filter(models.Insight.created_at == today).all()
    if existing:
        return [{"title": i.title, "content": i.content} for i in existing]

    income_val = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.type == "credit").scalar() or 0.0
    spend_val = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.type == "debit").scalar() or 0.0
    spend_val = abs(spend_val)
    
    top_cats = db.query(
        models.Category.name,
        func.sum(func.abs(models.Transaction.amount)).label('total')
    ).join(models.Transaction.category).filter(models.Transaction.type == "debit").group_by(models.Category.name).all()
    
    if not top_cats and income_val == 0:
        return [{"title": "No Data", "content": "Upload a statement to get AI insights."}]
        
    spend_summary = ", ".join([f"{row[0]}: ₹{row[1]}" for row in top_cats])
    
    prompt = f"""
    You are an expert financial advisor AI. Given the following user's monthly spending summary, generate exactly 3 short, punchy, and highly actionable financial insights or warnings.
    
    Data:
    - Total Income: ₹{income_val}
    - Total Spend: ₹{spend_val}
    - Savings: ₹{income_val - spend_val}
    - Spend by Category: {spend_summary}
    
    Return a JSON object with a single key "insights" mapping to an array of 3 objects, each with a 'title' (max 4 words) and 'content' (max 2 sentences).
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a financial advisor. Output ONLY valid JSON objects."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        insights_data = result.get("insights", [])
        
        # Save to DB
        saved_insights = []
        for ind_data in insights_data:
            ins = models.Insight(
                title=ind_data.get("title", "Insight"),
                content=ind_data.get("content", ""),
                created_at=today
            )
            db.add(ins)
            saved_insights.append({"title": ins.title, "content": ins.content})
            
        db.commit()
        return saved_insights
    except Exception as e:
        print("Error generating insights:", e)
        return []
