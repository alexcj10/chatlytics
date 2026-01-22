from ml.topic_modeling import extract_topics
import pandas as pd

def get_topics_analytics(df, selected_user='Overall'):
    # Filter by user if not Overall
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    
    if df.empty:
        return []

    # Get overall topics for this context
    topics = extract_topics(df)
    return topics

def get_topic_timeline(df, selected_user='Overall'):
    # Group by month and get topics for each month
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    
    if df.empty:
        return []

    # Ensure date is datetime
    df['date'] = pd.to_datetime(df['date'])
    df['month_year'] = df['date'].dt.to_period('M').astype(str)
    
    timeline = []
    months = sorted(df['month_year'].unique())
    
    # Analyze last 6 months or all if fewer
    for month in months[-6:]:
        month_df = df[df['month_year'] == month]
        if len(month_df) > 10:
            month_topics = extract_topics(month_df, n_topics=3)
            if month_topics:
                timeline.append({
                    "month": month,
                    "topics": month_topics
                })
    
    return timeline
