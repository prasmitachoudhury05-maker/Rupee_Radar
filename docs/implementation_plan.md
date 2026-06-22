# RupeeRadar: Phase-Wise Implementation Plan

Based on the system architecture, the development of RupeeRadar will be broken down into the following distinct phases. This ensures a structured approach, moving from foundation to AI integration, advanced features, and final presentation.

## Phase 1: Foundation & Setup
**Goal:** Initialize the project repositories and establish the core technology stack.
- **Tasks:**
  - Set up the Frontend project (Vite + React / Next.js) and configure Tailwind CSS.
  - Set up the Backend project (Python + FastAPI) and create a basic virtual environment.
  - Initialize the database schema for `Transactions`, `Categories`, `Insights`, and `Budgets`.
  - Establish basic routing and folder structures.

## Phase 2: Data Ingestion & Flexible Mapping
**Goal:** Allow users to upload bank statements securely and map unknown formats.
- **Tasks:**
  - Build a file upload UI component in the Frontend.
  - Implement a **Flexible CSV Mapper** UI so users can assign columns (Date, Amount, Description) if the bank format is unrecognized.
  - Create a Backend API endpoint to receive and parse files.
  - **Privacy First:** Implement the **Data Anonymization Step** in the backend to strip account numbers and names before further processing.

## Phase 3: AI Categorization & Processing Layer
**Goal:** Add intelligence to categorize raw transactions and identify recurring payments.
- **Tasks:**
  - Integrate an LLM API (OpenAI) or local NLP model.
  - Send *anonymized* descriptions to classify them into categories (Food, Travel, Bills, EMI, etc.).
  - Implement heuristic logic to detect recurring payments.
  - Save the categorized and enriched data securely to the database.

## Phase 4: Financial Metrics, Budgeting & Insights
**Goal:** Calculate the core financial numbers, set budgets, and generate insights.
- **Tasks:**
  - Build Backend logic to calculate Total Income, Spend, Savings, and Top Categories.
  - Implement **Smart Budgeting**: Allow users to set budgets per category and calculate progress.
  - Feed aggregated data back to the LLM to generate personalized spending insights.
  - Expose REST API endpoints to fetch these metrics.

## Phase 5: Dashboard Visualization & Chat Interface
**Goal:** Present the processed data beautifully and allow users to converse with it.
- **Tasks:**
  - Build Dashboard UI (Summary Cards, Budget Alerts).
  - Integrate a charting library (Recharts) for pie/bar charts of spending categories and trends.
  - Build the **"Chat with your Data" Interface**: A chatbot window where users can ask questions like "How much did I spend on Zomato?".
  - Route chat queries through the backend to the LLM with relevant context.

## Phase 6: Reporting, Testing & Final Polish
**Goal:** Ensure the end-to-end workflow is bug-free and provide a shareable output.
- **Tasks:**
  - Implement the **Downloadable PDF Report** feature (Backend PDF generation + Frontend download button).
  - Test the platform with messy, real-world sample bank statements from various banks.
  - Polish the UI/UX, ensuring the application feels premium, responsive, and trustworthy.
  - Write final documentation on how to run the prototype.

## Phase 7: Deployment & Submission Packaging (The "Winning" Phase)
**Goal:** Remove all friction for evaluators by providing a live, pre-populated working demo.
- **Tasks:**
  - **Live Hosting:** Deploy the Frontend to Vercel/Netlify and the Backend to Render/Railway.
  - **Sample Data Integration:** Add a "Try with Sample Data" button on the landing page so judges can see a fully populated dashboard instantly without needing to upload their own CSV.
  - **Demo Video:** Record a crisp 2-minute walkthrough highlighting the auto-categorization and AI Chat features.
  - **Final Submission Assembly:** Package the live URL, GitHub repo link, Demo Video, and Architecture Document into the final submission format.
