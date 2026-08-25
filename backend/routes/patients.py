"""
routes/patients.py — HealthcareOS Flask Backend

Endpoints:
    GET  /api/patients          → admin: all | patient: own row only
    GET  /api/patients/<id>     → admin, doctor: any | patient: own only
    POST /api/patients          → admin only
    PATCH /api/patients/<id>    → admin only

Table: patient
    patient_id, name, gender, dob, email, phone, address, insurance_details
"""

from flask import Blueprint, request, jsonify
from config import supabase
from middleware.auth_guard import require_role

patients_bp = Blueprint('patients', __name__)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/patients
# ─────────────────────────────────────────────────────────────────────────────
@patients_bp.route('/api/patients', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_patients():
    """
    Admin/Doctor → returns all patients (with optional ?search= query param).
    Patient      → returns only their own row (scoped by patient_id in JWT).
    """
    try:
        user = request.user

        if user['role'] == 'patient':
            # A patient can only see their own record
            result = supabase.table('patient') \
                .select('*') \
                .eq('patient_id', user['patient_id']) \
                .execute()
            return jsonify(result.data), 200

        # Admin / Doctor — return all, support optional search
        search = request.args.get('search', '').strip()
        query = supabase.table('patient').select('*').order('patient_id')

        if search:
            # Supabase ilike for case-insensitive name/email search
            query = query.or_(f'name.ilike.%{search}%,email.ilike.%{search}%')

        result = query.execute()
        return jsonify(result.data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/patients/<id>
# ─────────────────────────────────────────────────────────────────────────────
@patients_bp.route('/api/patients/<int:patient_id>', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_patient_by_id(patient_id):
    """
    Returns a single patient row.
    A patient role can only fetch their own record — others get 403.
    """
    try:
        user = request.user

        # Patients can only view their own data
        if user['role'] == 'patient' and user['patient_id'] != patient_id:
            return jsonify({'error': 'Access denied. You can only view your own record.'}), 403

        result = supabase.table('patient') \
            .select('*') \
            .eq('patient_id', patient_id) \
            .limit(1) \
            .execute()

        if not result.data:
            return jsonify({'error': f'Patient {patient_id} not found.'}), 404

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/patients
# ─────────────────────────────────────────────────────────────────────────────
@patients_bp.route('/api/patients', methods=['POST'])
@require_role('admin')
def create_patient():
    """
    Admin creates a new patient record.
    Body: { name, gender, dob, email, phone, address, insurance_details? }
    """
    try:
        body = request.get_json(silent=True) or {}
        required = ['name', 'gender', 'dob', 'email', 'phone', 'address']
        missing = [f for f in required if not body.get(f)]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        result = supabase.table('patient').insert({
            'name':              body['name'].strip(),
            'gender':            body['gender'],
            'dob':               body['dob'],
            'email':             body['email'].strip().lower(),
            'phone':             body['phone'].strip(),
            'address':           body['address'].strip(),
            'insurance_details': body.get('insurance_details', ''),
        }).execute()

        return jsonify(result.data[0]), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/patients/<id>
# ─────────────────────────────────────────────────────────────────────────────
@patients_bp.route('/api/patients/<int:patient_id>', methods=['PATCH'])
@require_role('admin')
def update_patient(patient_id):
    """
    Admin updates patient details.
    Body: any subset of { name, gender, dob, email, phone, address, insurance_details }
    """
    try:
        body = request.get_json(silent=True) or {}
        allowed = ['name', 'gender', 'dob', 'email', 'phone', 'address', 'insurance_details']
        updates = {k: v for k, v in body.items() if k in allowed and v is not None}

        if not updates:
            return jsonify({'error': 'No valid fields provided for update.'}), 400

        result = supabase.table('patient') \
            .update(updates) \
            .eq('patient_id', patient_id) \
            .execute()

        if not result.data:
            return jsonify({'error': f'Patient {patient_id} not found.'}), 404

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
