/**
 * File: mockAIDiagnosis.js
 * Description: Mock data for all AI features.
 * Used on: AICopilot.jsx, AISymptomChecker.jsx, EmergencyTriage.jsx, RiskPrediction.jsx, etc.
 */

export const mockCopilotResponse = {
  probableDiagnosis: 'Acute Anterior Myocardial Infarction (STEMI)',
  confidence: 94,
  differentialDiagnoses: [
    { name: 'Acute Aortic Dissection', confidence: 45, severity: 'Critical' },
    { name: 'Acute Pericarditis', confidence: 30, severity: 'Medium' },
    { name: 'Gastroesophageal Reflux Disease (GERD)', confidence: 15, severity: 'Low' }
  ],
  suggestedLabs: ['12-Lead ECG (Emergency)', 'Cardiac Troponin I/T (Serial)', '2D Echocardiogram', 'Chest X-Ray (AP View)'],
  drugInteractionWarning: {
    severity: 'Danger',
    warning: 'CRITICAL WARNING: Patient is currently on Sildenafil (Viagra). Co-administration of Nitroglycerin is STRICTLY CONTRAINDICATED as it can cause profound, life-threatening hypotension.'
  },
  clinicalNotes: 'Presenting with crushing substernal chest pain radiating to the left arm and jaw, accompanied by diaphoresis and mild dyspnea for 45 minutes. Vitals indicate borderline hypotension and sinus tachycardia. Immediate cardiac monitoring required.',
  modelVersion: 'Gemini-Med-Pro v1.5',
  timestamp: '2026-06-09 22:05:00'
};

export const mockDiagnosisHistory = [
  {
    logId: 'DL001',
    date: '2026-06-09 10:15 AM',
    symptoms: 'Substernal squeezing chest pain, radiating to left shoulder, sweating',
    condition: 'Acute Coronary Syndrome',
    urgency: 'Critical',
    confidence: 94
  },
  {
    logId: 'DL002',
    date: '2026-06-08 02:40 PM',
    symptoms: 'Sudden weakness on left side of face, difficulty speaking, slurred speech',
    condition: 'Transient Ischemic Attack (TIA)',
    urgency: 'Critical',
    confidence: 89
  },
  {
    logId: 'DL003',
    date: '2026-06-07 09:00 AM',
    symptoms: 'Severe pounding headache behind right eye, nausea, sensitivity to light',
    condition: 'Migraine with Aura',
    urgency: 'Medium',
    confidence: 82
  },
  {
    logId: 'DL004',
    date: '2026-06-06 05:22 PM',
    symptoms: 'Shortness of breath, dry cough, wheezing, chest tightness in cold air',
    condition: 'Asthma Exacerbation',
    urgency: 'High',
    confidence: 87
  },
  {
    logId: 'DL005',
    date: '2026-06-05 11:30 AM',
    symptoms: 'Burning pain in epigastrium, worse after eating, sour throat',
    condition: 'Gastroesophageal Reflux (GERD)',
    urgency: 'Low',
    confidence: 76
  },
  {
    logId: 'DL006',
    date: '2026-06-04 01:10 PM',
    symptoms: 'High fever, shaking chills, productive cough with rusty sputum, side pain',
    condition: 'Lobar Pneumonia',
    urgency: 'High',
    confidence: 85
  },
  {
    logId: 'DL007',
    date: '2026-06-03 04:50 PM',
    symptoms: 'Pain, swelling and warmth in left calf after a 12-hour flight',
    condition: 'Deep Vein Thrombosis (DVT)',
    urgency: 'High',
    confidence: 81
  },
  {
    logId: 'DL008',
    date: '2026-06-02 08:15 AM',
    symptoms: 'Frequent urination, excessive thirst, sudden unexplained weight loss',
    condition: 'New Onset Diabetes Mellitus',
    urgency: 'Medium',
    confidence: 91
  },
  {
    logId: 'DL009',
    date: '2026-06-01 03:00 PM',
    symptoms: 'Pain in right lower abdomen, radiating to groin, nausea, low grade fever',
    condition: 'Acute Appendicitis',
    urgency: 'High',
    confidence: 88
  },
  {
    logId: 'DL010',
    date: '2026-05-31 10:20 AM',
    symptoms: 'Generalized joint pains, morning stiffness lasting > 1 hour, bilateral symmetry',
    condition: 'Active Rheumatoid Arthritis',
    urgency: 'Medium',
    confidence: 78
  }
];

export const mockTriagePatients = [
  {
    patientName: 'Karan Malhotra',
    age: 38,
    complaint: 'Crushing chest pain and sweating',
    vitals: { bp: '95/60', hr: 110, temp: 98.4, spo2: 91 },
    aiTriageScore: 98,
    urgency: 'Critical',
    waitingTime: 3
  },
  {
    patientName: 'Aditi Sharma',
    age: 41,
    complaint: 'Sudden onset slurred speech and facial droop',
    vitals: { bp: '150/95', hr: 88, temp: 98.6, spo2: 97 },
    aiTriageScore: 95,
    urgency: 'Critical',
    waitingTime: 5
  },
  {
    patientName: 'Rohan Deshmukh',
    age: 61,
    complaint: 'Severe shortness of breath at rest',
    vitals: { bp: '140/90', hr: 104, temp: 99.0, spo2: 88 },
    aiTriageScore: 92,
    urgency: 'Critical',
    waitingTime: 8
  },
  {
    patientName: 'Sneha Reddy',
    age: 26,
    complaint: 'High grade fever with stiff neck and confusion',
    vitals: { bp: '110/70', hr: 98, temp: 102.5, spo2: 96 },
    aiTriageScore: 88,
    urgency: 'High',
    waitingTime: 12
  },
  {
    patientName: 'Vijay Mallya',
    age: 71,
    complaint: 'Uncontrolled bleeding from shin laceration',
    vitals: { bp: '105/65', hr: 92, temp: 97.9, spo2: 98 },
    aiTriageScore: 84,
    urgency: 'High',
    waitingTime: 15
  },
  {
    patientName: 'Vikram Singh',
    age: 48,
    complaint: 'Acute severe right lower quadrant abdominal pain',
    vitals: { bp: '130/80', hr: 90, temp: 100.2, spo2: 99 },
    aiTriageScore: 78,
    urgency: 'High',
    waitingTime: 20
  },
  {
    patientName: 'Priya Nair',
    age: 33,
    complaint: 'Suspected fracture of left wrist from fall',
    vitals: { bp: '120/75', hr: 82, temp: 98.4, spo2: 99 },
    aiTriageScore: 65,
    urgency: 'Medium',
    waitingTime: 25
  },
  {
    patientName: 'Siddharth Rao',
    age: 44,
    complaint: 'Painful urination and flank pain with chills',
    vitals: { bp: '125/80', hr: 85, temp: 101.1, spo2: 98 },
    aiTriageScore: 62,
    urgency: 'Medium',
    waitingTime: 30
  },
  {
    patientName: 'Amit Verma',
    age: 43,
    complaint: 'Deep laceration on forearm with controlled bleeding',
    vitals: { bp: '122/78', hr: 80, temp: 98.5, spo2: 99 },
    aiTriageScore: 58,
    urgency: 'Medium',
    waitingTime: 35
  },
  {
    patientName: 'Kavitha Murthy',
    age: 57,
    complaint: 'Persistent vomiting and dehydration symptoms',
    vitals: { bp: '100/60', hr: 95, temp: 99.2, spo2: 97 },
    aiTriageScore: 52,
    urgency: 'Medium',
    waitingTime: 40
  },
  {
    patientName: 'Ananya Iyer',
    age: 31,
    complaint: 'Mild wheezing and allergic rash',
    vitals: { bp: '115/70', hr: 78, temp: 98.6, spo2: 98 },
    aiTriageScore: 45,
    urgency: 'Low',
    waitingTime: 45
  },
  {
    patientName: 'Sanjay Dutt',
    age: 49,
    complaint: 'Chronic back pain flare-up',
    vitals: { bp: '135/85', hr: 72, temp: 98.2, spo2: 99 },
    aiTriageScore: 35,
    urgency: 'Low',
    waitingTime: 50
  },
  {
    patientName: 'Pooja Hegde',
    age: 30,
    complaint: 'Minor burn on thumb index finger',
    vitals: { bp: '118/72', hr: 74, temp: 98.6, spo2: 100 },
    aiTriageScore: 28,
    urgency: 'Low',
    waitingTime: 60
  },
  {
    patientName: 'Harish Kalyan',
    age: 39,
    complaint: 'Sore throat and nasal congestion',
    vitals: { bp: '120/80', hr: 70, temp: 99.4, spo2: 99 },
    aiTriageScore: 20,
    urgency: 'Low',
    waitingTime: 70
  },
  {
    patientName: 'Shalini Sen',
    age: 34,
    complaint: 'Earache and mild vertigo',
    vitals: { bp: '110/70', hr: 68, temp: 98.4, spo2: 100 },
    aiTriageScore: 18,
    urgency: 'Low',
    waitingTime: 80
  }
];

export const mockRiskPatients = [
  {
    patientId: 'P08',
    patientName: 'Meera Patel',
    age: 68,
    riskScore: 89,
    riskLevel: 'red',
    topFactor: 'Uncontrolled Type-2 Diabetes & Hypertension',
    contributingFactors: [
      'Age over 65 (High Risk)',
      'HbA1c levels persistent at 8.4%',
      'Average BP 155/92 mmHg over past 3 checkups',
      'Sedentary lifestyle history'
    ],
    recommendations: [
      'Escalate Metformin therapy or initiate SGLT2 inhibitors.',
      'Schedule a comprehensive cardiological review.',
      'Deploy home blood-glucose log synchronizer.'
    ]
  },
  {
    patientId: 'P07',
    patientName: 'Rohan Deshmukh',
    age: 61,
    riskScore: 82,
    riskLevel: 'red',
    topFactor: 'Family History of Coronary Artery Disease',
    contributingFactors: [
      'Strong paternal history of early MI',
      'Lipid profile shows LDL 174 mg/dL',
      'Active smoking history'
    ],
    recommendations: [
      'Initiate high-intensity statin therapy immediately.',
      'Provide smoking cessation counseling and nicotine patch referral.',
      'Order cardiac CT calcium scoring.'
    ]
  },
  {
    patientId: 'P03',
    patientName: 'Vikram Singh',
    age: 48,
    riskScore: 72,
    riskLevel: 'amber',
    topFactor: 'Post-Op Infection Risk & Joint Effusion',
    contributingFactors: [
      'High post-surgical inflammation indicator (ESR 35 mm/hr)',
      'Borderline high blood glucose levels post-op',
      'Limited knee joint mobility'
    ],
    recommendations: [
      'Maintain close monitoring of inflammatory markers.',
      'Prescribe customized physical therapy regimen twice weekly.',
      'Conduct surgical site inspection check.'
    ]
  },
  {
    patientId: 'P01',
    patientName: 'Rahul Mehta',
    age: 36,
    riskScore: 68,
    riskLevel: 'amber',
    topFactor: 'Borderline Hypertension & Smoking',
    contributingFactors: [
      'Intermittent systolic BP spikes up to 142 mmHg',
      'Stress-induced eating and high sodium consumption'
    ],
    recommendations: [
      'Provide lifestyle coaching for stress relief.',
      'Request daily home BP logging via mobile health check.'
    ]
  },
  {
    patientId: 'P05',
    patientName: 'Siddharth Rao',
    age: 44,
    riskScore: 58,
    riskLevel: 'amber',
    topFactor: 'Elevated HbA1c (7.4%) & Fatty Liver Indicators',
    contributingFactors: [
      'Persistent fasting blood glucose above 135 mg/dL',
      'High triglycerides levels (182 mg/dL)'
    ],
    recommendations: [
      'Optimize dietary carbohydrate levels.',
      'Order liver ultrasound (USG) screening.'
    ]
  }
];

// Fill out to 20 entries
const patientNamesList = [
  'Rahul Mehta', 'Aditi Sharma', 'Vikram Singh', 'Ananya Iyer', 'Siddharth Rao',
  'Priya Nair', 'Rohan Deshmukh', 'Meera Patel', 'Karan Malhotra', 'Sneha Reddy',
  'Arjun Gupta', 'Divya Krishnan', 'Amit Verma', 'Kavitha Murthy', 'Sanjay Dutt',
  'Pooja Hegde', 'Vijay Mallya', 'Shalini Sen', 'Rajesh Khanna', 'Harish Kalyan'
];

for (let i = mockRiskPatients.length; i < 20; i++) {
  const score = 20 + (i * 3) + (i % 5);
  let level = 'green';
  if (score > 75) level = 'red';
  else if (score > 50) level = 'amber';

  mockRiskPatients.push({
    patientId: `P${(i % 20) + 1 < 10 ? '0' + ((i % 20) + 1) : (i % 20) + 1}`,
    patientName: patientNamesList[i % patientNamesList.length],
    age: 25 + (i * 2),
    riskScore: score,
    riskLevel: level,
    topFactor: i % 2 === 0 ? 'Sedentary Lifestyle & Weight management' : 'Dietary sodium excess and stress',
    contributingFactors: [
      'Elevated Body Mass Index (BMI)',
      'Sub-optimal vegetable portion control'
    ],
    recommendations: [
      'Increase general daily movement.',
      'Review nutrition goals.'
    ]
  });
}
export default { mockCopilotResponse, mockDiagnosisHistory, mockTriagePatients, mockRiskPatients };
