"""
Sentiment Inference Module for WhatsApp Chat Analysis

This module provides the main API for sentiment analysis, using the
enhanced VADER analyzer with Hinglish support for accurate analysis
of English and Roman Hindi WhatsApp messages.

The analyzer provides:
- Positive/Negative/Neutral classification
- Compound sentiment scores  
- Per-user sentiment breakdown
"""

import pandas as pd
from ml.sentiment_vader import get_analyzer


def predict_message_sentiment(messages: list) -> tuple:
    """
    Predict sentiment for a list of messages.
    
    Args:
        messages: List of message strings
        
    Returns:
        Tuple of (labels, scores) where:
            - labels: List of sentiment labels ('Positive', 'Negative', 'Neutral')
            - scores: List of compound scores (-1 to +1)
    """
    analyzer = get_analyzer()
    results = analyzer.analyze_batch(messages)
    
    labels = [r['label'] for r in results]
    scores = [r['compound'] for r in results]
    
    return labels, scores


def overall_sentiment(df: pd.DataFrame) -> dict:
    """
    Compute overall sentiment statistics for the chat.
    
    Args:
        df: DataFrame with 'message' column
        
    Returns:
        Dictionary with:
            - positive_percentage: % of positive messages
            - negative_percentage: % of negative messages
            - neutral_percentage: % of neutral messages
            - average_compound: Average compound score (-1 to +1)
            - total_messages: Total message count
    """
    df = df.copy()
    messages = df["message"].astype(str).tolist()
    
    analyzer = get_analyzer()
    return analyzer.get_aggregate_sentiment(messages)


def user_wise_sentiment(df: pd.DataFrame) -> dict:
    """
    Compute sentiment statistics per user.
    
    Args:
        df: DataFrame with 'user' and 'message' columns
        
    Returns:
        Dictionary mapping user -> {
            positive_percentage,
            negative_percentage, 
            neutral_percentage,
            average_compound,
            message_count
        }
    """
    results = {}
    analyzer = get_analyzer()

    for user, group in df.groupby("user"):
        messages = group["message"].astype(str).tolist()
        stats = analyzer.get_aggregate_sentiment(messages)
        
        results[user] = {
            "positive_percentage": stats["positive_percentage"],
            "negative_percentage": stats["negative_percentage"],
            "neutral_percentage": stats["neutral_percentage"],
            "average_compound": stats["average_compound"],
            "message_count": stats["total_messages"]
        }

    return results


def attach_sentiment_to_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add sentiment columns to the dataframe.
    
    Args:
        df: DataFrame with 'message' column
        
    Returns:
        DataFrame with added columns:
            - sentiment: Sentiment label (Positive/Negative/Neutral)
            - sentiment_score: Compound score (-1 to +1)
    """
    messages = df["message"].astype(str).tolist()
    
    analyzer = get_analyzer()
    results = analyzer.analyze_batch(messages)

    df = df.copy()
    df["sentiment"] = [r["label"] for r in results]
    df["sentiment_score"] = [r["compound"] for r in results]

    return df
