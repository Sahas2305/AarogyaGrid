"""
routes/appointments.py — HealthcareOS Flask Backend

Endpoints:
    GET   /api/appointments        → role-scoped (admin=all, doctor=theirs, patient=theirs)
    GET   /api/appointments/<id>   → single appointment
    POST  /api/appointments        → patient or admin books appointment
    PATCH /api/appointments/<id>   → doctor or admin updates status

Table: appointment
    appointment_id, patient_id, doctor_id, department_id,
    appointment_date, appointment_time, status, reason
"""

from flask import Blueprint, request, jsonify
from config import supabase
from middleware.auth_guard import require_role

appointments_bp = Blueprint('appointments', __name__)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/appointments
# ─────────────────────────────────────────────────────────────────────────────
@appointments_bp.route('/api/appointments', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_appointments():
    """
    Returns appointments scoped by caller's role:
      admin   → all appointments (joined with patient name, doctor name, dept name)
      doctor  → only appointments assigned to their doctor_id
      patient → only appointments belonging to their patient_id

    Optional query params:
      ?status=Pending|Confirmed|Completed|Cancelled
      ?date=YYYY-MM-DD
    """
    try:
        user   = request.user
        status = request.args.get('status')
        date   = request.args.get('date')

        # Joined query — bring in patient name, doctor name, department name
        query = supabase.table('appointment').select(
            '*, '
            'patient(patient_id, name, phone), '
            'doctor(doctor_id, name, specialization), '
            'department(department_name)'
        ).order('appointment_date', desc=True).order('appointment_time', desc=True)

        # Role scoping
        if user['role'] == 'doctor':
            query = query.eq('doctor_id', user['doctor_id'])
        elif user['role'] == 'patient':
            query = query.eq('patient_id', user['patient_id'])

        # Optional filters
        if status:
            query = query.eq('status', status)
        if date:
            query = query.eq('appointment_date', date)

        result = query.execute()
        return jsonify(result.data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/appointments/<id>
# ─────────────────────────────────────────────────────────────────────────────
@appointments_bp.route('/api/appointments/<int:appointment_id>', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_appointment_by_id(appointment_id):
    """Returns a single appointment with joined names."""
    try:
        user = request.user

        result = supabase.table('appointment').select(
            '*, patient(patient_id, name, phone), '
            'doctor(doctor_id, name, specialization), '
            'department(department_name)'
        ).eq('appointment_id', appointment_id).limit(1).execute()

        if not result.data:
            return jsonify({'error': f'Appointment {appointment_id} not found.'}), 404

        appt = result.data[0]

        # Ownership check for patients
        if user['role'] == 'patient' and appt.get('patient_id') != user['patient_id']:
            return jsonify({'error': 'Access denied.'}), 403

        # Ownership check for doctors
        if user['role'] == 'doctor' and appt.get('doctor_id') != user['doctor_id']:
            return jsonify({'error': 'Access denied.'}), 403

        return jsonify(appt), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/appointments
# ─────────────────────────────────────────────────────────────────────────────
@appointments_bp.route('/api/appointments', methods=['POST'])
@require_role('admin', 'patient')
def create_appointment():
    """
    Books a new appointment.
    Patient role: patient_id is auto-set from JWT (can't book for someone else).
    Admin role:   patient_id must be provided in body.

    Body: {
        doctor_id, department_id, appointment_date, appointment_time, reason,
        patient_id  ← required if caller is admin
    }
    """
    try:
        body = request.get_json(silent=True) or {}
        user = request.user

        required = ['doctor_id', 'department_id', 'appointment_date', 'appointment_time']
        missing = [f for f in required if not body.get(f)]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        # Determine patient_id
        if user['role'] == 'patient':
            patient_id = user['patient_id']
        else:
            patient_id = body.get('patient_id')
            if not patient_id:
                return jsonify({'error': 'patient_id is required for admin bookings.'}), 400

        result = supabase.table('appointment').insert({
            'patient_id':        patient_id,
            'doctor_id':         int(body['doctor_id']),
            'department_id':     int(body['department_id']),
            'appointment_date':  body['appointment_date'],
            'appointment_time':  body['appointment_time'],
            'status':            'Pending',
            'reason':            body.get('reason', ''),
        }).execute()

        return jsonify(result.data[0]), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/appointments/<id>
# ─────────────────────────────────────────────────────────────────────────────
@appointments_bp.route('/api/appointments/<int:appointment_id>', methods=['PATCH'])
@require_role('admin', 'doctor', 'patient')
def update_appointment(appointment_id):
    """
    Updates appointment fields.
    Doctor/Admin → can update status (Confirmed, Completed, Cancelled).
    Patient      → can only cancel their own pending appointment.

    Body: { status? , reason?, appointment_date?, appointment_time? }
    """
    try:
        body = request.get_json(silent=True) or {}
        user = request.user

        # Fetch current appointment first (for ownership check)
        existing = supabase.table('appointment') \
            .select('patient_id, doctor_id, status') \
            .eq('appointment_id', appointment_id) \
            .limit(1) \
            .execute()

        if not existing.data:
            return jsonify({'error': f'Appointment {appointment_id} not found.'}), 404

        appt = existing.data[0]

        # Patient can only cancel their own appointments
        if user['role'] == 'patient':
            if appt['patient_id'] != user['patient_id']:
                return jsonify({'error': 'Access denied.'}), 403
            new_status = body.get('status')
            if new_status and new_status != 'Cancelled':
                return jsonify({'error': 'Patients can only cancel appointments.'}), 403

        # Doctor can only update their own scheduled appointments
        if user['role'] == 'doctor' and appt['doctor_id'] != user['doctor_id']:
            return jsonify({'error': 'Access denied.'}), 403

        allowed  = ['status', 'reason', 'appointment_date', 'appointment_time']
        valid_statuses = {'Pending', 'Confirmed', 'Completed', 'Cancelled'}
        updates  = {k: v for k, v in body.items() if k in allowed and v is not None}

        if 'status' in updates and updates['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400

        if not updates:
            return jsonify({'error': 'No valid fields to update.'}), 400

        result = supabase.table('appointment') \
            .update(updates) \
            .eq('appointment_id', appointment_id) \
            .execute()

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
