import pandas as pd
import numpy as np
from ml.roles import assign_participant_roles
from app.analytics import conversation_initiator
import json

def test_role_consistency():
    # 1. Setup Mock Data
    dates = pd.to_datetime([
        '2023-01-01 10:00:00', '2023-01-01 11:00:00', # Alice starts, Bob replies
        '2023-01-02 09:00:00', '2023-01-02 09:30:00', # Alice starts, Bob replies
        '2023-01-03 08:00:00', '2023-01-03 08:30:00'  # Bob starts, Alice replies
    ])
    users = ['Alice', 'Bob', 'Alice', 'Bob', 'Bob', 'Alice']
    df = pd.DataFrame({'date': dates, 'user': users, 'message': ['msg']*6})
    
    # 2. Global Calculation
    # Alice should have 2 starts, Bob 1.
    global_initiators = conversation_initiator(df, 'Overall')
    print(f"Global Initiators:\n{global_initiators}")
    
    # 3. Individual view calculation WITHOUT stats (Simulating the bug)
    df_alice = df[df['user'] == 'Alice'].copy()
    roles_alice_buggy = assign_participant_roles(df_alice)
    alice_starts_buggy = next((r['value'] for r in roles_alice_buggy['Initiator']['top'] if r['user'] == 'Alice'), "0")
    print(f"Alice Starts (Buggy): {alice_starts_buggy}") # Expected "3 starts" because Alice is the only one in her filtered list
    
    # 4. Individual view calculation WITH stats (The Fix)
    roles_alice_fixed = assign_participant_roles(df_alice, precomputed_initiators=global_initiators)
    alice_starts_fixed = next((r['value'] for r in roles_alice_fixed['Initiator']['top'] if r['user'] == 'Alice'), "0")
    print(f"Alice Starts (Fixed): {alice_starts_fixed}") 
    
    # Assertions
    assert "3" in alice_starts_buggy, f"Expected buggy count to be 3, got {alice_starts_buggy}"
    assert "2" in alice_starts_fixed, f"Expected fixed count to be 2, got {alice_starts_fixed}"
    
    print("\nSUCCESS: Count discrepancy resolved by passing global initiators!")

if __name__ == "__main__":
    test_role_consistency()
