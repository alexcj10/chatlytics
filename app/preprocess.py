import re
import pandas as pd


def preprocess_whatsapp_text(data: str) -> pd.DataFrame:
    """
    Takes raw WhatsApp chat text and returns a structured DataFrame
    """

    # -----------------------------
    # 1. Normalize unicode space
    # -----------------------------
    data = data.replace('\u202f', ' ')

    # -----------------------------
    # 2. Timestamp regex pattern
    # -----------------------------
    pattern = r"\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s?(?:am|pm)\s-\s"

    # -----------------------------
    # 3. Split messages & extract dates
    # -----------------------------
    messages = re.split(pattern, data)
    messages = messages[1:]  # Remove the first element (empty string before the first match)

    dates = re.findall(pattern, data)

    # Force alignment (real-world safety)
    min_len = min(len(messages), len(dates))
    messages = messages[:min_len]
    dates = dates[:min_len]

    # -----------------------------
    # 4. Create initial DataFrame
    # -----------------------------
    df = pd.DataFrame({
        'user_messages': messages,
        'message_dates': dates
    })

    # -----------------------------
    # 5. Convert to datetime
    # -----------------------------
    df['message_dates'] = pd.to_datetime(
        df['message_dates'],
        format='%d/%m/%y, %I:%M %p - '
    )

    df.rename(columns={'message_dates': 'date'}, inplace=True)

    # -----------------------------
    # 6. Extract users & clean messages
    # -----------------------------
    # -----------------------------
    # 6. Extract users & clean messages
    # -----------------------------
    # Vectorized pattern matching
    # Pattern looks for "User: Message" format
    # Captures: (User), (Message)
    pattern = r'^(.+?):\s(.*)'
    
    split_df = df['user_messages'].str.extract(pattern)
    
    df['user'] = split_df[0]
    df['message'] = split_df[1]
    
    # Rows that didn't match the pattern are group notifications
    # For those, 'user' will be NaN. We fill it with 'group_notification'
    # and the message is just the original text.
    mask_notifications = df['user'].isna()
    df.loc[mask_notifications, 'user'] = 'group_notification'
    df.loc[mask_notifications, 'message'] = df.loc[mask_notifications, 'user_messages']

    df.drop(columns=['user_messages'], inplace=True)

    # -----------------------------
    # 7. Date-time features
    # -----------------------------
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month_name()
    df['month_num'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['day_name'] = df['date'].dt.day_name()
    df['hour'] = df['date'].dt.hour
    df['minute'] = df['date'].dt.minute

    # -----------------------------
    # 8. Global Sort
    # -----------------------------
    df.sort_values('date', inplace=True)
    df.reset_index(drop=True, inplace=True)

    return df

