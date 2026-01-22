import pandas as pd
import numpy as np
from ml.anomalies import get_anomalies
from app.analytics import response_time_analysis

def get_chat_health(df):
    """
    Calculates the health score using the user-defined formula:
    0.30 * Sentiment + 0.25 * Engagement + 0.20 * Response + 0.15 * Balance - 0.10 * Anomaly Penalty
    """
    if df.empty:
        return {"score": 0, "rating": "N/A", "metrics": {}}

    df_clean = df[df['user'] != 'group_notification']
    if df_clean.empty:
        return {"score": 0, "rating": "N/A", "metrics": {}}

    # 1. Sentiment Score (0-100)
    # Based on (Positive - Negative) compound shift
    pos_ratio = (df_clean['sentiment'] == 'Positive').mean()
    neg_ratio = (df_clean['sentiment'] == 'Negative').mean()
    sentiment_score = max(0, min(100, (pos_ratio - neg_ratio + 1) * 50))

    # 2. Engagement Score (0-100)
    # messages_per_day and active_days_ratio
    days_range = (df_clean['date'].max() - df_clean['date'].min()).days + 1
    active_days = df_clean['date'].dt.date.nunique()
    active_days_ratio = active_days / days_range
    msgs_per_day = len(df_clean) / days_range
    
    # Normalize: 10 msgs/day is good, 50% active days is good
    engagement_score = min(100, (msgs_per_day * 5) + (active_days_ratio * 50))

    # 3. Response Score (0-100)
    # Lower response time = higher score
    resp_times = response_time_analysis(df_clean, 'Overall')
    if resp_times:
        avg_resp_min = np.mean(list(resp_times.values()))
        # Score 100 if < 5 mins, 0 if > 1440 mins (1 day)
        response_score = max(0, 100 * (1 - (min(1440, avg_resp_min) / 1440)))
    else:
        response_score = 50 # Default

    # 4. Balance Score (0-100)
    # Inverse of variance in participation
    user_counts = df_clean['user'].value_counts()
    if len(user_counts) > 1:
        cv = user_counts.std() / user_counts.mean()
        balance_score = max(0, 100 * (1 - (cv / 2)))
    else:
        balance_score = 20 # Low balance for one-sided chats

    # 5. Anomaly Penalty (0-10)
    # Deduction based on detected anomalies
    anomalies = get_anomalies(df_clean)
    penalty = min(10, len(anomalies) * 2)

    # Final Calculation
    final_score = (
        (0.30 * sentiment_score) + 
        (0.25 * engagement_score) + 
        (0.20 * response_score) + 
        (0.15 * balance_score)
    ) - penalty

    final_score = round(max(0, min(100, final_score)), 1)

    # Determine Rating
    if final_score >= 85: 
        rating, color = "Legendary", "text-emerald-400"
    elif final_score >= 70:
        rating, color = "Vibrant", "text-teal-400"
    elif final_score >= 50:
        rating, color = "Healthy", "text-indigo-400"
    elif final_score >= 30:
        rating, color = "Sporadic", "text-amber-400"
    else:
        rating, color = "Cold", "text-rose-400"

    return {
        "score": final_score,
        "rating": rating,
        "color": color,
        "metrics": {
            "sentiment": round(sentiment_score, 1),
            "engagement": round(engagement_score, 1),
            "response": round(response_score, 1),
            "balance": round(balance_score, 1),
            "penalty": round(penalty, 1)
        },
        "description": f"This chat is {rating.lower()} with a refined health score of {final_score}%."
    }
