"""
routes/auth.py — HealthcareOS Flask Backend
Handles user login and patient self-registration.

Endpoints:
    POST /api/auth/login      — verify credentials, return JWT
    POST /api/auth/register   — create new patient account
"""

import os
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify
from config import supabase, JWT_SECRET

auth_bp = Blueprint('auth', __name__)


def _generate_token(user: dict) -> str:
    """
    Generates a signed JWT valid for 24 hours.

    Payload shape:
        user_id    : int   — primary key from users table
        role       : str   — 'admin' | 'doctor' | 'patient'
        patient_id : int|None
        doctor_id  : int|None
        username   : str
        exp        : datetime — expiry (24 h from now)
    """
    payload = {
        'user_id':    user.get('user_id'),
        'role':       user.get('role'),
        'patient_id': user.get('patient_id'),
        'doctor_id':  user.get('doctor_id'),
        'username':   user.get('username'),
        'exp':        datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/login
# ─────────────────────────────────────────────────────────────────────────────
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """
    Authenticates a user by email + password.

    Request body (JSON):
        { "email": "...", "password": "..." }

    Returns (200):
        {
            "token": "<JWT>",
            "role": "admin|doctor|patient",
            "user_id": 1,
            "patient_id": 5 | null,
            "doctor_id": 3 | null,
            "username": "Rahul Mehta"
        }

    Errors:
        400 — missing fields
        401 — wrong email or password
        500 — server/database error
    """
    body = request.get_json(silent=True) or {}
    email    = body.get('email', '').strip().lower()
    password = body.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    try:
        # ── 1. Look up user by email ─────────────────────────────────────
        result = supabase.table('users').select('*').eq('email', email).limit(1).execute()

        if not result.data:
            # Intentionally vague — don't reveal whether email exists
            return jsonify({'error': 'Invalid email or password.'}), 401

        user = result.data[0]

        # ── 2. Verify bcrypt password ────────────────────────────────────
        stored_hash = user.get('password_hash', '')
        password_matches = bcrypt.checkpw(
            password.encode('utf-8'),
            stored_hash.encode('utf-8')
        )

        if not password_matches:
            return jsonify({'error': 'Invalid email or password.'}), 401

        # ── 3. Build token + response ────────────────────────────────────
        token = _generate_token(user)

        return jsonify({
            'token':      token,
            'role':       user.get('role'),
            'user_id':    user.get('user_id'),
            'patient_id': user.get('patient_id'),
            'doctor_id':  user.get('doctor_id'),
            'username':   user.get('username'),
        }), 200

    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/register
# ─────────────────────────────────────────────────────────────────────────────
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """
    Registers a new patient account.
    Inserts into `patient` first, then into `users` with patient_id = new patient's ID.

    Request body (JSON):
        {
            "username": "Rahul Mehta",
            "email": "rahul@gmail.com",
            "password": "SecurePass123",
            "gender": "Male",
            "dob": "1998-05-21",
            "phone": "9876543210",
            "address": "Bangalore, Karnataka",
            "insurance_details": "LIC-00123"   ← optional
        }

    Returns (201):
        {
            "token": "<JWT>",
            "role": "patient",
            "user_id": 11,
            "patient_id": 5,
            "username": "Rahul Mehta"
        }

    Errors:
        400 — missing required fields
        409 — email already registered
        500 — server/database error
    """
    body = request.get_json(silent=True) or {}

    # ── 1. Validate required fields ──────────────────────────────────────
    required = ['username', 'email', 'password', 'gender', 'dob', 'phone', 'address']
    missing  = [f for f in required if not body.get(f)]
    if missing:
        return jsonify({'error': f'Missing required fields: {missing}'}), 400

    email    = body['email'].strip().lower()
    password = body['password']
    username = body['username'].strip()

    # ── 2. Check if email already exists ─────────────────────────────────
    try:
        existing = supabase.table('users').select('user_id').eq('email', email).execute()
        if existing.data:
            return jsonify({'error': 'An account with this email already exists.'}), 409
    except Exception as e:
        return jsonify({'error': f'Database check failed: {str(e)}'}), 500

    # ── 3. Hash password ──────────────────────────────────────────────────
    password_hash = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    new_patient_id = None

    try:
        # ── 4. Insert into `patient` table ───────────────────────────────
        patient_insert = supabase.table('patient').insert({
            'name':               username,
            'gender':             body.get('gender'),
            'dob':                body.get('dob'),
            'email':              email,
            'phone':              body.get('phone'),
            'address':            body.get('address'),
            'insurance_details':  body.get('insurance_details', ''),
        }).execute()

        if not patient_insert.data:
            raise Exception('Patient insert returned no data.')

        new_patient_id = patient_insert.data[0]['patient_id']

        # ── 5. Insert into `users` table ─────────────────────────────────
        user_insert = supabase.table('users').insert({
            'username':      username,
            'email':         email,
            'password_hash': password_hash,
            'role':          'patient',
            'patient_id':    new_patient_id,
            'doctor_id':     None,
        }).execute()

        if not user_insert.data:
            raise Exception('User insert returned no data.')

        new_user = user_insert.data[0]
        token    = _generate_token(new_user)

        return jsonify({
            'token':      token,
            'role':       'patient',
            'user_id':    new_user.get('user_id'),
            'patient_id': new_patient_id,
            'doctor_id':  None,
            'username':   username,
        }), 201

    except Exception as e:
        # ── 6. Manual rollback: delete patient row if user insert failed ──
        if new_patient_id is not None:
            try:
                supabase.table('patient').delete().eq('patient_id', new_patient_id).execute()
            except Exception:
                pass  # Best-effort cleanup
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500
