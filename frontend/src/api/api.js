/**
 * api.js — HealthcareOS Frontend
 * Single utility file for all Flask API calls.
 * Every page imports functions from here — no raw fetch() in components.
 *
 * Usage:
 *   import { getDoctors, createAppointment } from '../api/api';
 *   const doctors = await getDoctors();
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
export const loginUser = (email, password) =>
  fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());

/** POST /api/auth/register — returns same shape as login */
export const registerPatient = (data) =>
  fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json());

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
export const getAppointments = () => request('/api/appointments');

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
export const getMedicalRecords = () => request('/api/medical-records');

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
export const getLabReports = () => request('/api/lab-reports');

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
 * POST /api/symptom-log — saves symptoms to DB
 * Body: { patient_id, appointment_id, symptom_description, source }
 */
export const submitSymptoms = (data) =>
  request('/api/symptom-log', { method: 'POST', body: JSON.stringify(data) });

/**
 * POST /api/ai-diagnosis — triggers Gemini API, stores result, returns prediction
 * Body: { symptom_id, patient_age }
 */
export const getAIDiagnosis = (data) =>
  request('/api/ai-diagnosis', { method: 'POST', body: JSON.stringify(data) });
