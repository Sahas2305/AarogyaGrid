"""
middleware/auth_guard.py — HealthcareOS Flask Backend

Provides the @require_role(*roles) decorator.

Usage:
    from middleware.auth_guard import require_role

    @appointments_bp.route('/api/appointments', methods=['GET'])
    @require_role('admin', 'doctor', 'patient')
    def get_appointments():
        user = request.user   # { user_id, role, patient_id, doctor_id }
        ...

After successful verification, the decoded JWT payload is attached
to `request.user` so any route handler can read the caller's identity
without repeating the decode logic.
"""

import os
import jwt
from functools import wraps
from flask import request, jsonify
from config import JWT_SECRET


def require_role(*allowed_roles):
    """
    Decorator factory — wraps a Flask route and enforces JWT + role check.

    Args:
        *allowed_roles: One or more of 'admin', 'doctor', 'patient'.

    Returns:
        403 if the caller's role is not in allowed_roles.
        401 if the token is missing, expired, or malformed.
        Calls the wrapped function if the token is valid.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # ── 1. Extract token from Authorization header ──────────────
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Missing or malformed Authorization header.'}), 401

            token = auth_header.split(' ', 1)[1]

            # ── 2. Decode and verify JWT ────────────────────────────────
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Token has expired. Please log in again.'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'error': 'Invalid token. Please log in again.'}), 401

            # ── 3. Role check ───────────────────────────────────────────
            role = payload.get('role', '')
            if role not in allowed_roles:
                return jsonify({
                    'error': f'Access denied. Required role(s): {list(allowed_roles)}. Your role: {role}'
                }), 403

            # ── 4. Attach user info to request context ──────────────────
            # Every route handler can now do: request.user['patient_id'] etc.
            request.user = {
                'user_id':    payload.get('user_id'),
                'role':       role,
                'patient_id': payload.get('patient_id'),   # None if doctor/admin
                'doctor_id':  payload.get('doctor_id'),    # None if patient/admin
                'username':   payload.get('username'),
            }

            return fn(*args, **kwargs)
        return wrapper
    return decorator
