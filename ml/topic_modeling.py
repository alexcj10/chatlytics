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
        # Lowercase
        text = text.lower()
        # Remove media omitted
        text = re.sub(r'<media omitted>', '', text)
        # Remove non-alphabetic
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        return text

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
