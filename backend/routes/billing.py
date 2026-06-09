"""
routes/billing.py — HealthcareOS Flask Backend

Endpoints:
    GET   /api/billing         → role-scoped
    GET   /api/billing/<id>    → single bill
    POST  /api/billing         → admin only
    PATCH /api/billing/<id>    → admin marks bill as paid

Table: billing
    billing_id, appointment_id, patient_id, amount,
    payment_method, payment_date
"""

from datetime import date
from flask import Blueprint, request, jsonify
from config import supabase
from middleware.auth_guard import require_role

billing_bp = Blueprint('billing', __name__)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/billing
# ─────────────────────────────────────────────────────────────────────────────
@billing_bp.route('/api/billing', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_billing():
    """
    Role-scoped:
      admin  → all bills (with patient name, appointment date)
      doctor → bills linked to their patients' appointments
      patient→ own bills only
    """
    try:
        user = request.user

        query = supabase.table('billing').select(
            '*, '
            'patient(patient_id, name), '
            'appointment(appointment_id, appointment_date, status)'
        ).order('billing_id', desc=True)

        if user['role'] == 'patient':
            query = query.eq('patient_id', user['patient_id'])
        elif user['role'] == 'doctor':
            # Get appointments belonging to this doctor, filter bills by those appointment IDs
            appt_result = supabase.table('appointment') \
                .select('appointment_id') \
                .eq('doctor_id', user['doctor_id']) \
                .execute()
            appt_ids = [a['appointment_id'] for a in appt_result.data]
            if not appt_ids:
                return jsonify([]), 200
            query = query.in_('appointment_id', appt_ids)

        result = query.execute()
        return jsonify(result.data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/billing/<id>
# ─────────────────────────────────────────────────────────────────────────────
@billing_bp.route('/api/billing/<int:billing_id>', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_bill_by_id(billing_id):
    """Returns a single bill with ownership check for patients."""
    try:
        user = request.user

        result = supabase.table('billing').select(
            '*, patient(name), appointment(appointment_date, status)'
        ).eq('billing_id', billing_id).limit(1).execute()

        if not result.data:
            return jsonify({'error': f'Bill {billing_id} not found.'}), 404

        bill = result.data[0]
        if user['role'] == 'patient' and bill.get('patient_id') != user['patient_id']:
            return jsonify({'error': 'Access denied.'}), 403

        return jsonify(bill), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/billing
# ─────────────────────────────────────────────────────────────────────────────
@billing_bp.route('/api/billing', methods=['POST'])
@require_role('admin')
def create_bill():
    """
    Admin creates a new bill.
    Body: { appointment_id, patient_id, amount, payment_method? }
    payment_date defaults to today if payment_method provided.
    """
    try:
        body = request.get_json(silent=True) or {}
        required = ['appointment_id', 'patient_id', 'amount']
        missing = [f for f in required if body.get(f) is None]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        payment_method = body.get('payment_method')
        result = supabase.table('billing').insert({
            'appointment_id': int(body['appointment_id']),
            'patient_id':     int(body['patient_id']),
            'amount':         float(body['amount']),
            'payment_method': payment_method,
            'payment_date':   str(date.today()) if payment_method else None,
        }).execute()

        return jsonify(result.data[0]), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/billing/<id>
# ─────────────────────────────────────────────────────────────────────────────
@billing_bp.route('/api/billing/<int:billing_id>', methods=['PATCH'])
@require_role('admin')
def update_bill(billing_id):
    """
    Admin marks a bill as paid or updates amount.
    Body: { payment_method?, amount?, payment_date? }
    """
    try:
        body = request.get_json(silent=True) or {}
        allowed = ['payment_method', 'amount', 'payment_date']
        updates = {k: v for k, v in body.items() if k in allowed and v is not None}

        # Auto-set today's date if marking as paid and no date given
        if 'payment_method' in updates and 'payment_date' not in updates:
            updates['payment_date'] = str(date.today())

        if not updates:
            return jsonify({'error': 'No valid fields to update.'}), 400

        result = supabase.table('billing') \
            .update(updates) \
            .eq('billing_id', billing_id) \
            .execute()

        if not result.data:
            return jsonify({'error': f'Bill {billing_id} not found.'}), 404

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
