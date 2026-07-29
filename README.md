# AI-Powered Predictive Maintenance Platform

An enterprise-grade, full-stack predictive maintenance application designed for industrial manufacturing plants. The platform integrates time-series sensor monitoring, failure history logging, Gemini 2.5 AI risk prediction, RUL (Remaining Useful Life) estimation, RAG-grounded maintenance engineer chat, and a 4-agent multi-agent maintenance planner.

---

## Technical Stack & Architecture

- **Frontend:** React 18, Vite, Tailwind CSS (Custom Industrial Theme), Recharts, Lucide Icons, React Router v6, Axios, `@tanstack/react-query`.
- **Backend:** Node.js (v20+), Express.js, `@google/genai` (Official Google Gen AI SDK used strictly server-side), Zod validation schemas, CORS, Helmet, Rate Limiter, JWT.
- **Database & Auth Engine:** Supabase PostgreSQL DDL with `pgvector` extension and PostgreSQL Row-Level Security (RLS) policies (`database/schema.sql`).
- **AI Engines:**
  - **Failure Risk Analysis:** Gemini 2.5 structured JSON prediction with risk scores (0-100), contributing factor weights, and telemetry gaps.
  - **RUL Estimation:** Multi-variable degradation curves with pessimistic/optimistic confidence bands.
  - **Maintenance Recommendations:** Actionable work plans featuring mandatory plant condition human-verification checkboxes before auto-creating Work Orders.
  - **AI Maintenance Engineer (RAG Chat):** Grounded in OEM manuals using vector similarity search with document citations.
  - **Multi-Agent Planner:** Sequential 4-agent pipeline (Diagnostics → Risk → Scheduling → Parts → Master Strategy).

---

## Directory Structure

```text
predictive-maintenance-system/
├── client/                     # React Vite Frontend App
│   ├── src/
│   │   ├── components/        # AI, Asset, Maintenance & Analytics UI Components
│   │   ├── context/           # AuthContext & Session Management
│   │   ├── pages/             # 16 Full Page Application Routes
│   │   ├── services/          # Axios API Interceptors
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Node.js Express Backend & AI Engine
│   ├── src/
│   │   ├── controllers/       # Auth, Assets, AI, Maintenance, Analytics Controllers
│   │   ├── middleware/        # JWT Auth, Role Restrictions, Zod Error Handler
│   │   ├── routes/            # REST API Route Declarations
│   │   ├── schemas/           # Zod Input & Output Schemas
│   │   ├── services/          # Gemini SDK Client, RAG Service, Multi-Agent Orchestrator
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql             # 13 Tables, pgvector Index, RLS Policies, DDL
└── README.md
```

---

## Quick Start Guide

### 1. Install Server Dependencies & Start API Backend
```bash
cd server
npm install
npm run dev
```

### 2. Install Client Dependencies & Start Web Application
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to access the platform.
