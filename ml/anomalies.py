import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_anomalies_if(df):
    """
    Uses Isolation Forest to detect multidimensional anomalies.
    Features: [message_count, avg_sentiment, media_count, link_count]
    """
    if df.empty:
        return []
        
    df_copy = df.copy()
    df_copy['date_only'] = df_copy['date'].dt.date
    
    # Feature Engineering per Day
    daily_stats = df_copy.groupby('date_only').agg({
        'message': 'count',
        'sentiment_score': 'mean'
    }).rename(columns={'message': 'message_count', 'sentiment_score': 'avg_sentiment'})
    
    # Media and Link counts per day
    url_pattern = r'https?://\S+|www\.\S+'
    daily_stats['media_count'] = df_copy[df_copy['message'] == '<Media omitted>'].groupby('date_only').size()
    daily_stats['link_count'] = df_copy['message'].str.count(url_pattern).groupby(df_copy['date_only']).sum()
    
    daily_stats = daily_stats.fillna(0)
    
    if len(daily_stats) < 5:
        return []

    # Prepare features for Isolation Forest
    features = daily_stats[['message_count', 'avg_sentiment', 'media_count', 'link_count']]
    
    # Model configuration
    # contamination=0.05 means we expect ~5% of days to be anomalies
    model = IsolationForest(contamination=0.05, random_state=42)
    daily_stats['anomaly_score'] = model.fit_predict(features)
    
    # anomaly_score is -1 for outliers, 1 for inliers
    outliers = daily_stats[daily_stats['anomaly_score'] == -1]
    
    anomalies = []
    mean_count = daily_stats['message_count'].mean()
    mean_sent = daily_stats['avg_sentiment'].mean()
    
    for date, row in outliers.iterrows():
        # Determine the primary reason for anomaly
        reasons = []
        if row['message_count'] > mean_count * 2:
            reasons.append("unusually high volume")
        if row['avg_sentiment'] < mean_sent - 0.5:
            reasons.append("sharp drop in mood")
        elif row['avg_sentiment'] > mean_sent + 0.5:
            reasons.append("exceptionally positive tone")
        if row['media_count'] > daily_stats['media_count'].mean() * 3:
            reasons.append("media burst")
            
        desc = f"Unique pattern detected: {', '.join(reasons) if reasons else 'statistical outlier'}."
        
        anomalies.append({
            "type": "Pattern Anomaly",
            "date": str(date),
            "value": int(row['message_count']),
            "severity": "High" if len(reasons) > 1 else "Medium",
            "description": desc,
            "metrics": {
                "messages": int(row['message_count']),
                "sentiment": round(float(row['avg_sentiment']), 2)
            }
        })
        
    return anomalies

def get_anomalies(df):
    """
    Compiles detected anomalies using Isolation Forest.
    """
    results = detect_anomalies_if(df)
    
    # Also keep a simplified sentiment shift check for immediate context
    # Sort by date descending
    results.sort(key=lambda x: x['date'], reverse=True)
    
    return results[:10]
