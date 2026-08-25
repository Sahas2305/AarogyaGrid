/**
 * File: mockAppointments.js
 * Description: Mock data for 50 appointments.
 * Used on: AppointmentManagement.jsx, AdminDashboard.jsx, DoctorDashboard.jsx, PatientDashboard.jsx, etc.
 */

export const mockAppointments = [
  {
    appointmentId: 'A001',
    patientId: 'P01',
    patientName: 'Rahul Mehta',
    doctorId: 'D01',
    doctorName: 'Dr. Priya Sharma',
    department: 'Cardiology',
    date: '2026-06-10', // Upcoming
    timeSlot: '09:00 AM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Follow-up for mild hypertension'
  },
  {
    appointmentId: 'A002',
    patientId: 'P02',
    patientName: 'Aditi Sharma',
    doctorId: 'D02',
    doctorName: 'Dr. Anil Deshmukh',
    department: 'Neurology',
    date: '2026-06-10', // Upcoming
    timeSlot: '10:00 AM',
    status: 'Scheduled',
    type: 'Virtual',
    reason: 'Migraine management consultation'
  },
  {
    appointmentId: 'A003',
    patientId: 'P03',
    patientName: 'Vikram Singh',
    doctorId: 'D03',
    doctorName: 'Dr. Vikram Seth',
    department: 'Orthopedics',
    date: '2026-06-10',
    timeSlot: '11:00 AM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Post-op knee surgery review'
  },
  {
    appointmentId: 'A004',
    patientId: 'P04',
    patientName: 'Ananya Iyer',
    doctorId: 'D04',
    doctorName: 'Dr. Kavita Rao',
    department: 'Pediatrics',
    date: '2026-06-10',
    timeSlot: '12:00 PM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Immunization and general checkup'
  },
  {
    appointmentId: 'A005',
    patientId: 'P05',
    patientName: 'Siddharth Rao',
    doctorId: 'D05',
    doctorName: 'Dr. Rajesh Patel',
    department: 'General',
    date: '2026-06-10',
    timeSlot: '02:00 PM',
    status: 'Scheduled',
    type: 'Virtual',
    reason: 'Seasonal viral fever'
  },
  {
    appointmentId: 'A006',
    patientId: 'P06',
    patientName: 'Priya Nair',
    doctorId: 'D06',
    doctorName: 'Dr. Shalini Hegde',
    department: 'Emergency',
    date: '2026-06-09', // Today
    timeSlot: '09:30 AM',
    status: 'Completed',
    type: 'In-Person',
    reason: 'Acute asthma attack triage'
  },
  {
    appointmentId: 'A007',
    patientId: 'P07',
    patientName: 'Rohan Deshmukh',
    doctorId: 'D01',
    doctorName: 'Dr. Priya Sharma',
    department: 'Cardiology',
    date: '2026-06-09', // Today
    timeSlot: '10:30 AM',
    status: 'Completed',
    type: 'In-Person',
    reason: 'Arrythmia diagnostic consult'
  },
  {
    appointmentId: 'A008',
    patientId: 'P08',
    patientName: 'Meera Patel',
    doctorId: 'D03',
    doctorName: 'Dr. Vikram Seth',
    department: 'Orthopedics',
    date: '2026-06-09', // Today
    timeSlot: '11:30 AM',
    status: 'Cancelled',
    type: 'In-Person',
    reason: 'Severe joint stiffness'
  },
  {
    appointmentId: 'A009',
    patientId: 'P09',
    patientName: 'Karan Malhotra',
    doctorId: 'D02',
    doctorName: 'Dr. Anil Deshmukh',
    department: 'Neurology',
    date: '2026-06-09',
    timeSlot: '02:30 PM',
    status: 'Completed',
    type: 'Virtual',
    reason: 'Chronic sleep disorder tracking'
  },
  {
    appointmentId: 'A010',
    patientId: 'P10',
    patientName: 'Sneha Reddy',
    doctorId: 'D04',
    doctorName: 'Dr. Kavita Rao',
    department: 'Pediatrics',
    date: '2026-06-09',
    timeSlot: '03:30 PM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Allergic rhinitis consultation'
  },
  {
    appointmentId: 'A011',
    patientId: 'P11',
    patientName: 'Arjun Gupta',
    doctorId: 'D11',
    doctorName: 'Dr. Vivek Anand',
    department: 'General',
    date: '2026-06-09',
    timeSlot: '04:00 PM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Annual health package screen'
  },
  {
    appointmentId: 'A012',
    patientId: 'P12',
    patientName: 'Divya Krishnan',
    doctorId: 'D07',
    doctorName: 'Dr. Suresh Kumar',
    department: 'Cardiology',
    date: '2026-06-11', // Future
    timeSlot: '09:00 AM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Pre-surgery evaluation'
  },
  {
    appointmentId: 'A013',
    patientId: 'P13',
    patientName: 'Amit Verma',
    doctorId: 'D08',
    doctorName: 'Dr. Meenakshi Sundaram',
    department: 'Neurology',
    date: '2026-06-11',
    timeSlot: '10:00 AM',
    status: 'Scheduled',
    type: 'Virtual',
    reason: 'Peripheral neuropathy check'
  },
  {
    appointmentId: 'A014',
    patientId: 'P14',
    patientName: 'Kavitha Murthy',
    doctorId: 'D09',
    doctorName: 'Dr. Sandeep Reddy',
    department: 'Orthopedics',
    date: '2026-06-11',
    timeSlot: '11:00 AM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Osteoarthritis treatment review'
  },
  {
    appointmentId: 'A015',
    patientId: 'P15',
    patientName: 'Sanjay Dutt',
    doctorId: 'D10',
    doctorName: 'Dr. Neha Gupta',
    department: 'Pediatrics',
    date: '2026-06-11',
    timeSlot: '12:00 PM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Child nutrition guidance'
  },
  {
    appointmentId: 'A016',
    patientId: 'P16',
    patientName: 'Pooja Hegde',
    doctorId: 'D11',
    doctorName: 'Dr. Vivek Anand',
    department: 'General',
    date: '2026-06-11',
    timeSlot: '02:00 PM',
    status: 'Scheduled',
    type: 'Virtual',
    reason: 'Hypothyroidism prescription update'
  },
  {
    appointmentId: 'A017',
    patientId: 'P17',
    patientName: 'Vijay Mallya',
    doctorId: 'D01',
    doctorName: 'Dr. Priya Sharma',
    department: 'Cardiology',
    date: '2026-06-12',
    timeSlot: '09:30 AM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Stress test consultation'
  },
  {
    appointmentId: 'A018',
    patientId: 'P18',
    patientName: 'Shalini Sen',
    doctorId: 'D02',
    doctorName: 'Dr. Anil Deshmukh',
    department: 'Neurology',
    date: '2026-06-12',
    timeSlot: '10:30 AM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Tension headaches tracking'
  },
  {
    appointmentId: 'A019',
    patientId: 'P19',
    patientName: 'Rajesh Khanna',
    doctorId: 'D03',
    doctorName: 'Dr. Vikram Seth',
    department: 'Orthopedics',
    date: '2026-06-12',
    timeSlot: '11:30 AM',
    status: 'Scheduled',
    type: 'Virtual',
    reason: 'Lower back ache recovery plan'
  },
  {
    appointmentId: 'A020',
    patientId: 'P20',
    patientName: 'Harish Kalyan',
    doctorId: 'D04',
    doctorName: 'Dr. Kavita Rao',
    department: 'Pediatrics',
    date: '2026-06-12',
    timeSlot: '02:30 PM',
    status: 'Scheduled',
    type: 'In-Person',
    reason: 'Sore throat check'
  }
];

// Add 30 additional historic entries to reach 50
for (let i = 21; i <= 50; i++) {
  const patientIdx = (i % 20) + 1;
  const pId = `P${patientIdx < 10 ? '0' + patientIdx : patientIdx}`;
  const docIdx = (i % 12) + 1;
  const dId = `D${docIdx < 10 ? '0' + docIdx : docIdx}`;
  
  const pNames = [
    'Rahul Mehta', 'Aditi Sharma', 'Vikram Singh', 'Ananya Iyer', 'Siddharth Rao',
    'Priya Nair', 'Rohan Deshmukh', 'Meera Patel', 'Karan Malhotra', 'Sneha Reddy',
    'Arjun Gupta', 'Divya Krishnan', 'Amit Verma', 'Kavitha Murthy', 'Sanjay Dutt',
    'Pooja Hegde', 'Vijay Mallya', 'Shalini Sen', 'Rajesh Khanna', 'Harish Kalyan'
  ];
  
  const dNames = [
    'Dr. Priya Sharma', 'Dr. Anil Deshmukh', 'Dr. Vikram Seth', 'Dr. Kavita Rao',
    'Dr. Rajesh Patel', 'Dr. Shalini Hegde', 'Dr. Suresh Kumar', 'Dr. Meenakshi Sundaram',
    'Dr. Sandeep Reddy', 'Dr. Neha Gupta', 'Dr. Vivek Anand', 'Dr. Aruna Ramakrishnan'
  ];

  const depts = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'General', 'Emergency', 'Cardiology', 'Neurology',
    'Orthopedics', 'Pediatrics', 'General', 'Emergency'
  ];

  const statusOpts = ['Completed', 'Completed', 'Completed', 'Cancelled'];
  const typeOpts = ['In-Person', 'Virtual'];
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  
  // Dynamic historic date going back
  const daysAgo = i - 20;
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - daysAgo);
  const dateStr = dateObj.toISOString().split('T')[0];

  mockAppointments.push({
    appointmentId: `A${i < 100 ? '0' + i : i}`,
    patientId: pId,
    patientName: pNames[patientIdx - 1],
    doctorId: dId,
    doctorName: dNames[docIdx - 1],
    department: depts[docIdx - 1],
    date: dateStr,
    timeSlot: timeSlots[i % timeSlots.length],
    status: statusOpts[i % statusOpts.length],
    type: typeOpts[i % typeOpts.length],
    reason: `Consultation number ${i} for symptoms review`
  });
}
