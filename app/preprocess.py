import re
import pandas as pd
from dateutil import parser

def preprocess_whatsapp_text(data: str) -> pd.DataFrame:
    """
    Takes raw WhatsApp chat text and returns a structured DataFrame
    Supports multiple date formats (Android, iOS)
    """

    # 1. Normalize unicode characters
    data = data.replace('\u202f', ' ') # Narrow no-break space
    data = data.replace('\u200e', '')  # Left-to-right mark (common in iOS exports)

    # 2. Define known patterns
    # (regex_pattern, date_format_for_strptime OR None for auto-parse)
    
    patterns = [
        # Android (12-hour): 12/05/2023, 10:30 pm - User: Message
        # Note: varies between d/m/y and m/d/y depending on locale. 
        # We catch the structure first.
        (r"\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s?(?:am|pm|AM|PM)\s-\s", None), 

        # Android (24-hour): 12/05/2023, 22:30 - User: Message
        (r"\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s-\s", None),
        
        # iOS: [12/05/23, 10:30:15] User: Message
        (r"\[\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}:\d{2}\]\s", None),
        
        # iOS (12-hour variant): [12/05/23, 10:30:15 PM] User: Message
        (r"\[\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}:\d{2}\s(?:PM|AM|pm|am)\]\s", None),

        # Dotted format: 12.05.2023, 10:30 pm - User: Message
        (r"\d{1,2}\.\d{1,2}\.\d{2,4},\s\d{1,2}:\d{2}\s?(?:am|pm|AM|PM)\s-\s", None),
    ]

    selected_pattern = None
    
    # Detect which pattern matches
    for pat, _ in patterns:
        matches = re.findall(pat, data)
        if len(matches) > 0:
            selected_pattern = pat
            break
            
    if not selected_pattern:
        # Fallback: exact original pattern if above failed for some reason, 
        # or simple return empty if truly nothing matches
        selected_pattern = r"\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s?(?:am|pm)\s-\s"

    # 3. Split messages & extract dates
    messages = re.split(selected_pattern, data)
    messages = messages[1:]  # Remove the first element (empty string before the first match)
    
    dates = re.findall(selected_pattern, data)

    # Force alignment (real-world safety)
    min_len = min(len(messages), len(dates))
    messages = messages[:min_len]
    dates = dates[:min_len]

    if min_len == 0:
        return pd.DataFrame()

    # 4. Create initial DataFrame
    df = pd.DataFrame({
        'user_messages': messages,
        'message_dates': dates
    })

    # 5. Clean dates for parsing
    # Remove brackets, hyphens, etc to make it easier for dateutil
    def clean_date_str(d_str):
        d_str = d_str.strip()
        # Remove trailing dash for Android formats
        if d_str.endswith('-'):
            d_str = d_str[:-1].strip()
        # Remove brackets for iOS formats
        if d_str.startswith('[') and d_str.endswith(']'):
            d_str = d_str[1:-1]
        # Replace dots with slashes
        d_str = d_str.replace('.', '/')
        return d_str

    df['cleaned_dates'] = df['message_dates'].apply(clean_date_str)

    # 6. Convert to datetime using dateutil (smart parsing)
    # We use dayfirst=True because WhatsApp usually defaults to locale, and d/m/y is common globally.
    # ideally we'd guess, but dateutil is decent. 
    # NOTE: If user is US based (m/d/y), this *might* be wrong for 02/05 (Feb 5 vs May 2).
    # But hard to strictly infer without more context. Standardizing on dayfirst=True/False is a trade-off.
    # Given the user context (friend's phone), trying dayfirst=True is a safer global default than US-centric.
    try:
        df['date'] = df['cleaned_dates'].apply(lambda x: parser.parse(x, dayfirst=True))
    except:
        # Fallback if dayfirst fails or mixed
        try:
             df['date'] = pd.to_datetime(df['cleaned_dates'], dayfirst=True)
        except:
             # Final fallback to flexible
             df['date'] = pd.to_datetime(df['cleaned_dates'], errors='coerce')
    
    # Drop rows where date parsing failed
    df.dropna(subset=['date'], inplace=True)
    
    # 7. Extract users & clean messages
    # Pattern looks for "User: Message" format
    # Captures: (User), (Message)
    # Note: iOS sometimes doesn't put a space after colon in some locales, but standard is ": "
    
    user_msg_pattern = r'^([^:]+):\s?(.*)'
    
    split_df = df['user_messages'].str.extract(user_msg_pattern)
    
    df['user'] = split_df[0]
    df['message'] = split_df[1]
    
    # Rows that didn't match the pattern are group notifications
    mask_notifications = df['user'].isna()
    df.loc[mask_notifications, 'user'] = 'group_notification'
    df.loc[mask_notifications, 'message'] = df.loc[mask_notifications, 'user_messages']

    df.drop(columns=['user_messages', 'message_dates', 'cleaned_dates'], inplace=True)

    # 8. Date-time features
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month_name()
    df['month_num'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['day_name'] = df['date'].dt.day_name()
    df['hour'] = df['date'].dt.hour
    df['minute'] = df['date'].dt.minute

    # 9. Global Sort
    df.sort_values('date', inplace=True)
    df.reset_index(drop=True, inplace=True)

    return df

