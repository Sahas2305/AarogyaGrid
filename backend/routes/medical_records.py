"""
routes/medical_records.py — HealthcareOS Flask Backend

Endpoints:
    GET  /api/medical-records          → role-scoped
    GET  /api/medical-records/<id>     → single record
    POST /api/medical-records          → doctor only

Table: medical_record
    record_id, patient_id, doctor_id, appointment_id,
    diagnosis, prescription, notes, record_date
"""

from datetime import date
from flask import Blueprint, request, jsonify
from config import supabase
from middleware.auth_guard import require_role

medical_records_bp = Blueprint('medical_records', __name__)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/medical-records
# ─────────────────────────────────────────────────────────────────────────────
@medical_records_bp.route('/api/medical-records', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_medical_records():
    """
    Role-scoped:
      admin   → all records (joined with patient name, doctor name)
      doctor  → records where doctor_id = their id
      patient → records where patient_id = their id
    """
    try:
        user = request.user

        query = supabase.table('medical_record').select(
            '*, '
            'patient(patient_id, name), '
            'doctor(doctor_id, name, specialization)'
        ).order('record_date', desc=True)

        if user['role'] == 'doctor':
            query = query.eq('doctor_id', user['doctor_id'])
        elif user['role'] == 'patient':
            query = query.eq('patient_id', user['patient_id'])

        result = query.execute()
        return jsonify(result.data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/medical-records/<id>
# ─────────────────────────────────────────────────────────────────────────────
@medical_records_bp.route('/api/medical-records/<int:record_id>', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_record_by_id(record_id):
    """Returns a single medical record with ownership check."""
    try:
        user = request.user

        result = supabase.table('medical_record').select(
            '*, patient(patient_id, name), doctor(doctor_id, name)'
        ).eq('record_id', record_id).limit(1).execute()

        if not result.data:
            return jsonify({'error': f'Record {record_id} not found.'}), 404

        record = result.data[0]

        if user['role'] == 'patient' and record.get('patient_id') != user['patient_id']:
            return jsonify({'error': 'Access denied.'}), 403
        if user['role'] == 'doctor' and record.get('doctor_id') != user['doctor_id']:
            return jsonify({'error': 'Access denied.'}), 403

        return jsonify(record), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/medical-records
# ─────────────────────────────────────────────────────────────────────────────
@medical_records_bp.route('/api/medical-records', methods=['POST'])
@require_role('doctor', 'admin')
def create_medical_record():
    """
    Doctor writes a new medical record.
    doctor_id is auto-set from the JWT for doctor role.

    Body: {
        patient_id, appointment_id?,
        diagnosis, prescription, notes?
    }
    """
    try:
        body = request.get_json(silent=True) or {}
        user = request.user

        required = ['patient_id', 'diagnosis', 'prescription']
        missing = [f for f in required if not body.get(f)]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        # Doctor's id comes from JWT, not request body (security)
        doctor_id = user['doctor_id'] if user['role'] == 'doctor' else body.get('doctor_id')
        if not doctor_id:
            return jsonify({'error': 'doctor_id is required for admin writes.'}), 400

        result = supabase.table('medical_record').insert({
            'patient_id':      int(body['patient_id']),
            'doctor_id':       int(doctor_id),
            'appointment_id':  body.get('appointment_id'),
            'diagnosis':       body['diagnosis'].strip(),
            'prescription':    body['prescription'].strip(),
            'notes':           body.get('notes', '').strip(),
            'record_date':     str(date.today()),
        }).execute()

        return jsonify(result.data[0]), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
