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
    users = []
    clean_messages = []

    for text in df['user_messages']:
        match = re.match(r'^(.+?):\s(.*)', text)

        if match:
            users.append(match.group(1))
            clean_messages.append(match.group(2))
        else:
            users.append('group_notification')
            clean_messages.append(text)

    df['user'] = users
    df['message'] = clean_messages
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

    return df

