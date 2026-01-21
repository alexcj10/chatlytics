import emoji

EMOJI_SENTIMENT_MAP = {
    "😂": " laugh positive ",
    "🤣": " laugh positive ",
    "😄": " happy positive ",
    "😊": " happy positive ",
    "🙂": " positive ",
    "❤️": " love positive ",
    "😍": " love positive ",
    "👍": " approve positive ",
    "🙏": " thankful positive ",

    "😡": " angry negative ",
    "😠": " angry negative ",
    "😢": " sad negative ",
    "😭": " sad negative ",
    "💔": " heartbreak negative ",
    "👎": " disapprove negative ",
    "😞": " sad negative ",
}

def replace_emojis_with_text(text: str) -> str:
    for emo, meaning in EMOJI_SENTIMENT_MAP.items():
        text = text.replace(emo, meaning)
    return text
