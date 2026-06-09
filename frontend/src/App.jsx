/**
 * Component Name: App
 * Props: None
 * Description: Core router mapping and global context wrapper.
 * Used on: main.jsx (entry mount)
 */
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { RoleGuard } from './hooks/useRoleGuard';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import AuditLogs from './pages/admin/AuditLogs';
import BedManagement from './pages/admin/BedManagement';
import EmergencyTriage from './pages/admin/EmergencyTriage';
import RiskPrediction from './pages/admin/RiskPrediction';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import MyPatients from './pages/doctor/MyPatients';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import WriteRecord from './pages/doctor/WriteRecord';
import AICopilot from './pages/doctor/AICopilot';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MyMedicalRecords from './pages/patient/MyMedicalRecords';
import MyLabReports from './pages/patient/MyLabReports';
import MyBills from './pages/patient/MyBills';
import AIReportExplainer from './pages/patient/AIReportExplainer';

// Shared Pages
import AppointmentManagement from './pages/shared/AppointmentManagement';
import MedicalRecords from './pages/shared/MedicalRecords';
import BillingPage from './pages/shared/BillingPage';
import LabReports from './pages/shared/LabReports';
import AISymptomChecker from './pages/shared/AISymptomChecker';

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/login',
    element: <Login />
  },
  // Protected Routes wrapped in DashboardLayout
  {
    element: <DashboardLayout />,
    children: [
      // Admin Only
      {
        element: <RoleGuard allowedRoles={['admin']} />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/doctors', element: <ManageDoctors /> },
          { path: '/admin/patients', element: <ManagePatients /> },
          { path: '/admin/audit', element: <AuditLogs /> },
          { path: '/admin/beds', element: <BedManagement /> },
          { path: '/admin/triage', element: <EmergencyTriage /> },
          { path: '/admin/risk', element: <RiskPrediction /> }
        ]
      },
      // Doctor Only
      {
        element: <RoleGuard allowedRoles={['doctor']} />,
        children: [
          { path: '/doctor/dashboard', element: <DoctorDashboard /> },
          { path: '/doctor/patients', element: <MyPatients /> },
          { path: '/doctor/appointments', element: <DoctorAppointments /> },
          { path: '/doctor/records', element: <WriteRecord /> },
          { path: '/doctor/copilot', element: <AICopilot /> },
          { path: '/doctor/symptom-checker', element: <AISymptomChecker viewMode="doctor" /> }
        ]
      },
      // Patient Only
      {
        element: <RoleGuard allowedRoles={['patient']} />,
        children: [
          { path: '/patient/dashboard', element: <PatientDashboard /> },
          { path: '/patient/appointments', element: <MyAppointments /> },
          { path: '/patient/book', element: <BookAppointment /> },
          { path: '/patient/records', element: <MyMedicalRecords /> },
          { path: '/patient/labs', element: <MyLabReports /> },
          { path: '/patient/bills', element: <MyBills /> },
          { path: '/patient/symptom-checker', element: <AISymptomChecker viewMode="patient" /> },
          { path: '/patient/report-explainer', element: <AIReportExplainer /> }
        ]
      },
      // Admin + Doctor Shared
      {
        element: <RoleGuard allowedRoles={['admin', 'doctor']} />,
        children: [
          { path: '/appointments', element: <AppointmentManagement /> },
          { path: '/records', element: <MedicalRecords /> }
        ]
      },
      // All Roles Shared (Admin, Doctor, Patient)
      {
        element: <RoleGuard allowedRoles={['admin', 'doctor', 'patient']} />,
        children: [
          { path: '/billing', element: <BillingPage /> },
          { path: '/labs', element: <LabReports /> }
        ]
      }
    ]
  },
  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d2044',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px'
          }
        }}
      />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
