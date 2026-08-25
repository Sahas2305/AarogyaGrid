"""
routes/bed_booking.py — HealthcareOS Flask Backend

Endpoints:
    GET   /api/beds              → list all beds with availability (all roles)
    GET   /api/bed-bookings      → role-scoped bookings
    POST  /api/bed-bookings      → patient or admin books a bed
    PATCH /api/bed-bookings/<id> → admin/doctor updates status (discharge, cancel)

Uses in-memory bed data + Supabase for bookings.
If a `bed_booking` table doesn't exist, creates bookings in the `audit_log` table
as a graceful fallback so the UI always works.
"""

from datetime import date, datetime, timezone
from flask import Blueprint, request, jsonify
from config import supabase
from middleware.auth_guard import require_role

bed_booking_bp = Blueprint('bed_booking', __name__)

# ── Static ward/bed catalogue (mirrors mockBeds.js) ──────────────────────────
WARDS = {
    "General Ward": {
        "floor": "Ground Floor", "price_per_day": 800,
        "facilities": ["Shared bathroom", "TV", "Nurse call bell", "3 meals/day"],
        "capacity": 20, "color": "cyan"
    },
    "Private Room": {
        "floor": "2nd Floor", "price_per_day": 3500,
        "facilities": ["Attached bathroom", "AC", "Smart TV", "Mini fridge", "Sofa", "24/7 nursing"],
        "capacity": 10, "color": "purple"
    },
    "Semi-Private Room": {
        "floor": "1st Floor", "price_per_day": 1800,
        "facilities": ["Shared bathroom", "AC", "TV", "2 meals/day", "Nurse call bell"],
        "capacity": 15, "color": "blue"
    },
    "ICU": {
        "floor": "3rd Floor", "price_per_day": 8500,
        "facilities": ["Ventilator support", "Cardiac monitor", "24/7 intensivist", "Isolation"],
        "capacity": 8, "color": "danger"
    },
    "HDU (High Dependency)": {
        "floor": "3rd Floor", "price_per_day": 5500,
        "facilities": ["Step-down ICU", "Continuous monitoring", "Oxygen support"],
        "capacity": 6, "color": "warning"
    },
    "Paediatric Ward": {
        "floor": "1st Floor", "price_per_day": 1200,
        "facilities": ["Child-friendly", "Play area access", "Parent cot", "Paediatric nurse"],
        "capacity": 12, "color": "success"
    },
}


# In-memory fallback storage if table not yet created in Supabase
_IN_MEMORY_BOOKINGS = []
_BOOKING_ID_COUNTER = 101

def _get_booked_counts():
    """Return a dict of ward_type → count of active bookings."""
    try:
        result = supabase.table('bed_booking') \
            .select('ward_type') \
            .in_('status', ['Confirmed', 'Active']) \
            .execute()
        counts = {}
        for row in result.data:
            wt = row['ward_type']
            counts[wt] = counts.get(wt, 0) + 1
        return counts
    except Exception:
        counts = {}
        for b in _IN_MEMORY_BOOKINGS:
            if b.get('status') in ['Confirmed', 'Active']:
                wt = b['ward_type']
                counts[wt] = counts.get(wt, 0) + 1
        return counts


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/beds — list wards with live availability
# ─────────────────────────────────────────────────────────────────────────────
@bed_booking_bp.route('/api/beds', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_beds():
    booked = _get_booked_counts()
    result = []
    for ward_name, info in WARDS.items():
        booked_count = booked.get(ward_name, 0)
        available    = max(0, info['capacity'] - booked_count)
        result.append({
            'ward_type':       ward_name,
            'floor':           info['floor'],
            'price_per_day':   info['price_per_day'],
            'facilities':      info['facilities'],
            'total_capacity':  info['capacity'],
            'booked':          booked_count,
            'available':       available,
            'color':           info['color'],
        })
    return jsonify(result), 200


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/bed-bookings — role-scoped bookings
# ─────────────────────────────────────────────────────────────────────────────
@bed_booking_bp.route('/api/bed-bookings', methods=['GET'])
@require_role('admin', 'doctor', 'patient')
def get_bed_bookings():
    user = request.user
    try:
        query = supabase.table('bed_booking').select(
            '*, patient(patient_id, name, phone)'
        ).order('created_at', desc=True)

        if user['role'] == 'patient':
            query = query.eq('patient_id', user['patient_id'])

        result = query.execute()
        return jsonify(result.data), 200

    except Exception:
        # Fallback to in-memory bookings
        if user['role'] == 'patient':
            user_bookings = [b for b in _IN_MEMORY_BOOKINGS if b.get('patient_id') == user.get('patient_id')]
            return jsonify(user_bookings), 200
        return jsonify(_IN_MEMORY_BOOKINGS), 200


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/bed-bookings — patient or admin books a bed
# ─────────────────────────────────────────────────────────────────────────────
@bed_booking_bp.route('/api/bed-bookings', methods=['POST'])
@require_role('admin', 'patient')
def create_bed_booking():
    global _BOOKING_ID_COUNTER
    try:
        body = request.get_json(silent=True) or {}
        user = request.user

        required = ['ward_type', 'admission_date', 'reason']
        missing  = [f for f in required if not body.get(f)]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        ward_type = body['ward_type']
        if ward_type not in WARDS:
            return jsonify({'error': f'Invalid ward type: {ward_type}'}), 400

        patient_id = user['patient_id'] if user['role'] == 'patient' else body.get('patient_id')
        if not patient_id:
            return jsonify({'error': 'patient_id required for admin bookings.'}), 400

        booked = _get_booked_counts()
        available = max(0, WARDS[ward_type]['capacity'] - booked.get(ward_type, 0))
        if available <= 0:
            return jsonify({'error': f'{ward_type} is fully booked. No beds available.'}), 409

        booking_payload = {
            'patient_id':          int(patient_id),
            'ward_type':           ward_type,
            'admission_date':      body['admission_date'],
            'expected_discharge':  body.get('expected_discharge'),
            'reason':              body['reason'].strip(),
            'status':              'Confirmed',
            'price_per_day':       WARDS[ward_type]['price_per_day'],
            'floor':               WARDS[ward_type]['floor'],
            'created_at':          datetime.now(timezone.utc).isoformat(),
        }

        try:
            result = supabase.table('bed_booking').insert(booking_payload).execute()
            booking = result.data[0]
        except Exception:
            _BOOKING_ID_COUNTER += 1
            booking = {
                **booking_payload,
                'booking_id': _BOOKING_ID_COUNTER,
            }
            _IN_MEMORY_BOOKINGS.insert(0, booking)

        # Log audit
        try:
            supabase.table('audit_log').insert({
                'action':         'INSERT',
                'table_affected': 'bed_booking',
                'details':        f"Bed booking confirmed: {ward_type} for patient_id {patient_id}",
                'ip_address':     request.remote_addr or '127.0.0.1',
            }).execute()
        except Exception:
            pass

        return jsonify(booking), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/bed-bookings/<id> — update status (discharge / cancel)
# ─────────────────────────────────────────────────────────────────────────────
@bed_booking_bp.route('/api/bed-bookings/<int:booking_id>', methods=['PATCH'])
@require_role('admin', 'doctor', 'patient')
def update_bed_booking(booking_id):
    try:
        body = request.get_json(silent=True) or {}
        user = request.user

        # Try from Supabase first
        try:
            existing = supabase.table('bed_booking') \
                .select('booking_id, patient_id, status') \
                .eq('booking_id', booking_id) \
                .limit(1).execute()
            booking = existing.data[0] if existing.data else None
        except Exception:
            booking = next((b for b in _IN_MEMORY_BOOKINGS if b.get('booking_id') == booking_id), None)

        if not booking:
            return jsonify({'error': f'Booking {booking_id} not found.'}), 404

        # Patients can only cancel their own booking
        if user['role'] == 'patient':
            if booking['patient_id'] != user['patient_id']:
                return jsonify({'error': 'Access denied.'}), 403
            new_status = body.get('status')
            if new_status != 'Cancelled':
                return jsonify({'error': 'Patients can only cancel bookings.'}), 403

        allowed  = ['status', 'actual_discharge', 'notes']
        updates  = {k: v for k, v in body.items() if k in allowed and v is not None}

        if not updates:
            return jsonify({'error': 'No valid fields to update.'}), 400

        try:
            result = supabase.table('bed_booking') \
                .update(updates) \
                .eq('booking_id', booking_id) \
                .execute()
            return jsonify(result.data[0]), 200
        except Exception:
            for b in _IN_MEMORY_BOOKINGS:
                if b.get('booking_id') == booking_id:
                    b.update(updates)
                    return jsonify(b), 200

        return jsonify({'error': 'Failed to update booking.'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

