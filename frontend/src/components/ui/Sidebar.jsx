/**
 * Component Name: Sidebar
 * Props:
 *   - collapsed (boolean): collapsed width state
 *   - onToggle (function): collapse toggle action
 * Description: Renders the primary sidebar with navigation links matching the user's role.
 * Used on: DashboardLayout.jsx
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Bed,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Calendar,
  FileText,
  CreditCard,
  ClipboardList,
  CalendarCheck,
  FilePen,
  Brain,
  Activity,
  CalendarPlus,
  FileHeart,
  FlaskConical,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Configuration mapping roles to nav configurations
const roleNavConfig = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Doctors', path: '/admin/doctors', icon: Stethoscope },
    { label: 'Manage Patients', path: '/admin/patients', icon: Users },
    { label: 'Bed Management', path: '/admin/beds', icon: Bed },
    { label: 'Emergency Triage', path: '/admin/triage', icon: AlertTriangle, badge: '98' },
    { label: 'Risk Prediction', path: '/admin/risk', icon: TrendingUp },
    { label: 'Audit Logs', path: '/admin/audit', icon: ShieldCheck },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Medical Records', path: '/records', icon: FileText },
    { label: 'Billing System', path: '/billing', icon: CreditCard },
    { label: 'Lab Reports', path: '/labs', icon: ClipboardList }
  ],
  doctor: [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'My Patients', path: '/doctor/patients', icon: Users },
    { label: 'Doctor Schedule', path: '/doctor/appointments', icon: CalendarCheck },
    { label: 'Write Records', path: '/doctor/records', icon: FilePen },
    { label: 'AI Clinical Copilot', path: '/doctor/copilot', icon: Brain, badge: 'AI' },
    { label: 'AI Symptom Checker', path: '/doctor/symptom-checker', icon: Activity },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Medical Records', path: '/records', icon: FileText },
    { label: 'Billing System', path: '/billing', icon: CreditCard },
    { label: 'Lab Reports', path: '/labs', icon: ClipboardList }
  ],
  patient: [
    { label: 'My Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Book Appointment', path: '/patient/book', icon: CalendarPlus },
    { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'My Health Records', path: '/patient/records', icon: FileHeart },
    { label: 'My Lab Reports', path: '/patient/labs', icon: FlaskConical },
    { label: 'Invoices & Bills', path: '/patient/bills', icon: Receipt },
    { label: 'AI Symptom Checker', path: '/patient/symptom-checker', icon: Activity },
    { label: 'AI Report Explainer', path: '/patient/report-explainer', icon: Brain, badge: 'AI' },
    { label: 'Billing System', path: '/billing', icon: CreditCard },
    { label: 'Lab Reports', path: '/labs', icon: ClipboardList }
  ]
};

export const Sidebar = ({ collapsed, onToggle }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const currentRole = currentUser?.role || 'admin';
  const navItems = roleNavConfig[currentRole] || [];

  const roleLabels = {
    admin: 'Admin Portal',
    doctor: 'Doctor Portal',
    patient: 'Patient Portal'
  };

  const roleColors = {
    admin: 'bg-brand-danger/25 text-brand-danger border-brand-danger/40',
    doctor: 'bg-brand-cyan/25 text-brand-cyan border-brand-cyan/40',
    patient: 'bg-brand-success/25 text-brand-success border-brand-success/40'
  };

  return (
    <div
      className={`
        h-screen 
        bg-[#0d2044] 
        border-r 
        border-white/8 
        flex 
        flex-col 
        justify-between 
        transition-all 
        duration-300
        z-30
        relative
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* Upper Area */}
      <div>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/8">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="p-2 bg-gradient-to-r from-brand-cyan to-brand-blue rounded-lg text-white">
              <Stethoscope className="w-5 h-5 flex-shrink-0" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-lg text-white tracking-wider truncate">
                Healthcare<span className="text-brand-cyan">OS</span>
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-all hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Indicator Card */}
        {!collapsed && currentUser && (
          <div className="p-4 border-b border-white/5">
            <div className={`px-3 py-2 rounded-xl border flex flex-col items-center justify-center text-center ${roleColors[currentRole]}`}>
              <span className="text-[10px] uppercase font-bold tracking-widest">{roleLabels[currentRole]}</span>
              <span className="text-xs text-white mt-0.5 truncate max-w-full font-semibold">{currentUser.name}</span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="mt-4 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navItems.map((item, idx) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`
                  flex items-center 
                  py-2.5 px-3 
                  rounded-lg 
                  transition-all 
                  group 
                  relative
                  ${isActive 
                    ? 'bg-brand-cyan/10 border-l-2 border-brand-cyan text-brand-cyan font-semibold' 
                    : 'text-text-secondary hover:text-white hover:bg-white/5 border-l-2 border-transparent'}
                `}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-cyan' : 'text-text-secondary group-hover:text-white'}`} />
                
                {!collapsed && (
                  <span className="ml-3 text-sm truncate tracking-wide">{item.label}</span>
                )}
                
                {/* Badge Indicator */}
                {item.badge && !collapsed && (
                  <span className={`ml-auto px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    item.badge === 'AI' 
                      ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30' 
                      : 'bg-brand-danger/20 text-brand-danger border border-brand-danger/30'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Hover Tooltip */}
                {collapsed && (
                  <div className="absolute left-[76px] bg-surface-secondary text-white text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Info */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5 text-[10px] text-text-secondary/50 text-center select-none font-mono">
          HealthcareOS v1.0.0
        </div>
      )}
    </div>
  );
};

export default Sidebar;
