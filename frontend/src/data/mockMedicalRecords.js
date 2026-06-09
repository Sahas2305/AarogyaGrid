/**
 * File: mockMedicalRecords.js
 * Description: Mock data for 30 medical records.
 * Used on: MedicalRecords.jsx, PatientDashboard.jsx, DoctorDashboard.jsx, etc.
 */

export const mockMedicalRecords = [
  {
    recordId: 'R001',
    patientId: 'P01',
    patientName: 'Rahul Mehta',
    doctorId: 'D01',
    doctorName: 'Dr. Priya Sharma',
    department: 'Cardiology',
    date: '2026-05-15',
    diagnosis: 'Essential Hypertension',
    treatment: 'Pharmacological management and dietary salt restriction.',
    prescription: 'Tab. Telmisartan 40mg - Once daily (Morning) for 3 months',
    notes: 'Patient complains of occasional mild morning headaches. Vitals stable. Restrict sodium in diet.',
    vitals: { bp: '138/88', hr: 76, temp: 98.6, spo2: 98 }
  },
  {
    recordId: 'R002',
    patientId: 'P02',
    patientName: 'Aditi Sharma',
    doctorId: 'D02',
    doctorName: 'Dr. Anil Deshmukh',
    department: 'Neurology',
    date: '2026-05-20',
    diagnosis: 'Chronic Migraine',
    treatment: 'Prophylactic and abortive therapy with trigger identification.',
    prescription: 'Tab. Amitriptyline 10mg - Once daily (Night) for 1 month\nTab. Naproxen 500mg - SOS for severe pain',
    notes: 'Triggered by poor sleep cycles. Advised dark room rest and stress reduction.',
    vitals: { bp: '110/70', hr: 72, temp: 98.4, spo2: 99 }
  },
  {
    recordId: 'R003',
    patientId: 'P03',
    patientName: 'Vikram Singh',
    doctorId: 'D03',
    doctorName: 'Dr. Vikram Seth',
    department: 'Orthopedics',
    date: '2026-05-22',
    diagnosis: 'Left Knee Osteoarthritis',
    treatment: 'Intra-articular lubrication, physiotherapy, weight loss.',
    prescription: 'Tab. Paracetamol 650mg - Twice daily for 15 days\nCap. Glucosamine Chondroitin - Once daily for 2 months',
    notes: 'Moderate effusion in left knee. Advised quadriceps strengthening exercises.',
    vitals: { bp: '130/80', hr: 80, temp: 98.2, spo2: 97 }
  },
  {
    recordId: 'R004',
    patientId: 'P04',
    patientName: 'Ananya Iyer',
    doctorId: 'D04',
    doctorName: 'Dr. Kavita Rao',
    department: 'Pediatrics',
    date: '2026-05-28',
    diagnosis: 'Allergic Bronchitis',
    treatment: 'Bronchodilators and avoiding allergen triggers.',
    prescription: 'Syp. Levocetirizine 5ml - Once daily at night for 10 days\nInhaler Budesonide 100mcg - 1 puff twice daily',
    notes: 'History of dust allergy. Wheezing heard in bilateral lung fields.',
    vitals: { bp: '100/60', hr: 96, temp: 99.1, spo2: 96 }
  },
  {
    recordId: 'R005',
    patientId: 'P05',
    patientName: 'Siddharth Rao',
    doctorId: 'D11',
    doctorName: 'Dr. Vivek Anand',
    department: 'General',
    date: '2026-06-01',
    diagnosis: 'Type 2 Diabetes Mellitus',
    treatment: 'Oral hypoglycemic agents and lifestyle adjustments.',
    prescription: 'Tab. Metformin 500mg - Twice daily (after breakfast & dinner)',
    notes: 'HbA1c is 7.4%. Patient advised moderate-intensity exercise for 30 minutes daily.',
    vitals: { bp: '128/82', hr: 74, temp: 98.6, spo2: 99 }
  }
];

// Seed remaining records dynamically to reach 30
const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General', 'Emergency'];
const diagnoses = [
  'Hyperlipidemia', 'Tension Headache', 'Lumbar Spondylosis', 'Acute Gastroenteritis',
  'Gastroesophageal Reflux Disease (GERD)', 'Asthma Exacerbation', 'Coronary Artery Disease',
  'Sciatica', 'Vitamin D Deficiency', 'Acute Pharyngitis', 'Hypothyroidism', 'Rheumatoid Arthritis'
];
const treatments = [
  'Statin therapy and lifestyle diet modification.', 'Pain management and posture correction.',
  'Core strengthening, heat packs, and physiotherapy.', 'Oral rehydration therapy and light diet.',
  'Proton-pump inhibitors and avoidance of spicy food.', 'Inhaled corticosteroids and avoiding triggers.',
  'Antiplatelets, beta-blockers, and cardiac rehab.', 'Nerve pain modulators and traction therapy.',
  'Cholecalciferol supplements and sun exposure.', 'Antibiotic therapy and warm gargles.',
  'Thyroid hormone replacement therapy.', 'Disease-modifying antirheumatic drugs (DMARDs).'
];
const prescriptions = [
  'Tab. Atorvastatin 10mg - Once daily at night', 'Tab. Ibuprofen 400mg - SOS after food',
  'Tab. Pregabalin 75mg - Once daily at night', 'Syp. ORS - 1L over 24 hours\nTab. Ondansetron 4mg - SOS',
  'Cap. Pantoprazole 40mg - Once daily before breakfast', 'Inhaler Albuterol - 2 puffs every 4 hours SOS',
  'Tab. Aspirin 75mg - Once daily\nTab. Metoprolol 25mg - Once daily', 'Tab. Gabapentin 300mg - Once daily at night',
  'Sachet Cholecalciferol 60k IU - Once weekly for 8 weeks', 'Tab. Amoxicillin 500mg - Thrice daily for 5 days',
  'Tab. Levothyroxine 50mcg - Once daily on empty stomach', 'Tab. Methotrexate 7.5mg - Once weekly'
];

const patientNames = [
  'Rahul Mehta', 'Aditi Sharma', 'Vikram Singh', 'Ananya Iyer', 'Siddharth Rao',
  'Priya Nair', 'Rohan Deshmukh', 'Meera Patel', 'Karan Malhotra', 'Sneha Reddy',
  'Arjun Gupta', 'Divya Krishnan', 'Amit Verma', 'Kavitha Murthy', 'Sanjay Dutt',
  'Pooja Hegde', 'Vijay Mallya', 'Shalini Sen', 'Rajesh Khanna', 'Harish Kalyan'
];

for (let i = 6; i <= 30; i++) {
  const patientIdx = (i % 20) + 1;
  const pId = `P${patientIdx < 10 ? '0' + patientIdx : patientIdx}`;
  const docIdx = (i % 12) + 1;
  const dId = `D${docIdx < 10 ? '0' + docIdx : docIdx}`;
  
  const dNames = [
    'Dr. Priya Sharma', 'Dr. Anil Deshmukh', 'Dr. Vikram Seth', 'Dr. Kavita Rao',
    'Dr. Rajesh Patel', 'Dr. Shalini Hegde', 'Dr. Suresh Kumar', 'Dr. Meenakshi Sundaram',
    'Dr. Sandeep Reddy', 'Dr. Neha Gupta', 'Dr. Vivek Anand', 'Dr. Aruna Ramakrishnan'
  ];

  const diagIdx = i % diagnoses.length;
  const deptIdx = i % departments.length;
  
  // Date going back
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - (i * 3));
  const dateStr = dateObj.toISOString().split('T')[0];

  mockMedicalRecords.push({
    recordId: `R${i < 100 ? '0' + i : i}`,
    patientId: pId,
    patientName: patientNames[patientIdx - 1],
    doctorId: dId,
    doctorName: dNames[docIdx - 1],
    department: departments[deptIdx],
    date: dateStr,
    diagnosis: diagnoses[diagIdx],
    treatment: treatments[diagIdx],
    prescription: prescriptions[diagIdx],
    notes: `Routine follow-up record number ${i}. Patient compliance with medications is good.`,
    vitals: {
      bp: `${110 + (i % 25)}/${70 + (i % 15)}`,
      hr: 68 + (i % 20),
      temp: (98.0 + (i % 10) / 10).toFixed(1),
      spo2: 95 + (i % 5)
    }
  });
}
