import pandas as pd
import re
import emoji
import string
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
from emoji_map import replace_emojis_with_text

# -----------------------------
# Text Cleaning Function
# -----------------------------
def clean_text(text):
    text = str(text).lower()

    # remove URLs
    text = re.sub(r"http\S+|www\S+", "", text)

    # remove emojis
    text = replace_emojis_with_text(text)

    # remove numbers
    text = re.sub(r"\d+", "", text)

    # remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))

    # remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# -----------------------------
# Load Data
# -----------------------------
train_df = pd.read_csv(r"C:\Users\ALEX\Downloads\chatlytics\ml\train.csv")
val_df   = pd.read_csv(r"C:\Users\ALEX\Downloads\chatlytics\ml\val.csv")
test_df  = pd.read_csv(r"C:\Users\ALEX\Downloads\chatlytics\ml\test.csv")

# -----------------------------
# Apply Cleaning
# -----------------------------
train_df["sentence"] = train_df["sentence"].apply(clean_text)
val_df["sentence"]   = val_df["sentence"].apply(clean_text)
test_df["sentence"]  = test_df["sentence"].apply(clean_text)

X_train = train_df["sentence"]
y_train = train_df["label"]

X_val = val_df["sentence"]
y_val = val_df["label"]

X_test = test_df["sentence"]
y_test = test_df["label"]


# -----------------------------
# Build Pipeline
# -----------------------------
pipeline = Pipeline(
    steps=[
        (
            "tfidf",
            TfidfVectorizer(
                max_features=50000,
                ngram_range=(1, 2),
                stop_words="english"
            ),
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=2000,
                solver="liblinear",
                C=2.0,
                class_weight="balanced"
            ),
        ),
    ]
)


# -----------------------------
# Train Model
# -----------------------------
pipeline.fit(X_train, y_train)


# -----------------------------
# Validation Performance
# -----------------------------
val_preds = pipeline.predict(X_val)
print("Validation Accuracy:", accuracy_score(y_val, val_preds))
print("\nValidation Report:\n", classification_report(y_val, val_preds))


# -----------------------------
# Test Performance
# -----------------------------
test_preds = pipeline.predict(X_test)
print("Test Accuracy:", accuracy_score(y_test, test_preds))
print("\nTest Report:\n", classification_report(y_test, test_preds))


# -----------------------------
# Save Model
# -----------------------------
joblib.dump(pipeline, "models/sentiment_pipeline.pkl")
print("\n✅ Model saved as models/sentiment_pipeline.pkl")
