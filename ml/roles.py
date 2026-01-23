import pandas as pd
import numpy as np
from app.analytics import response_time_analysis, conversation_initiator

def assign_participant_roles(df):
    """
    Identifies the Top 3 people who fit each role best.
    """
    if df.empty:
        return {}

    df_clean = df[df['user'] != 'group_notification'].copy()
    if df_clean.empty:
        return {}

    users = df_clean['user'].unique()
    if len(users) == 0:
        return {}

    # 1. Initiator Stats
    initiator_counts = conversation_initiator(df_clean, 'Overall')
    if isinstance(initiator_counts, pd.Series):
        initiator_counts = initiator_counts.to_dict()
    
    # 2. Response Stats
    users_arr = df_clean['user'].values
    mask = (users_arr[1:] != users_arr[:-1])
    responders = users_arr[1:][mask]
    response_counts = pd.Series(responders).value_counts().to_dict()
    
    # 3. Basic Stats
    user_stats = df_clean.groupby('user').agg({
        'message': ['count', lambda x: x.str.len().mean(), lambda x: x.str.split().str.len().mean()]
    })
    user_stats.columns = ['msg_count', 'avg_chars', 'avg_words']

    # 4. Media & Links
    url_pattern = r'https?://\S+|www\.\S+'
    df_clean['is_media'] = df_clean['message'] == '<Media omitted>'
    df_clean['link_count'] = df_clean['message'].str.count(url_pattern)
    
    media_link_stats = df_clean.groupby('user').agg({
        'is_media': 'sum',
        'link_count': 'sum'
    })

    # Calculate scores for each user
    user_metrics = {}
    for user in users:
        msg_count = user_stats.loc[user, 'msg_count']
        avg_words = user_stats.loc[user, 'avg_words']
        starts = initiator_counts.get(user, 0)
        responses = response_counts.get(user, 0)
        media_links = media_link_stats.loc[user, 'is_media'] + media_link_stats.loc[user, 'link_count']
        
        user_metrics[user] = {
            "starts": starts,
            "responses": responses,
            "msg_count": msg_count,
            "avg_words": avg_words,
            "media_links": media_links,
            "listener_score": -(msg_count * avg_words) # Lower engagement = higher score
        }

    # Identify Top N
    def get_top_n(metric_name, n=3, higher_is_better=True):
        sorted_users = sorted(
            user_metrics.items(), 
            key=lambda x: x[1][metric_name], 
            reverse=higher_is_better
        )
        return sorted_users[:n]

    has_media = max((m.get("media_links", 0) for m in user_metrics.values()), default=0) > 0
    top_initiators = get_top_n("starts")
    top_drivers = get_top_n("msg_count")
    top_broadcasters = get_top_n("media_links") if has_media else get_top_n("avg_words")
    top_listeners = get_top_n("listener_score")
    
    # Responder: High responses, Low starts relative to responses
    for u in user_metrics:
        user_metrics[u]["responder_score"] = user_metrics[u]["responses"] / max(1, user_metrics[u]["starts"])
    top_responders = get_top_n("responder_score")

    def format_top(top_list, metric_key, suffix=""):
        res = []
        for u, v in top_list:
            val = v.get(metric_key, 0)
            if isinstance(val, (float, np.float64, np.float32)):
                val_str = f"{float(val):.1f}{suffix}"
            else:
                val_str = f"{val}{suffix}"
            res.append({"user": str(u), "value": val_str})
        return res

    roles_info = {
        "Initiator": {
            "top": format_top(top_initiators, "starts", " starts"),
            "description": "Starts conversations frequently, setting the pace for everyone.",
            "label": "Start Power"
        },
        "Responder": {
            "top": format_top(top_responders, "responses", " replies"),
            "description": "Mostly replies and keeps the thread alive without initiating much.",
            "label": "Reply Count"
        },
        "Driver": {
            "top": format_top(top_drivers, "msg_count", " msgs"),
            "description": "The engine of the chat. Keeps conversation going with heavy engagement.",
            "label": "Total Activity"
        },
        "Listener": {
            "top": format_top(top_listeners, "avg_words", " words"),
            "description": "Quiet observer. Prefers short replies and low overall message volume.",
            "label": "Avg Length"
        },
        "Broadcaster": {
            "top": format_top(top_broadcasters, "media_links" if has_media else "avg_words", " items" if has_media else " words"),
            "description": "Information hub. Shares long messages, interesting links, or media files.",
            "label": "Shared Info"
        }
    }

    return roles_info
