"""
app.py — HealthcareOS Flask Backend
Entry point. Initializes Flask, registers CORS, and mounts all route Blueprints.

Run locally:
    python app.py

Production (Render):
    gunicorn app:app
"""

from flask import Flask, jsonify
from flask_cors import CORS

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

# ── App factory ──────────────────────────────────────────────────────────────
app = Flask(__name__)

# Allow requests from the React dev server (port 5173) and production domain.
# Update the origins list when you deploy to Vercel.
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",        # Vite dev server
            "http://localhost:3000",        # fallback CRA / preview
            "https://*.vercel.app",         # Vercel preview deployments
        ],
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
        'message': 'HealthcareOS API is live'
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
