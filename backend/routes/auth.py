"""
routes/auth.py — HealthcareOS Flask Backend
Handles user login and patient self-registration.

Endpoints:
    POST /api/auth/login      — verify credentials, return JWT
    POST /api/auth/register   — create new patient account
"""

import os
import re
import random
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify
from config import supabase, JWT_SECRET

auth_bp = Blueprint('auth', __name__)

# ── In-memory OTP Storage (phone -> { otp, expires_at, verified }) ────────────
_OTP_CACHE = {}


def normalize_and_validate_mobile(phone_input: str):
    """
    Validates that the input is a valid 10-digit mobile number (starts with 6-9).
    Returns (cleaned_10_digits, error_message_or_None).
    """
    if not phone_input:
        return None, "Phone number is required."
    digits = re.sub(r'\D', '', str(phone_input).strip())
    if len(digits) == 12 and digits.startswith('91'):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith('0'):
        digits = digits[1:]
    
    if not re.match(r'^[6-9]\d{9}$', digits):
        return None, "Invalid mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9."
    return digits, None


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
# POST /api/auth/send-otp
# ─────────────────────────────────────────────────────────────────────────────
@auth_bp.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    """
    Generates and returns a 6-digit OTP for phone verification.
    Body: { "phone": "9876543210" }
    """
    body = request.get_json(silent=True) or {}
    phone = body.get('phone', '')

    clean_phone, phone_err = normalize_and_validate_mobile(phone)
    if phone_err:
        return jsonify({'error': phone_err}), 400

    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    _OTP_CACHE[clean_phone] = {
        'otp': otp_code,
        'expires_at': expires_at,
        'verified': False
    }

    return jsonify({
        'success': True,
        'message': f'OTP sent successfully to +91 {clean_phone}',
        'phone': clean_phone,
        'otp': otp_code  # Displayed in notification toast for testing
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/verify-otp
# ─────────────────────────────────────────────────────────────────────────────
@auth_bp.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    """
    Verifies 6-digit OTP submitted by user.
    Body: { "phone": "9876543210", "otp": "123456" }
    """
    body = request.get_json(silent=True) or {}
    phone = body.get('phone', '')
    otp_submitted = str(body.get('otp', '')).strip()

    clean_phone, phone_err = normalize_and_validate_mobile(phone)
    if phone_err:
        return jsonify({'error': phone_err}), 400

    if not otp_submitted:
        return jsonify({'error': 'Please enter the 6-digit OTP.'}), 400

    record = _OTP_CACHE.get(clean_phone)
    if not record:
        return jsonify({'error': 'No active OTP request found. Please request a new OTP.'}), 400

    if datetime.now(timezone.utc) > record['expires_at']:
        _OTP_CACHE.pop(clean_phone, None)
        return jsonify({'error': 'OTP has expired. Please request a new OTP.'}), 400

    if record['otp'] != otp_submitted:
        return jsonify({'error': 'Invalid OTP. Please check and try again.'}), 400

    record['verified'] = True
    return jsonify({
        'success': True,
        'message': 'Mobile number verified successfully!',
        'phone': clean_phone
    }), 200


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

    # ── 1b. Validate mobile number ───────────────────────────────────────
    clean_phone, phone_err = normalize_and_validate_mobile(body.get('phone'))
    if phone_err:
        return jsonify({'error': phone_err}), 400

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

    dob_val = body.get('dob')
    if dob_val and isinstance(dob_val, str):
        dob_str = dob_val.strip()
        if '-' in dob_str:
            parts = dob_str.split('-')
            if len(parts) == 3 and len(parts[0]) == 2 and len(parts[2]) == 4:
                dob_val = f"{parts[2]}-{parts[1]}-{parts[0]}"
        elif '/' in dob_str:
            parts = dob_str.split('/')
            if len(parts) == 3 and len(parts[0]) == 2 and len(parts[2]) == 4:
                dob_val = f"{parts[2]}-{parts[1]}-{parts[0]}"

    try:
        # ── 4. Insert into `patient` table ───────────────────────────────
        patient_insert = supabase.table('patient').insert({
            'name':               username,
            'gender':             body.get('gender'),
            'dob':                dob_val,
            'email':              email,
            'phone':              clean_phone,
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
