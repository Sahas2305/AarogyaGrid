"""
routes/lab_reports.py — HealthcareOS Flask Backend

Endpoints:
    GET  /api/lab-reports          → role-scoped
    GET  /api/lab-reports/<id>     → single lab test
    POST /api/lab-reports          → admin or doctor

Table: lab_test
    test_id, record_id, test_name, ordered_by,
    test_date, result, notes
"""

from datetime import date
from flask import Blueprint, request, jsonify
from config import supabase
from middleware.auth_guard import require_role

lab_reports_bp = Blueprint('lab_reports', __name__)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/lab-reports
# ─────────────────────────────────────────────────────────────────────────────
@lab_reports_bp.route('/api/lab-reports', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_lab_reports():
    """
    Role-scoped via the medical_record link:
      admin  → all lab tests
      doctor → tests linked to their medical records
      patient→ tests linked to their medical records

    Joins: lab_test → medical_record → patient / doctor names
    """
    try:
        user = request.user

        # Base query with join to medical_record for patient/doctor context
        query = supabase.table('lab_test').select(
            '*, '
            'medical_record(record_id, patient_id, doctor_id, diagnosis, '
            'patient(name), doctor(name))'
        ).order('test_date', desc=True)

        if user['role'] == 'doctor':
            # Get record IDs for this doctor
            records = supabase.table('medical_record') \
                .select('record_id') \
                .eq('doctor_id', user['doctor_id']) \
                .execute()
            record_ids = [r['record_id'] for r in records.data]
            if not record_ids:
                return jsonify([]), 200
            query = query.in_('record_id', record_ids)

        elif user['role'] == 'patient':
            # Get record IDs for this patient
            records = supabase.table('medical_record') \
                .select('record_id') \
                .eq('patient_id', user['patient_id']) \
                .execute()
            record_ids = [r['record_id'] for r in records.data]
            if not record_ids:
                return jsonify([]), 200
            query = query.in_('record_id', record_ids)

        result = query.execute()
        return jsonify(result.data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/lab-reports/<id>
# ─────────────────────────────────────────────────────────────────────────────
@lab_reports_bp.route('/api/lab-reports/<int:test_id>', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_lab_report_by_id(test_id):
    """Returns a single lab test result with full join."""
    try:
        result = supabase.table('lab_test').select(
            '*, medical_record(record_id, patient_id, doctor_id, patient(name), doctor(name))'
        ).eq('test_id', test_id).limit(1).execute()

        if not result.data:
            return jsonify({'error': f'Lab test {test_id} not found.'}), 404

        test = result.data[0]
        user = request.user

        # Access check via nested medical_record
        mr = test.get('medical_record', {}) or {}
        if user['role'] == 'patient' and mr.get('patient_id') != user['patient_id']:
            return jsonify({'error': 'Access denied.'}), 403
        if user['role'] == 'doctor' and mr.get('doctor_id') != user['doctor_id']:
            return jsonify({'error': 'Access denied.'}), 403

        return jsonify(test), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/lab-reports
# ─────────────────────────────────────────────────────────────────────────────
@lab_reports_bp.route('/api/lab-reports', methods=['POST'])
@require_role('admin', 'doctor')
def create_lab_report():
    """
    Doctor/Admin adds a new lab test linked to a medical record.

    Body: {
        record_id, test_name, ordered_by,
        test_date?, result?, notes?
    }
    """
    try:
        body = request.get_json(silent=True) or {}
        required = ['record_id', 'test_name', 'ordered_by']
        missing = [f for f in required if not body.get(f)]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        result = supabase.table('lab_test').insert({
            'record_id':  int(body['record_id']),
            'test_name':  body['test_name'].strip(),
            'ordered_by': body['ordered_by'].strip(),
            'test_date':  body.get('test_date', str(date.today())),
            'result':     body.get('result', '').strip(),
            'notes':      body.get('notes', '').strip(),
        }).execute()

        return jsonify(result.data[0]), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
