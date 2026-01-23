import pandas as pd
import numpy as np
from ml.roles import assign_participant_roles
import json

def test_roles_6():
    # Create mock chat data with some late-night messages for Charlie
    data = {
        'date': pd.to_datetime([
            '2023-01-01 10:00:00', '2023-01-01 10:01:00', '2023-01-01 10:05:00',
            '2023-01-02 09:00:00', '2023-01-02 09:02:00', '2023-01-02 09:10:00',
            '2023-01-03 23:30:00', '2023-01-04 01:05:00', # Night owl messages
            '2023-01-04 11:00:00', '2023-01-04 11:01:00', '2023-01-04 11:02:00'
        ]),
        'user': [
            'Alice', 'Bob', 'Alice',
            'Alice', 'Bob', 'Alice',
            'Charlie', 'Charlie',
            'Bob', 'Alice', 'Bob'
        ],
        'message': [
            'Hi Bob!', 'Hey Alice', 'How are you?',
            'Good morning guys', 'Morning Alice!', 'Anyone free today?',
            'Check this out: http://example.com', 'Cool!',
            'What about this?', 'Nice one!', 'Indeed'
        ],
        'hour': [10, 10, 10, 9, 9, 9, 23, 1, 11, 11, 11],
        'day_name': ['Sunday', 'Sunday', 'Sunday', 'Monday', 'Monday', 'Monday', 'Tuesday', 'Tuesday', 'Wednesday', 'Wednesday', 'Wednesday']
    }
    df = pd.DataFrame(data)
    df['only_date'] = df['date'].dt.date
    
    print("Testing 6-Role Assignment (with Night Owl)...")
    roles = assign_participant_roles(df)
    
    print(json.dumps(roles, indent=2))
    
    expected_roles = ["Initiator", "Responder", "Driver", "Broadcaster", "Listener", "Night Owl"]
    for role in expected_roles:
        assert role in roles, f"Missing role: {role}"
        assert "top" in roles[role], f"Missing top list for role: {role}"
        assert len(roles[role]["top"]) > 0, f"Empty top list for role: {role}"
    
    print("\nSUCCESS: 6 roles correctly identified, filling the 2x3 grid.")

if __name__ == "__main__":
    test_roles_6()
