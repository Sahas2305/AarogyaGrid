"""
routes/ai_diagnosis.py — HealthcareOS Flask Backend
Stub — Phase 3 implementation pending.
"""
from flask import Blueprint, jsonify
ai_diagnosis_bp = Blueprint('ai_diagnosis', __name__)

@ai_diagnosis_bp.route('/api/symptom-log', methods=['POST'])
def post_symptom_log():
    return jsonify({'message': 'symptom-log route — Phase 3 pending'}), 200

@ai_diagnosis_bp.route('/api/ai-diagnosis', methods=['POST'])
def post_ai_diagnosis():
    return jsonify({'message': 'ai-diagnosis route — Phase 3 pending'}), 200
