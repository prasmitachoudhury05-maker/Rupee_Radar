# RupeeRadar: System Architecture

## 1. System Overview
RupeeRadar is an AI-powered personal finance assistant designed to ingest raw bank statement data (PDFs, CSVs, or Excel files), process and categorize transactions, and present meaningful financial insights through a user-friendly dashboard. 

The architecture is divided into three main layers:
- **Presentation Layer (Frontend):** Handles user interactions, file uploads, data visualization, and conversational AI chat.
- **Application Layer (Backend):** Manages API requests, orchestrates data processing, handles business logic, and generates exportable reports.
- **AI / Data Processing Layer:** Responsible for parsing statements, anonymizing data, categorizing transactions, generating insights, and answering user queries.

---

## 2. Component Architecture

### 2.1 Frontend (Presentation Layer)
- **Framework:** React / Next.js (or Vite) 
- **Styling:** Tailwind CSS for rapid UI development, along with a charting library (e.g., Recharts or Chart.js) for the dashboard.
- **Responsibilities:**
  - **Dynamic File Upload & Mapper:** Upload interface with a "Flexible CSV Mapper" to allow users to map columns (Date, Amount, Description) if their bank format is unrecognized.
  - **Dashboard:** Displaying key metrics (Total Income, Total Spend, Savings) and Budget Alerts.
  - **Visual Charts:** Showing spending categories and recurring payments.
  - **AI Chat Interface:** A "Chat with your Data" module where users can ask questions in plain English.
  - **Report Export:** Button to download a compiled PDF report.

### 2.2 Backend (Application Layer)
- **Framework:** Python with FastAPI or Flask.
- **Responsibilities:**
  - Expose RESTful APIs for file uploads, retrieving transactions, fetching insights, and handling chat queries.
  - Budgeting logic to track spending against user-defined limits.
  - PDF Report Generation engine (e.g., using ReportLab or PDFKit).
  - Act as a bridge between the frontend and the AI processing services.

### 2.3 AI & Data Processing Layer
- **Data Extraction & Flexible Parsing:** 
  - Using `pandas` and flexible mapping schemas to ingest data, falling back to user-defined mappings when necessary.
- **Privacy & Anonymization Engine (NEW):**
  - A pre-processing step that scrubs Personally Identifiable Information (PII) such as Account Numbers, Names, and Exact Balances before any data is sent to external LLMs.
- **Categorization & Recurring Payment Detection:**
  - **LLM Integration:** Classify transactions into predefined categories based on anonymized descriptions.
  - **Heuristics:** Identify recurring payments.
- **Insight Generation & Conversational Querying:**
  - Generate 3+ personalized insights based on aggregate data.
  - Convert natural language chat queries ("How much did I spend on food?") into database queries or LLM context lookups.

### 2.4 Database / Storage Layer
- **Database:** SQLite (for local prototype) or PostgreSQL (for deployment).
- **Responsibilities:**
  - Store uploaded user data securely.
  - Maintain structured tables for `Users`, `Transactions`, `Categories`, `Insights`, and `Budgets`.

### 2.5 Deployment & Hosting Layer
- **Frontend Hosting:** Vercel or Netlify for instant, edge-cached React delivery.
- **Backend Hosting:** Render or Railway to host the Python FastAPI server and handle the LLM API routing.
- **Demo Mode Engine:** Pre-loaded dummy data state that bypasses the upload phase for frictionless evaluation.

---

## 3. Data Flow Workflow

1. **Upload & Map:** User uploads a statement. If the format is unknown, the Frontend prompts the user to map the columns.
2. **Ingestion & Anonymization:** Backend receives the data, structures it, and actively scrubs PII (Anonymization Layer).
3. **Categorization:** Scrubbed transaction descriptions are sent to an AI model to retrieve clean names and categories.
4. **Analysis & Budgeting:** The system calculates totals, identifies recurring payments, and checks spending against user-defined budgets.
5. **Storage & Insight Generation:** The enriched data is saved. The LLM generates summary insights.
6. **Visualization & Interaction:** The Frontend renders the dashboard. The user can view alerts, download a PDF report, or use the Chat Interface to ask specific questions about their finances.

---

## 4. Security & Privacy Considerations
- **Data Anonymization:** Critical step before AI processing to ensure trust.
- **Local Processing Priority:** Option to run local open-source LLMs (like Llama-3 or Mistral) for users who want zero external API calls.
