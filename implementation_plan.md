# Implementation Plan - HealthcareOS — Healthcare Excellence Platform

Build a premium, fully functional final-year DBMS project named "HealthcareOS — Healthcare Excellence Platform" for Dayananda Sagar College of Engineering, Bangalore (Darshan Gupta, Devansh Pateriya, Keshav Lath, and Sahastranshu Mishra from CSE Cyber Security). 

This is a frontend-only mockup web application using React + Vite + Tailwind CSS v3 + React Router v6 + Framer Motion + Recharts + Lucide Icons. It implements a complete hospital dashboard with Admin, Doctor, and Patient views, database auditing simulation (trigger logs), bed forecasting, risk metrics, an AI copilot, and triage dashboards.

## User Review Required

> [!IMPORTANT]
> **Tailwind CSS Version & Configuration**: We will configure standard Tailwind CSS v3 (compatible with React 18 / Vite) so that all style classes match v3 specifications.
> **Mock Data Strategy**: There will be 9 mock data modules that provide rich relational-style patient, doctor, appointment, record, billing, lab, audit, AI, and bed details. All data will be simulated locally, and state modifications (e.g. adding records, checking triage status, toggling roles) will update the UI immediately and persist in local component state.
> **Project Directory**: We will create the project inside `C:\Users\sahas\.gemini\antigravity\scratch\HealthcareOS` and configure it as the workspace.

## Open Questions

None. The specification is extremely detailed and we have mapped out all 26+ files.

## Proposed Changes

All files will be created in the `C:\Users\sahas\.gemini\antigravity\scratch\HealthcareOS` directory.

### Project Setup and Infrastructure

#### [NEW] [package.json](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/package.json)
- React 18, Vite, Tailwind CSS v3, PostCSS, Autoprefixer, React Router v6, Framer Motion, Recharts, Lucide React, React Hot Toast, Date-Fns.

#### [NEW] [tailwind.config.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/tailwind.config.js)
- Extend design colors:
  - `brand-cyan`: `#00d4ff`
  - `brand-blue`: `#0066cc`
  - `surface-primary`: `#0a1628`
  - `surface-secondary`: `#112255`
  - `surface-card`: `#0d2044`
- Extend custom animation: `pulse-cyan` keyframe and utility mapping.

#### [NEW] [globals.css](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/styles/globals.css)
- Tailwind CSS directives.
- Custom variables for branding colors.
- Scrollbar styles and custom utility classes.

#### [NEW] [AuthContext.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/context/AuthContext.jsx)
- Simulated role context with Admin, Doctor, and Patient profiles.
- Persistence of user session in `localStorage`.
- `switchRole(role)` for instant switching during evaluation.

#### [NEW] [useAuth.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/hooks/useAuth.js)
- Easy access hook to current user and role state.

#### [NEW] [useRoleGuard.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/hooks/useRoleGuard.js)
- Guard hook for protected pages. Redirects users to correct pages if role doesn't match.

#### [NEW] [useCountUp.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/hooks/useCountUp.js)
- Custom hook that triggers a counting animation from 0 to target value when in viewport.

---

### Reusable UI Primitives (`src/components/ui/`)

All files will contain structural comment headers documenting properties and usage.

#### [NEW] [Button.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/Button.jsx)
- Glassmorphic, custom gradient options, and simple presets.

#### [NEW] [Card.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/Card.jsx)
- Rounded-2xl, border-white/8, shadow card layout. Supports AI-pulsing border state.

#### [NEW] [Badge.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/Badge.jsx)
- Color badges for statuses (Success, Warning, Danger, Info, Purple).

#### [NEW] [Modal.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/Modal.jsx)
- Framer Motion overlay modal.

#### [NEW] [Drawer.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/Drawer.jsx)
- Framer Motion slide-in from right.

#### [NEW] [Table.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/Table.jsx)
- Standardized responsive dark grid table.

#### [NEW] [StatCard.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/StatCard.jsx)
- Numeric metrics block with trend indication and sparklines.

#### [NEW] [Sidebar.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/Sidebar.jsx)
- Collapsible navigation panel supporting role configurations.

#### [NEW] [Topbar.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/Topbar.jsx)
- Role selector, active user details, and notification bell anchor.

#### [NEW] [PageHeader.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/PageHeader.jsx)
- Subheader titles and buttons for layouts.

#### [NEW] [SkeletonLoader.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/SkeletonLoader.jsx)
- Pulsing loading block for simulated async outputs.

#### [NEW] [NotificationPanel.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/NotificationPanel.jsx)
- Bell drawer displaying grouped alerts (AI Alerts, System, Appointments, All) with read marks.

#### [NEW] [EcgLine.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/ui/EcgLine.jsx)
- SVG ECG Heartbeat component animated with Framer Motion pathLength.

---

### Chart Wrappers (`src/components/charts/`)

#### [NEW] [AreaChart.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/charts/AreaChart.jsx)
- Linear gradient cyan area chart.

#### [NEW] [BarChart.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/charts/BarChart.jsx)
- Department metrics horizontal bars.

#### [NEW] [LineChart.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/charts/LineChart.jsx)
- Standard revenue tracking.

#### [NEW] [DonutChart.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/charts/DonutChart.jsx)
- Pie layout representing department capacity loads.

#### [NEW] [ScatterPlot.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/charts/ScatterPlot.jsx)
- Age vs Risk scatter layout.

#### [NEW] [SparkLine.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/components/charts/SparkLine.jsx)
- Minimalist trend indicator overlay in Stat Cards.

---

### Dashboard Layout (`src/layouts/`)

#### [NEW] [DashboardLayout.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/layouts/DashboardLayout.jsx)
- Core workspace container with active page transitions and structural sidebar/topbar.

---

### Mock Data Files (`src/data/`)

Full dataset with realistic Bangalore addresses, Indian patient names, and INR currencies.

#### [NEW] [mockPatients.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockPatients.js)
#### [NEW] [mockDoctors.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockDoctors.js)
#### [NEW] [mockAppointments.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockAppointments.js)
#### [NEW] [mockMedicalRecords.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockMedicalRecords.js)
#### [NEW] [mockBilling.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockBilling.js)
#### [NEW] [mockLabReports.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockLabReports.js)
#### [NEW] [mockAuditLogs.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockAuditLogs.js)
#### [NEW] [mockAIDiagnosis.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockAIDiagnosis.js)
#### [NEW] [mockBeds.js](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/data/mockBeds.js)

---

### Application Routing

#### [NEW] [App.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/App.jsx)
- React Router v6 path hierarchy binding all dashboards and guard elements.

#### [NEW] [main.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/main.jsx)
- Mounting file.

---

### Pages

#### [NEW] [Landing.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/Landing.jsx)
- Dark hero landing with SVGEcg heart line drawing animation.
- Animated viewport counters for "11 Tables", "3 Role Portals", "6 AI Features".
- Key feature blocks with clean hover transitions.

#### [NEW] [Login.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/auth/Login.jsx)
- Dual column screen: animated SVGEcg banner on left, Login/Register forms with floating labels and eye toggle on right.
- Fast role entry deck allowing instantaneous simulation logins.

#### [NEW] [AdminDashboard.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/admin/AdminDashboard.jsx)
- Statistics panel (Total patients, total doctors, today's appointments, pending bills).
- 30-day AreaChart, horizontal department load BarChart, recent DB Audit log tracker, active doctors availability board, system disk space visual.

#### [NEW] [ManageDoctors.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/admin/ManageDoctors.jsx)
- Full list of doctors with quick action buttons. Addition drawer for new registrations.

#### [NEW] [ManagePatients.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/admin/ManagePatients.jsx)
- Patient listings page with search query matching and sorting.

#### [NEW] [AuditLogs.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/admin/AuditLogs.jsx)
- Full table layout mapping actions (INSERT, UPDATE, DELETE) inside database. Exposes JSON block formatting.

#### [NEW] [BedManagement.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/admin/BedManagement.jsx)
- Radial occupancy indicator, floor-wise layouts with state colors, forecasting.

#### [NEW] [EmergencyTriage.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/admin/EmergencyTriage.jsx)
- Pulsing emergency cards, real-time random triage updates, triage score sort, interactive evaluation inputs.

#### [NEW] [RiskPrediction.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/admin/RiskPrediction.jsx)
- Scatter diagram, gradient threat bars, risk profile summaries.

#### [NEW] [DoctorDashboard.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/doctor/DoctorDashboard.jsx)
- Active clock banner, live patient consultation drawer with vitals checks and diagnosis logs, patient symptom feed.

#### [NEW] [AICopilot.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/doctor/AICopilot.jsx)
- Deep analysis page. Intake layout with diagnostics details, differential findings lists, warnings, and lab recommendations.

#### [NEW] [MyPatients.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/doctor/MyPatients.jsx)
- Specialized directory of doctor's assigned patient profiles.

#### [NEW] [DoctorAppointments.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/doctor/DoctorAppointments.jsx)
- Schedule board detailing upcoming appointments.

#### [NEW] [WriteRecord.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/doctor/WriteRecord.jsx)
- Simple form to write medical record notes.

#### [NEW] [PatientDashboard.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/patient/PatientDashboard.jsx)
- Welcome banner, health strip metrics, appointment histories, medical history expandable accordion.

#### [NEW] [BookAppointment.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/patient/BookAppointment.jsx)
- Multi-step wizard booking interface.

#### [NEW] [MyAppointments.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/patient/MyAppointments.jsx)
- Schedule layout for patients.

#### [NEW] [MyMedicalRecords.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/patient/MyMedicalRecords.jsx)
- Medical timeline and vitals tracking.

#### [NEW] [MyLabReports.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/patient/MyLabReports.jsx)
- Lab values list with "Explain with AI" buttons.

#### [NEW] [MyBills.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/patient/MyBills.jsx)
- Patient-specific billing, paid/pending watermarks.

#### [NEW] [AIReportExplainer.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/patient/AIReportExplainer.jsx)
- Visual interface simplifying lab reports with highlights and explanations.

#### [NEW] [AppointmentManagement.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/shared/AppointmentManagement.jsx)
- Shared calendar component, scheduler wizards, search dropdown elements.

#### [NEW] [MedicalRecords.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/shared/MedicalRecords.jsx)
- Card-based histories with colored specialties borders.

#### [NEW] [BillingPage.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/shared/BillingPage.jsx)
- Revenue metrics line graph, receipts generator.

#### [NEW] [LabReports.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/shared/LabReports.jsx)
- Ordered values dashboard, custom laboratory drawers.

#### [NEW] [AISymptomChecker.jsx](file:///C:/Users/sahas/.gemini/antigravity/scratch/HealthcareOS/src/pages/shared/AISymptomChecker.jsx)
- Dialog chat panel, animated wait dots, circular risk gauges, suggested chips.

---

## Verification Plan

### Automated Verification
We will run:
- Vite static build verification `npm run build` to confirm there are no syntax, typescript, style, or dependency compilation errors.
- Verify React Router and route definitions match all URLs.

### Manual Verification
- Test role switcher toggling in the topbar header and demo switch deck in Login page. Verify links filter out correctly based on roles.
- Check animations (ECG Heartbeat line length drawer on mount, triage pulses, fade-ins).
- Check dialog drawer actions and chart tooltips.
