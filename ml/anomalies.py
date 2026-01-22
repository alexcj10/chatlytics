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
    # anomaly_score is -1 for outliers, 1 for inliers
    daily_stats['anomaly_label'] = model.fit_predict(features)
    # raw_scores: lower is more anomalous
    daily_stats['raw_severity'] = model.decision_function(features)
    
    # anomaly_score is -1 for outliers, 1 for inliers
    outliers = daily_stats[daily_stats['anomaly_label'] == -1]
    
    anomalies = []
    mean_count = daily_stats['message_count'].mean()
    mean_sent = daily_stats['avg_sentiment'].mean()
    
    for date, row in outliers.iterrows():
        # Determine the primary reason for anomaly
        reasons = []
        anomaly_category = "spikes" # Default
        anomaly_type = "Pattern Anomaly"
        
        # Volume Anomalies
        if row['message_count'] > mean_count * 2.5:
            reasons.append("unusually high volume")
            anomaly_type = "Activity Burst"
            anomaly_category = "spikes"
        elif row['message_count'] < mean_count * 0.3 and row['message_count'] > 0:
            reasons.append("significant dip in activity")
            anomaly_type = "Activity Drought"
            anomaly_category = "drops"
            
        # Sentiment Anomalies
        if row['avg_sentiment'] < mean_sent - 0.4:
            reasons.append("notable drop in conversation mood")
            if anomaly_type == "Pattern Anomaly": 
                anomaly_type = "Sentiment Shift"
                anomaly_category = "drops"
        elif row['avg_sentiment'] > mean_sent + 0.4:
            reasons.append("exceptionally high positive energy")
            if anomaly_type == "Pattern Anomaly": 
                anomaly_type = "Joy Spike"
                anomaly_category = "spikes"
            
        # Media/Link Anomalies
        if row['media_count'] > daily_stats['media_count'].mean() * 3 and row['media_count'] > 5:
            reasons.append("media sharing frenzy")
            if anomaly_type == "Pattern Anomaly": 
                anomaly_type = "Media Burst"
                anomaly_category = "spikes"
            
        desc = f"Unique pattern detected: {', '.join(reasons) if reasons else 'statistical outlier'}."
        
        # Invert decision function: lower (more negative) means higher severity rank
        severity_rank = abs(float(row['raw_severity']))
        
        # Z-score for more intuitive severity weighting
        std_count = daily_stats['message_count'].std()
        z_score = (row['message_count'] - mean_count) / std_count if std_count > 0 else 0

        anomalies.append({
            "type": anomaly_type,
            "category": anomaly_category,
            "date": str(date),
            "value": int(row['message_count']),
            "severity": "Critical" if row['raw_severity'] < -0.15 else "High" if row['raw_severity'] < -0.1 else "Medium",
            "severity_score": round(severity_rank, 4),
            "z_score": round(abs(z_score), 2),
            "description": desc,
            "metrics": {
                "messages": int(row['message_count']),
                "sentiment": round(float(row['avg_sentiment']), 2)
            }
        })
        
    return anomalies

def detect_gaps(df, gap_threshold_hours=72):
    """
    Detects unusually long periods of silence in the conversation.
    Default threshold is 3 days (72 hours).
    """
    if df.empty or len(df) < 5:
        return []
        
    df = df.sort_values('date')
    df['gap'] = df['date'].diff().dt.total_seconds() / 3600
    
    gaps = df[df['gap'] > gap_threshold_hours].copy()
    
    anomalies = []
    for _, row in gaps.iterrows():
        days = round(row['gap'] / 24, 1)
        anomalies.append({
            "type": "Silent Period",
            "category": "drops",
            "date": str(row['date'].date()),
            "severity": "High" if row['gap'] > 168 else "Medium", # High if > 1 week
            "severity_score": min(row['gap'] / 720, 1.0), # Normalized score
            "description": f"The conversation went silent for about {days} days before this message.",
            "metrics": {
                "gap_hours": int(row['gap']),
                "duration_days": days
            }
        })
    return anomalies

def get_anomalies(df):
    """
    Compiles detected anomalies and partitions into spikes and drops.
    """
    if df.empty: return {"spikes": [], "drops": []}
    
    # Pass 1: Pattern Anomalies (IF-based)
    pattern_anomalies = detect_anomalies_if(df)
    
    # Pass 2: Gap Detection
    gap_anomalies = detect_gaps(df)
    
    # Combine results
    all_anomalies = pattern_anomalies + gap_anomalies
    
    # Partition
    spikes = [a for a in all_anomalies if a.get('category') == 'spikes']
    drops = [a for a in all_anomalies if a.get('category') == 'drops']
    
    # Sort each by severity_score descending
    spikes.sort(key=lambda x: x.get('severity_score', 0), reverse=True)
    drops.sort(key=lambda x: x.get('severity_score', 0), reverse=True)
    
    return {
        "spikes": spikes[:10],
        "drops": drops[:10]
    }
