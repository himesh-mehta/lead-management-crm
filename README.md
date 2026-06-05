# LeadFlow CRM 🚀

A modern, fast, responsive Lead Management CRM designed with a premium dark SaaS theme. Built using Node.js + Express on the backend, Neon Serverless PostgreSQL with raw SQL queries on the database layer, and React + Vite + Tailwind CSS on the frontend.

## 🔗 Deployed Links & Visuals
- **Live Demo Link:** `https://leadflow-crm.vercel.app` *(Placeholder)*
- **API Server Endpoint:** `https://leadflow-api.railway.app` *(Placeholder)*

*Mock Screenshot: [Premium Dark Dashboard](https://raw.githubusercontent.com/himesh-mehta/lead-management-crm/main/screenshot.png)*

---

## 🛠️ Tech Stack

### Backend
- **Core:** Node.js, Express.js
- **Database:** Neon PostgreSQL (Serverless Cloud Postgres)
- **Database Driver:** `@neondatabase/serverless` & `pg` (node-postgres)
- **Validation:** `express-validator`
- **Config & DevTools:** `dotenv`, `cors`, `nodemon`

### Frontend
- **Bundler & Framework:** Vite, React.js
- **Styling:** Tailwind CSS (v4 compatible PostCSS setup)
- **Charts & Visualization:** Recharts
- **Icons:** Lucide React
- **Toast Notifications:** React Hot Toast
- **Router:** React Router DOM (v6)
- **HTTP Client:** Axios

---

## ✨ Features
- 📊 **Interactive Dashboard:** Quick overview of pipeline analytics (Total Leads, Conversion Rate, Closed Won, Active Leads) and a table of the 5 most recently created leads.
- 📋 **Lead Directory Grid:** Fully responsive table displaying lead profiles. Auto-converts to a grid of details cards on smaller mobile layouts.
- 🔍 **Real-Time Live Search:** Search instantly across lead names, companies, and emails.
- 🎛️ **Granular Filtering:** Filter the pipeline by status (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`).
- 📈 **SaaS Visualization Panel:** Dark-themed Recharts diagrams displaying:
  - Lead distribution status (Donut/Pie Chart)
  - Monthly lead intake volume (Bar Chart)
- 📝 **Validation Form:** Fully responsive validator forms checking inputs, email schemas, and mandatory values before dispatching API writes.
- ⚠️ **Confirmative Modals:** Intercepts deletions with safety prompt modals.
- 🎨 **Responsive UI/UX:** Mobile sliding navigation sidebar drawer, focus rings, custom SVG favicon, and smooth fade-in routing transitions.

---

## 📁 Project Folder Structure

```
lead-management-crm/
├── client/                     # React Frontend App
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── SearchBar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── LeadForm.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Navbar.jsx
│   │   ├── hooks/
│   │   │   └── useLeads.js     # State hooks for Leads
│   │   ├── pages/              # Main Route Pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leads.jsx
│   │   │   ├── AddLead.jsx
│   │   │   ├── EditLead.jsx
│   │   │   ├── Stats.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios API mappings
│   │   ├── utils/
│   │   │   └── helpers.js      # Status badge color helpers
│   │   ├── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json             # Vercel Client Deploy Settings
│   └── .env
├── server/                     # Express Backend API
│   ├── config/
│   │   └── db.js               # Neon Pool Configuration
│   ├── controllers/
│   │   └── leadController.js   # Lead Controllers
│   ├── middleware/
│   │   ├── errorHandler.js     # Global Error Middleware
│   │   ├── validate.js         # express-validator triggers
│   │   └── leadValidation.js   # Input rule validation parameters
│   ├── models/
│   │   └── Lead.js             # Raw SQL Query Model Functions
│   ├── routes/
│   │   └── leadRoutes.js       # Express Router mounting
│   ├── Procfile                # Railway Server Launch settings
│   ├── index.js                # App Bootstrap
│   └── .env
└── README.md
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js installed locally (v18+ recommended)
- A database instance on [Neon.tech](https://neon.tech) (Free tier works perfectly)

### 1. Clone the repository
```bash
git clone https://github.com/himesh-mehta/lead-management-crm.git
cd lead-management-crm
```

### 2. Configure Backend Server
```bash
# Install dependencies
npm install

# Create environment config
# Edit server/.env and add your variables (see Env Variables section below)
```

### 3. Configure Frontend Client
```bash
# Navigate to client folder
cd client
npm install

# Create environment config
# Edit client/.env and add VITE_API_URL (see Env Variables section below)
```

### 4. Running Locally
Start the backend server:
```bash
# In the root directory
npm run dev
```

Start the frontend client:
```bash
# In the client/ directory
npm run dev
```
Open `http://localhost:5173` to see the application running.

---

## 🔑 Environment Variables

### Backend Server (`server/.env`)
```ini
# Database Connection
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require

# Port allocation
PORT=5000

# Environment Mode
NODE_ENV=development

# Allowed CORS origins
CLIENT_URL=http://localhost:5173
```

### Frontend Client (`client/.env`)
```ini
# Backend Base API URL
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 API Documentation

All routes are prefixed with `/api/leads`.

| Method | Endpoint | Description | Request Body | Sample Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | Fetch paginated leads (sort, page, status filters) | None | `{ leads: [], total: 0, currentPage: 1, totalPages: 0, limit: 10 }` |
| **GET** | `/search?q=x` | Instantly search name, email, company | None | `[{ id: 1, name: "Himesh Mehta", ... }]` |
| **GET** | `/stats` | Fetch aggregated pipeline statistics | None | `{ stats: { total: 1, thisMonth: 1, conversionRate: "0.0%", byStatus: { New: 1 } } }` |
| **GET** | `/:id` | Fetch details of a single lead | None | `{ lead: { id: 1, name: "John Doe", ... } }` |
| **POST** | `/` | Add a new lead to the pipeline | `{ name, email, phone, company, status, notes }` | `{ message: "Lead created successfully", lead: { ... } }` |
| **PUT** | `/:id` | Partially update details of a lead | `{ name, status, notes, ... }` | `{ message: "Lead updated successfully", lead: { ... } }` |
| **DELETE** | `/:id` | Permanently delete a lead from directory | None | `{ message: "Lead deleted successfully", lead: { ... } }` |

---

## 🚀 Deployment Guide

### Backend: Deploying to Railway
1. Sign up on [Railway](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo** → Choose your `lead-management-crm` repository.
3. Add the following **Variables** under project settings:
   - `DATABASE_URL` *(Your Neon Connection String)*
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
4. Railway will auto-detect the `server/Procfile` and start the server process.

### Frontend: Deploying to Vercel
1. Sign up on [Vercel](https://vercel.com/).
2. Select **Add New Project** → Choose your repository.
3. Configure the directory settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
4. Set the **Environment Variables**:
   - `VITE_API_URL` = `https://your-railway-app.railway.app/api`
5. Press **Deploy**. The `client/vercel.json` rewrite configuration handles React Router SPAs automatically.

---

## 📄 License
This project is licensed under the MIT License.
