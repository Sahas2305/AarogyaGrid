"""
routes/doctors.py — HealthcareOS Flask Backend

Endpoints:
    GET  /api/doctors              → admin, patient, doctor: all doctors + department
    GET  /api/doctors/<id>         → admin, doctor: single doctor
    POST /api/doctors              → admin only (creates doctor + user login account)
    PATCH /api/doctors/<id>        → admin only

Tables:
    doctor      — doctor_id, department_id, name, specialization, phone, email
    department  — department_id, department_name, description
    users       — linked by doctor_id
"""

import bcrypt
from flask import Blueprint, request, jsonify
from config import supabase
from middleware.auth_guard import require_role

doctors_bp = Blueprint('doctors', __name__)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/doctors
# ─────────────────────────────────────────────────────────────────────────────
@doctors_bp.route('/api/doctors', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_doctors():
    """
    Returns all doctors joined with their department name.
    Accessible by all roles (patients need this to book appointments).
    Optional query param: ?department_id=<int>
    """
    try:
        dept_filter = request.args.get('department_id')

        # Join doctor with department to get department_name inline
        query = supabase.table('doctor') \
            .select('*, department(department_id, department_name)') \
            .order('doctor_id')

        if dept_filter:
            query = query.eq('department_id', int(dept_filter))

        result = query.execute()
        return jsonify(result.data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/doctors/<id>
# ─────────────────────────────────────────────────────────────────────────────
@doctors_bp.route('/api/doctors/<int:doctor_id>', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_doctor_by_id(doctor_id):
    """Returns a single doctor with department info."""
    try:
        result = supabase.table('doctor') \
            .select('*, department(department_id, department_name)') \
            .eq('doctor_id', doctor_id) \
            .limit(1) \
            .execute()

        if not result.data:
            return jsonify({'error': f'Doctor {doctor_id} not found.'}), 404

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/doctors
# ─────────────────────────────────────────────────────────────────────────────
@doctors_bp.route('/api/doctors', methods=['POST'])
@require_role('admin')
def create_doctor():
    """
    Admin registers a new doctor.
    Creates a row in `doctor` AND a login account in `users`.

    Body: {
        name, specialization, phone, email, department_id,
        password   ← temporary password set by admin
    }
    """
    try:
        body = request.get_json(silent=True) or {}
        required = ['name', 'specialization', 'phone', 'email', 'department_id', 'password']
        missing = [f for f in required if not body.get(f)]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        email = body['email'].strip().lower()

        # Check email not already registered
        existing = supabase.table('users').select('user_id').eq('email', email).execute()
        if existing.data:
            return jsonify({'error': 'A user with this email already exists.'}), 409

        new_doctor_id = None

        # ── 1. Insert into doctor table ──────────────────────────────────
        doctor_result = supabase.table('doctor').insert({
            'name':           body['name'].strip(),
            'specialization': body['specialization'].strip(),
            'phone':          body['phone'].strip(),
            'email':          email,
            'department_id':  int(body['department_id']),
        }).execute()

        if not doctor_result.data:
            raise Exception('Doctor insert returned no data.')

        new_doctor_id = doctor_result.data[0]['doctor_id']

        # ── 2. Hash password and create users account ────────────────────
        pw_hash = bcrypt.hashpw(
            body['password'].encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        user_result = supabase.table('users').insert({
            'username':      body['name'].strip(),
            'email':         email,
            'password_hash': pw_hash,
            'role':          'doctor',
            'patient_id':    None,
            'doctor_id':     new_doctor_id,
        }).execute()

        if not user_result.data:
            raise Exception('User insert returned no data.')

        return jsonify({
            'doctor':  doctor_result.data[0],
            'user_id': user_result.data[0]['user_id'],
            'message': f'Doctor {body["name"]} registered successfully.'
        }), 201

    except Exception as e:
        # Manual rollback — delete doctor row if user insert failed
        if new_doctor_id is not None:
            try:
                supabase.table('doctor').delete().eq('doctor_id', new_doctor_id).execute()
            except Exception:
                pass
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/doctors/<id>
# ─────────────────────────────────────────────────────────────────────────────
@doctors_bp.route('/api/doctors/<int:doctor_id>', methods=['PATCH'])
@require_role('admin')
def update_doctor(doctor_id):
    """
    Admin updates doctor details.
    Body: any subset of { name, specialization, phone, email, department_id }
    """
    try:
        body = request.get_json(silent=True) or {}
        allowed = ['name', 'specialization', 'phone', 'email', 'department_id']
        updates = {k: v for k, v in body.items() if k in allowed and v is not None}

        if not updates:
            return jsonify({'error': 'No valid fields to update.'}), 400

        result = supabase.table('doctor') \
            .update(updates) \
            .eq('doctor_id', doctor_id) \
            .execute()

        if not result.data:
            return jsonify({'error': f'Doctor {doctor_id} not found.'}), 404

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/departments  (bonus — needed by BookAppointment page)
# ─────────────────────────────────────────────────────────────────────────────
@doctors_bp.route('/api/departments', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_departments():
    """Returns all departments. Used by appointment booking dropdowns."""
    try:
        result = supabase.table('department').select('*').order('department_id').execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
