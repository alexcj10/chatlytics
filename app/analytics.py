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
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    # Total num of messages
    num_messages = df.shape[0]

    # count total words
    total_words = int(df['message'].apply(lambda x: len(x.split())).sum())

    # count media messages
    media_messages = df[df['message'] == '<Media omitted>'].shape[0]

    return{
        'Total Number of Messages': num_messages,
        'Total Number of Words': total_words,
        'Total Number of Media Messages': media_messages
    }

# most active users 
def most_active_users(df, top_n=10):
    # Returns top N most active users (excluding group notifications)
    df = df[df['user'] != 'group_notification']
    return df['user'].value_counts().head(top_n)

def count_links(df, selected_user='Overall'):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    url_pattern = r'https?://\S+|www\.\S+'

    link_count = df['message'].str.count(url_pattern).sum()

    return int(link_count)

def daily_timeline(df, selected_user="Overall"):

    df = df.copy()

    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    df['only_date'] = df['date'].dt.date

    timeline = df.groupby('only_date').size().reset_index(name='message_count')

    return timeline

def hourly_activity(df, selected_user='Overall'):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    hourly = df.groupby('hour').size().reset_index(name="message_count")

    return hourly

def weekly_activity(df, selected_user="Overall"):
    if selected_user != "Overall":
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
    if selected_user != "Overall":
        df = df[df['user'] == selected_user]

    monthly = (
        df.groupby(['month_num', 'month'])
          .size()
          .reset_index(name='message_count')
          .sort_values('month_num')
    )

    return monthly[['month', 'message_count']]

def quarterly_activity(df, selected_user="Overall"):
    if selected_user != "Overall":
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
    if selected_user != "Overall":
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
    return timeline.loc[timeline['message_count'].idxmax()]

def most_busy_weekday(df):
    return df['day_name'].value_counts().idxmax()

def most_busy_month(df):
    monthly = (
        df.groupby(['month_num', 'month'])
          .size()
          .reset_index(name='message_count')
    )
    return monthly.loc[monthly['message_count'].idxmax()]

def most_common_words(df, selected_user='Overall', top_n=20):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    
    df = df[df['user'] != 'group_notification']
    df = df[df['message'] != '<Media omitted>']

    words = []
    for msg in df['message']:
        for word in msg.lower().split():
            if word not in STOPWORDS:
                words.append(word)

    return pd.Series(words).value_counts().head(top_n)


def emoji_analysis(df, selected_user='Overall', top_n=10):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    # Optimized emoji extraction
    # 1. Filter out empty/media messages if needed (though existing code didn't explicitly filter all)
    # Existing code: just iterated 'message' column.
    
    # 2. Join all text into one massive string? 
    # For very large histograms, joining might be memory intensive but fast.
    # Iterating characters in python is slow.
    # We use emoji.emoji_list() which is generally cleaner than per-char check.
    
    # Filter to avoid processing irrelevant rows if any
    messages = df['message'].dropna()
    
    # Concatenate all messages (careful with memory, but usually fine for chat logs)
    all_text = " ".join(messages)
    
    # Use list comprehension with emoji.EMOJI_DATA check
    # While still a loop, it runs over characters in a giant string which is simpler struct than DF rows
    # Faster: 
    emojis = [c for c in all_text if c in emoji.EMOJI_DATA]

    return pd.Series(emojis).value_counts().head(top_n)


def response_time_analysis(df, selected_user='Overall'):
    # Optimized Vectorized Response Time Analysis
    
    # Filter out group notifications and ensure sorted by date
    # Use .copy() to avoid SettingWithCopyWarning
    df = df[df['user'] != 'group_notification'].copy()
    df = df.sort_values('date').reset_index(drop=True)

    # Calculate time differences and user changes in one go
    # prev_user = user at i-1
    # prev_date = date at i-1
    df['prev_user'] = df['user'].shift(1)
    df['prev_date'] = df['date'].shift(1)
    
    # We only care about rows where the user CHANGED (someone responded to someone else)
    # AND where it's not the very first message (prev_user is NaN)
    mask = (df['user'] != df['prev_user']) & (df['prev_user'].notna())
    
    responses = df[mask].copy()
    
    if responses.empty:
        return {}
        
    responses['time_diff'] = (responses['date'] - responses['prev_date']).dt.total_seconds() / 60
    
    # Group by the responder (curr_user) -> average time diff
    avg_times_series = responses.groupby('user')['time_diff'].mean()
    
    if selected_user != 'Overall':
        val = avg_times_series.get(selected_user, 0)
        # If user has no response data, returning {user: 0} or empty dict?
        # Original logic returned {} if not found/calculated? 
        # Original: if not selected_user in avg_response_time: return {} 
        # But wait, original code logic:
        # if selected_user in avg_response_time: return {selected: val} else: return {}
        if selected_user in avg_times_series:
             return {selected_user: val}
        else:
             return {}

    return avg_times_series.to_dict()

def conversation_initiator(df, selected_user='Overall'):
    
    df = df[df['user'] != 'group_notification']
    df = df.sort_values('date')

    # Extract date only
    df = df.copy()
    df['only_date'] = df['date'].dt.date

    # First message of each day
    first_messages = df.groupby('only_date').first()

    # Count initiators
    initiator_counts = first_messages['user'].value_counts()
    
    if selected_user != 'Overall':
        if selected_user in initiator_counts:
            return pd.Series({selected_user: initiator_counts[selected_user]})
        else:
            return pd.Series([], dtype=int)

    return initiator_counts

def longest_message(df, selected_user='Overall'):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    temp = df[
        (df['user'] != 'group_notification') &
        (df['message'] != '<Media omitted>')
    ].copy()

    if temp.empty:
        return {}

    temp['char_length'] = temp['message'].str.len()

    longest = temp.loc[temp['char_length'].idxmax()]

    return {
        'user': longest['user'],
        'message': longest['message'],
        'char_length': longest['char_length'],
        'date': longest['date']
    }

def most_wordy_message(df, selected_user='Overall'):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
   
    temp = df[
        (df['user'] != 'group_notification') &
        (df['message'] != '<Media omitted>')
    ].copy()

    if temp.empty:
        return {}

    temp['word_count'] = temp['message'].str.split().str.len()

    most_wordy = temp.loc[temp['word_count'].idxmax()]

    return {
        'user': most_wordy['user'],
        'message': most_wordy['message'],
        'word_count': most_wordy['word_count'],
        'date': most_wordy['date']
    }

def most_busy_hour(df, selected_user='Overall'):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    return int(df['hour'].value_counts().idxmax())
