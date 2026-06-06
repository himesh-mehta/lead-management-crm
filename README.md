# LeadBridge CRM 🚀

A modern, highly visual Lead Management CRM designed with a responsive, premium dashboard interface featuring brand orange (`#ff7a59`) highlights. 

This full-stack system is powered by a **Node.js + Express** server, **Drizzle ORM** communicating with **Neon Serverless PostgreSQL**, and a **React + Vite + TypeScript** frontend styled with Tailwind CSS and visualised using customized **Recharts** curves and glassmorphic micro-interactions.

---

## 🔗 Live Deployed Links

- **Live Application (Frontend):** [https://lead-management-crm-omega.vercel.app](https://lead-management-crm-omega.vercel.app)
- **API Server Endpoint (Backend):** [https://lead-management-crm-x26w.onrender.com](https://lead-management-crm-x26w.onrender.com)
- **API Health Endpoint:** [https://lead-management-crm-x26w.onrender.com/health](https://lead-management-crm-x26w.onrender.com/health)

---

## 🛠️ Tech Stack

### Frontend (Client SPA)
- **Framework & Bundler:** React.js, Vite, TypeScript
- **Styling & Transitions:** Tailwind CSS (v4 compatible), Framer Motion
- **Data Visualizations:** Recharts (Area, Donut, Horizontal Bar, Spline Line, Stacked Bar)
- **Routing:** React Router DOM (v6)
- **HTTP Client & Hooks:** Axios, TanStack React Query (v5)
- **Utility Libraries:** Lucide React, React Hot Toast, jsPDF, html2canvas

### Backend (REST API Server)
- **Runtime & Framework:** Node.js, Express.js (v5)
- **Database Layer:** Neon Serverless PostgreSQL
- **Object-Relational Mapping (ORM):** Drizzle ORM
- **Migration Engine:** Drizzle-Kit
- **Auth Systems:** JWT (JSON Web Tokens) with header interceptors, Bcrypt.js password hashing
- **Development & Config:** Dotenv, CORS, Express Validator, Nodemon

---

## ✨ Features

- 🔐 **Multi-User Secure Authentication:** Fully secured login, registration, and logout flows. Scopes all leads, recent activities, and statistics to the authenticated user's ID.
- ⚡ **Instant Demo Mode:** Jump directly into the application with the "Try Demo Account" button, which logs in a sandbox user and seeds 20 diverse, realistic leads if the database is clean.
- 📊 **Pipeline Analytics Dashboard:** Clean, cards-based overview of core KPIs (Total Opportunities, Closed Won, Closed Lost, and Conversion Rates) with mini sparklines.
- 📈 **Premium Chart Visualizations:** Polished charts featuring brand colors, custom spline curves, rounded stacked bars, and modern glassmorphic hover tooltips:
  - **Status Distribution:** Donut chart with an inner glass ring detailing total leads.
  - **Monthly Growth Intake:** Orange gradient spline Area chart tracking lead signups.
  - **Lead Source Distribution:** Horizontal rounded Bar chart resolving category label overlaps.
  - **Revenue Pipeline Forecast:** Stacked Bar chart detailing qualified and converted values.
  - **Lead Conversion Trend:** Spline Line chart displaying conversion rate progress.
- 📋 **Flexible Leads Directory:** Fully paginated directory containing sorting features, search indexing (name, email, company), and status filter toggles. Converts into visual details cards automatically on mobile viewports.
- 📄 **PDF Report Generation:** One-click canvas rendering and PDF download for all pipeline metrics, optimized for both light and dark mode capturing.
- 📝 **Input validation:** Statically checks emails, numbers, and inputs using Express Validator rules on the API layer, and provides responsive forms on the frontend.

---

## 📁 Project Folder Structure

```
lead-management-crm/
├── client/                     # React Frontend App (Vite + TS)
│   ├── src/
│   │   ├── components/         # Reusable UI components & Modals
│   │   ├── context/            # AuthContext (JWT states & interceptors)
│   │   ├── hooks/              # useLeads (React Query wrapper)
│   │   ├── pages/              # Routing pages (Leads, Login, Stats, etc.)
│   │   ├── services/           # Axios API mappings
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Helper utilities
│   │   ├── index.css           # Styling overrides & Tailwind directives
│   │   ├── App.tsx             # Root router & auth route guards
│   │   └── main.tsx            # React bootstrap
│   ├── tailwind.config.js
│   └── vercel.json             # Vercel SPA redirects
├── server/                     # Express Backend REST API
│   ├── config/                 # Neon connection pooling
│   ├── controllers/            # Auth & Lead route handlers
│   ├── db/                     # Drizzle schemas and migration snapshots
│   ├── middleware/             # JWT auth validation & global error handlers
│   ├── models/                 # Raw SQL seeding & bootstrap hooks
│   ├── routes/                 # Express route mounts
│   ├── Procfile                # Procfile config for deployment
│   ├── index.js                # App bootstrap entry point
│   └── .env
├── drizzle.config.js           # Drizzle-kit configuration
├── package.json                # Root package dependencies (server & migrations)
└── README.md
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- A PostgreSQL database instance (Get a free serverless database at [Neon.tech](https://neon.tech))

### 1. Clone & Install Root Dependencies
```bash
git clone https://github.com/himesh-mehta/lead-management-crm.git
cd lead-management-crm
npm install
```

### 2. Configure Backend Environment
Create a `.env` file inside the `server/` directory:
```bash
touch server/.env
```
Add the following configuration variables:
```ini
# Database Connection (Get from Neon console)
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require

# Server Port
PORT=5000

# Environment Mode
NODE_ENV=development

# JSON Web Token Secret (Paste a secure random string)
JWT_SECRET=9e9cfa4d4b1a45749f984dfa75bfcb9958742b6a22b10a2eb7b8b2e11894dcd5

# Frontend CORS Origin URL
CLIENT_URL=http://localhost:5173
```

### 3. Generate & Apply Database Migrations
We use **Drizzle ORM** and **Drizzle-kit** to automatically manage tables and types. In the root directory, run:
```bash
# Generate SQL migration file from server/db/schema.js
npm run db:generate

# Push migrations live to your database
npm run db:migrate
```

### 4. Configure Frontend Environment
Navigate to the `client/` directory and install local packages:
```bash
cd client
npm install
```
Create a `.env` file inside the `client/` directory:
```bash
touch .env
```
Add the local API server URL:
```ini
VITE_API_URL=http://localhost:5000/api
```

### 5. Running the Application
Start the Backend Server (from the root directory):
```bash
npm run dev
```

Start the Frontend Dev Server (from the `client/` directory):
```bash
npm run dev
```

Open your browser to `http://localhost:5173` to see the application running locally!

---

## 📊 API Documentation

All routes are prefixed with `/api`. Auth is enforced on all `/api/leads` endpoints via `Authorization: Bearer <jwt_token>`.

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/signup` | Create a new user account | `{ name, email, password }` |
| **POST** | `/signin` | Login to account and get JWT | `{ email, password }` |
| **POST** | `/demo` | Login as Sandbox user (seeds leads if empty) | None |

### Lead Routes (`/api/leads`)
| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Fetch paginated, filtered leads | `?page=1&limit=10&status=New` |
| **GET** | `/search` | Live search names, emails, companies | `?q=search_term` |
| **GET** | `/stats` | Fetch parsed pipeline metrics & charts data | None |
| **GET** | `/:id` | Fetch specific lead details | None |
| **POST** | `/` | Add a new lead to the pipeline | `{ name, email, phone, company, status, source, notes, gender, estimatedValue }` |
| **PUT** | `/:id` | Update lead properties | `{ name, status, estimatedValue, ... }` |
| **DELETE** | `/:id` | Delete lead from the database | None |

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
