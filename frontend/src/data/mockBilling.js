/**
 * File: mockBilling.js
 * Description: Mock data for 30 billing records.
 * Used on: BillingPage.jsx, MyBills.jsx, PatientDashboard.jsx, etc.
 */

export const mockBilling = [
  {
    billId: 'B001',
    patientId: 'P01',
    patientName: 'Rahul Mehta',
    date: '2026-06-05',
    totalAmount: 18500,
    insuranceClaimed: 15000,
    paidAmount: 3500,
    status: 'Paid',
    items: [
      { description: 'Cardiology Specialist Consultation', quantity: 1, amount: 1200 },
      { description: 'Electrocardiogram (ECG)', quantity: 1, amount: 800 },
      { description: 'Echocardiogram (2D Echo)', quantity: 1, amount: 3500 },
      { description: 'Inpatient Room Charges (Semi-Private - 2 Days)', quantity: 2, amount: 5000 },
      { description: 'Cardiovascular Medications (30 Days)', quantity: 1, amount: 3000 }
    ]
  },
  {
    billId: 'B002',
    patientId: 'P02',
    patientName: 'Aditi Sharma',
    date: '2026-06-06',
    totalAmount: 4200,
    insuranceClaimed: 0,
    paidAmount: 4200,
    status: 'Paid',
    items: [
      { description: 'Neurology Consultation', quantity: 1, amount: 1500 },
      { description: 'Migraine Medication Kit', quantity: 1, amount: 1200 },
      { description: 'Brain MRI Scan (OPD Ref)', quantity: 1, amount: 1500 }
    ]
  },
  {
    billId: 'B003',
    patientId: 'P03',
    patientName: 'Vikram Singh',
    date: '2026-06-07',
    totalAmount: 48000,
    insuranceClaimed: 40000,
    paidAmount: 0,
    status: 'Pending',
    items: [
      { description: 'Orthopedic Knee Arthroscopy', quantity: 1, amount: 35000 },
      { description: 'Post-Op Physical Therapy (5 Sessions)', quantity: 5, amount: 5000 },
      { description: 'Antibiotics and Pain Management Kit', quantity: 1, amount: 8000 }
    ]
  },
  {
    billId: 'B004',
    patientId: 'P04',
    patientName: 'Ananya Iyer',
    date: '2026-06-08',
    totalAmount: 2500,
    insuranceClaimed: 2000,
    paidAmount: 500,
    status: 'Paid',
    items: [
      { description: 'Pediatric Consultation', quantity: 1, amount: 1000 },
      { description: 'Asthma Inhaler (Budesonide)', quantity: 1, amount: 1200 },
      { description: 'Nebulization Session', quantity: 1, amount: 300 }
    ]
  },
  {
    billId: 'B005',
    patientId: 'P05',
    patientName: 'Siddharth Rao',
    date: '2026-06-09',
    totalAmount: 12400,
    insuranceClaimed: 10000,
    paidAmount: 0,
    status: 'Pending',
    items: [
      { description: 'General Medicine Health Package', quantity: 1, amount: 4500 },
      { description: 'Comprehensive Diabetic Blood Profile', quantity: 1, amount: 2900 },
      { description: 'Insulin and Glucose Meter Pack', quantity: 1, amount: 5000 }
    ]
  }
];

// Seed remaining records dynamically to reach 30
const patientNames = [
  'Rahul Mehta', 'Aditi Sharma', 'Vikram Singh', 'Ananya Iyer', 'Siddharth Rao',
  'Priya Nair', 'Rohan Deshmukh', 'Meera Patel', 'Karan Malhotra', 'Sneha Reddy',
  'Arjun Gupta', 'Divya Krishnan', 'Amit Verma', 'Kavitha Murthy', 'Sanjay Dutt',
  'Pooja Hegde', 'Vijay Mallya', 'Shalini Sen', 'Rajesh Khanna', 'Harish Kalyan'
];

for (let i = 6; i <= 30; i++) {
  const patientIdx = (i % 20) + 1;
  const pId = `P${patientIdx < 10 ? '0' + patientIdx : patientIdx}`;
  
  // Create randomized items
  const descriptions = [
    'General Practitioner Consultation', 'CBC Lab Panel', 'Complete Urinalysis', 'Chest X-Ray',
    'Broad-spectrum Antibiotics', 'Standard Ward Bed Day', 'Nursing and Care Fee', 'ECG Monitoring',
    'Specialist OPD Consultation', 'IV Fluids and Consumables'
  ];
  const amounts = [1000, 800, 400, 1500, 1200, 3500, 1000, 900, 1500, 700];

  const item1 = i % descriptions.length;
  const item2 = (i + 3) % descriptions.length;
  const item3 = (i + 6) % descriptions.length;

  const total = amounts[item1] + amounts[item2] + amounts[item3];
  const claim = i % 3 === 0 ? Math.floor(total * 0.8) : 0;
  const paid = i % 4 === 0 ? 0 : total - claim;
  const status = paid === 0 && claim > 0 ? 'Pending' : (paid > 0 ? 'Paid' : 'Pending');

  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - (i * 2));
  const dateStr = dateObj.toISOString().split('T')[0];

  mockBilling.push({
    billId: `B${i < 10 ? '0' + i : i}`,
    patientId: pId,
    patientName: patientNames[patientIdx - 1],
    date: dateStr,
    totalAmount: total,
    insuranceClaimed: claim,
    paidAmount: paid,
    status: status,
    items: [
      { description: descriptions[item1], quantity: 1, amount: amounts[item1] },
      { description: descriptions[item2], quantity: 1, amount: amounts[item2] },
      { description: descriptions[item3], quantity: 1, amount: amounts[item3] }
    ]
  });
}
export default mockBilling;
