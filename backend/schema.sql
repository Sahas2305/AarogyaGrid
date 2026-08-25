-- ─────────────────────────────────────────────────────────────
-- HealthcareOS — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to initialize your DB.
-- ─────────────────────────────────────────────────────────────

-- 1. Departments
CREATE TABLE IF NOT EXISTS department (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 2. Patients
CREATE TABLE IF NOT EXISTS patient (
    patient_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    insurance_details VARCHAR(100)
);

-- 3. Doctors
CREATE TABLE IF NOT EXISTS doctor (
    doctor_id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES department(department_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Users (Authentication Accounts)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
    patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctor(doctor_id) ON DELETE CASCADE
);

-- 5. Appointments
CREATE TABLE IF NOT EXISTS appointment (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES department(department_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    reason TEXT
);

-- 6. Medical Records
CREATE TABLE IF NOT EXISTS medical_record (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointment(appointment_id) ON DELETE SET NULL,
    diagnosis TEXT NOT NULL,
    prescription TEXT NOT NULL,
    notes TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 7. Billing
CREATE TABLE IF NOT EXISTS billing (
    billing_id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointment(appointment_id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patient(patient_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATE
);

-- 8. Lab Tests
CREATE TABLE IF NOT EXISTS lab_test (
    test_id SERIAL PRIMARY KEY,
    record_id INTEGER NOT NULL REFERENCES medical_record(record_id) ON DELETE CASCADE,
    test_name VARCHAR(100) NOT NULL,
    ordered_by VARCHAR(100) NOT NULL,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    result TEXT,
    notes TEXT
);

-- 9. Audit Logs (No foreign keys to allow logs to remain even if rows are deleted)
CREATE TABLE IF NOT EXISTS audit_log (
    audit_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_affected VARCHAR(50) NOT NULL,
    action_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    details TEXT
);

-- ─────────────────────────────────────────────────────────────
-- Seeding Initial Data
-- ─────────────────────────────────────────────────────────────

-- Seed Departments
INSERT INTO department (department_name, description)
VALUES 
('Cardiology', 'Heart and cardiovascular system care'),
('Neurology', 'Brain and nervous system diagnostic & treatment'),
('Pediatrics', 'Infant, child, and adolescent healthcare'),
('General Medicine', 'Primary care and internal medicine general consultation')
ON CONFLICT (department_name) DO NOTHING;

-- Seed Doctors
INSERT INTO doctor (department_id, name, specialization, phone, email)
VALUES 
(1, 'Dr Sharma', 'Cardiologist', '9876543211', 'sharma@gmail.com'),
(2, 'Dr Gupta', 'Neurologist', '9876543212', 'gupta@gmail.com'),
(3, 'Dr Mehta', 'Pediatrician', '9876543213', 'mehta@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Seed Patients
INSERT INTO patient (name, gender, dob, email, phone, address, insurance_details)
VALUES 
('Devansh Pateriya', 'Male', '2004-05-18', 'devansh@gmail.com', '9876543201', 'HSR Layout, Bangalore', 'MAX-77382'),
('Darshan Gupta', 'Male', '2004-09-12', 'darshan@gmail.com', '9876543202', 'Indiranagar, Bangalore', 'LIC-10023'),
('Sahastranshu Mishra', 'Male', '2004-02-28', 'sahas@gmail.com', '9876543203', 'Koramangala, Bangalore', 'HDFC-88290')
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Database Auditing Triggers (Simulation)
-- ─────────────────────────────────────────────────────────────

-- Trigger Function to log changes
CREATE OR REPLACE FUNCTION log_database_action()
RETURNS TRIGGER AS $$
DECLARE
    record_details TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        record_details := 'Row deleted';
        INSERT INTO audit_log (action, table_affected, details)
        VALUES ('DELETE', TG_TABLE_NAME, record_details);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        record_details := 'Row updated';
        INSERT INTO audit_log (action, table_affected, details)
        VALUES ('UPDATE', TG_TABLE_NAME, record_details);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        record_details := 'Row inserted';
        INSERT INTO audit_log (action, table_affected, details)
        VALUES ('INSERT', TG_TABLE_NAME, record_details);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to key tables (check if trigger already exists first or drop & recreate)
DROP TRIGGER IF EXISTS audit_patient_trigger ON patient;
CREATE TRIGGER audit_patient_trigger
AFTER INSERT OR UPDATE OR DELETE ON patient
FOR EACH ROW EXECUTE FUNCTION log_database_action();

DROP TRIGGER IF EXISTS audit_doctor_trigger ON doctor;
CREATE TRIGGER audit_doctor_trigger
AFTER INSERT OR UPDATE OR DELETE ON doctor
FOR EACH ROW EXECUTE FUNCTION log_database_action();

DROP TRIGGER IF EXISTS audit_appointment_trigger ON appointment;
CREATE TRIGGER audit_appointment_trigger
AFTER INSERT OR UPDATE OR DELETE ON appointment
FOR EACH ROW EXECUTE FUNCTION log_database_action();

DROP TRIGGER IF EXISTS audit_medical_record_trigger ON medical_record;
CREATE TRIGGER audit_medical_record_trigger
AFTER INSERT OR UPDATE OR DELETE ON medical_record
FOR EACH ROW EXECUTE FUNCTION log_database_action();

DROP TRIGGER IF EXISTS audit_billing_trigger ON billing;
CREATE TRIGGER audit_billing_trigger
AFTER INSERT OR UPDATE OR DELETE ON billing
FOR EACH ROW EXECUTE FUNCTION log_database_action();
