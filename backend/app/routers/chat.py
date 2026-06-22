from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from .. import models

from ..utils.llm import client

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
def chat_with_data(req: ChatRequest, db: Session = Depends(get_db)):
    txs = db.query(models.Transaction).order_by(models.Transaction.date.desc()).limit(100).all()
    
    tx_list = []
    for t in txs:
        cat_name = t.category.name if t.category else "Other"
        tx_list.append(f"{t.date}: {t.description} | {cat_name} | {'Credit' if t.type == 'credit' else 'Debit'} {abs(t.amount)}")
        
    context_str = "\n".join(tx_list)
    
    prompt = f"""
    You are RupeeRadar's AI Financial Assistant. The user is asking a question about their finances.
    Use the provided transaction history context to answer. Be helpful, concise, and analytical.
    Do not use complex markdown formatting like tables unless explicitly asked.
    
    Context (Recent Transactions):
    {context_str}
    
    User Question: {req.message}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a concise, helpful financial assistant."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=500
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        print(e)
        return {"response": "Sorry, I am having trouble connecting to my AI processor right now."}
