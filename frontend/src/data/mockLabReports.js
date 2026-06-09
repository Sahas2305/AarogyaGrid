/**
 * File: mockLabReports.js
 * Description: Mock data for 25 lab reports.
 * Used on: LabReports.jsx, MyLabReports.jsx, AIReportExplainer.jsx, etc.
 */

export const mockLabReports = [
  {
    reportId: 'L001',
    patientId: 'P01',
    patientName: 'Rahul Mehta',
    doctorId: 'D01',
    doctorName: 'Dr. Priya Sharma',
    testName: 'Lipid Profile',
    date: '2026-06-04',
    status: 'Completed',
    results: [
      { parameter: 'Total Cholesterol', value: '235', unit: 'mg/dL', referenceRange: '< 200', status: 'High' },
      { parameter: 'HDL (Good) Cholesterol', value: '38', unit: 'mg/dL', referenceRange: '> 40', status: 'Low' },
      { parameter: 'LDL (Bad) Cholesterol', value: '162', unit: 'mg/dL', referenceRange: '< 100', status: 'High' },
      { parameter: 'Triglycerides', value: '175', unit: 'mg/dL', referenceRange: '< 150', status: 'High' }
    ],
    aiExplanation: {
      summary: 'Your lipid profile shows elevated cholesterol levels, particularly LDL ("bad") cholesterol, combined with low HDL ("good") cholesterol. This pattern, known as dyslipidemia, increases the long-term risk of arterial plaque buildup.',
      findings: [
        'Total cholesterol is 235 mg/dL (moderately high).',
        'LDL cholesterol is 162 mg/dL, which significantly exceeds the target threshold of 100 mg/dL.',
        'HDL cholesterol is low at 38 mg/dL, which reduces natural cardiovascular protection.'
      ],
      actions: [
        'Adopt a heart-healthy diet low in saturated fats, trans fats, and processed sugars (Mediterranean diet recommended).',
        'Incorporate 30-45 minutes of aerobic exercise (walking, swimming, cycling) at least 5 days a week.',
        'Discuss starting low-dose statin therapy with Dr. Priya Sharma.'
      ]
    }
  },
  {
    reportId: 'L002',
    patientId: 'P02',
    patientName: 'Aditi Sharma',
    doctorId: 'D02',
    doctorName: 'Dr. Anil Deshmukh',
    testName: 'Complete Blood Count (CBC)',
    date: '2026-06-05',
    status: 'Completed',
    results: [
      { parameter: 'Hemoglobin', value: '11.2', unit: 'g/dL', referenceRange: '12.0 - 15.0', status: 'Low' },
      { parameter: 'Red Blood Cells (RBC)', value: '3.9', unit: 'million/uL', referenceRange: '4.0 - 5.2', status: 'Low' },
      { parameter: 'White Blood Cells (WBC)', value: '6,200', unit: '/uL', referenceRange: '4,000 - 11,000', status: 'Normal' },
      { parameter: 'Platelets', value: '2,40,000', unit: '/uL', referenceRange: '1,50,000 - 4,50,000', status: 'Normal' }
    ],
    aiExplanation: {
      summary: 'Your CBC indicates a mild microcytic anemia, which is commonly caused by iron deficiency. Your white blood cells and platelets are within normal ranges, ruling out major infectious or clotting disorders.',
      findings: [
        'Hemoglobin is low at 11.2 g/dL, indicating reduced oxygen-carrying capacity.',
        'RBC count is slightly depressed at 3.9 million/uL.',
        'Immune cells (WBC) and clotting components (Platelets) are healthy.'
      ],
      actions: [
        'Increase intake of iron-rich foods, including spinach, lentils, lean red meat, and fortified cereals.',
        'Consume Vitamin C (citrus fruits, bell peppers) alongside iron sources to improve absorption.',
        'Schedule a serum ferritin and iron study to confirm the diagnosis.'
      ]
    }
  },
  {
    reportId: 'L003',
    patientId: 'P03',
    patientName: 'Vikram Singh',
    doctorId: 'D03',
    doctorName: 'Dr. Vikram Seth',
    testName: 'Rheumatoid Factor (RF) & ESR',
    date: '2026-06-06',
    status: 'Completed',
    results: [
      { parameter: 'Rheumatoid Factor', value: '45', unit: 'IU/mL', referenceRange: '< 14', status: 'High' },
      { parameter: 'Erythrocyte Sedimentation Rate (ESR)', value: '32', unit: 'mm/hr', referenceRange: '0 - 15', status: 'High' }
    ],
    aiExplanation: {
      summary: 'The elevated levels of Rheumatoid Factor and ESR suggest an active autoimmune inflammatory response, consistent with a diagnosis of rheumatoid arthritis, aligning with your reports of joint stiffness.',
      findings: [
        'Rheumatoid Factor is 45 IU/mL, which is positive (above reference 14 IU/mL).',
        'ESR is elevated at 32 mm/hr, indicating moderate systemic inflammation.'
      ],
      actions: [
        'Avoid high-impact stresses on painful joints; engage in gentle range-of-motion exercises.',
        'Use warm compresses to relieve morning joint stiffness.',
        'Consult with Dr. Vikram Seth regarding anti-inflammatory medications or DMARDs.'
      ]
    }
  },
  {
    reportId: 'L004',
    patientId: 'P04',
    patientName: 'Ananya Iyer',
    doctorId: 'D04',
    doctorName: 'Dr. Kavita Rao',
    testName: 'Allergy Panel - Pediatric',
    date: '2026-06-07',
    status: 'Pending',
    results: [],
    aiExplanation: null
  },
  {
    reportId: 'L005',
    patientId: 'P05',
    patientName: 'Siddharth Rao',
    doctorId: 'D11',
    doctorName: 'Dr. Vivek Anand',
    testName: 'HbA1c & Fasting Glucose',
    date: '2026-06-08',
    status: 'Completed',
    results: [
      { parameter: 'Fasting Plasma Glucose', value: '142', unit: 'mg/dL', referenceRange: '70 - 100', status: 'High' },
      { parameter: 'HbA1c (Glycated Hemoglobin)', value: '7.4', unit: '%', referenceRange: '4.0 - 5.6', status: 'High' }
    ],
    aiExplanation: {
      summary: 'Your HbA1c is 7.4%, which confirms poor glycemic control, indicating diabetes mellitus. Your fasting blood glucose is also elevated, necessitating medication adjustments and nutritional monitoring.',
      findings: [
        'HbA1c is 7.4% (diabetic threshold is >= 6.5%). This represents your average blood glucose over the past 3 months.',
        'Fasting blood glucose is high at 142 mg/dL.'
      ],
      actions: [
        'Strictly monitor carbohydrate intake and avoid simple sugars.',
        'Adhere diligently to the prescribed metformin dosage.',
        'Walk for 15 minutes immediately following major meals to suppress glucose spikes.'
      ]
    }
  }
];

// Seed remaining dynamically to reach 25
const patientNames = [
  'Rahul Mehta', 'Aditi Sharma', 'Vikram Singh', 'Ananya Iyer', 'Siddharth Rao',
  'Priya Nair', 'Rohan Deshmukh', 'Meera Patel', 'Karan Malhotra', 'Sneha Reddy',
  'Arjun Gupta', 'Divya Krishnan', 'Amit Verma', 'Kavitha Murthy', 'Sanjay Dutt',
  'Pooja Hegde', 'Vijay Mallya', 'Shalini Sen', 'Rajesh Khanna', 'Harish Kalyan'
];

const testNames = [
  'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Thyroid Profile (T3, T4, TSH)',
  'Vitamin D3 & B12 Panel', 'Urine Routine & Microscopy', 'HbA1c Screening', 'Serum Electrolytes'
];

for (let i = 6; i <= 25; i++) {
  const patientIdx = (i % 20) + 1;
  const pId = `P${patientIdx < 10 ? '0' + patientIdx : patientIdx}`;
  const docIdx = (i % 12) + 1;
  const dId = `D${docIdx < 10 ? '0' + docIdx : docIdx}`;
  
  const dNames = [
    'Dr. Priya Sharma', 'Dr. Anil Deshmukh', 'Dr. Vikram Seth', 'Dr. Kavita Rao',
    'Dr. Rajesh Patel', 'Dr. Shalini Hegde', 'Dr. Suresh Kumar', 'Dr. Meenakshi Sundaram',
    'Dr. Sandeep Reddy', 'Dr. Neha Gupta', 'Dr. Vivek Anand', 'Dr. Aruna Ramakrishnan'
  ];

  const testIdx = i % testNames.length;
  
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - (i * 3));
  const dateStr = dateObj.toISOString().split('T')[0];

  const status = i % 8 === 0 ? 'Pending' : 'Completed';

  mockLabReports.push({
    reportId: `L${i < 10 ? '0' + i : i}`,
    patientId: pId,
    patientName: patientNames[patientIdx - 1],
    doctorId: dId,
    doctorName: dNames[docIdx - 1],
    testName: testNames[testIdx],
    date: dateStr,
    status: status,
    results: status === 'Pending' ? [] : [
      { parameter: 'Reference Indicator A', value: (50 + (i % 30)).toString(), unit: 'units', referenceRange: '10 - 60', status: 'Normal' },
      { parameter: 'Reference Indicator B', value: (120 + (i % 80)).toString(), unit: 'mg/dL', referenceRange: '< 130', status: i % 5 === 0 ? 'High' : 'Normal' }
    ],
    aiExplanation: status === 'Pending' ? null : {
      summary: `Your lab result for ${testNames[testIdx]} shows mostly stable levels, with minor fluctuations that should be evaluated in context of your clinical physical symptoms.`,
      findings: [
        `Indicator A is within healthy limits at ${50 + (i % 30)} units.`,
        i % 5 === 0 ? `Indicator B is slightly high at ${120 + (i % 80)} mg/dL.` : `Indicator B is normal at ${120 + (i % 80)} mg/dL.`
      ],
      actions: [
        'Maintain a balanced diet and log physical symptoms.',
        'Present these results to your consulting physician during your next scheduled appointment.'
      ]
    }
  });
}
export default mockLabReports;
