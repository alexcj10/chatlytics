"""
VADER-based Sentiment Analyzer with Enhanced Hinglish Support
Optimized for WhatsApp chat analysis with English and Roman Hindi text

This module provides a professional-grade sentiment analysis solution
that handles:
- English text
- Roman Hindi (Hinglish) text
- Emojis and emoticons
- Social media slang
- Intensity modifiers
"""

import re
import emoji
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


# =============================================================================
# COMPREHENSIVE HINGLISH LEXICON
# =============================================================================
# Format: word -> sentiment intensity (-4 to +4 scale)
# Positive: +1 to +4 (mild to strong positive)
# Negative: -1 to -4 (mild to strong negative)

HINGLISH_LEXICON = {
    # ----- STRONG POSITIVE (+2.5 to +4) -----
    "awesome": 3.5,
    "amazing": 3.5,
    "zabardast": 3.5,      # Fantastic
    "shandaar": 3.5,       # Magnificent
    "kamaal": 3.2,         # Amazing
    "lajawaab": 3.5,       # Incomparable
    "mast": 3.0,           # Cool/Awesome
    "badiya": 3.0,         # Great
    "badhiya": 3.0,        # Great (alt spelling)
    "shandar": 3.5,        # Magnificent
    "jabardast": 3.5,      # Fantastic (alt spelling)
    "faadu": 3.0,          # Awesome (slang)
    "jhakaas": 3.2,        # Super (Mumbai slang)
    "superb": 3.5,
    "fantastic": 3.5,
    "excellent": 3.5,
    "brilliant": 3.5,
    "wonderful": 3.5,
    "terrific": 3.2,
    "wahh": 3.0,           # Wow expression
    "waah": 3.0,           # Wow expression
    "wah": 2.8,            # Wow expression
    "lovely": 3.0,
    "beautiful": 3.0,
    "perfect": 3.5,
    
    # ----- MODERATE POSITIVE (+1.5 to +2.5) -----
    "accha": 2.0,          # Good/Okay
    "acha": 2.0,           # Good (alt)
    "achha": 2.0,          # Good (alt)
    "theek": 1.5,          # Okay/Fine
    "thik": 1.5,           # Okay (alt)
    "sahi": 2.2,           # Right/Correct/Cool
    "shi": 2.0,            # Right (short)
    "mazaa": 2.5,          # Fun/Enjoyment
    "maza": 2.5,           # Fun (alt)
    "maja": 2.5,           # Fun (alt)
    "khush": 2.5,          # Happy
    "khushi": 2.5,         # Happiness
    "pyaar": 2.5,          # Love
    "pyar": 2.5,           # Love (alt)
    "dil": 1.8,            # Heart
    "hasna": 2.0,          # Laugh
    "hasi": 2.0,           # Laughter
    "enjoy": 2.0,
    "party": 1.5,
    "celebration": 2.0,
    "shaadi": 2.0,         # Wedding
    "dost": 1.8,           # Friend
    "yaar": 1.5,           # Friend/buddy
    "bhai": 1.5,           # Brother/bro
    "bro": 1.5,
    "dude": 1.3,
    "behen": 1.5,          # Sister
    "jeet": 2.5,           # Win/Victory
    "jiyo": 2.5,           # Long live!
    "zindabad": 2.5,       # Long live!
    "barobar": 2.0,        # Equal/Right
    "sundar": 2.5,         # Beautiful
    "sexy": 2.0,           # Attractive (often used casually)
    "cute": 2.5,
    "sweet": 2.2,
    "smart": 2.0,
    "talented": 2.5,
    "proud": 2.0,
    "congrats": 2.5,
    "congratulations": 2.8,
    "badhai": 2.5,         # Congratulations
    "shubh": 2.0,          # Auspicious
    "mangal": 2.0,         # Auspicious
    "dhanyavaad": 2.0,     # Thank you
    "dhanyawad": 2.0,      # Thank you (alt)
    "shukriya": 2.0,       # Thank you (Urdu)
    "thanks": 1.8,
    "thankyou": 2.0,
    "thanku": 1.8,
    "thnx": 1.5,
    "thx": 1.5,
    "ty": 1.5,
    
    # ----- MILD POSITIVE (+0.5 to +1.5) -----
    "haan": 1.0,           # Yes
    "han": 1.0,            # Yes (alt)
    "haa": 0.8,            # Yes (alt)
    "ji": 1.0,             # Respectful yes
    "jee": 1.0,            # Respectful yes (alt)
    "bilkul": 1.5,         # Absolutely
    "zaroor": 1.2,         # Definitely
    "pakka": 1.5,          # Confirmed/Sure
    "confirm": 1.2,
    "done": 1.0,
    "ok": 0.5,
    "okay": 0.5,
    "k": 0.3,
    "kk": 0.5,
    "hmm": 0.3,
    "hmmm": 0.3,
    "interesting": 1.2,
    "nice": 1.8,
    "noice": 2.0,          # Slang nice
    "naice": 2.0,          # Slang nice (alt)
    "cool": 1.8,
    "kool": 1.8,           # Cool (alt spelling)
    "chill": 1.5,
    
    # ----- MILD NEGATIVE (-0.5 to -1.5) -----
    "nahi": -0.8,          # No
    "nai": -0.8,           # No (alt)
    "na": -0.5,            # No (short)
    "mat": -0.8,           # Don't
    "ruk": -0.5,           # Wait/Stop
    "wait": -0.3,
    "baad": -0.3,          # Later
    "kal": 0.0,            # Tomorrow (neutral)
    "boring": -1.5,
    "bore": -1.2,
    "thaka": -1.0,         # Tired
    "tired": -1.0,
    "busy": -0.8,
    "late": -0.8,
    "problem": -1.2,
    "issue": -1.0,
    "confuse": -1.0,
    "confused": -1.2,
    "tension": -1.5,
    "stress": -1.5,
    
    # ----- MODERATE NEGATIVE (-1.5 to -2.5) -----
    "bura": -2.0,          # Bad
    "ganda": -2.2,         # Dirty/Bad
    "kharab": -2.0,        # Bad/Spoiled
    "bekar": -2.2,         # Useless
    "bekaar": -2.2,        # Useless (alt)
    "faltu": -2.2,         # Useless/Waste
    "nakli": -1.8,         # Fake
    "jhooth": -2.0,        # Lie
    "jhoot": -2.0,         # Lie (alt)
    "galat": -2.0,         # Wrong
    "galt": -1.8,          # Wrong (alt)
    "mushkil": -1.5,       # Difficult
    "dukh": -2.0,          # Sadness
    "dard": -2.0,          # Pain
    "takleef": -2.0,       # Trouble
    "pareshan": -2.0,      # Troubled
    "gussa": -2.2,         # Anger
    "angry": -2.2,
    "irritate": -2.0,
    "irritated": -2.2,
    "annoyed": -2.0,
    "annoying": -2.2,
    "sad": -2.0,
    "upset": -2.2,
    "disappointed": -2.5,
    "disappoint": -2.2,
    "hurt": -2.2,
    "rude": -2.0,
    "mean": -1.8,
    "wrong": -1.8,
    "bad": -2.0,
    "worst": -3.0,
    "worse": -2.5,
    "hate": -3.0,
    "dislike": -2.0,
    "sorry": -0.8,         # Apology (mild negative context)
    "maafi": -0.8,         # Forgiveness/Sorry
    
    # ----- STRONG NEGATIVE (-2.5 to -4) -----
    "bakwas": -3.0,        # Nonsense
    "bakwaas": -3.0,       # Nonsense (alt)
    "ghatiya": -3.0,       # Low quality/Disgusting
    "wahiyat": -3.2,       # Terrible
    "wahiyaat": -3.2,      # Terrible (alt)
    "bhadda": -2.8,        # Ugly
    "stupid": -2.8,
    "idiot": -3.0,
    "fool": -2.5,
    "pagal": -2.5,         # Crazy/Mad (context-dependent but often negative)
    "paagal": -2.5,        # Crazy (alt)
    "bewakoof": -3.0,      # Fool
    "gadha": -2.8,         # Donkey (insult)
    "ullu": -2.5,          # Owl (insult - fool)
    "chutiya": -3.8,       # Strong insult
    "mc": -3.5,            # Abbreviated insult
    "bc": -3.5,            # Abbreviated insult
    "bsdk": -3.5,          # Abbreviated insult
    "saala": -2.5,         # Mild insult
    "kameena": -3.2,       # Jerk/Scoundrel
    "harami": -3.2,        # Bastard
    "gandu": -3.5,         # Strong insult
    "madarchod": -4.0,     # Very strong insult
    "bhenchod": -4.0,      # Very strong insult
    "terrible": -3.2,
    "horrible": -3.2,
    "awful": -3.0,
    "disgusting": -3.5,
    "pathetic": -3.0,
    "useless": -2.5,
    "trash": -3.0,
    "garbage": -3.0,
    "crap": -2.5,
    "shit": -3.0,
    "damn": -2.0,
    "hell": -2.0,
    "fuck": -3.5,
    "wtf": -2.8,
    "ffs": -2.5,
    
    # ----- EXPRESSIONS & REACTIONS -----
    "lol": 2.0,            # Laughing
    "lmao": 2.5,           # Laughing hard
    "lmfao": 2.8,          # Laughing very hard
    "rofl": 2.5,           # Rolling on floor laughing
    "haha": 2.0,
    "hahaha": 2.5,
    "hahahaha": 2.8,
    "hehe": 1.8,
    "hehehe": 2.0,
    "hihi": 1.5,
    "xd": 2.0,
    "xD": 2.0,
    "omg": 1.5,            # Surprise (often positive)
    "wow": 2.5,
    "yay": 2.8,
    "yaay": 3.0,
    "yaaay": 3.2,
    "hurray": 3.0,
    "hooray": 3.0,
    "woot": 2.5,
    "woohoo": 3.0,
    "uff": -1.0,           # Frustration
    "uhh": -0.5,
    "ugh": -1.8,
    "eww": -2.5,
    "meh": -0.8,
    "bleh": -1.0,
    "argh": -2.0,
    "grr": -2.0,
    "hmph": -1.2,
    "oops": -1.0,
    "ouch": -1.5,
    "aww": 2.0,            # Cute/Sweet
    "awww": 2.5,
    "awwww": 2.8,
    
    # ----- EMOJI TEXT REPRESENTATIONS -----
    ":)": 2.0,
    ":-)": 2.0,
    ":(": -2.0,
    ":-(": -2.0,
    ":D": 2.5,
    ":-D": 2.5,
    ";)": 1.8,
    ";-)": 1.8,
    ":P": 1.5,
    ":-P": 1.5,
    ":p": 1.5,
    ":/": -1.0,
    ":-/": -1.0,
    ":|": -0.5,
    ":-|": -0.5,
    "<3": 3.0,             # Heart
    "</3": -2.5,           # Broken heart
    
    # ----- HINGLISH INTENSIFIERS -----
    "bahut": 1.5,          # Very (intensifier - boosts following word)
    "bohot": 1.5,          # Very (alt)
    "bhot": 1.3,           # Very (short)
    "boht": 1.3,           # Very (alt short)
    "bht": 1.0,            # Very (abbreviated)
    "kafi": 1.2,           # Quite/Enough
    "zyada": 1.0,          # More/Too much
    "ekdum": 1.5,          # Absolutely
    "puri": 1.2,           # Completely
    "poora": 1.2,          # Complete/Full
    "sabse": 1.3,          # Most
    "asli": 1.2,           # Real/Genuine
    "sacchi": 1.5,         # Truly
    "sach": 1.2,           # Truth
    "sach mein": 1.5,      # Really/Truly
    "really": 1.3,
    "very": 1.2,
    "super": 1.5,
    "ultra": 1.5,
    "mega": 1.5,
    "totally": 1.3,
    "absolutely": 1.5,
    "completely": 1.3,
    "extremely": 1.5,
    
    # ----- COMMON WHATSAPP PHRASES -----
    "bol": 0.5,            # Speak/Tell
    "bolo": 0.5,           # Speak/Tell
    "batao": 0.5,          # Tell me
    "bta": 0.3,            # Tell (short)
    "kya": 0.0,            # What (neutral)
    "kaise": 0.0,          # How (neutral)
    "kaisa": 0.0,          # How (neutral)
    "kahan": 0.0,          # Where (neutral)
    "kab": 0.0,            # When (neutral)
    "kyun": -0.3,          # Why (slightly questioning)
    "kyu": -0.3,           # Why (alt)
    "achanak": -0.5,       # Suddenly
    "jaldi": 0.0,          # Quickly
    "abhi": 0.0,           # Now
    "baaki": 0.0,          # Remaining
    "phir": 0.0,           # Then/Again
    "fir": 0.0,            # Then (alt)
    "aur": 0.0,            # And
    "bhi": 0.0,            # Also
    "sirf": 0.0,           # Only
    "bas": 0.0,            # Just/Enough
    "khatam": -0.5,        # Finished/Over
    "chalo": 0.5,          # Let's go
    "chal": 0.3,           # Go/Alright
    "aa": 0.3,             # Come
    "aaja": 0.5,           # Come
    "milte": 0.8,          # Meet
    "milenge": 0.8,        # Will meet
    "miss": 1.5,           # Missing someone
    "yaad": 1.2,           # Remember/Memory
}


class HinglishVaderAnalyzer:
    """
    Enhanced VADER Sentiment Analyzer with Hinglish/Roman-Hindi support.
    
    This analyzer extends VADER's capabilities by:
    1. Adding a comprehensive Hinglish lexicon
    2. Pre-processing text to handle common patterns
    3. Providing multi-state sentiment classification
    """
    
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        
        # Update VADER's lexicon with Hinglish words
        for word, score in HINGLISH_LEXICON.items():
            self.analyzer.lexicon[word] = score
    
    def _preprocess(self, text: str) -> str:
        """
        Preprocess text for better sentiment analysis.
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Convert to lowercase for consistent matching
        text = text.lower()
        
        # Handle repeated characters (e.g., "noooo" -> "nooo", "yesss" -> "yess")
        # Keep at most 3 repeated characters to preserve intensity
        text = re.sub(r'(.)\1{3,}', r'\1\1\1', text)
        
        # Convert emojis to text descriptions (VADER handles this, but we enhance)
        text = emoji.demojize(text, delimiters=(" ", " "))
        
        # Clean up common WhatsApp patterns
        text = re.sub(r'<media omitted>', '', text, flags=re.IGNORECASE)
        text = re.sub(r'<[^>]+>', '', text)  # Remove other tags
        
        # Clean URLs
        text = re.sub(r'http\S+|www\S+', '', text)
        
        # Normalize spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def analyze(self, text: str) -> dict:
        """
        Analyze sentiment of a single text message.
        
        Returns:
            dict with keys:
                - compound: Overall sentiment score (-1 to +1)
                - positive: Positive sentiment ratio (0 to 1)
                - negative: Negative sentiment ratio (0 to 1)
                - neutral: Neutral sentiment ratio (0 to 1)
                - label: Sentiment label (Positive/Negative/Neutral)
        """
        processed_text = self._preprocess(text)
        
        if not processed_text:
            return {
                'compound': 0.0,
                'positive': 0.0,
                'negative': 0.0,
                'neutral': 1.0,
                'label': 'Neutral'
            }
        
        scores = self.analyzer.polarity_scores(processed_text)
        
        # Determine label based on compound score
        # Using standard VADER thresholds
        compound = scores['compound']
        if compound >= 0.05:
            label = 'Positive'
        elif compound <= -0.05:
            label = 'Negative'
        else:
            label = 'Neutral'
        
        return {
            'compound': compound,
            'positive': scores['pos'],
            'negative': scores['neg'],
            'neutral': scores['neu'],
            'label': label
        }
    
    def analyze_batch(self, texts: list) -> list:
        """
        Analyze sentiment for a batch of texts efficiently.
        
        Returns:
            List of sentiment dictionaries
        """
        return [self.analyze(text) for text in texts]
    
    def get_aggregate_sentiment(self, texts: list) -> dict:
        """
        Get aggregate sentiment statistics for a list of texts.
        
        Returns:
            dict with:
                - positive_percentage: % of positive messages
                - negative_percentage: % of negative messages
                - neutral_percentage: % of neutral messages
                - average_compound: Average compound score
                - total_messages: Total number of messages
        """
        if not texts:
            return {
                'positive_percentage': 0.0,
                'negative_percentage': 0.0,
                'neutral_percentage': 0.0,
                'average_compound': 0.0,
                'total_messages': 0
            }
        
        results = self.analyze_batch(texts)
        
        positive_count = sum(1 for r in results if r['label'] == 'Positive')
        negative_count = sum(1 for r in results if r['label'] == 'Negative')
        neutral_count = sum(1 for r in results if r['label'] == 'Neutral')
        
        total = len(results)
        avg_compound = sum(r['compound'] for r in results) / total if total > 0 else 0.0
        
        return {
            'positive_percentage': round((positive_count / total) * 100, 2) if total > 0 else 0.0,
            'negative_percentage': round((negative_count / total) * 100, 2) if total > 0 else 0.0,
            'neutral_percentage': round((neutral_count / total) * 100, 2) if total > 0 else 0.0,
            'average_compound': round(avg_compound, 4),
            'total_messages': total
        }


# Create a singleton instance for efficiency
_analyzer = None

def get_analyzer() -> HinglishVaderAnalyzer:
    """Get or create the singleton analyzer instance."""
    global _analyzer
    if _analyzer is None:
        _analyzer = HinglishVaderAnalyzer()
    return _analyzer
