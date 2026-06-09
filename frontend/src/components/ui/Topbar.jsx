/**
 * Component Name: Topbar
 * Props:
 *   - onBellClick (function): action when clicking the alert bell
 *   - unreadCount (number): quantity of unread alert notifications
 * Description: Renders the top bar header for authenticated dashboards
 * Used on: DashboardLayout.jsx
 */
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, Bell, LogOut, ChevronDown, User, Shield, Stethoscope, Users } from 'lucide-react';

export const Topbar = ({ onBellClick, unreadCount = 3 }) => {
  const { currentUser, switchRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Generate Breadcrumbs
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  const getBreadcrumbLabel = (segment) => {
    if (!segment) return '';
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleRoleSelect = (role) => {
    switchRole(role);
    setRoleDropdownOpen(false);
    
    // Redirect to corresponding dashboard on role switch
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'doctor') navigate('/doctor/dashboard');
    else if (role === 'patient') navigate('/patient/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    admin: 'bg-brand-danger text-white',
    doctor: 'bg-brand-cyan text-[#0a1628]',
    patient: 'bg-brand-success text-white'
  };

  return (
    <header className="h-16 bg-[#0d2044] border-b border-white/8 flex items-center justify-between px-6 z-20 relative select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-1 text-xs text-text-secondary md:text-sm">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          return (
            <React.Fragment key={to}>
              <span className="text-white/20">/</span>
              {isLast ? (
                <span className="text-white font-semibold">{getBreadcrumbLabel(value)}</span>
              ) : (
                <Link to={to} className="hover:text-white transition-colors">
                  {getBreadcrumbLabel(value)}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Center: Search Bar */}
      <div className="hidden lg:flex items-center w-80 bg-white/5 border border-white/5 hover:border-white/10 rounded-full px-4 py-1.5 transition-all duration-300">
        <Search className="w-4 h-4 text-text-secondary mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search patients, doctors, records..."
          className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
        />
      </div>

      {/* Right: Notification and Profiles */}
      <div className="flex items-center space-x-4">
        {/* DEMO SWITCHER */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center space-x-1 px-3 py-1 bg-white/5 border border-white/8 hover:bg-white/10 rounded-lg text-xs font-semibold text-brand-cyan transition-all"
          >
            <span>Demo: {currentUser?.role ? currentUser.role.toUpperCase() : 'Guest'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#0d2044] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <button
                onClick={() => handleRoleSelect('admin')}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-white hover:bg-white/5 transition-all flex items-center space-x-2"
              >
                <Shield className="w-3.5 h-3.5 text-brand-danger" />
                <span>Admin Role</span>
              </button>
              <button
                onClick={() => handleRoleSelect('doctor')}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-white hover:bg-white/5 transition-all flex items-center space-x-2"
              >
                <Stethoscope className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Doctor Role</span>
              </button>
              <button
                onClick={() => handleRoleSelect('patient')}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-white hover:bg-white/5 transition-all flex items-center space-x-2"
              >
                <Users className="w-3.5 h-3.5 text-brand-success" />
                <span>Patient Role</span>
              </button>
            </div>
          )}
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onBellClick}
          className="p-2 hover:bg-white/5 rounded-full text-text-secondary hover:text-white transition-all relative border border-transparent hover:border-white/5"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-danger text-[9px] font-extrabold text-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Account Circle */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2.5 p-1.5 hover:bg-white/5 rounded-full transition-all focus:outline-none"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-inner ${roleColors[currentUser.role] || 'bg-brand-blue text-white'}`}>
                {currentUser.avatarInitials}
              </div>
              <ChevronDown className="w-4 h-4 text-text-secondary hidden md:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0d2044] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                <div className="px-4 py-2 border-b border-white/8">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">{currentUser.email}</p>
                  <span className={`inline-block text-[9px] uppercase px-1.5 py-0.2 rounded mt-1 font-extrabold border ${
                    currentUser.role === 'admin' 
                      ? 'border-brand-danger/30 text-brand-danger bg-brand-danger/10' 
                      : currentUser.role === 'doctor' 
                        ? 'border-brand-cyan/30 text-brand-cyan bg-brand-cyan/10' 
                        : 'border-brand-success/30 text-brand-success bg-brand-success/10'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                
                <Link
                  to={currentUser.role === 'admin' ? '/admin/dashboard' : currentUser.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                  onClick={() => setProfileDropdownOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-all flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile Panel</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-brand-danger hover:bg-brand-danger/10 transition-all flex items-center space-x-2 border-t border-white/5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
