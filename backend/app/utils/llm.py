import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

VALID_CATEGORIES = [
    "Food", "Travel", "Shopping", "Bills", "EMI", 
    "Subscriptions", "Salary", "Rent", "Investments", "Other"
]

def categorize_transactions_batch(transactions: list[dict]) -> list[dict]:
    """
    Takes a list of dictionaries with 'id' and 'description'.
    Returns the same list but with a 'category' key added to each.
    """
    if not transactions:
        return []
        
    prompt = f"""
    You are a financial AI assistant. Categorize these bank transactions based on their descriptions.
    Valid categories: {', '.join(VALID_CATEGORIES)}.
    
    Given the following JSON array of transactions, return a JSON object containing exactly one key "results" which maps to an array of objects. Each object must have the original 'id' and a newly assigned 'category' from the valid list.
    
    Transactions:
    {json.dumps(transactions)}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a data processing bot that ONLY outputs valid JSON objects."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant", 
            temperature=0.1,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        
        result_content = response.choices[0].message.content
        parsed = json.loads(result_content)
        
        if "results" in parsed:
            return parsed["results"]
        return [{"id": t["id"], "category": "Other"} for t in transactions]
    except Exception as e:
        print(f"LLM Error: {e}")
        return [{"id": t["id"], "category": "Other"} for t in transactions]
