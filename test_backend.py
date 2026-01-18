from app.preprocess import preprocess_whatsapp_text
from app.analytics import *

# Load WhatsApp chat
with open("WhatsApp Chat with Rahul Kes.txt", "r", encoding="utf-8") as f:
    data = f.read()

df = preprocess_whatsapp_text(data)

print("DF shape:", df.shape)
print(df.head())

print("Users:", get_user_list(df))
print("Basic stats:", fetch_basic_stats(df))
print("Links:", count_links(df))
print("Most active users:", most_active_users(df))
print("Weekly activity:", weekly_activity(df))
print("Monthly activity:", monthly_activity(df))
print("Most busy weekday:", most_busy_weekday(df))
print("Emoji analysis:", emoji_analysis(df))
print("Daily timeline:", daily_timeline(df).head())
print("Hourly activity:", hourly_activity(df).head())
print("Quarterly activity:", quarterly_activity(df))
print("Yearly activity:", yearly_activity(df))
print("Most busy day:", most_busy_day(df))
print("Most busy month:", most_busy_month(df))
print("Response time:", response_time_analysis(df))
print("Conversation initiator:", conversation_initiator(df))
print("Longest message:", longest_message(df))
print("Most wordy message:", most_wordy_message(df))
print("Common words:", most_common_words(df))
