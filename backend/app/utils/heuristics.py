import pandas as pd

def detect_recurring_payments(df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyzes a DataFrame of transactions to identify recurring ones.
    Simple Heuristic: If we see the same amount (or very similar description) 
    happening multiple times, we flag it as recurring.
    """
    df['is_recurring'] = False
    
    # Extract only debits (we usually care about recurring expenses like subscriptions/EMI)
    # Group by Amount and Description similarity
    
    # A very simple heuristic: 
    # Exact same description and exact same amount appearing > 1 times -> recurring.
    # We group by description and amount to find duplicates.
    counts = df.groupby(['Description', 'Amount']).size().reset_index(name='count')
    recurring_candidates = counts[counts['count'] > 1]
    
    for _, row in recurring_candidates.iterrows():
        # Update the original df where Description and Amount match
        mask = (df['Description'] == row['Description']) & (df['Amount'] == row['Amount'])
        df.loc[mask, 'is_recurring'] = True
        
    return df
