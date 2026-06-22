# 💸 RupeeRadar: AI-Powered Personal Finance Engine

![RupeeRadar Dashboard](https://img.shields.io/badge/Status-Live-success) ![React](https://img.shields.io/badge/React-18-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green) ![SQLite](https://img.shields.io/badge/Database-SQLite-lightgrey)

**RupeeRadar** is a next-generation personal finance dashboard that automatically ingests raw, messy bank statements and uses state-of-the-art Generative AI (Llama-3.1 via Groq) to categorize transactions, detect recurring subscriptions, and provide personalized financial insights.

---

## 🎥 Project Demo

👉 **[Click Here to Watch the RupeeRadar Video Demo!](https://github.com/prasmitachoudhury05-maker/Rupee_Radar/blob/main/Rupee_Radar.mp4)**

---

## 🚀 Features

*   **🪄 AI Auto-Categorization:** Upload any CSV statement. The LLM automatically cleans up cryptic bank descriptions (e.g., "POS/ZOMATO/1234") and categorizes them accurately.
*   **📊 Dynamic Dashboard:** Instantly visualize your spending habits, top expense categories, and net savings using beautiful, responsive charts.
*   **🤖 "Talk to Your Bank Statement":** An embedded AI Chatbot that allows you to query your financial data in natural language (e.g., *"How much did I spend on food this month?"*).
*   **🎯 Smart Budgeting:** Set customized monthly limits for any category. Real-time progress bars warn you when you are approaching or exceeding your limits.
*   **🕵️‍♂️ Subscription Sniper:** Automatically detects hidden recurring payments (Netflix, EMIs, Rent) and projects their devastating yearly impact on your wallet.
*   **📄 One-Click PDF Reports:** Instantly generate and download a multi-page professional PDF containing your financial health summary and AI insights.
*   **🏦 Multi-Bank Aggregation:** Seamlessly upload multiple statements from different banks (HDFC, SBI, ICICI). The engine aggregates them into a unified net-worth view.

---

## 🏗️ System Architecture

RupeeRadar uses a modern decoupled architecture:

1.  **Frontend (React + Vite + TailwindCSS + Recharts)**
    *   Handles file uploads, data visualization, and conversational UI.
2.  **Backend (Python + FastAPI)**
    *   Provides REST APIs. Uses `pandas` for initial data cleaning.
3.  **Database (SQLite + SQLAlchemy)**
    *   Stores transactions, categories, budgets, and generated insights permanently.
4.  **AI Engine (Groq Llama-3.1 API)**
    *   Powers the auto-categorization heuristics, chat interface, and financial advice generation.

---

## 💻 Running the App Locally

If you want to run RupeeRadar on your own machine, follow these 3 simple steps:

### 1. Clone & Set Up Backend
```bash
# Navigate to backend
cd backend

# Create a virtual environment and activate it
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up your Groq API Key
# Create a .env file inside the backend folder and add:
# GROQ_API_KEY=your_key_here

# Run the server
uvicorn app.main:app --reload
```

### 2. Set Up Frontend
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 3. Open the App
Navigate to `http://localhost:5173` in your browser. 
**Pro Tip:** Click the **"Try with Sample Data"** button to instantly populate the dashboard without needing to find a CSV file!

---

## 🌐 Live Demo & Submission Links

*   **Live Web App:** [Insert Vercel URL Here]
*   **Backend API Docs:** [Insert Render URL Here]/docs
*   **Video Walkthrough:** [Insert YouTube URL Here]

*Built with ❤️ for the Hackathon*
