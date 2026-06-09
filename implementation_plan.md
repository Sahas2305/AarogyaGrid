# Implementation Plan — HealthcareOS Backend Integration

## Context

The React + Vite frontend (HealthcareOS) is fully built and pulled. It has:
- 26+ pages across Admin / Doctor / Patient roles
- Mock data in `src/data/` (9 JS modules)
- `AuthContext.jsx` doing fake role switching via `localStorage`
- `Login.jsx` with hardcoded mock login (no real API call yet)
- Supabase tables already created

**Goal:** Wire a real Flask backend to Supabase, replace all mock data with live API calls, and ship a fully functional system.

---

## Folder Structure (Final Target)

```
healthcare-project/
├── backend/                        ← Flask API (NEW — to be created)
│   ├── .env                        ← Supabase URL + keys (never commit)
│   ├── requirements.txt
│   ├── app.py                      ← Flask init + CORS config
│   ├── config.py                   ← Supabase client init
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                 ← /api/auth/login, /api/auth/register
│   │   ├── patients.py             ← /api/patients
│   │   ├── doctors.py              ← /api/doctors
│   │   ├── appointments.py         ← /api/appointments
│   │   ├── medical_records.py      ← /api/medical-records
│   │   ├── billing.py              ← /api/billing
│   │   ├── lab_reports.py          ← /api/lab-reports
│   │   ├── audit_logs.py           ← /api/audit-logs
│   │   └── ai_diagnosis.py         ← /api/symptom-log + /api/ai-diagnosis
│   └── middleware/
│       ├── __init__.py
│       └── auth_guard.py           ← @require_role('admin') decorator
│
└── frontend/                       ← Existing React app (already built)
    ├── .env                        ← VITE_API_BASE_URL=http://localhost:5000
    └── src/
        ├── api/
        │   └── api.js              ← [NEW] All fetch() calls in one place
        ├── context/
        │   └── AuthContext.jsx     ← [MODIFY] Replace mock with real login
        └── pages/                  ← [MODIFY] Replace mock data with api.js calls
```

---

## Phase 1 — Backend Setup (Flask)

> **You need your Supabase URL and anon/service key ready before starting this phase.**

### Files to Create

#### [NEW] `backend/requirements.txt`
```
flask
flask-cors
supabase
bcrypt
python-dotenv
pyjwt
```

#### [NEW] `backend/.env`
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
JWT_SECRET=your_random_secret_string
FLASK_ENV=development
```

> [!CAUTION]
> **Never commit `.env` to git.** Add `backend/.env` to `.gitignore` immediately.

#### [NEW] `backend/config.py`
- Load `.env` with `python-dotenv`
- Initialize `supabase` client using `create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)`
- Export `supabase` as a module-level singleton used by all route files

#### [NEW] `backend/app.py`
- Create Flask app
- Enable `flask-cors` with `origins=["http://localhost:5173"]`
- Register all Blueprints: `auth_bp`, `patients_bp`, `doctors_bp`, `appointments_bp`, `medical_records_bp`, `billing_bp`, `lab_reports_bp`, `audit_logs_bp`, `ai_diagnosis_bp`
- Add a health-check route `GET /api/ping` returning `{ "status": "ok" }`

#### [NEW] `backend/middleware/auth_guard.py`
- `require_role(*roles)` decorator that reads JWT from `Authorization: Bearer <token>` header
- Decodes JWT using `PyJWT`, extracts `role` + `linked_id`
- If role not in allowed roles → returns 403
- Sets `request.user = { role, linked_id, user_id }` for route handlers

### Verification (Phase 1)
- Run `python app.py` → server starts on port 5000
- Hit `GET http://localhost:5000/api/ping` → `{ "status": "ok" }`
- Fetch one row from Supabase in a test route → data returned as JSON

---

## Phase 2 — Auth Routes

### [NEW] `backend/routes/auth.py`

**`POST /api/auth/login`**
1. Receive `{ email, password }` from request body
2. Query `USERS` table where `email = email`
3. Use `bcrypt.checkpw()` to verify password against stored hash
4. If valid → generate JWT with `{ user_id, role, linked_id, exp }`
5. Return `{ token, role, linked_id, user_id, name }`
6. If invalid → return 401

**`POST /api/auth/register`**
1. Receive `{ name, dob, gender, phone, email, address, insurance_policy_no, password }`
2. Check if email exists in `USERS` → return 409 if yes
3. Hash password with `bcrypt.hashpw()`
4. Insert into `PATIENT` → capture `Patient_ID` via `data[0]['Patient_ID']`
5. Insert into `USERS` with `linked_id = Patient_ID`, `role = 'patient'`
6. On any failure → manually delete the PATIENT row to keep data consistent
7. On success → generate JWT and return same shape as login

> [!IMPORTANT]
> Supabase Python client doesn't support raw SQL transactions. Use `try/except` with manual rollback: if USERS insert fails after PATIENT was inserted, delete the PATIENT row in the `except` block.

### Frontend Changes (Phase 2)

#### [MODIFY] `frontend/src/context/AuthContext.jsx`
- Add `loginWithCredentials(email, password)` async function
- POST to `/api/auth/login`, receive `{ token, role, linked_id, name }`
- Save token to `localStorage` as `healthcare_token`
- Save `role`, `linked_id`, `name` to React state
- Keep `switchRole()` for demo mode (quick-login cards in Login.jsx)

#### [MODIFY] `frontend/src/pages/auth/Login.jsx`
- `handleLoginSubmit` → call `loginWithCredentials(email, password)` from context
- Show real error toast if credentials are wrong
- Remove the fake email-sniffing role logic (`email.includes('priya')` etc.)
- `handleRegisterSubmit` → POST to `/api/auth/register` via `api.js`
- Keep Quick Demo cards (they call `switchRole()` directly — no API needed)

---

## Phase 3 — API Routes per Module

All routes follow the same pattern:
1. Import `supabase` from `config.py`
2. Apply `@require_role(...)` decorator
3. Query Supabase, return `jsonify(data)`
4. On error → return `jsonify({ "error": str(e) }), 500`

### [NEW] `backend/routes/patients.py`

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| GET | `/api/patients` | admin | Fetch all rows from PATIENT |
| GET | `/api/patients/<id>` | admin, doctor, patient | Single patient; patient scoped to their `linked_id` |
| POST | `/api/patients` | admin | Insert new PATIENT row |
| PATCH | `/api/patients/<id>` | admin | Update patient details |

### [NEW] `backend/routes/doctors.py`

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| GET | `/api/doctors` | admin, patient | Fetch all doctors |
| GET | `/api/doctors/<id>` | admin, doctor | Fetch single doctor |
| POST | `/api/doctors` | admin | Insert DOCTOR + USERS in sequence |
| PATCH | `/api/doctors/<id>` | admin | Update doctor info |

### [NEW] `backend/routes/appointments.py`

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| GET | `/api/appointments` | all | Scoped by role: admin=all, doctor=their schedule, patient=their bookings |
| POST | `/api/appointments` | patient, admin | Book new appointment |
| PATCH | `/api/appointments/<id>` | doctor, admin | Update status (Confirmed/Cancelled/Completed) |

### [NEW] `backend/routes/medical_records.py`

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| GET | `/api/medical-records` | all | Scoped: admin=all, doctor=their patients, patient=their own |
| POST | `/api/medical-records` | doctor | Write new record |

### [NEW] `backend/routes/billing.py`

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| GET | `/api/billing` | all | Scoped by role |
| POST | `/api/billing` | admin | Create new bill |
| PATCH | `/api/billing/<id>` | admin | Mark as paid |

### [NEW] `backend/routes/lab_reports.py`

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| GET | `/api/lab-reports` | all | Scoped by role |
| POST | `/api/lab-reports` | admin, doctor | Upload new lab report |

### [NEW] `backend/routes/audit_logs.py`

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| GET | `/api/audit-logs` | admin only | Fetch all audit log entries |

> [!NOTE]
> Supabase triggers already insert into AUDIT_LOG automatically on INSERT/UPDATE/DELETE in key tables. This route just reads them.

### [NEW] `backend/routes/ai_diagnosis.py`

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| POST | `/api/symptom-log` | patient, doctor | Save symptoms to SYMPTOM_LOG table |
| POST | `/api/ai-diagnosis` | patient, doctor | Call Gemini API with symptoms, store result in AI_DIAGNOSIS, return prediction |

> [!IMPORTANT]
> Use **Google Gemini API** (free tier). Add `GEMINI_API_KEY` to `.env`. Install `google-generativeai`. Prompt: *"Given these symptoms: {symptoms}, patient age: {age}, provide a short differential diagnosis with 3 possibilities and a risk level (Low/Medium/High)."*

---

## Phase 4 — Connect React Frontend to Flask

### [NEW] `frontend/src/api/api.js`

Single utility file — every page imports from here, no direct `fetch()` in components.

```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('healthcare_token') || ''}`
});

// Auth
export const loginUser = (email, password) =>
  fetch(`${BASE_URL}/api/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ email, password }) }).then(r => r.json());

export const registerPatient = (data) =>
  fetch(`${BASE_URL}/api/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json());

// Patients
export const getPatients = () => fetch(`${BASE_URL}/api/patients`, { headers: getHeaders() }).then(r => r.json());
export const getPatientById = (id) => fetch(`${BASE_URL}/api/patients/${id}`, { headers: getHeaders() }).then(r => r.json());

// Doctors
export const getDoctors = () => fetch(`${BASE_URL}/api/doctors`, { headers: getHeaders() }).then(r => r.json());
export const createDoctor = (data) => fetch(`${BASE_URL}/api/doctors`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json());

// Appointments
export const getAppointments = () => fetch(`${BASE_URL}/api/appointments`, { headers: getHeaders() }).then(r => r.json());
export const createAppointment = (data) => fetch(`${BASE_URL}/api/appointments`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json());
export const updateAppointmentStatus = (id, status) => fetch(`${BASE_URL}/api/appointments/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) }).then(r => r.json());

// Medical Records
export const getMedicalRecords = () => fetch(`${BASE_URL}/api/medical-records`, { headers: getHeaders() }).then(r => r.json());
export const createMedicalRecord = (data) => fetch(`${BASE_URL}/api/medical-records`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json());

// Billing
export const getBilling = () => fetch(`${BASE_URL}/api/billing`, { headers: getHeaders() }).then(r => r.json());

// Lab Reports
export const getLabReports = () => fetch(`${BASE_URL}/api/lab-reports`, { headers: getHeaders() }).then(r => r.json());

// Audit Logs
export const getAuditLogs = () => fetch(`${BASE_URL}/api/audit-logs`, { headers: getHeaders() }).then(r => r.json());

// AI Diagnosis
export const submitSymptoms = (data) => fetch(`${BASE_URL}/api/symptom-log`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json());
export const getAIDiagnosis = (data) => fetch(`${BASE_URL}/api/ai-diagnosis`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json());
```

### [NEW] `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:5000
```

### Pages to Modify (replace mock imports with api.js)

| Page | Replace Mock | With API Call |
|------|-------------|---------------|
| `AdminDashboard.jsx` | mockPatients, mockDoctors, mockAppointments, mockAuditLogs | `getPatients()`, `getDoctors()`, `getAppointments()`, `getAuditLogs()` |
| `ManageDoctors.jsx` | mockDoctors | `getDoctors()`, `createDoctor()` |
| `ManagePatients.jsx` | mockPatients | `getPatients()` |
| `AuditLogs.jsx` | mockAuditLogs | `getAuditLogs()` |
| `DoctorDashboard.jsx` | mockPatients, mockAppointments | `getPatients()`, `getAppointments()` |
| `MyPatients.jsx` | mockPatients | `getPatients()` (doctor-scoped by backend) |
| `DoctorAppointments.jsx` | mockAppointments | `getAppointments()` |
| `WriteRecord.jsx` | mockPatients | `getPatients()`, `createMedicalRecord()` |
| `AICopilot.jsx` | mockAIDiagnosis | `getAIDiagnosis()` |
| `PatientDashboard.jsx` | mockPatients, mockAppointments, mockMedicalRecords | all three API calls |
| `BookAppointment.jsx` | mockDoctors | `getDoctors()`, `createAppointment()` |
| `MyAppointments.jsx` | mockAppointments | `getAppointments()` |
| `MyMedicalRecords.jsx` | mockMedicalRecords | `getMedicalRecords()` |
| `MyLabReports.jsx` | mockLabReports | `getLabReports()` |
| `MyBills.jsx` | mockBilling | `getBilling()` |
| `AISymptomChecker.jsx` | mockAIDiagnosis | `submitSymptoms()`, `getAIDiagnosis()` |
| `AppointmentManagement.jsx` | mockAppointments, mockDoctors | both API calls |
| `BillingPage.jsx` | mockBilling | `getBilling()` |
| `LabReports.jsx` | mockLabReports | `getLabReports()` |
| `MedicalRecords.jsx` | mockMedicalRecords | `getMedicalRecords()` |

---

## Phase 5 — CORS + Deployment Config

### Local Testing Checklist
- [ ] Flask running on port 5000, React dev server on port 5173
- [ ] CORS headers present in all Flask responses (verify in browser DevTools → Network tab)
- [ ] All routes tested in Postman with a valid JWT before connecting to frontend
- [ ] JWT expiry and 403 behavior tested for wrong-role access

### Deployment
- **Flask → Render.com** (free tier): Connect GitHub, root = `backend/`, start command = `gunicorn app:app`, add all env vars in Render dashboard
- **React → Vercel**: Connect GitHub, root = `frontend/`, Vercel auto-detects Vite
- Update `VITE_API_BASE_URL` in Vercel env vars to the Render backend URL

---

## Priority Execution Order

```
1.  Phase 1 — Backend Setup         → app.py, config.py, requirements.txt, .env
2.  Phase 2 — Auth Login route       → routes/auth.py (login endpoint)
3.  Phase 2 — Auth Register route    → routes/auth.py (register endpoint)
4.  Frontend AuthContext update      → replace mock login with real API call
5.  Phase 3 — Appointments           → most central, used by 3+ modules
6.  Phase 3 — Patients + Doctors     → needed by Admin dashboard
7.  Phase 3 — Medical Records        → Doctor portal
8.  Phase 3 — Lab Reports            → Doctor portal
9.  Phase 3 — Billing                → Patient portal
10. Phase 3 — Audit Logs             → Admin (may auto-work via Supabase triggers)
11. Phase 3 — AI Diagnosis           → last, depends on symptom log + Gemini API
12. Phase 4 — Wire all pages         → replace mock imports, one page at a time
13. Phase 5 — Deployment             → Render + Vercel
```

---

## Verification Plan

### Phase 1
- `GET /api/ping` → `{ "status": "ok" }`
- Supabase connection test route fetches from PATIENT table

### Phase 2
- `POST /api/auth/login` with correct creds → JWT returned, role in payload
- `POST /api/auth/login` with wrong password → 401
- `POST /api/auth/register` → Patient row + Users row created in Supabase
- Login in React → redirected to correct role dashboard

### Phase 3
- Each route tested in Postman with valid JWT header
- Admin JWT → `/api/patients` returns all rows
- Patient JWT → `/api/patients` returns only their own row
- Doctor JWT on admin-only route → 403

### Phase 4
- Each page loads data from real Supabase (not mock)
- Loading spinners show briefly before data renders
- Create appointment in React → row appears in Supabase dashboard

### Phase 5
- Frontend on Vercel loads login page correctly
- Login works end-to-end against Render-hosted Flask backend
