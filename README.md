---
title: Chatlytics Backend
emoji: 📊
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
---

<p align="center">
  <img src="frontend/public/chatlytics.png" alt="Chatlytics Logo" width="80" height="80">
</p>

<h1 align="center" style="font-size: 2.5em;">Chatlytics</h1>

<p align="center">
  <strong>A powerful WhatsApp Chat Analyzer with beautiful visualizations</strong>
</p>

<p align="center">
  <a href="https://chatlytics.netlify.app">🚀 Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#api-reference">API</a>
</p>

---

## ✨ Overview

Chatlytics is a modern web application that transforms your WhatsApp chat exports into insightful analytics and beautiful visualizations. Upload your chat file and discover patterns in your conversations with 19+ analytics metrics.

**🌐 Live Application:** [chatlytics.netlify.app](https://chatlytics.netlify.app)

---

## 🎯 Features

### 📊 Core Analytics
- **Basic Stats** — Total messages, words, and media shared
- **Links Shared** — Count of all URLs in conversations
- **Most Active Users** — Top 10 contributors (for group chats)

### 📈 Time-Based Analysis
- **Daily Timeline** — Message activity over days
- **Hourly Distribution** — Peak hours of activity
- **Weekly Activity** — Day-of-week patterns
- **Monthly Trends** — Seasonal patterns
- **Quarterly Growth** — Long-term engagement
- **Yearly Overview** — Year-over-year comparison

### 🔍 Advanced ML & Algorithmic Insights

#### 🎭 Sentiment Analysis (Hinglish Support)
*   **Initial Approach:** Supervised Learning via **TF-IDF Vectorization & Logistic Regression** classifier.
*   **Current Engine:** **VADER (Valence Aware Dictionary and sEntiment Reasoner)** for real-time rule-based intensity mapping.
*   **Hinglish Implementation:** Augmented the VADER lexicon with a custom **Hinglish/Roman-Hindi Lexicon** (+300 words like *zabardast, mast, badiya, bakwas*) to handle code-switching in Indian chat contexts.

#### 🏗️ Topic Modeling
*   **Algorithm:** **LDA (Latent Dirichlet Allocation)** from `scikit-learn` for unsupervised theme discovery.
*   **Methodology:** Uses **Count Vectorization** with a combined stopword engine (Standard English + Custom Hinglish Grammar) to extract semantic themes and their temporal distribution.

#### 🏥 Chat Health Score (Conversational Fitness)
*   **Mathematical Formula:**
    $$Score = (0.30 \cdot S) + (0.25 \cdot E) + (0.20 \cdot R) + (0.15 \cdot B) - P$$
*   **Metrics:** 
    - **$S$ (Sentiment):** Positive/Negative compound ratio.
    - **$E$ (Engagement):** Message frequency & active days.
    - **$R$ (Response):** Temporal latency mapping.
    - **$B$ (Balance):** Coefficient of Variation for participation.
    - **$P$ (Penalty):** Anomaly deductions.

#### 🚨 Anomaly Detection (Pattern Scrutiny)
*   **Algorithm:** **Isolation Forest** (Ensemble-based unsupervised outlier detection).
*   **Impact Scoring:** Statistical significance calculated via our custom **Z-Score ($\sigma$)** formula:
    $$Z = \frac{\text{MessageCount} - \text{MeanCount}}{\text{StandardDeviation}}$$
*   **Dimensions:** Multidimensional analysis of volume, sentiment, media bursts, and link density.

#### 🧠 Conversation Role Analysis (CRA)
*   **Methodology:** Behavioral mapping using multi-factor activity heatmaps and response latency patterns.
*   **Scope:** **Global Ranking Only** (Reflects the intrinsic dynamics of the entire chat history, providing a static high-level behavioral overview).
*   **The 6 Behavioral Personas:**
    - **Initiator** (⚡) — The conversation starter who kicks off new threads.
    - **Responder** (💬) — The fast-action engine who keeps the momentum going.
    - **Driver** (🛡️) — The primary volume steering force in the chat.
    - **Broadcaster** (📻) — Detailed communicators with the highest word-to-message ratios.
    - **Listener** (🎧) — Concise participants who engage steadily with focused input.
    - **Night Owl** (🌙) — The late-night specialist who dominates after-dark activity.

### 🎨 User Experience
- **Per-User Analytics** — Filter all stats by individual participant
- **Dark Theme** — Modern, eye-friendly dark UI
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Interactive Charts** — Powered by Recharts with tooltips

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **Recharts** | Charts and visualizations |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python API |
| **Pandas** | Data processing and analysis |
| **Python Emoji** | Emoji detection and counting |
| **WordCloud** | Stopwords filtering |
| **Uvicorn** | ASGI server |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/alexcj10/chatlytics.git
cd chatlytics
```

### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8000`.

---

## 📤 How to Export WhatsApp Chat

1. Open WhatsApp on your phone
2. Go to the chat you want to analyze
3. Tap **⋮** (menu) → **More** → **Export chat**
4. Choose **Without media** (recommended for faster processing)
5. Save the `.txt` file
6. Upload to Chatlytics!

---

## 🔌 API Reference

### `POST /analyze`

Upload a WhatsApp chat export file for analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (WhatsApp chat .txt export)

**Response:**
```json
{
  "users": ["Overall", "User1", "User2"],
  "analytics": {
    "Overall": {
      "basic_stats": {
        "Total Number of Messages": 5000,
        "Total Number of Words": 25000,
        "Total Number of Media Messages": 150
      },
      "links_shared": 45,
      "most_active_users": {"User1": 2500, "User2": 2500},
      "daily_timeline": [{"date": "2023-01-01", "message_count": 42}],
      "hourly_activity": [{"hour": 14, "message_count": 120}],
      "weekly_activity": [{"day_name": "Monday", "message_count": 850}],
      "monthly_activity": [{"month": "January", "message_count": 1200}],
      "quarterly_activity": [{"quarter": "2023Q1", "message_count": 3500}],
      "yearly_activity": [{"year": 2023, "message_count": 15000}],
      "most_busy_day": {"2023-12-25": 450},
      "most_busy_weekday": "Sunday",
      "most_busy_month": {"December": 4500},
      "most_busy_hour": 21,
      "response_time_analysis": {"User1": 45.5, "User2": 12.2},
      "conversation_initiator": {"User1": 150, "User2": 140},
      "longest_message": {"user": "User1", "message": "...", "date": "..."},
      "most_wordy_message": {"user": "User2", "words": 150, "date": "..."},
      "most_common_words": {"hello": 450, "thanks": 312},
      "emoji_analysis": {"😂": 450, "❤️": 312},
      "sentiment_analysis": {
        "overall": "Positive",
        "compound": 0.45,
        "pos": 0.2, "neg": 0.05, "neu": 0.75
      },
      "user_sentiment_breakdown": {"User1": {...}, "User2": {...}},
      "topic_modeling": [{"topic_id": 1, "words": ["vacation", "beach"]}],
      "topic_timeline": [{"date": "2023-01-01", "topic_id": 1, "count": 5}],
      "chat_health": {
        "score": 82.5,
        "rating": "Healthy",
        "metrics": {"sentiment": 85, "engagement": 90, "response": 75, "balance": 80}
      },
      "anomalies": {
        "spikes": [{"type": "Activity Burst", "date": "2023-12-25", "z_score": 7.08}],
        "drops": [{"type": "Silent Period", "date": "2023-11-01", "gap_hours": 124}]
      }
    }
  }
}
```

---

## 🌍 Deployment

### Frontend (Netlify)
The frontend is deployed on **Netlify** with automatic deployments from the main branch.

**Live URL:** [chatlytics.netlify.app](https://chatlytics.netlify.app)

### Backend (Hugging Face Spaces)
The backend runs as a Docker container on **Hugging Face Spaces**.

```dockerfile
# Uses Python 3.9 with FastAPI
# Exposes port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

---

## 📁 Project Structure

```
chatlytics/
├── app/                    # Backend (FastAPI Layer)
│   ├── main.py            # API routes and orchestration
│   ├── analytics.py       # Core statistical functions
│   ├── preprocess.py      # WhatsApp chat parser
│   └── topics.py          # Topic modeling orchestrator
├── ml/                     # Machine Learning Layer
│   ├── anomalies.py       # Isolation Forest (Outlier Detection)
│   ├── health.py          # Chat Health scoring logic
│   ├── sentiment_vader.py # Enhanced Hinglish VADER engine
│   ├── sentiment_inference.py # Sentiment orchestration
│   └── topic_modeling.py  # LDA-based theme discovery
├── frontend/              # Frontend (Next.js)
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AdvancedAnalytics.tsx
│   │   │   ├── CRAPanel.tsx         # Conversation Role Analysis Panel
│   │   │   ├── StatsCards.tsx
│   │   │   ├── UploadSection.tsx
│   │   │   └── Sidebar.tsx
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── Dockerfile             # HuggingFace deployment
├── requirements.txt       # Python dependencies
└── README.md
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/alexcj10">alexcj10</a>
</p>



