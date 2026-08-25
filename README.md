# 🏥 AarogyaGrid
### *Nationwide Intelligent Healthcare, Geolocation & Inpatient Hospital Logistics Platform*

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TailwindCSS-00d4ff?style=for-the-badge&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Backend-Flask%203%20%7C%20Python%203.10+-3776ab?style=for-the-badge&logo=python)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-8e75ff?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](LICENSE)

---

## 🌟 Overview

**AarogyaGrid** is a full-stack, enterprise-grade healthcare management and hospital network platform built for patients, doctors, and hospital administrators across India.

It connects over **93+ top-tier hospitals across all 28 States and Union Territories**, providing automated GPS geolocation, live inpatient bed availability, real-time doctor appointments with turn-by-turn Google Maps routing, Gemini AI clinical diagnostics, self-serve UPI/Card payments, and security audit logs.

---

## ✨ Key Features & Capabilities

### 📍 1. Nationwide Geolocation & Hospital Directory
- **Auto-GPS Detection**: Calculates exact road and aerial distance (`km`) to the nearest hospital facility using the **Haversine formula**.
- **93+ Verified Indian Hospitals**: Comprehensive directory covering Bengaluru, Mumbai, Delhi NCR, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad, Jaipur, Kochi, Lucknow, Chandigarh, and all state capitals.
- **Facility Discovery Modal**: Filter instantly by State, City, 6-digit Pincode, or Clinical Specialty (Cardiology, Oncology, Organ Transplant, etc.) with star ratings (⭐ 4.6–4.9) and live bed capacity indicators.
- **Dynamic System Adaptation**: Selecting any hospital dynamically changes the **Topbar active badge**, **Bed booking ward pricing**, **Google Maps Directions**, and **Billing letterheads**.

### 🛏️ 2. Inpatient Bed Booking & Ward Management
- **Ward Availability Indicators**: Real-time capacity progress bars across 6 ward tiers:
  - *General Ward*, *Semi-Private*, *Private Deluxe*, *ICU / Critical Care*, *Pediatric Unit*, *Day Care Unit*.
- **Interactive Reservation Engine**: Select admission and expected discharge dates, calculate estimated daily hospital tariffs, and reserve beds instantly.
- **Patient & Admin Portals**: Patients can view and cancel their active bed bookings, while hospital admins manage bed status and hospital admissions.

### 💳 3. Self-Serve Payment Gateway
- **Patient-Only Security**: "Pay Now" checkout buttons are strictly restricted to authenticated patient sessions (Admins/Doctors only view itemized audit receipts).
- **Multiple Payment Modes**:
  - 📱 **UPI**: Google Pay, PhonePe, Paytm, BHIM, Cred with real-time UPI ID verification.
  - 💳 **Credit / Debit Cards**: Visa, MasterCard, RuPay with CVV and expiry validation.
  - 🏦 **Net Banking**: HDFC, ICICI, SBI, Axis, Kotak, Punjab National Bank.
  - 💵 **Cash at Hospital Counter**: Self-pay reservation slip with counter reference.
- **Instant Hospital Receipts**: Generates watermarked digital receipts with transaction IDs and dynamic hospital branding.

### 🩺 4. Doctor Consultation & Slide-in Chart Drawer
- **1-Click "Open Chart"**: Instant slide-in drawer on the Doctor Dashboard displaying patient demographics, latest vitals, consultation history, and recent lab reports.
- **AI Clinical Decision Copilot**: Context-aware clinical assistant powered by **Google Gemini** to analyze differential diagnoses and suggest drug interactions.
- **Prescription & Record Writer**: Digital prescription ledger that syncs directly with patient records.

### 🤖 5. Gemini AI Diagnostic Suite
- **AI Symptom Checker**: Natural language symptom assessment that recommends triage urgency and matches the exact medical specialist.
- **AI Report Explainer**: Translates complex blood panels, lipid profiles, and pathology reports into plain, easy-to-understand language for patients.
- **Doctor Clinical Copilot**: Suggests clinical investigations, ICD-10 diagnostic paths, and treatment protocols.

### 📊 6. Administrative Operations & Security
- **Emergency Triage Index**: Color-coded severity tracker for emergency arrivals (Red, Yellow, Green).
- **PostgreSQL Trigger-Driven Audit Logs**: Automatic tracking of every database modification (insert, update, delete) across patient records, appointments, and billing.
- **Non-Blocking Socket Resilience**: Supabase retry interceptor wrapper preventing `WinError 10035` crashes on high-frequency queries.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS, Lucide Icons |
| **Charts & Metrics** | Recharts, Framer Motion, CountUp |
| **Backend API** | Python, Flask 3, Flask-CORS, Gunicorn |
| **Database & Auth** | PostgreSQL via Supabase, PyJWT, bcrypt password hashing |
| **AI & LLM** | Google Gemini Flash API (`google-generativeai`) |
| **Location & Maps** | HTML5 Geolocation API, Haversine Distance Matrix, Google Maps Navigation |

---

## 📁 Repository Structure

```
healthcare-project/
├── backend/
│   ├── app.py                     # Flask entry point & blueprint router
│   ├── config.py                  # Supabase & Gemini client initialization
│   ├── schema.sql                 # PostgreSQL tables, triggers & audit logs
│   ├── requirements.txt           # Python dependencies
│   ├── routes/
│   │   ├── auth.py                # Login, Register, JWT generation
│   │   ├── bed_booking.py         # Inpatient bed reservations API
│   │   ├── billing.py             # Invoicing & self-serve payment PATCH
│   │   ├── doctors.py             # Doctor directory & schedule
│   │   ├── patients.py            # Patient records & registration
│   │   ├── appointments.py        # Calendar scheduling & statuses
│   │   ├── medical_records.py     # Clinical notes & prescriptions
│   │   ├── lab_reports.py         # Lab test orders & results
│   │   ├── audit_logs.py          # PostgreSQL trigger audit stream
│   │   └── ai_diagnosis.py        # Google Gemini AI symptom & copilot endpoints
│   └── utils/
│       ├── supabase_retry.py      # Non-blocking socket retry interceptor
│       └── audit.py               # Audit log helper
└── frontend/
    ├── index.html                 # App root & metadata
    ├── src/
    │   ├── api/api.js             # Centralized Axios API client
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Session & JWT role guard
    │   │   └── HospitalContext.jsx# Nationwide location & hospital state
    │   ├── data/
    │   │   └── hospitalsData.js   # 93+ Indian hospitals catalog & Haversine distance
    │   ├── pages/
    │   │   ├── admin/             # Bed management, Triage, Risk, Audit
    │   │   ├── doctor/            # Dashboard, Schedule, Chart Drawer, Copilot
    │   │   ├── patient/           # Dashboard, Bed Booking, Appointments, Bills, Labs
    │   │   └── shared/            # Billing, Lab Reports, Symptom Checker
    │   └── components/            # HospitalSelectorModal, Sidebar, Topbar, Drawers
    └── vite.config.js
```

---

## 🚀 Quickstart & Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/dvshpat/healthcare-project.git
cd healthcare-project
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
JWT_SECRET=your-random-jwt-secret
GEMINI_API_KEY=your-google-gemini-api-key
```

Run the backend server:
```bash
python app.py
```
> Backend API will be live at `http://127.0.0.1:5000`

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
> Frontend app will be live at `http://localhost:5173`

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@healthcareos.org` | `Admin@1234` | All hospital operations, beds, triage, audit logs |
| **Doctor** | `priya.sharma@hospital.org` | `Doctor@1234` | Patient charts, copilot, appointments, prescriptions |
| **Patient** | `devansh@gmail.com` | `Patient@1234` | GPS hospital finder, bed booking, appointments, Pay Now |

---

## 📄 License
This project is open-source and available under the **MIT License**.
