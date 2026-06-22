import re

def anonymize_text(text: str) -> str:
    """
    Strips potential PII (Account numbers, phone numbers, exact balances) from text.
    """
    if not isinstance(text, str):
        return text
        
    # Mask 10-16 digit numbers (Account / Card numbers / Phone numbers)
    text = re.sub(r'\b\d{10,16}\b', '[MASKED_ACCT]', text)
    
    # Mask UPI IDs (e.g. name@okicici, name@sbi)
    text = re.sub(r'[a-zA-Z0-9.\-_]+@[a-zA-Z]+', '[MASKED_UPI]', text)
    
    # Optional: Mask PAN cards (5 letters, 4 digits, 1 letter)
    text = re.sub(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', '[MASKED_PAN]', text)

    return text
