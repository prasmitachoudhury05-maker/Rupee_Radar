from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
import os
import tempfile
from fpdf import FPDF
from unidecode import unidecode

from ..database import get_db
from .. import models

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.get("/pdf")
def export_pdf(db: Session = Depends(get_db)):
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

    insights = db.query(models.Insight).filter(models.Insight.created_at == date.today()).all()

    pdf = FPDF()
    pdf.add_page()
    
    pdf.set_font("helvetica", "B", 24)
    pdf.cell(0, 15, "RupeeRadar Financial Report", ln=True, align="C")
    
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 10, f"Generated on: {date.today()}", ln=True, align="C")
    pdf.ln(10)

    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "Executive Summary", ln=True)
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 8, f"Total Income: Rs. {income_val:,.2f}", ln=True)
    pdf.cell(0, 8, f"Total Spend: Rs. {spend_val:,.2f}", ln=True)
    pdf.cell(0, 8, f"Net Savings: Rs. {savings_val:,.2f}", ln=True)
    pdf.ln(10)

    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "Top Expense Categories", ln=True)
    pdf.set_font("helvetica", "", 12)
    for cat in top_cats:
        pdf.cell(0, 8, f"{cat[0]}: Rs. {float(cat[1]):,.2f}", ln=True)
    pdf.ln(10)

    if insights:
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, "AI Financial Insights", ln=True)
        pdf.set_font("helvetica", "B", 12)
        for ins in insights:
            safe_title = unidecode(ins.title.replace('\u20b9', 'Rs. '))
            safe_content = unidecode(ins.content.replace('\u20b9', 'Rs. '))
            
            pdf.cell(0, 8, safe_title, ln=True)
            pdf.set_font("helvetica", "", 11)
            pdf.multi_cell(0, 6, safe_content)
            pdf.ln(4)
            pdf.set_font("helvetica", "B", 12)

    temp_fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(temp_fd)
    
    pdf.output(temp_path)
    
    return FileResponse(
        temp_path, 
        media_type="application/pdf", 
        filename=f"RupeeRadar_Report_{date.today()}.pdf"
    )
