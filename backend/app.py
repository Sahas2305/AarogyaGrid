"""
app.py — HealthcareOS Flask Backend
Entry point. Initializes Flask, registers CORS, and mounts all route Blueprints.

Run locally:
    python app.py

Production (Render):
    gunicorn app:app
"""

import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

from flask import Flask, jsonify
from flask_cors import CORS
import time
import logging

logger = logging.getLogger(__name__)

# ── Global Supabase retry patch ───────────────────────────────────────────────
# WinError 10035 (WSAEWOULDBLOCK) is a transient Windows socket error that
# occurs when the OS rejects an idle TCP connection. We patch the underlying
# PostgREST client execute() to auto-retry these cases.
def _patch_supabase_execute():
    """Monkey-patch postgrest's SyncRequestBuilder.execute with retry logic."""
    try:
        from postgrest._sync.request_builder import SyncQueryRequestBuilder

        _original_execute = SyncQueryRequestBuilder.execute

        def _retrying_execute(self, *args, **kwargs):
            retryable = ("10035", "10054", "10053", "WinError", "WSAEWOULDBLOCK",
                         "socket", "ConnectionReset", "Connection aborted", "RemoteDisconnected")
            last_err = None
            delay = 0.4
            for attempt in range(3):
                try:
                    return _original_execute(self, *args, **kwargs)
                except Exception as exc:
                    msg = str(exc)
                    if any(sig in msg for sig in retryable):
                        last_err = exc
                        if attempt < 2:
                            logger.warning(
                                "[Supabase] Socket error attempt %d/3: %s — retry in %.1fs",
                                attempt + 1, exc, delay
                            )
                            time.sleep(delay)
                            delay = min(delay * 2, 4.0)
                        continue
                    raise  # non-transient — raise immediately
            raise last_err

        SyncQueryRequestBuilder.execute = _retrying_execute
        logger.info("[Supabase] Retry patch applied to SyncQueryRequestBuilder.execute")
    except (ImportError, AttributeError) as e:
        logger.warning("[Supabase] Could not apply retry patch: %s", e)

_patch_supabase_execute()

# ── Import all route blueprints ──────────────────────────────────────────────
from routes.auth            import auth_bp
from routes.patients        import patients_bp
from routes.doctors         import doctors_bp
from routes.appointments    import appointments_bp
from routes.medical_records import medical_records_bp
from routes.billing         import billing_bp
from routes.lab_reports     import lab_reports_bp
from routes.audit_logs      import audit_logs_bp
from routes.ai_diagnosis    import ai_diagnosis_bp
from routes.bed_booking     import bed_booking_bp

# ── App factory ──────────────────────────────────────────────────────────────
app = Flask(__name__)

# Allow requests from the React dev server, Vercel deployments, and production domains
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

# ── Register blueprints ───────────────────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(patients_bp)
app.register_blueprint(doctors_bp)
app.register_blueprint(appointments_bp)
app.register_blueprint(medical_records_bp)
app.register_blueprint(billing_bp)
app.register_blueprint(lab_reports_bp)
app.register_blueprint(audit_logs_bp)
app.register_blueprint(ai_diagnosis_bp)
app.register_blueprint(bed_booking_bp)


# ── Health-check route ────────────────────────────────────────────────────────
@app.route('/api/ping', methods=['GET'])
def ping():
    """
    Quick sanity-check endpoint.
    Hit this first to confirm Flask + Supabase are running correctly.
    GET /api/ping → { "status": "ok", "message": "HealthcareOS API is live" }
    """
    return jsonify({
        'status': 'ok',
        'message': 'AarogyaGrid API is live'
    }), 200


# ── Supabase connection test ──────────────────────────────────────────────────
@app.route('/api/ping/db', methods=['GET'])
def ping_db():
    """
    Verifies Supabase connection by fetching one row from the patient table.
    GET /api/ping/db → { "status": "ok", "sample": {...} }
    Only use during development — disable/remove before production deployment.
    """
    try:
        from config import supabase
        result = supabase.table('patient').select('patient_id, name').limit(1).execute()
        return jsonify({
            'status': 'ok',
            'message': 'Supabase connection successful',
            'sample': result.data
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


# ── Global error handlers ─────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Route not found'}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed'}), 405


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
