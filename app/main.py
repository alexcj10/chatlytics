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

from app.topics import (
    get_topics_analytics,
    get_topic_timeline
)

from ml.sentiment_inference import (
    overall_sentiment,
    user_wise_sentiment,
    attach_sentiment_to_df
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



# Pre-calc global stats function to avoid passing full DF repeatedly or recalculating
def precompute_global_stats(df):
    resp_times = response_time_analysis(df, 'Overall')
    initiators = conversation_initiator(df, 'Overall')
    return resp_times, initiators

def get_all_analytics(df, selected_user, global_resp_times=None, global_initiators=None):
    # Ensure nested dicts and Series are fully converted to JSON-safe types
    
    # We expect 'df' to be already filtered for the specific user if selected_user != 'Overall'
    # EXCEPT for response_time_analysis and conversation_initiator which might rely on global context
    # But for those, we heavily prefer using the pre-calculated globals passed in.
    
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

    # Helper for extracting user specific stats from global dicts
    def get_user_stat(global_dict, user):
        if user == 'Overall': return global_dict
        if isinstance(global_dict, (pd.Series, dict)):
            val = global_dict.get(user, 0 if isinstance(global_dict, dict) else None)
            if val is None: return {} # pandas series get might return None/NaN
            # Standardize return format: {user: value}
            return {user: val}
        return {}

    # Logic for response times: use global if provided
    if global_resp_times is not None:
        if selected_user == 'Overall':
            resp_stats = global_resp_times
        else:
            # Reconstruct the expected {user: time} format
            val = global_resp_times.get(selected_user)
            resp_stats = {selected_user: val} if val is not None else {}
    else:
        # Fallback (slow)
        resp_stats = response_time_analysis(df, selected_user)

    # Logic for initiators: use global if provided
    if global_initiators is not None:
         if selected_user == 'Overall':
             # Convert Series to dict for JSON
             init_stats = global_initiators.to_dict()
         else:
             val = global_initiators.get(selected_user)
             init_stats = {selected_user: val} if val is not None else {}
    else:
        init_stats = conversation_initiator(df, selected_user)
        if hasattr(init_stats, 'to_dict'): init_stats = init_stats.to_dict()

    
    res = {
        "basic_stats": basic_stats,
        "links_shared": links_shared,
        # most_active_users needs FULL df if calculating for Overall, but if selected_user is specific, it's just meant to be empty?
        # Original code: if selected_user == 'Overall' else {}
        # We can just return {} if filtered df is passed, or we'd need full df. 
        # But usually client only asks mostly active users for Overall view. 
        # If we passed filtered DF, we can't calculate most active users (it would just be the one user).
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
        "response_time_analysis": resp_stats,
        "conversation_initiator": {str(k): v for k, v in init_stats.items()},
        "longest_message": clean_message_dict(longest_message(df, selected_user)),
        "most_wordy_message": clean_message_dict(most_wordy_message(df, selected_user)),
        "most_common_words": {str(k): v for k, v in most_common_words(df, selected_user).to_dict().items()},
        "emoji_analysis": {str(k): v for k, v in emoji_analysis(df, selected_user).to_dict().items()},
        "most_busy_hour": most_busy_hour(df, selected_user),
        "sentiment_analysis": overall_sentiment(df),
        "user_sentiment_breakdown": user_wise_sentiment(df) if selected_user == 'Overall' else {},
        "topic_modeling": get_topics_analytics(df, selected_user),
        "topic_timeline": get_topic_timeline(df, selected_user)
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

        # Preprocess chat (Now returns GLOBALLY SORTED df)
        df = preprocess_whatsapp_text(data)
        
        if df.empty:
            print("Error: DataFrame is empty")
            raise HTTPException(status_code=400, detail="No messages found. The file might be in an unsupported format or empty.")

        users = get_user_list(df)
        print(f"Found users: {users}")
        
        # Pre-compute heavy global stats ONCE
        print("Pre-computing global statistics...")
        global_resp_times, global_initiators = precompute_global_stats(df)
        
        # Store analytics for each user
        all_analytics = {}
        for user in users:
            # print(f"Computing analytics for user: {user}") # Reduce log spam
            try:
                # Efficient Filtering
                if user == 'Overall':
                    df_context = df
                else:
                    df_context = df[df['user'] == user]
                
                raw_user_analytics = get_all_analytics(
                    df_context, 
                    user, 
                    global_resp_times=global_resp_times, 
                    global_initiators=global_initiators
                )
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
