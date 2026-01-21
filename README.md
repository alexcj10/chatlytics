---
title: Chatlytics Backend
emoji: 📊
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

<p align="center">
  <img src="frontend/public/chatlytics.png" alt="Chatlytics Logo" width="80" height="80">
</p>

<h1 align="center">Chatlytics</h1>

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

### 🔍 Advanced Insights
- **Most Busy Day/Hour/Month** — Identify peak activity periods
- **Response Time Analysis** — Average response times per user
- **Conversation Initiator** — Who starts conversations the most
- **Longest Message** — By character count
- **Most Wordy Message** — By word count
- **Common Words** — Top 20 frequently used words (excluding stopwords)
- **Emoji Analysis** — Top 10 most used emojis

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
      "daily_timeline": [...],
      "hourly_activity": [...],
      "weekly_activity": [...],
      "monthly_activity": [...],
      "quarterly_activity": [...],
      "yearly_activity": [...],
      "most_busy_day": {...},
      "most_busy_weekday": "Saturday",
      "most_busy_month": {...},
      "most_busy_hour": 21,
      "response_time_analysis": {...},
      "conversation_initiator": {...},
      "longest_message": {...},
      "most_wordy_message": {...},
      "most_common_words": {...},
      "emoji_analysis": {...}
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
├── app/                    # Backend (FastAPI)
│   ├── main.py            # API routes and main logic
│   ├── analytics.py       # 19 analytics functions
│   └── preprocess.py      # WhatsApp chat parser
├── frontend/              # Frontend (Next.js)
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AdvancedAnalytics.tsx
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
