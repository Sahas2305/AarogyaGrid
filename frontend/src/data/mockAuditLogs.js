/**
 * File: mockAuditLogs.js
 * Description: Mock data for 50 database audit logs representing triggers.
 * Used on: AuditLogs.jsx, AdminDashboard.jsx, etc.
 */

export const mockAuditLogs = [
  {
    auditId: 'AU001',
    userName: 'Dr. Admin Kumar',
    role: 'admin',
    action: 'UPDATE',
    tableAffected: 'BED',
    recordId: 'BED-C102',
    actionTime: '2026-06-09 18:24:12',
    ipAddress: '192.168.12.45',
    details: '{\n  "old": { "status": "Available", "patientId": null },\n  "new": { "status": "Occupied", "patientId": "P01" }\n}'
  },
  {
    auditId: 'AU002',
    userName: 'Dr. Priya Sharma',
    role: 'doctor',
    action: 'INSERT',
    tableAffected: 'MEDICAL_RECORD',
    recordId: 'R001',
    actionTime: '2026-06-09 17:15:30',
    ipAddress: '192.168.12.82',
    details: '{\n  "inserted": {\n    "recordId": "R001",\n    "patientId": "P01",\n    "diagnosis": "Essential Hypertension",\n    "prescription": "Tab. Telmisartan 40mg - Once daily"\n  }\n}'
  },
  {
    auditId: 'AU003',
    userName: 'Dr. Admin Kumar',
    role: 'admin',
    action: 'DELETE',
    tableAffected: 'APPOINTMENT',
    recordId: 'A008',
    actionTime: '2026-06-09 16:10:04',
    ipAddress: '192.168.12.45',
    details: '{\n  "deleted": {\n    "appointmentId": "A008",\n    "patientId": "P08",\n    "reason": "Severe joint stiffness"\n  }\n}'
  },
  {
    auditId: 'AU004',
    userName: 'System Trigger',
    role: 'system',
    action: 'INSERT',
    tableAffected: 'AUDIT_LOG',
    recordId: 'AU003',
    actionTime: '2026-06-09 16:10:04',
    ipAddress: '127.0.0.1',
    details: '{\n  "triggered_by": "DELETE trigger on APPOINTMENT table",\n  "logId": "AU003"\n}'
  },
  {
    auditId: 'AU005',
    userName: 'Dr. Admin Kumar',
    role: 'admin',
    action: 'UPDATE',
    tableAffected: 'BILLING',
    recordId: 'B001',
    actionTime: '2026-06-09 14:30:22',
    ipAddress: '192.168.12.45',
    details: '{\n  "old": { "status": "Pending", "paidAmount": 0 },\n  "new": { "status": "Paid", "paidAmount": 3500 }\n}'
  }
];

// Seed remaining logs to hit 50
const tables = [
  'PATIENT', 'DOCTOR', 'APPOINTMENT', 'MEDICAL_RECORD', 'BILLING', 
  'LAB_REPORT', 'BED', 'DEPARTMENT', 'USER', 'STAFF', 'AUDIT_LOG'
];
const users = ['Dr. Admin Kumar', 'Dr. Priya Sharma', 'Dr. Anil Deshmukh', 'Dr. Vikram Seth', 'Rahul Mehta', 'System Trigger'];
const userRoles = ['admin', 'doctor', 'doctor', 'doctor', 'patient', 'system'];
const actions = ['INSERT', 'UPDATE', 'UPDATE', 'UPDATE', 'DELETE'];

for (let i = 6; i <= 50; i++) {
  const tableIdx = i % tables.length;
  const userIdx = i % users.length;
  const actionIdx = i % actions.length;
  
  const act = actions[actionIdx];
  const tbl = tables[tableIdx];
  
  const dateObj = new Date();
  dateObj.setHours(dateObj.getHours() - (i * 2));
  const timeStr = dateObj.toISOString().replace('T', ' ').split('.')[0];
  
  let detailsText = '';
  if (act === 'INSERT') {
    detailsText = `{\n  "inserted": {\n    "id": "${tbl.substring(0, 3)}-${100 + i}",\n    "createdBy": "${users[userIdx]}",\n    "status": "Active"\n  }\n}`;
  } else if (act === 'UPDATE') {
    detailsText = `{\n  "old": { "lastModified": "${timeStr}", "status": "Pending" },\n  "new": { "lastModified": "${timeStr}", "status": "Approved" }\n}`;
  } else {
    detailsText = `{\n  "deleted": {\n    "id": "${tbl.substring(0, 3)}-${100 + i}",\n    "purgedAt": "${timeStr}"\n  }\n}`;
  }

  mockAuditLogs.push({
    auditId: `AU${i < 10 ? '0' + i : i}`,
    userName: users[userIdx],
    role: userRoles[userIdx],
    action: act,
    tableAffected: tbl,
    recordId: `${tbl.substring(0, 3)}-${100 + i}`,
    actionTime: timeStr,
    ipAddress: `192.168.12.${10 + i}`,
    details: detailsText
  });
}
export default mockAuditLogs;
