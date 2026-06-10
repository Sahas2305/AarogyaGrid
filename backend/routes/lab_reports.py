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
            records = supabase.table('medical_record') \
                .select('record_id') \
                .eq('doctor_id', user['doctor_id']) \
                .execute()
            record_ids = [r['record_id'] for r in records.data]
            if not record_ids:
                return jsonify([]), 200
            query = query.in_('record_id', record_ids)

        elif user['role'] == 'patient':
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
    Doctor/Admin adds a new lab test.
    Body: { patient_id, doctor_id, test_name, test_date?, notes? }

    Auto-resolves record_id by:
      1. Finding the patient's latest medical_record
      2. If none, finding the patient's latest appointment and creating a record
    """
    try:
        body       = request.get_json(silent=True) or {}
        test_name  = (body.get('test_name') or '').strip()
        patient_id = body.get('patient_id')
        doctor_id  = body.get('doctor_id')

        if not test_name:
            return jsonify({'error': 'Missing field: test_name'}), 400
        if not patient_id:
            return jsonify({'error': 'Missing field: patient_id'}), 400

        patient_id = int(patient_id)

        # Resolve ordered_by doctor name
        if doctor_id:
            doctor_id = int(doctor_id)
            doc = supabase.table('doctor').select('name') \
                .eq('doctor_id', doctor_id).limit(1).execute()
            ordered_by = doc.data[0]['name'] if doc.data else 'Admin'
        else:
            doc = supabase.table('doctor').select('doctor_id, name').limit(1).execute()
            doctor_id  = doc.data[0]['doctor_id'] if doc.data else None
            ordered_by = doc.data[0]['name']      if doc.data else 'Admin'

        # Step 1: Find an existing medical record for this patient
        rec = supabase.table('medical_record') \
            .select('record_id') \
            .eq('patient_id', patient_id) \
            .order('record_date', desc=True) \
            .limit(1).execute()

        if rec.data:
            record_id = rec.data[0]['record_id']
        else:
            # Step 2: Find the patient's most recent appointment
            appt = supabase.table('appointment') \
                .select('appointment_id, doctor_id') \
                .eq('patient_id', patient_id) \
                .order('appointment_date', desc=True) \
                .limit(1).execute()

            if not appt.data:
                return jsonify({
                    'error': 'No appointments found for this patient. Please book an appointment first before ordering a lab test.'
                }), 400

            appt_id     = appt.data[0]['appointment_id']
            appt_doc_id = appt.data[0]['doctor_id'] or doctor_id

            # Create a medical record linked to that appointment
            new_rec = supabase.table('medical_record').insert({
                'patient_id':     patient_id,
                'doctor_id':      appt_doc_id,
                'appointment_id': appt_id,
                'diagnosis':      'Lab Test Order',
                'prescription':   '',
                'notes':          'Auto-created for lab order.',
                'record_date':    str(date.today()),
            }).execute()
            record_id = new_rec.data[0]['record_id']

        # Step 3: Insert the lab test
        result = supabase.table('lab_test').insert({
            'record_id':  record_id,
            'test_name':  test_name,
            'ordered_by': ordered_by,
            'test_date':  body.get('test_date', str(date.today())),
            'result':     body.get('result', ''),
            'notes':      body.get('notes', ''),
        }).execute()

        return jsonify(result.data[0]), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
