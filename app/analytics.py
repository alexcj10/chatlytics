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

def most_common_words(df, top_n=20):
    df = df[df['user'] != 'group_notification']
    df = df[df['message'] != '<Media omitted>']

    words = []
    for msg in df['message']:
        for word in msg.lower().split():
            if word not in STOPWORDS:
                words.append(word)

    return pd.Series(words).value_counts().head(top_n)


def emoji_analysis(df, top_n=10):
    emojis = []

    for msg in df['message']:
        for char in msg:
            if char in emoji.EMOJI_DATA:
                emojis.append(char)

    return pd.Series(emojis).value_counts().head(top_n)


def response_time_analysis(df):

    df = df[df['user'] != 'group_notification']
    df = df.sort_values('date').reset_index(drop=True)

    response_times = {}

    for i in range(1, len(df)):
        current_user = df.loc[i, 'user']
        previous_user = df.loc[i - 1, 'user']

        if current_user != previous_user:
            time_diff = (
                df.loc[i, 'date'] - df.loc[i - 1, 'date']
            ).total_seconds() / 60  # minutes

            response_times.setdefault(current_user, []).append(time_diff)

    avg_response_time = {
        user: sum(times) / len(times)
        for user, times in response_times.items()
        if len(times) > 0
    }

    return avg_response_time

def conversation_initiator(df):

    df = df[df['user'] != 'group_notification']
    df = df.sort_values('date')

    # Extract date only
    df = df.copy()
    df['only_date'] = df['date'].dt.date

    # First message of each day
    first_messages = df.groupby('only_date').first()

    # Count initiators
    initiator_counts = first_messages['user'].value_counts()

    return initiator_counts

def longest_message(df):

    temp = df[
        (df['user'] != 'group_notification') &
        (df['message'] != '<Media omitted>')
    ].copy()

    temp['char_length'] = temp['message'].str.len()

    longest = temp.loc[temp['char_length'].idxmax()]

    return {
        'user': longest['user'],
        'message': longest['message'],
        'char_length': longest['char_length'],
        'date': longest['date']
    }

def most_wordy_message(df):
   
    temp = df[
        (df['user'] != 'group_notification') &
        (df['message'] != '<Media omitted>')
    ].copy()

    temp['word_count'] = temp['message'].str.split().str.len()

    most_wordy = temp.loc[temp['word_count'].idxmax()]

    return {
        'user': most_wordy['user'],
        'message': most_wordy['message'],
        'word_count': most_wordy['word_count'],
        'date': most_wordy['date']
    }

def most_busy_hour(df):
    return int(df['hour'].value_counts().idxmax())
