import joblib
import pandas as pd
from pathlib import Path

# Load trained sentiment pipeline
MODEL_PATH = Path("ml/models/sentiment_pipeline.pkl")
pipeline = joblib.load(MODEL_PATH)

def predict_message_sentiment(messages):
    """
    Predict sentiment for a list of messages
    Returns predictions and probabilities
    """
    preds = pipeline.predict(messages)
    probs = pipeline.predict_proba(messages)

    return preds, probs


def overall_sentiment(df):
    """
    Computes overall sentiment score for the chat
    """
    df = df.copy()
    messages = df["message"].astype(str).tolist()
    preds, _ = predict_message_sentiment(messages)

    df["sentiment"] = preds

    positive_ratio = (df["sentiment"] == 1).mean()
    negative_ratio = (df["sentiment"] == 0).mean()

    return {
        "positive_percentage": round(positive_ratio * 100, 2),
        "negative_percentage": round(negative_ratio * 100, 2),
        "total_messages": len(df)
    }


def user_wise_sentiment(df):
    """
    Computes sentiment stats per user
    """
    results = {}

    for user, group in df.groupby("user"):
        messages = group["message"].astype(str).tolist()
        preds, _ = predict_message_sentiment(messages)

        positive_ratio = (preds == 1).mean()
        negative_ratio = (preds == 0).mean()

        results[user] = {
            "positive_percentage": round(positive_ratio * 100, 2),
            "negative_percentage": round(negative_ratio * 100, 2),
            "message_count": len(group)
        }

    return results


def attach_sentiment_to_df(df):
    """
    Adds sentiment column to the dataframe
    """
    messages = df["message"].astype(str).tolist()
    preds, probs = predict_message_sentiment(messages)

    df = df.copy()
    df["sentiment"] = preds
    df["sentiment_confidence"] = probs.max(axis=1)

    return df
