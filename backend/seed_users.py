"""
seed_users.py — HealthcareOS Backend
Creates login accounts in the `users` table for all existing patients, doctors,
and one admin account. Run this ONCE to populate the users table.

Usage:
    python seed_users.py

Default credentials after seeding:
    Admin   → admin@healthcareos.org   / Admin@1234
    Doctor  → sharma@gmail.com         / Doctor@1234
    Doctor  → gupta@gmail.com          / Doctor@1234
    Doctor  → mehta@gmail.com          / Doctor@1234
    Patient → devansh@gmail.com        / Patient@1234
    Patient → darshan@gmail.com        / Patient@1234
    Patient → sahas@gmail.com          / Patient@1234
"""

import bcrypt
from dotenv import load_dotenv
load_dotenv()
from config import supabase


def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def seed():
    users_to_create = []

    # ── 1. Admin account (no patient_id or doctor_id) ─────────────────────────
    users_to_create.append({
        'username':      'Admin HealthcareOS',
        'email':         'admin@healthcareos.org',
        'password_hash': hash_pw('Admin@1234'),
        'role':          'admin',
        'patient_id':    None,
        'doctor_id':     None,
    })

    # ── 2. Doctor accounts — link to existing doctor rows ─────────────────────
    doctors = supabase.table('doctor').select('doctor_id, name, email').execute().data
    for doc in doctors:
        users_to_create.append({
            'username':      doc['name'],
            'email':         doc['email'],
            'password_hash': hash_pw('Doctor@1234'),
            'role':          'doctor',
            'patient_id':    None,
            'doctor_id':     doc['doctor_id'],
        })

    # ── 3. Patient accounts — link to existing patient rows ───────────────────
    patients = supabase.table('patient').select('patient_id, name, email').execute().data
    for pat in patients:
        users_to_create.append({
            'username':      pat['name'],
            'email':         pat['email'],
            'password_hash': hash_pw('Patient@1234'),
            'role':          'patient',
            'patient_id':    pat['patient_id'],
            'doctor_id':     None,
        })

    # ── 4. Insert all at once ─────────────────────────────────────────────────
    result = supabase.table('users').insert(users_to_create).execute()
    print(f"✅ Seeded {len(result.data)} user accounts successfully.\n")
    for u in result.data:
        print(f"  [{u['role'].upper():8}] {u['email']} (user_id={u['user_id']})")


if __name__ == '__main__':
    seed()
