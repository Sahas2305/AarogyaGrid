/**
 * api.js — HealthcareOS Frontend
 * Single utility file for all Flask API calls.
 * Every page imports functions from here — no raw fetch() in components.
 *
 * Usage:
 *   import { getDoctors, createAppointment } from '../api/api';
 *   const doctors = await getDoctors();
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://aarogyagrid.onrender.com');

/** Reads the JWT from localStorage and builds standard request headers */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('healthcare_token') || ''}`,
});

/** Generic fetch wrapper — throws on non-OK responses */
const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/auth/login — returns { token, role, user_id, patient_id, doctor_id, username } */
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Server error (${res.status})`);
  return json;
};

/** POST /api/auth/register — returns same shape as login */
export const registerPatient = async (data) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Registration error (${res.status})`);
  return json;
};

/** POST /api/auth/send-otp — returns { success, message, otp, phone } */
export const sendMobileOtp = async (phone) => {
  const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Failed to send OTP (${res.status})`);
  return json;
};

/** POST /api/auth/verify-otp — returns { success, message, phone } */
export const verifyMobileOtp = async (phone, otp) => {
  const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `OTP verification failed (${res.status})`);
  return json;
};

// ─────────────────────────────────────────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/patients — admin: all rows | patient: own row only (backend-scoped) */
export const getPatients = () => request('/api/patients');

/** GET /api/patients/:id */
export const getPatientById = (id) => request(`/api/patients/${id}`);

/** POST /api/patients — admin only */
export const createPatient = (data) =>
  request('/api/patients', { method: 'POST', body: JSON.stringify(data) });

/** PATCH /api/patients/:id — admin only */
export const updatePatient = (id, data) =>
  request(`/api/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// ─────────────────────────────────────────────────────────────────────────────
// DOCTORS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/doctors */
export const getDoctors = () => request('/api/doctors');

/** GET /api/doctors/:id */
export const getDoctorById = (id) => request(`/api/doctors/${id}`);

/** POST /api/doctors — admin only (creates doctor + user account) */
export const createDoctor = (data) =>
  request('/api/doctors', { method: 'POST', body: JSON.stringify(data) });

/** PATCH /api/doctors/:id — admin only */
export const updateDoctor = (id, data) =>
  request(`/api/doctors/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENTS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/departments */
export const getDepartments = () => request('/api/departments');

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/appointments — scoped by role in backend */
export const getAppointments = async () => {
  const data = await request('/api/appointments');
  return data.map((app) => ({
    ...app,
    // Flatten nested joins for easy template access
    date:            app.appointment_date,
    time_slot:       app.appointment_time,
    doctor_name:     app.doctor?.name     || app.doctor_name     || '—',
    patient_name:    app.patient?.name    || app.patient_name    || '—',
    department_name: app.department?.department_name || (
      typeof app.department === 'string' ? app.department : '—'
    ),
    status: app.status === 'Pending' ? 'Scheduled' : app.status,
  }));
};

/**
 * POST /api/appointments
 * Body: { patient_id, doctor_id, department_id, appointment_date, appointment_time, reason }
 */
export const createAppointment = (data) =>
  request('/api/appointments', { method: 'POST', body: JSON.stringify(data) });

/** PATCH /api/appointments/:id — update status: Confirmed | Cancelled | Completed */
export const updateAppointmentStatus = (id, status) =>
  request(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

// ─────────────────────────────────────────────────────────────────────────────
// MEDICAL RECORDS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/medical-records — scoped by role */
export const getMedicalRecords = async () => {
  const data = await request('/api/medical-records');
  return data.map((rec) => ({
    ...rec,
    doctor_name:  rec.doctor?.name  || rec.doctor_name  || '—',
    patient_name: rec.patient?.name || rec.patient_name || '—',
  }));
};

/**
 * POST /api/medical-records — doctor only
 * Body: { patient_id, doctor_id, appointment_id, diagnosis, prescription, notes }
 */
export const createMedicalRecord = (data) =>
  request('/api/medical-records', { method: 'POST', body: JSON.stringify(data) });

// ─────────────────────────────────────────────────────────────────────────────
// BILLING
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/billing — scoped by role */
export const getBilling = () => request('/api/billing');

/** POST /api/billing — admin only */
export const createBill = (data) =>
  request('/api/billing', { method: 'POST', body: JSON.stringify(data) });

/** PATCH /api/billing/:id — mark as paid */
export const markBillPaid = (id, payment_method) =>
  request(`/api/billing/${id}`, { method: 'PATCH', body: JSON.stringify({ payment_method }) });

// ─────────────────────────────────────────────────────────────────────────────
// LAB TESTS / REPORTS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/lab-reports — scoped by role */
export const getLabReports = async () => {
  const data = await request('/api/lab-reports');
  return data.map((lab) => ({
    ...lab,
    // Map DB column names to template-expected names
    lab_report_id: lab.test_id,
    report_date:   lab.test_date,
    status:        lab.result ? 'Completed' : 'Pending',
    doctor_name:   lab.medical_record?.doctor?.name || lab.ordered_by || '—',
    patient_name:  lab.medical_record?.patient?.name || '—',
  }));
};

/**
 * POST /api/lab-reports — admin/doctor
 * Body: { record_id, test_name, ordered_by, test_date, result, notes }
 */
export const createLabReport = (data) =>
  request('/api/lab-reports', { method: 'POST', body: JSON.stringify(data) });

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/audit-logs — admin only */
export const getAuditLogs = () => request('/api/audit-logs');

// ─────────────────────────────────────────────────────────────────────────────
// AI DIAGNOSIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/symptom-log — saves symptom description to DB
 * Body: { symptom_description: string, source?: string }
 * Response: { symptom_id: int|null, message: string }
 */
export const submitSymptoms = (data) =>
  request('/api/symptom-log', { method: 'POST', body: JSON.stringify(data) });

/**
 * POST /api/ai-diagnosis — calls Gemini, returns structured triage JSON
 * Body: { symptoms: string, patient_age?: number }
 * Response: { condition, urgency, confidence, description, actions[], specialty, specialty_reason }
 */
export const getAIDiagnosis = (data) =>
  request('/api/ai-diagnosis', { method: 'POST', body: JSON.stringify(data) });

// ─────────────────────────────────────────────────────────────────────────────
// BED BOOKING
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/beds — list wards with availability */
export const getWards = () => request('/api/beds');

/** GET /api/bed-bookings — role-scoped bed bookings */
export const getBedBookings = () => request('/api/bed-bookings');

/** POST /api/bed-bookings — book a bed */
export const createBedBooking = (data) =>
  request('/api/bed-bookings', { method: 'POST', body: JSON.stringify(data) });

/** PATCH /api/bed-bookings/:id — cancel/update a bed booking */
export const cancelBedBooking = (id) =>
  request(`/api/bed-bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Cancelled' }) });
