"""
routes/ai_diagnosis.py — HealthcareOS Flask Backend
Implements real Gemini-powered symptom analysis with specialty recommendation.

Endpoints:
  POST /api/symptom-log    — save symptoms, return symptom_id
  POST /api/ai-diagnosis   — run Gemini triage, return structured JSON
"""

import json
import re
import google.generativeai as genai
from flask import Blueprint, jsonify, request
from config import supabase, GEMINI_API_KEY
from middleware.auth_guard import require_role

ai_diagnosis_bp = Blueprint('ai_diagnosis', __name__)

# Configure Gemini client once at import time
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ── Gemini model generator with active endpoint fallbacks ────────────────────
def _generate_with_gemini(prompt: str) -> str:
    """Generate content trying active Gemini models (flash-latest, 3.6-flash, 2.5-flash-lite, etc.)."""
    api_key = GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment.")
    genai.configure(api_key=api_key)
    candidate_models = [
        'gemini-flash-latest',
        'gemini-3.6-flash',
        'gemini-2.5-flash-lite',
        'gemini-pro-latest',
        'gemini-1.5-flash',
        'gemini-pro'
    ]
    last_err = None
    for model_name in candidate_models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            last_err = e
            continue
    raise last_err or Exception("All Gemini model endpoints failed")


# ── Structured triage prompt ──────────────────────────────────────────────────
TRIAGE_PROMPT = """You are a certified clinical triage AI assistant embedded in a hospital management system.

A patient has reported the following symptoms:
"{symptoms}"

Patient age (if available): {age}

Your task: Analyze the symptoms and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

The JSON must exactly match this schema:
{{
  "condition": "Primary medical condition name (e.g. Acute Coronary Syndrome)",
  "urgency": "Critical | High | Medium | Low",
  "confidence": <integer 0-100>,
  "description": "2-3 sentence clinical description of the condition",
  "actions": [
    "Action 1 the patient should take",
    "Action 2",
    "Action 3"
  ],
  "specialty": "Medical specialty the patient should consult (e.g. Cardiologist, Neurologist, General Physician, Orthopedic Surgeon, Pulmonologist, Gastroenterologist, Dermatologist, ENT Specialist, Ophthalmologist, Psychiatrist)",
  "specialty_reason": "One concise sentence explaining why this specialty is recommended"
}}

Rules:
- urgency must be exactly one of: Critical, High, Medium, Low
- confidence must be an integer between 50 and 98
- actions must have exactly 3 items
- Output ONLY the raw JSON object, nothing else, no markdown fences
"""


# ── Helper: extract JSON from Gemini response ─────────────────────────────────
def _extract_json(text: str) -> dict:
    """Strip markdown fences and parse the first JSON object found."""
    text = re.sub(r'```(?:json)?', '', text).strip().rstrip('`').strip()
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in Gemini response")
    return json.loads(match.group())


# ── Keyword-based fallback when Gemini fails ──────────────────────────────────
def _fallback_response(symptoms: str) -> dict:
    s = symptoms.lower()
    if any(k in s for k in ['chest', 'heart', 'breath', 'breathe', 'palpitation']):
        return {
            "condition": "Possible Cardiac Event",
            "urgency": "Critical",
            "confidence": 85,
            "description": "Chest-related symptoms may indicate a cardiac event. Immediate medical evaluation is essential.",
            "actions": [
                "Call emergency services immediately.",
                "Do not drive yourself to the hospital.",
                "Chew aspirin 325mg if not allergic and available."
            ],
            "specialty": "Cardiologist",
            "specialty_reason": "Chest symptoms require urgent cardiac assessment by a specialist."
        }
    if any(k in s for k in ['headache', 'migraine', 'speech', 'weakness', 'slur', 'vision', 'numbness']):
        return {
            "condition": "Possible Neurological Event",
            "urgency": "High",
            "confidence": 80,
            "description": "Neurological symptoms including headache, vision changes, or speech issues require prompt evaluation.",
            "actions": [
                "Seek emergency care immediately.",
                "Do not take pain relievers without medical guidance.",
                "Note onset time and any triggers."
            ],
            "specialty": "Neurologist",
            "specialty_reason": "Neurological symptoms require specialist brain and nerve evaluation."
        }
    if any(k in s for k in ['cough', 'throat', 'fever', 'cold', 'flu', 'runny', 'congestion']):
        return {
            "condition": "Upper Respiratory Infection",
            "urgency": "Low",
            "confidence": 75,
            "description": "Symptoms are consistent with a common viral upper respiratory infection.",
            "actions": [
                "Rest and stay well hydrated.",
                "Take paracetamol for fever management.",
                "Consult a doctor if symptoms worsen after 5 days."
            ],
            "specialty": "General Physician",
            "specialty_reason": "General viral illnesses are best managed by a primary care physician."
        }
    if any(k in s for k in ['joint', 'knee', 'back', 'bone', 'fracture', 'sprain', 'muscle']):
        return {
            "condition": "Musculoskeletal Complaint",
            "urgency": "Medium",
            "confidence": 72,
            "description": "Symptoms point to a musculoskeletal issue that requires physical evaluation.",
            "actions": [
                "Apply RICE (Rest, Ice, Compression, Elevation) if applicable.",
                "Avoid strenuous activity on the affected area.",
                "Schedule an appointment with an orthopedic specialist."
            ],
            "specialty": "Orthopedic Surgeon",
            "specialty_reason": "Bone and joint issues are best assessed by an orthopedic specialist."
        }
    return {
        "condition": "Unspecified Condition — Requires Evaluation",
        "urgency": "Medium",
        "confidence": 60,
        "description": "The reported symptoms require in-person clinical assessment for accurate diagnosis.",
        "actions": [
            "Schedule a clinic appointment soon.",
            "Monitor and log your symptoms carefully.",
            "Avoid self-medicating without medical advice."
        ],
        "specialty": "General Physician",
        "specialty_reason": "A general physician can evaluate your symptoms and refer you to the right specialist."
    }


# ── Helper: optional patient ID from JWT ───────────────────────────────────────
def _get_optional_patient_id():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        try:
            token = auth_header.split(' ', 1)[1]
            from config import JWT_SECRET
            import jwt
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            return payload.get('patient_id')
        except Exception:
            return None
    return None


# ── POST /api/symptom-log ─────────────────────────────────────────────────────
@ai_diagnosis_bp.route('/api/symptom-log', methods=['POST'])
def post_symptom_log():
    """
    Save a symptom description and return the new row's ID.
    Body: { symptom_description: str, source?: str }
    Response: { symptom_id: int|null, message: str }
    """
    body = request.get_json(silent=True) or {}
    symptom_description = body.get('symptom_description', '').strip()

    if not symptom_description:
        return jsonify({'error': 'symptom_description is required'}), 400

    patient_id = _get_optional_patient_id()

    try:
        row = {
            'symptom_description': symptom_description,
            'source': body.get('source', 'patient-portal'),
        }
        if patient_id:
            row['patient_id'] = patient_id

        result = supabase.table('symptom_log').insert(row).execute()
        symptom_id = result.data[0].get('symptom_id') if result.data else None
        return jsonify({'symptom_id': symptom_id, 'message': 'Symptoms logged successfully'}), 201

    except Exception as e:
        # Table may not exist yet — return synthetic response so flow continues
        return jsonify({'symptom_id': None, 'message': 'Symptoms noted (DB log pending)', 'detail': str(e)}), 200


# ── POST /api/ai-diagnosis ────────────────────────────────────────────────────
@ai_diagnosis_bp.route('/api/ai-diagnosis', methods=['POST'])
def post_ai_diagnosis():
    """
    Run Gemini clinical triage on provided symptoms.
    Body: { symptoms: str, patient_age?: int }
    Response: { condition, urgency, confidence, description, actions[], specialty, specialty_reason }
    """
    body = request.get_json(silent=True) or {}
    symptoms = body.get('symptoms', '').strip()
    patient_age = body.get('patient_age', 'unknown')

    if not symptoms:
        return jsonify({'error': 'symptoms field is required'}), 400

    prompt = TRIAGE_PROMPT.format(symptoms=symptoms, age=patient_age)

    try:
        raw_text = _generate_with_gemini(prompt)
        diagnosis = _extract_json(raw_text)

        # Validate required keys
        required = ['condition', 'urgency', 'confidence', 'description', 'actions', 'specialty', 'specialty_reason']
        for key in required:
            if key not in diagnosis:
                raise ValueError(f"Missing key in Gemini response: {key}")

        # Sanitise
        diagnosis['confidence'] = max(50, min(98, int(diagnosis['confidence'])))
        if diagnosis['urgency'] not in ('Critical', 'High', 'Medium', 'Low'):
            diagnosis['urgency'] = 'Medium'

        return jsonify(diagnosis), 200

    except Exception as e:
        fallback = _fallback_response(symptoms)
        fallback['_fallback'] = True
        fallback['_error'] = str(e)
        return jsonify(fallback), 200
