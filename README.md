# 🏥 HealthcareOS

> A full-stack Healthcare Management System built as a DBMS project — featuring role-based dashboards for Admins, Doctors, and Patients, AI-powered diagnosis assistance, and real-time audit logging.

---

## ✨ Features

### 👥 Role-Based Access Control
- **Admin** — Manage doctors, patients, beds, view audit logs, emergency triage & risk prediction
- **Doctor** — View appointments, manage patient records, write prescriptions, AI Copilot assistance
- **Patient** — Book appointments, view medical records, lab reports, billing, and AI symptom checker

### 🤖 AI Integration (Google Gemini)
- **AI Symptom Checker** — Describe symptoms and get preliminary diagnosis suggestions
- **AI Copilot for Doctors** — Context-aware clinical decision support
- **AI Report Explainer** — Simplifies complex lab reports for patients in plain language

### 📊 Core Modules
- Patient & Doctor Management
- Appointment Scheduling
- Medical Records & Prescriptions
- Lab Reports
- Billing & Payments
- Bed Management
- Emergency Triage
- Audit Logs with PostgreSQL Triggers
- Risk Prediction Dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend** | Python, Flask 3, Flask-CORS |
| **Database** | PostgreSQL via Supabase |
| **Auth** | JWT (PyJWT) + bcrypt |
| **AI** | Google Gemini API (`google-generativeai`) |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## 📁 Project Structure

```
healthcare-project/
├── backend/
│   ├── app.py               # Flask entry point, blueprint registration
│   ├── config.py            # Supabase client & env config
│   ├── schema.sql           # PostgreSQL schema + seed data + audit triggers
│   ├── requirements.txt
│   ├── .env.example         # ← copy to .env and fill in secrets
│   ├── middleware/
│   │   └── auth_guard.py    # JWT role-guard decorator
│   ├── routes/
│   │   ├── auth.py
│   │   ├── patients.py
│   │   ├── doctors.py
│   │   ├── appointments.py
│   │   ├── medical_records.py
│   │   ├── billing.py
│   │   ├── lab_reports.py
│   │   ├── audit_logs.py
│   │   └── ai_diagnosis.py
│   └── utils/
│       └── audit.py
└── frontend/
    ├── src/
    │   ├── pages/           # Admin / Doctor / Patient / Shared pages
    │   ├── components/      # Reusable UI + chart components
    │   ├── context/         # AuthContext (JWT + role state)
    │   ├── hooks/           # useAuth, useCountUp, useRoleGuard
    │   └── api/             # Axios API wrapper
    ├── .env.example         # ← copy to .env and fill in values
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/healthcare-project.git
cd healthcare-project
```

---

### 2. Set up the Database

1. Open your Supabase project → **SQL Editor**
2. Paste and run the contents of [`backend/schema.sql`](backend/schema.sql)
3. This creates all tables, seeds initial data, and sets up audit triggers

---

### 3. Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-long-random-secret-string
GEMINI_API_KEY=your-gemini-api-key
```

Install dependencies and run:

```bash
pip install -r requirements.txt
python app.py
```

Backend runs at `http://localhost:5000`

---

### 4. Configure the Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Install dependencies and run:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔑 Default Login Credentials

> Seed users are created via [`backend/seed_users.py`](backend/seed_users.py). Run it once after schema setup.

```bash
cd backend
python seed_users.py
```

| Role | Email | Password |
|------|-------|----------|
| Admin | *(set in seed script)* | *(set in seed script)* |
| Doctor | *(set in seed script)* | *(set in seed script)* |
| Patient | *(set in seed script)* | *(set in seed script)* |

---

## 🗄️ Database Schema

```
department ──< doctor ──< appointment >── patient
                                │
                         medical_record ──< lab_test
                                │
                             billing
                                │
                           audit_log (trigger-driven)
```

Audit logs are written automatically by PostgreSQL triggers on `patient`, `doctor`, `appointment`, `medical_record`, and `billing` tables.

---

## 🌐 API Overview

All endpoints are prefixed with `/api/` and protected by JWT unless noted.

| Method | Endpoint | Role |
|--------|----------|------|
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/patients` | Admin |
| `GET` | `/api/doctors` | Admin, Doctor |
| `GET/POST` | `/api/appointments` | All |
| `GET/POST` | `/api/medical-records` | Doctor, Patient |
| `GET` | `/api/lab-reports` | Doctor, Patient |
| `GET` | `/api/billing` | Admin, Patient |
| `GET` | `/api/audit-logs` | Admin |
| `POST` | `/api/ai/diagnose` | Doctor |
| `GET` | `/api/ping` | Public (health check) |

---

## 🔒 Security

- Passwords are hashed with **bcrypt**
- All protected routes use **JWT Bearer token** authentication
- Role-based access enforced via `@require_role()` decorator
- Environment secrets are **never committed** to the repository

---

## 📦 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel
```
Set `VITE_API_BASE_URL` to your Render backend URL in Vercel's environment variables.

### Backend → Render
- Set all `.env` variables in Render's environment dashboard
- Start command: `gunicorn app:app`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push and open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
