/**
 * File: mockBeds.js
 * Description: Mock bed data for 6 departments.
 * Used on: BedManagement.jsx, etc.
 */

export const mockBedsData = {
  Cardiology: {
    floor: 3,
    totalBeds: 12,
    beds: [
      { bedId: 'CARD-301', status: 'Occupied', patientName: 'Rahul Mehta' },
      { bedId: 'CARD-302', status: 'Available', patientName: null },
      { bedId: 'CARD-303', status: 'Occupied', patientName: 'Rohan Deshmukh' },
      { bedId: 'CARD-304', status: 'Reserved', patientName: 'Vijay Mallya' },
      { bedId: 'CARD-305', status: 'Cleaning', patientName: null },
      { bedId: 'CARD-306', status: 'Available', patientName: null },
      { bedId: 'CARD-307', status: 'Occupied', patientName: 'Divya Krishnan' },
      { bedId: 'CARD-308', status: 'Available', patientName: null },
      { bedId: 'CARD-309', status: 'Occupied', patientName: 'Amit Verma' },
      { bedId: 'CARD-310', status: 'Available', patientName: null },
      { bedId: 'CARD-311', status: 'Available', patientName: null },
      { bedId: 'CARD-312', status: 'Available', patientName: null }
    ]
  },
  Neurology: {
    floor: 4,
    totalBeds: 10,
    beds: [
      { bedId: 'NEUR-401', status: 'Occupied', patientName: 'Aditi Sharma' },
      { bedId: 'NEUR-402', status: 'Cleaning', patientName: null },
      { bedId: 'NEUR-403', status: 'Occupied', patientName: 'Karan Malhotra' },
      { bedId: 'NEUR-404', status: 'Available', patientName: null },
      { bedId: 'NEUR-405', status: 'Reserved', patientName: 'Amit Verma' },
      { bedId: 'NEUR-406', status: 'Available', patientName: null },
      { bedId: 'NEUR-407', status: 'Available', patientName: null },
      { bedId: 'NEUR-408', status: 'Occupied', patientName: 'Shalini Sen' },
      { bedId: 'NEUR-409', status: 'Available', patientName: null },
      { bedId: 'NEUR-410', status: 'Available', patientName: null }
    ]
  },
  Orthopedics: {
    floor: 2,
    totalBeds: 10,
    beds: [
      { bedId: 'ORTH-201', status: 'Occupied', patientName: 'Vikram Singh' },
      { bedId: 'ORTH-202', status: 'Occupied', patientName: 'Kavitha Murthy' },
      { bedId: 'ORTH-203', status: 'Available', patientName: null },
      { bedId: 'ORTH-204', status: 'Cleaning', patientName: null },
      { bedId: 'ORTH-205', status: 'Available', patientName: null },
      { bedId: 'ORTH-206', status: 'Occupied', patientName: 'Rajesh Khanna' },
      { bedId: 'ORTH-207', status: 'Available', patientName: null },
      { bedId: 'ORTH-208', status: 'Available', patientName: null },
      { bedId: 'ORTH-209', status: 'Available', patientName: null },
      { bedId: 'ORTH-210', status: 'Available', patientName: null }
    ]
  },
  Pediatrics: {
    floor: 1,
    totalBeds: 8,
    beds: [
      { bedId: 'PEDI-101', status: 'Occupied', patientName: 'Ananya Iyer' },
      { bedId: 'PEDI-102', status: 'Occupied', patientName: 'Sneha Reddy' },
      { bedId: 'PEDI-103', status: 'Available', patientName: null },
      { bedId: 'PEDI-104', status: 'Available', patientName: null },
      { bedId: 'PEDI-105', status: 'Cleaning', patientName: null },
      { bedId: 'PEDI-106', status: 'Available', patientName: null },
      { bedId: 'PEDI-107', status: 'Reserved', patientName: 'Sanjay Dutt' },
      { bedId: 'PEDI-108', status: 'Available', patientName: null }
    ]
  },
  General: {
    floor: 2,
    totalBeds: 15,
    beds: [
      { bedId: 'GEN-201', status: 'Occupied', patientName: 'Siddharth Rao' },
      { bedId: 'GEN-202', status: 'Occupied', patientName: 'Arjun Gupta' },
      { bedId: 'GEN-203', status: 'Available', patientName: null },
      { bedId: 'GEN-204', status: 'Available', patientName: null },
      { bedId: 'GEN-205', status: 'Occupied', patientName: 'Sanjay Dutt' },
      { bedId: 'GEN-206', status: 'Available', patientName: null },
      { bedId: 'GEN-207', status: 'Cleaning', patientName: null },
      { bedId: 'GEN-208', status: 'Available', patientName: null },
      { bedId: 'GEN-209', status: 'Occupied', patientName: 'Pooja Hegde' },
      { bedId: 'GEN-210', status: 'Available', patientName: null },
      { bedId: 'GEN-211', status: 'Available', patientName: null },
      { bedId: 'GEN-212', status: 'Available', patientName: null },
      { bedId: 'GEN-213', status: 'Available', patientName: null },
      { bedId: 'GEN-214', status: 'Available', patientName: null },
      { bedId: 'GEN-215', status: 'Available', patientName: null }
    ]
  },
  Emergency: {
    floor: 1,
    totalBeds: 10,
    beds: [
      { bedId: 'EMER-101', status: 'Occupied', patientName: 'Priya Nair' },
      { bedId: 'EMER-102', status: 'Occupied', patientName: 'Harish Kalyan' },
      { bedId: 'EMER-103', status: 'Occupied', patientName: 'Amit Verma' },
      { bedId: 'EMER-104', status: 'Available', patientName: null },
      { bedId: 'EMER-105', status: 'Available', patientName: null },
      { bedId: 'EMER-106', status: 'Available', patientName: null },
      { bedId: 'EMER-107', status: 'Available', patientName: null },
      { bedId: 'EMER-108', status: 'Available', patientName: null },
      { bedId: 'EMER-109', status: 'Available', patientName: null },
      { bedId: 'EMER-110', status: 'Available', patientName: null }
    ]
  }
};
export default mockBedsData;
