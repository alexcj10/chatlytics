import emoji
from wordcloud import STOPWORDS
import pandas as pd

def get_user_list(df):
    users = df['user'].unique().tolist()

    if 'group_notification' in users:
        users.remove('group_notification')

    users.sort()
    users.insert(0, 'Overall')

    return users

def filter_df_by_user(df, selected_user):
    if selected_user == 'Overall':
        return df
    else: 
        return df[df['user'] == selected_user]
    
# analytics function 
def fetch_basic_stats(df, selected_user = 'Overall'):
    # Optimization: Expects df to be already filtered if called from main optimized loop
    if selected_user != 'Overall' and 'user' in df.columns and not (df['user'] == selected_user).all():
         df = df[df['user'] == selected_user]

    # Total num of messages
    num_messages = df.shape[0]

    # count total words
    # Optimization: vectorized string ops are faster than apply
    if num_messages > 0:
        total_words = df['message'].str.split().str.len().sum()
    else:
        total_words = 0

    # count media messages
    media_messages = df[df['message'] == '<Media omitted>'].shape[0]

    return{
        'Total Number of Messages': num_messages,
        'Total Number of Words': int(total_words),
        'Total Number of Media Messages': media_messages
    }

# most active users 
def most_active_users(df, top_n=10):
    # Returns top N most active users (excluding group notifications)
    df = df[df['user'] != 'group_notification']
    return df['user'].value_counts().head(top_n)

def count_links(df, selected_user='Overall'):
    if selected_user != 'Overall' and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    url_pattern = r'https?://\S+|www\.\S+'

    link_count = df['message'].str.count(url_pattern).sum()

    return int(link_count)

def daily_timeline(df, selected_user="Overall"):
    if selected_user != 'Overall' and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    df = df.copy()
    df['only_date'] = df['date'].dt.date

    timeline = df.groupby('only_date').size().reset_index(name='message_count')

    return timeline

def hourly_activity(df, selected_user='Overall'):
    if selected_user != 'Overall' and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    hourly = df.groupby('hour').size().reset_index(name="message_count")

    return hourly

def weekly_activity(df, selected_user="Overall"):
    if selected_user != "Overall" and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    weekly = (
        df['day_name']
        .value_counts()
        .reindex(order, fill_value=0)
        .reset_index()
    )

    weekly.columns = ['day', 'message_count']
    return weekly

def monthly_activity(df, selected_user="Overall"):
    if selected_user != "Overall" and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    monthly = (
        df.groupby(['month_num', 'month'])
        .size()
        .reset_index(name='message_count')
        .sort_values('month_num')
    )

    return monthly[['month', 'message_count']]

def quarterly_activity(df, selected_user="Overall"):
    if selected_user != "Overall" and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    df = df.copy()
    df['quarter'] = df['date'].dt.to_period('Q').astype(str)

    quarterly = (
        df.groupby('quarter')
          .size()
          .reset_index(name='message_count')
          .sort_values('quarter')
    )

    return quarterly

def yearly_activity(df, selected_user="Overall"):
    if selected_user != "Overall" and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    yearly = (
        df.groupby('year')
          .size()
          .reset_index(name='message_count')
          .sort_values('year')
    )

    return yearly

def most_busy_day(df):
    timeline = daily_timeline(df)
    if timeline.empty: return {}
    return timeline.loc[timeline['message_count'].idxmax()]

def most_busy_weekday(df):
    if df.empty: return "N/A"
    return df['day_name'].value_counts().idxmax()

def most_busy_month(df):
    monthly = (
        df.groupby(['month_num', 'month'])
          .size()
          .reset_index(name='message_count')
    )
    if monthly.empty: return {}
    return monthly.loc[monthly['message_count'].idxmax()]

def most_common_words(df, selected_user='Overall', top_n=20):
    if selected_user != 'Overall' and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]
    
    df = df[df['user'] != 'group_notification']
    df = df[df['message'] != '<Media omitted>']

    words = []
    # Vectorized check is hard for STOPWORDS without significant memory, 
    # but we can at least avoid re-splitting everything if we passed pre-split data?
    # For now, keep as is but rely on smaller df_filtered passed from main.
    for msg in df['message']:
        for word in msg.lower().split():
            if word not in STOPWORDS:
                words.append(word)

    return pd.Series(words).value_counts().head(top_n)


def emoji_analysis(df, selected_user='Overall', top_n=10):
    if selected_user != 'Overall' and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    # Filter messages
    messages = df['message'].dropna()
    if messages.empty:
        return pd.Series([], dtype=int)

    # Convert to single string
    all_text = "".join(messages)

    # Use emoji.emoji_list which is optimized in C usually (in newer versions)
    # The previous list comprehension [c for c in all_text if c in emoji.EMOJI_DATA] 
    # is O(N) but Python loop overhead on 10MB string is bad.
    
    # Analyze all emojis
    emoji_counts = emoji.emoji_count(all_text) # Just gives count
    # We need frequency of each.
    
    # Newer emoji library:
    all_emojis = [match['emoji'] for match in emoji.emoji_list(all_text)]
    
    return pd.Series(all_emojis).value_counts().head(top_n)


def response_time_analysis(df, selected_user='Overall'):
    # Optimized:
    # 1. df is already sorted by date from preprocess
    # 2. If 'Overall' is passed to main loop, we compute ONCE.
    # 3. If specific user is passed, we assume it's a lookup on PRE-COMPUTED data if provided,
    #    BUT Main.py will handle the passing of "pre-computed" by manually calling this function once 
    #    and then just filtering the dictionary.
    
    # This function expects FULL dataframe to calculate correctly
    # If selected_user is NOT 'Overall', we still need full DF context.
    
    # Filter out group notifications
    df_clean = df[df['user'] != 'group_notification']
    
    # NO SORTING needed here if preprocess did it.
    # df_clean = df_clean.sort_values('date') # Removed redundant sort

    # Calculate time differences and user changes
    # Use array access for speed
    users = df_clean['user'].values
    dates = df_clean['date'].values
    
    if len(users) < 2:
        return {}
        
    # Masks for user change
    # Logic: If user[i] != user[i-1], it's a response
    
    # Create shifted arrays
    prev_users = users[:-1]
    curr_users = users[1:]
    
    prev_dates = dates[:-1]
    curr_dates = dates[1:]
    
    # Boolean mask: where user changed
    mask = (curr_users != prev_users)
    
    # Filter dates and users where change happened
    # The 'responder' is the curr_user
    responders = curr_users[mask]
    response_durations = (curr_dates[mask] - prev_dates[mask])
    
    # Convert numpy timedelta64 to minutes
    # One minute = 60 * 10 9 nanoseconds?
    # Pandas timedelta conversion is easier
    response_durations_min = pd.to_timedelta(response_durations).total_seconds() / 60
    
    # Create DataFrame for grouping
    resp_df = pd.DataFrame({
        'user': responders,
        'time': response_durations_min
    })
    
    avg_times = resp_df.groupby('user')['time'].mean().to_dict()
    
    if selected_user != 'Overall':
        if selected_user in avg_times:
            return {selected_user: avg_times[selected_user]}
        else:
            return {}

    return avg_times

def conversation_initiator(df, selected_user='Overall'):
    # Expects FULL dataframe for correct context
    df_clean = df[df['user'] != 'group_notification']
    
    # Assuming df is sorted
    df_clean = df_clean.copy()
    df_clean['only_date'] = df_clean['date'].dt.date

    # First message of each day
    first_messages = df_clean.groupby('only_date').first()

    # Count initiators
    initiator_counts = first_messages['user'].value_counts()
    
    if selected_user != 'Overall':
        if selected_user in initiator_counts:
            return pd.Series({selected_user: initiator_counts[selected_user]})
        else:
            return pd.Series([], dtype=int)

    return initiator_counts

def longest_message(df, selected_user='Overall'):
    if selected_user != 'Overall' and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]

    # Optimized filter
    temp = df[
        (df['user'] != 'group_notification') & 
        (df['message'] != '<Media omitted>')
    ]

    if temp.empty:
        return {}

    # Just Use .str.len() directly on series, no copy needed really
    # But finding idxmax is faster on series
    lengths = temp['message'].str.len()
    try:
        max_idx = lengths.idxmax()
        longest = temp.loc[max_idx]
    except ValueError:
        return {}

    return {
        'user': longest['user'],
        'message': longest['message'],
        'char_length': int(longest['message'].__len__()), # Faster than column lookup
        'date': longest['date']
    }

def most_wordy_message(df, selected_user='Overall'):
    if selected_user != 'Overall' and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]
   
    temp = df[
        (df['user'] != 'group_notification') &
        (df['message'] != '<Media omitted>')
    ]

    if temp.empty:
        return {}

    # This operation is heavy (split). 
    word_counts = temp['message'].str.split().str.len()
    
    try:
        max_idx = word_counts.idxmax()
        most_wordy = temp.loc[max_idx]
        count = word_counts.loc[max_idx]
    except ValueError:
        return {}

    return {
        'user': most_wordy['user'],
        'message': most_wordy['message'],
        'word_count': int(count),
        'date': most_wordy['date']
    }

def most_busy_hour(df, selected_user='Overall'):
    if selected_user != 'Overall' and not (df['user'] == selected_user).all():
        df = df[df['user'] == selected_user]
    if df.empty: return 0
    return int(df['hour'].value_counts().idxmax())

