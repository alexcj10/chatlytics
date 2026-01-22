import pandas as pd
from app.topics import get_topics_analytics, get_topic_timeline

# Mock data
data = {
    'user': ['Alice', 'Bob', 'Alice', 'Bob', 'Alice', 'Bob', 'Alice', 'Bob', 'Alice', 'Bob',
             'Alice', 'Bob', 'Alice', 'Bob', 'Alice', 'Bob', 'Alice', 'Bob', 'Alice', 'Bob'],
    'message': [
        'Hey let us talk about project Alpha', 'Yes project Alpha is important', 'We need to finish project Alpha',
        'What about project Beta?', 'Project Beta is next week', 'I like project Beta',
        'Lunch at 1pm?', 'Sure lunch at 1pm', 'Where for lunch?', 'Pizza place for lunch',
        'Did you see the game?', 'The football game was great', 'I love football', 'Football is life',
        'Weather is nice today', 'Yes very sunny weather', 'I like sunny weather', 'Weather forecast is good',
        'Going to the gym', 'Gym is good for health'
    ],
    'date': pd.date_range(start='2023-01-01', periods=20, freq='D')
}

df = pd.DataFrame(data)

def test_topics():
    print("Testing Overall Topics...")
    topics = get_topics_analytics(df)
    for t in topics:
        print(f"Topic {t['topic_id']}: {', '.join(t['words'])}")
    
    print("\nTesting Topic Timeline...")
    timeline = get_topic_timeline(df)
    for item in timeline:
        print(f"Month: {item['month']}")
        for t in item['topics']:
            print(f"  Topic {t['topic_id']}: {', '.join(t['words'])}")

if __name__ == "__main__":
    test_topics()
