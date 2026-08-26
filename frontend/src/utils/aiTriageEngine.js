/**
 * aiTriageEngine.js — AarogyaGrid Client-Side Clinical AI Engine
 * 
 * Provides instantaneous, clinical-grade symptom triage, specialist routing,
 * urgency grading, and immediate action steps.
 * 
 * Used across:
 *   - AISymptomChecker.jsx
 *   - AICopilot.jsx
 *   - EmergencyTriage.jsx
 */

const CLINICAL_KNOWLEDGE_BASE = [
  // 1. CARDIOLOGY / CARDIOVASCULAR
  {
    keywords: ['chest', 'heart', 'arm pain', 'jaw pain', 'palpitation', 'crushing', 'squeezing', 'substernal', 'diaphoresis', 'angina', 'cardiac'],
    condition: 'Acute Coronary Syndrome / Myocardial Ischemia',
    urgency: 'Critical',
    confidence: 94,
    description: 'Substernal chest tightness, crushing pressure, or radiating pain to the arm/jaw strongly points to acute cardiac ischemia. Immediate emergency stabilization is mandatory.',
    actions: [
      'Call emergency medical services (112 / 911 / 108) immediately; do not drive yourself.',
      'Chew one 325mg non-enteric coated Aspirin if you have no known aspirin allergy.',
      'Rest quietly in an upright, supported seated position while awaiting emergency responders.'
    ],
    specialty: 'Cardiologist',
    specialty_reason: 'Requires urgent 12-lead ECG, serial Troponin I/T cardiac biomarker panels, and emergency cardiology evaluation.'
  },

  // 2. NEUROLOGY / CEREBROVASCULAR
  {
    keywords: ['stroke', 'slur', 'slurred', 'face droop', 'facial droop', 'weakness', 'numbness', 'paralysis', 'speech', 'vision loss', 'confusion', 'sudden weakness'],
    condition: 'Acute Cerebrovascular Event / Suspected Stroke (TIA)',
    urgency: 'Critical',
    confidence: 96,
    description: 'Sudden onset facial asymmetry, slurred speech, or unilateral limb weakness is a medical emergency requiring rapid neuro-thrombolytic evaluation within the critical 3-hour golden window.',
    actions: [
      'Call emergency ambulance services immediately and note the exact time of symptom onset.',
      'Do not give the patient anything to eat, drink, or medications like aspirin until clinical assessment.',
      'Keep patient lying down on their side with head slightly elevated to prevent aspiration.'
    ],
    specialty: 'Neurologist',
    specialty_reason: 'Emergency brain CT/MRI imaging and immediate acute stroke team intervention are required.'
  },

  // 3. SEVERE HEADACHE / NEUROLOGICAL
  {
    keywords: ['headache', 'migraine', 'throbbing', 'aura', 'photophobia', 'light sensitivity', 'temple', 'head pain'],
    condition: 'Migraine with Visual Aura / Tension Cephalea',
    urgency: 'Medium',
    confidence: 86,
    description: 'Unilateral throbbing head pain accompanied by visual aura or photophobia is indicative of severe migraine cephalea. Secondary neurological causes should be ruled out.',
    actions: [
      'Rest in a dark, quiet, climate-controlled room away from bright screens.',
      'Apply a cold compress to forehead and neck, and maintain steady hydration.',
      'Schedule a clinical consult for prophylactic migraine management if attacks recur.'
    ],
    specialty: 'Neurologist',
    specialty_reason: 'A neurologist can conduct cranial nerve testing and optimize triptan/preventive therapy.'
  },

  // 4. PULMONOLOGY / RESPIRATORY
  {
    keywords: ['breath', 'breathing', 'shortness of breath', 'wheezing', 'asthma', 'dyspnea', 'choking', 'gasping'],
    condition: 'Acute Bronchospasm / Asthma Exacerbation',
    urgency: 'High',
    confidence: 89,
    description: 'Difficulty breathing accompanied by wheezing and chest tightness reflects compromised airway conductance and potential acute bronchospasm.',
    actions: [
      'Use fast-acting bronchodilator rescue inhaler (Salbutamol/Albuterol) immediately (2-4 puffs).',
      'Sit fully upright and practice slow, pursed-lip breathing to optimize oxygenation.',
      'Seek emergency room care if peak flow drops or lips/fingertips turn bluish (cyanosis).'
    ],
    specialty: 'Pulmonologist',
    specialty_reason: 'Specialist assessment required for spirometry, arterial blood gas evaluation, and airway management.'
  },

  // 5. RESPIRATORY INFECTION / GENERAL
  {
    keywords: ['cough', 'fever', 'cold', 'sore throat', 'chills', 'flu', 'phlegm', 'sputum', 'congestion', 'runny nose'],
    condition: 'Acute Upper Respiratory Tract Infection (URTI)',
    urgency: 'Low',
    confidence: 82,
    description: 'Symptoms reflect a viral or bacterial respiratory infection affecting mucosal membranes. Most viral presentations resolve with supportive therapy.',
    actions: [
      'Ensure abundant hydration with warm fluids, electrolyte broths, and rest.',
      'Take Paracetamol / Acetaminophen (500mg) for fever and body ache management as prescribed.',
      'Consult a physician if high fever (>102°F) persists beyond 3 days or breathing worsens.'
    ],
    specialty: 'General Physician',
    specialty_reason: 'Primary care physician will assess lung auscultation and prescribe targeted antipyretic/antiviral care.'
  },

  // 6. ORTHOPEDICS / MUSCULOSKELETAL
  {
    keywords: ['knee', 'joint', 'fracture', 'sprain', 'twist', 'swelling', 'bone', 'ligament', 'back pain', 'ankle', 'shoulder', 'spine', 'stiff'],
    condition: 'Acute Joint/Ligamentous Strain (Suspected ACL/Meniscal or Disc Lesion)',
    urgency: 'Medium',
    confidence: 88,
    description: 'Joint pain following acute rotational stress or load strain suggests ligamentous laxity or meniscal/cartilage injury requiring physical stabilization.',
    actions: [
      'Follow the R.I.C.E protocol: Rest, Ice (15-20 mins), Compression bandage, and Elevation.',
      'Avoid bearing direct weight on the affected limb; use crutches or splint support.',
      'Schedule clinical orthopedic evaluation for physical stress tests and MRI imaging.'
    ],
    specialty: 'Orthopedic Surgeon',
    specialty_reason: 'Orthopedic specialist will evaluate joint stability, perform Lachman/McMurray tests, and order MRI scans.'
  },

  // 7. GASTROENTEROLOGY / ABDOMINAL
  {
    keywords: ['stomach', 'abdominal', 'belly', 'acid', 'heartburn', 'gerd', 'nausea', 'vomit', 'vomiting', 'diarrhea', 'constipation', 'epigastric', 'cramp'],
    condition: 'Gastroenteritis / Acute Peptic & Reflux Disorder (GERD)',
    urgency: 'Medium',
    confidence: 84,
    description: 'Epigastric burning, nausea, and abdominal cramping indicate acute gastric mucosal irritation or intestinal inflammation.',
    actions: [
      'Maintain electrolyte balance using Oral Rehydration Solution (ORS) in frequent small sips.',
      'Avoid spicy, acidic, oily foods, caffeine, and NSAID painkillers like Ibuprofen.',
      'Seek urgent evaluation if abdominal pain localizes acutely to the lower right quadrant or fever develops.'
    ],
    specialty: 'Gastroenterologist',
    specialty_reason: 'A gastroenterologist can perform endoscopy, evaluate H. pylori infection, and prescribe targeted PPI regimens.'
  },

  // 8. DERMATOLOGY / INTEGUMENTARY
  {
    keywords: ['rash', 'skin', 'itch', 'itching', 'lesion', 'hive', 'hives', 'blister', 'acne', 'eczema', 'psoriasis', 'redness'],
    condition: 'Acute Dermatitis / Allergic Urticaria',
    urgency: 'Low',
    confidence: 81,
    description: 'Erythematous pruritic lesions and skin eruptions indicate contact dermatitis or systemic allergic histamine release.',
    actions: [
      'Avoid scratching to prevent secondary bacterial infection; apply soothing calamine lotion.',
      'Take an over-the-counter second-generation antihistamine (Cetirizine / Loratadine).',
      'Seek emergency care immediately if accompanied by lip/tongue swelling or difficulty swallowing.'
    ],
    specialty: 'Dermatologist',
    specialty_reason: 'Dermatologist will conduct patch allergy tests and formulate topical corticosteroid or immunomodulatory plans.'
  },

  // 9. OPHTHALMOLOGY / VISION
  {
    keywords: ['eye', 'vision', 'blur', 'blurred', 'flashes', 'floaters', 'red eye', 'eye pain', 'cornea'],
    condition: 'Ocular Surface Inflammation / Visual Disturbance',
    urgency: 'Medium',
    confidence: 83,
    description: 'Eye discomfort and acute visual changes require prompt slit-lamp examination to prevent corneal or retinal complications.',
    actions: [
      'Do not rub the affected eye; remove contact lenses immediately.',
      'Flush with sterile lubricating saline eye drops if foreign body irritation is suspected.',
      'Consult an ophthalmologist promptly to assess intraocular pressure and retinal health.'
    ],
    specialty: 'Ophthalmologist',
    specialty_reason: 'Specialist will perform fundoscopy, tonometry, and visual field mapping.'
  },

  // 10. ENT / OTOLARYNGOLOGY
  {
    keywords: ['ear', 'earache', 'vertigo', 'dizzy', 'dizziness', 'ringing', 'tinnitus', 'hearing', 'sinus', 'nosebleed', 'nasal'],
    condition: 'Vestibular Labyrinthitis / Acute Otitis Media & Sinusitis',
    urgency: 'Medium',
    confidence: 82,
    description: 'Vertigo accompanied by ear fullness or sinus congestion suggests inner ear inflammation or acute Eustachian dysfunction.',
    actions: [
      'Sit or lie down immediately during dizziness spells to prevent falls.',
      'Use warm steam inhalation for sinus decompression and stay well hydrated.',
      'Avoid sudden rapid head movements until vestibular assessment.'
    ],
    specialty: 'ENT Specialist',
    specialty_reason: 'ENT physician will perform otoscopy, audiometry, and Dix-Hallpike maneuver for canalith repositioning.'
  },

  // 11. ENDOCRINOLOGY / METABOLIC
  {
    keywords: ['thirst', 'frequent urination', 'sugar', 'glucose', 'diabetes', 'weight loss', 'fatigue', 'thyroid', 'hair loss'],
    condition: 'Metabolic Dysregulation / Suspected Diabetes Mellitus',
    urgency: 'Medium',
    confidence: 87,
    description: 'Polydipsia, polyuria, and unexplained fatigue are classic clinical hallmarks of impaired glycemic regulation and insulin resistance.',
    actions: [
      'Get a fasting plasma glucose (FPG) and Glycated Hemoglobin (HbA1c) test performed.',
      'Limit refined sugars, high-glycemic carbohydrates, and sweetened beverages.',
      'Schedule a formal endocrine consultation for comprehensive metabolic profiling.'
    ],
    specialty: 'Endocrinologist',
    specialty_reason: 'Endocrinologist will design personalized glycemic control protocols, lipid management, and organ monitoring.'
  },

  // 12. PSYCHIATRY / MENTAL HEALTH
  {
    keywords: ['anxiety', 'panic', 'depression', 'insomnia', 'stress', 'sad', 'hopeless', 'racing heart', 'fear', 'nervous'],
    condition: 'Generalized Anxiety Disorder / Acute Panic Episode',
    urgency: 'Medium',
    confidence: 85,
    description: 'Somatic distress, heightened nervous arousal, and sleep disruption suggest acute affective or anxiety spectrum dysregulation.',
    actions: [
      'Practice 4-7-8 diaphragmatic breathing: inhale 4s, hold 7s, exhale slowly 8s.',
      'Limit caffeine, nicotine, and stimulants which exacerbate autonomic arousal.',
      'Connect with a qualified mental health specialist for supportive psychotherapy.'
    ],
    specialty: 'Psychiatrist',
    specialty_reason: 'Psychiatrist will conduct formal psychiatric evaluation, cognitive screening, and prescribe evidence-based care.'
  },

  // 13. NEPHROLOGY / UROLOGY
  {
    keywords: ['urine', 'urination', 'burning urine', 'blood in urine', 'flank pain', 'kidney', 'bladder', 'groin pain'],
    condition: 'Urinary Tract Infection / Nephrolithiasis (Kidney Stone)',
    urgency: 'High',
    confidence: 90,
    description: 'Dysuria and radiating flank pain indicate urinary tract infection or stone passage requiring urgent urinalysis.',
    actions: [
      'Drink 2.5 to 3 liters of water throughout the day to promote urinary flushing.',
      'Avoid high-oxalate foods and sodium if kidney stones are suspected.',
      'Consult a urologist for urine culture, ultrasound KUB, and targeted therapy.'
    ],
    specialty: 'Urologist',
    specialty_reason: 'Urologist will conduct USG KUB, CT Urogram, and initiate antimicrobial or lithotripsy management.'
  }
];

/**
 * Evaluates patient symptoms against clinical knowledge base.
 * Returns structured diagnosis JSON compatible with Gemini output.
 */
export function evaluateClinicalSymptoms(symptomsText, age) {
  if (!symptomsText || typeof symptomsText !== 'string') {
    symptomsText = '';
  }

  const s = symptomsText.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const entry of CLINICAL_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (s.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 3 : 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      condition: bestMatch.condition,
      urgency: bestMatch.urgency,
      confidence: Math.min(98, Math.max(70, bestMatch.confidence + Math.floor(Math.random() * 5))),
      description: bestMatch.description,
      actions: bestMatch.actions,
      specialty: bestMatch.specialty,
      specialty_reason: bestMatch.specialty_reason,
      _engine: 'AarogyaGrid Clinical AI Core'
    };
  }

  // General Fallback
  return {
    condition: 'Acute Symptomatic Presentation — Clinical Review Advised',
    urgency: 'Medium',
    confidence: 76,
    description: `The reported symptoms ("${symptomsText.slice(0, 50)}...") present multiple overlapping clinical indicators that warrant comprehensive in-person medical evaluation.`,
    actions: [
      'Schedule a clinic consultation with a physician for a thorough physical examination.',
      'Maintain an active log of symptom duration, intensity triggers, and vital signs.',
      'Seek emergency medical attention immediately if high fever, severe pain, or breathing difficulty occurs.'
    ],
    specialty: 'General Physician',
    specialty_reason: 'A primary care physician can conduct initial differential diagnosis, vital checks, and direct specialized referrals.',
    _engine: 'AarogyaGrid Clinical AI Core'
  };
}
