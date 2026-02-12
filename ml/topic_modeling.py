import re
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from wordcloud import STOPWORDS
from ml.sentiment_vader import HINGLISH_LEXICON

# Combine standard English stopwords with Hinglish lexicon keys (which are mostly sentiment words but some are common)
# We should also add common Hinglish grammar words that aren't in the sentiment lexicon
HINGLISH_STOPWORDS = {
    "hai", "haan", "ki", "ka", "ke", "ko", "ne", "me", "mein", "se", "hi", "jo", "to", "ta", "te", "ti",
    "par", "pe", "re", "ra", "ri", "ro", "na", "no", "nahin", "nahi", "nai", "naa", "ji", "jee", "ha", 
    "kya", "kyun", "kyu", "kaise", "kab", "kahan", "kahin", "kisi", "kuch", "aisa", "waise", "waise",
    "ab", "tab", "jab", "abhi", "phir", "fir", "baad", "pehle", "pahal", "saath", "sath", "liye", "liye",
    "hota", "hoti", "hote", "hua", "hui", "hue", "gaya", "gayi", "gaye", "jaa", "ja", "raha", "rahi", "rahe",
    "kar", "karke", "karna", "karni", "karne", "diya", "di", "de", "do", "le", "li", "lo", "ayega", "aayega",
    "tha", "thi", "the", "hu", "hoon", "hey", "hello", "hi", "hm", "hmm", "hmmm", "ok", "okay", "kk", "k"
}

ALL_STOPWORDS = set(STOPWORDS).union(HINGLISH_STOPWORDS).union(set(HINGLISH_LEXICON.keys()))

class TopicModeler:
    def __init__(self, n_topics=5, n_top_words=10):
        self.n_topics = n_topics
        self.n_top_words = n_top_words
        self.vectorizer = CountVectorizer(stop_words=list(ALL_STOPWORDS), max_df=0.95, min_df=2)
        self.lda = LatentDirichletAllocation(n_components=n_topics, random_state=42, learning_method='online')

    def _preprocess_text(self, text):
        if not isinstance(text, str):
            return ""
        
        # 1. Lowercase
        text = text.lower()
        
        # 2. Remove URLs (http/https/www)
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # 3. Remove media omitted
        text = re.sub(r'<media omitted>', '', text)
        
        # 4. Remove non-alphabetic characters (keep spaces)
        text = re.sub(r'[^a-z\s]', ' ', text)
        
        # 5. Remove long words (likely junk codes/hashes) and short words
        # Keeping words between 3 and 15 characters
        words = text.split()
        cleaned_words = [w for w in words if 3 <= len(w) <= 15]
        
        result = " ".join(cleaned_words)
        # Debug log for long strings (temporary)
        if len(result) > 50 and "http" in text: 
            print(f"[DEBUG] Original: {text[:50]}... -> Cleaned: {result[:50]}...")
            
        return result

    def fit_transform(self, messages):
        if not messages or len(messages) < 10: # Minimum messages to find meaningful topics
            return []

        processed_messages = [self._preprocess_text(m) for m in messages if self._preprocess_text(m).strip()]
        
        if not processed_messages:
            return []

        try:
            tf = self.vectorizer.fit_transform(processed_messages)
            if tf.shape[1] == 0:
                return []
            
            self.lda.fit(tf)
            
            feature_names = self.vectorizer.get_feature_names_out()
            topics = []
            
            for topic_idx, topic in enumerate(self.lda.components_):
                top_words_idx = topic.argsort()[:-self.n_top_words - 1:-1]
                top_words = [feature_names[i] for i in top_words_idx]
                topics.append({
                    "topic_id": topic_idx + 1,
                    "words": top_words
                })
            
            return topics
        except Exception as e:
            print(f"Error in TopicModeler: {e}")
            return []

def extract_topics(df, n_topics=5):
    modeler = TopicModeler(n_topics=n_topics)
    messages = df['message'].tolist()
    return modeler.fit_transform(messages)
