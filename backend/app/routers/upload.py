from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd
import io
import json

from ..database import get_db
from .. import models
from ..utils.anonymize import anonymize_text
from ..utils.heuristics import detect_recurring_payments
from ..utils.llm import categorize_transactions_batch, VALID_CATEGORIES

router = APIRouter(prefix="/api/upload", tags=["Upload"])

def ensure_categories_exist(db: Session):
    for cat_name in VALID_CATEGORIES:
        if not db.query(models.Category).filter(models.Category.name == cat_name).first():
            db.add(models.Category(name=cat_name))
    db.commit()

@router.post("/")
async def upload_statement(
    file: UploadFile = File(...),
    mapping: str = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported in this prototype.")
    
    contents = await file.read()
    
    try:
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if mapping:
        col_map = json.loads(mapping)
        rename_dict = {v: k for k, v in col_map.items() if v in df.columns}
        df.rename(columns=rename_dict, inplace=True)
        
    return process_dataframe(df, db)

@router.post("/sample")
def upload_sample_statement(db: Session = Depends(get_db)):
    """Loads the pre-configured sample_statement.csv instantly for one-click demo."""
    sample_path = "c:/Users/aman/Desktop/Rupee_Radar/sample_statement.csv"
    try:
        df = pd.read_csv(sample_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Sample data file not found.")
    
    # 1. Clear existing transactions and insights for a pristine demo
    db.query(models.Transaction).delete()
    db.query(models.Insight).delete()
    db.commit()
    
    # 2. Hardcode categories for the sample to bypass LLM latency and ensure it's instant
    cat_map = {
        "CREDIT-SALARY-TECHCORP": "Income",
        "Transfer to Landlord Acct 987654321098": "Housing",
        "Zomato Online Ordering": "Food",
        "Netflix Entertainment": "Entertainment",
        "Uber Rides": "Transportation",
        "Amazon India Shopping": "Shopping",
        "Zerodha Broking SIP": "Investment",
        "Airtel Broadband Bill": "Utilities",
        "Swiggy Food Delivery": "Food",
        "HDFC Personal Loan EMI": "Debt",
        "Starbucks Coffee": "Food",
        "IRCTC Train Ticket": "Travel",
        "Flipkart Electronics": "Shopping",
        "Refund Amazon India Shopping": "Shopping"
    }
    
    df['Category'] = df['Description'].map(cat_map).fillna('Other')
    df['is_recurring'] = df['Description'].str.contains("Netflix|Rent|SIP|EMI|Broadband", case=False, na=False)
    
    # 3. Save to Database
    ensure_categories_exist(db)
    db_cats = db.query(models.Category).all()
    cat_id_map = {c.name: c.id for c in db_cats}
    
    transactions_to_insert = []
    for _, row in df.iterrows():
        cat_name = row['Category']
        if cat_name not in cat_id_map:
            cat_name = "Other"
            
        amount_val = float(str(row['Amount']).replace(',', ''))
        parsed_date = pd.to_datetime(row['Date'], errors='coerce')
        
        t = models.Transaction(
            date=parsed_date.date(),
            description=anonymize_text(str(row['Description'])),
            amount=amount_val,
            type="credit" if amount_val > 0 else "debit",
            category_id=cat_id_map[cat_name],
            is_recurring=bool(row['is_recurring'])
        )
        transactions_to_insert.append(t)
        
    db.bulk_save_objects(transactions_to_insert)
    db.commit()
    
    preview = df[['Date', 'Description', 'Amount', 'Category', 'is_recurring']].head(5).to_dict(orient="records")
    
    return {
        "status": "success",
        "message": "Demo data loaded instantly!",
        "preview": preview,
        "total_rows": len(df)
    }

def process_dataframe(df: pd.DataFrame, db: Session):
    
    standard_cols = ['Date', 'Description', 'Amount']
    missing_cols = [col for col in standard_cols if col not in df.columns]
    
    if missing_cols:
        return {
            "status": "mapping_required",
            "columns": list(df.columns),
            "missing": missing_cols,
            "message": "Please map the required columns."
        }
    
    # 1. Clean & Anonymize
    df['Description'] = df['Description'].fillna("").astype(str).apply(anonymize_text)
    
    # 2. Heuristics for recurring payments
    df = detect_recurring_payments(df)
    
    # 3. Prepare for LLM Categorization (batching)
    # Give transactions an artificial ID for mapping back
    df['temp_id'] = range(1, len(df) + 1)
    
    tx_list = []
    for _, row in df.iterrows():
        tx_list.append({
            "id": row['temp_id'],
            "description": row['Description']
        })
        
    # We should batch this if > 100, but for prototype we assume standard size or batch by 50
    batch_size = 50
    categorized_results = []
    for i in range(0, len(tx_list), batch_size):
        batch = tx_list[i:i+batch_size]
        res = categorize_transactions_batch(batch)
        categorized_results.extend(res)
        
    # Map categories back to df
    cat_map = {item['id']: item.get('category', 'Other') for item in categorized_results}
    df['Category'] = df['temp_id'].map(cat_map).fillna('Other')
    
    # 4. Save to Database
    ensure_categories_exist(db)
    
    # Clear old insights so the dashboard generates fresh ones!
    db.query(models.Insight).delete()
    
    # Fetch category ID mapping
    db_cats = db.query(models.Category).all()
    cat_id_map = {c.name: c.id for c in db_cats}
    
    # Clear old transactions for prototype simplicity, or just append
    # db.query(models.Transaction).delete()
    
    transactions_to_insert = []
    for _, row in df.iterrows():
        cat_name = row['Category']
        if cat_name not in cat_id_map:
            cat_name = "Other"
            
        try:
            # Handle amount format (e.g. remove commas)
            amount_val = float(str(row['Amount']).replace(',', ''))
        except:
            amount_val = 0.0
            
        # Parse date safely (assuming YYYY-MM-DD or DD-MM-YYYY)
        parsed_date = pd.to_datetime(row['Date'], errors='coerce')
        if pd.isna(parsed_date):
            parsed_date = pd.to_datetime('today')
            
        t = models.Transaction(
            date=parsed_date.date(),
            description=row['Description'],
            amount=amount_val,
            type="credit" if amount_val > 0 else "debit",
            category_id=cat_id_map[cat_name],
            is_recurring=row['is_recurring']
        )
        transactions_to_insert.append(t)
        
    db.bulk_save_objects(transactions_to_insert)
    db.commit()
    
    preview = df[['Date', 'Description', 'Amount', 'Category', 'is_recurring']].head(5).to_dict(orient="records")
    
    return {
        "status": "success",
        "message": "File processed, AI categorized, and saved successfully.",
        "preview": preview,
        "total_rows": len(df)
    }
