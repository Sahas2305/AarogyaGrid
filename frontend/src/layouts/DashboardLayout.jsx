/**
 * Component Name: DashboardLayout
 * Props: None (wraps routing Outlets)
 * Description: Shell layout for all authenticated pages containing sidebar, topbar, and notifications panel.
 * Used on: App.jsx (routing shell)
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/ui/Sidebar';
import { Topbar } from '../components/ui/Topbar';
import { NotificationPanel } from '../components/ui/NotificationPanel';

export const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const location = useLocation();

  // Close drawers/panels when route changes
  useEffect(() => {
    setBellOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-primary text-white select-none">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Container */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Topbar */}
        <Topbar onBellClick={() => setBellOpen(true)} unreadCount={unreadCount} />

        {/* Sweeping Route Progress Bar */}
        <motion.div
          key={location.pathname}
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: '100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-brand-cyan to-brand-blue z-50 pointer-events-none"
        />

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-surface-primary relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Right Notification slide-out */}
        <NotificationPanel isOpen={bellOpen} onClose={() => setBellOpen(false)} setUnreadCount={setUnreadCount} />
      </div>
    </div>
  );
};

export default DashboardLayout;
