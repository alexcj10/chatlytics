from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from app.preprocess import preprocess_whatsapp_text
from app.analytics import (
    get_user_list,
    fetch_basic_stats,
    most_active_users,
    count_links,
    daily_timeline,
    hourly_activity,
    weekly_activity,
    monthly_activity,
    quarterly_activity,
    yearly_activity,
    most_busy_day,
    most_busy_weekday,
    most_busy_month,
    response_time_analysis,
    conversation_initiator,
    longest_message,
    most_wordy_message,
    most_common_words,
    emoji_analysis,
    most_busy_hour
)

app = FastAPI(title="WhatsApp Chat Analyzer API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_all_analytics(df, selected_user):
    # Ensure nested dicts and Series are fully converted to JSON-safe types
    
    basic_stats = fetch_basic_stats(df, selected_user)
    links_shared = count_links(df, selected_user)
    
    # Timelines - convert date objects to string
    def clean_timeline(timeline_df):
        temp = timeline_df.copy()
        for col in temp.columns:
            if temp[col].dtype == 'object' or 'date' in col:
                temp[col] = temp[col].apply(lambda x: str(x) if not isinstance(x, (int, float)) else x)
        return temp.to_dict(orient="records")

    # Most busy day/month - convert Series to string-safe dict
    def clean_series(ser):
        if hasattr(ser, 'to_dict'):
            d = ser.to_dict()
            return {str(k): (str(v) if not isinstance(v, (int, float)) else v) for k, v in d.items()}
        return {}

    # Longest/Most wordy - convert Timestamp in dict
    def clean_message_dict(msg_dict):
        if not msg_dict: return {}
        return {k: (str(v) if 'date' in k or isinstance(v, pd.Timestamp) else v) for k, v in msg_dict.items()}

    res = {
        "basic_stats": basic_stats,
        "links_shared": links_shared,
        "most_active_users": {str(k): v for k, v in most_active_users(df).to_dict().items()} if selected_user == 'Overall' else {},
        "daily_timeline": clean_timeline(daily_timeline(df, selected_user)),
        "hourly_activity": clean_timeline(hourly_activity(df, selected_user)),
        "weekly_activity": clean_timeline(weekly_activity(df, selected_user)),
        "monthly_activity": clean_timeline(monthly_activity(df, selected_user)),
        "quarterly_activity": clean_timeline(quarterly_activity(df, selected_user)),
        "yearly_activity": clean_timeline(yearly_activity(df, selected_user)),
        "most_busy_day": clean_series(most_busy_day(df)) if selected_user == 'Overall' else {},
        "most_busy_weekday": most_busy_weekday(df) if selected_user == 'Overall' else "",
        "most_busy_month": clean_series(most_busy_month(df)) if selected_user == 'Overall' else {},
        "response_time_analysis": response_time_analysis(df, selected_user),
        "conversation_initiator": {str(k): v for k, v in conversation_initiator(df, selected_user).to_dict().items()},
        "longest_message": clean_message_dict(longest_message(df, selected_user)),
        "most_wordy_message": clean_message_dict(most_wordy_message(df, selected_user)),
        "most_common_words": {str(k): v for k, v in most_common_words(df, selected_user).to_dict().items()},
        "emoji_analysis": {str(k): v for k, v in emoji_analysis(df, selected_user).to_dict().items()},
        "most_busy_hour": most_busy_hour(df, selected_user)
    }
    return res

import traceback

import numpy as np

def json_safe(obj):
    if isinstance(obj, dict):
        return {str(k): json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [json_safe(i) for i in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, (pd.Timestamp, pd.Series, pd.DataFrame)):
        if hasattr(obj, 'to_dict'):
            return json_safe(obj.to_dict())
        return str(obj)
    elif hasattr(obj, 'isoformat'): # Dates/Timestamps
        return obj.isoformat()
    elif isinstance(obj, (int, float, str, bool)) or obj is None:
        return obj
    else:
        return str(obj)

@app.post("/analyze")
async def analyze_chat(file: UploadFile = File(...)):
    try:
        print(f"Analyzing file: {file.filename}")
        # Read uploaded file with flexible encoding
        raw_data = await file.read()
        try:
            data = raw_data.decode("utf-8")
        except UnicodeDecodeError:
            try:
                data = raw_data.decode("utf-16")
            except UnicodeDecodeError:
                data = raw_data.decode("latin-1")

        # Preprocess chat
        df = preprocess_whatsapp_text(data)
        
        if df.empty:
            print("Error: DataFrame is empty")
            raise HTTPException(status_code=400, detail="No messages found. The file might be in an unsupported format or empty.")

        users = get_user_list(df)
        print(f"Found users: {users}")
        
        # Store analytics for each user
        all_analytics = {}
        for user in users:
            print(f"Computing analytics for user: {user}")
            try:
                raw_user_analytics = get_all_analytics(df, user)
                all_analytics[user] = json_safe(raw_user_analytics)
            except Exception as user_err:
                print(f"Error computing analytics for user {user}: {user_err}")
                traceback.print_exc()
                raise HTTPException(status_code=500, detail=f"Error analyzing user {user}: {str(user_err)}")

        return json_safe({
            "users": users,
            "analytics": all_analytics
        })
    except HTTPException as he:
        raise he
    except Exception as e:
        print("CRITICAL ERROR DURING ANALYSIS:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
