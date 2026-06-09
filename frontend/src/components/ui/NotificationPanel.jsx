/**
 * Component Name: NotificationPanel
 * Props:
 *   - isOpen (boolean): active drawer state
 *   - onClose (function): drawer close callback
 *   - setUnreadCount (function): updater to decrement notification count
 * Used on: DashboardLayout.jsx (bound to Topbar bell)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Calendar, Brain, Shield, AlertTriangle, Check } from 'lucide-react';

const initialNotifications = [
  {
    id: 1,
    category: 'AI Alerts',
    message: 'AI Alert: Critical triage alert (Score 98) logged for Patient Karan Malhotra in ER.',
    time: '5 mins ago',
    read: false,
    icon: AlertTriangle,
    iconColor: 'text-brand-danger bg-brand-danger/10 border-brand-danger/20'
  },
  {
    id: 2,
    category: 'Appointments',
    message: 'New Appointment scheduled: Dr. Priya Sharma with Rahul Mehta (Cardiology) - Tomorrow, 09:00 AM.',
    time: '25 mins ago',
    read: false,
    icon: Calendar,
    iconColor: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20'
  },
  {
    id: 3,
    category: 'System',
    message: 'System Security: Daily database transaction audit backup completed successfully.',
    time: '1 hour ago',
    read: false,
    icon: Shield,
    iconColor: 'text-brand-success bg-brand-success/10 border-brand-success/20'
  },
  {
    id: 4,
    category: 'AI Alerts',
    message: 'Lab Explanation generated: AI Report Explainer has processed Patient Rahul Mehta Lipid Profile values.',
    time: '3 hours ago',
    read: true,
    icon: Brain,
    iconColor: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20'
  }
];

export const NotificationPanel = ({ isOpen, onClose, setUnreadCount }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Appointments', 'AI Alerts', 'System'];

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    // Recalculate unread count
    const unreads = notifications.filter(n => n.id !== id && !n.read).length;
    setUnreadCount(unreads);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    return n.category === activeTab;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Transparent click area for backdrop */}
          <div onClick={onClose} className="fixed inset-0 bg-transparent" />

          {/* Slider */}
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-0 right-0 w-80 md:w-96 h-screen bg-[#0d2044] border-l border-white/8 shadow-2xl z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between p-4 border-b border-white/8">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-brand-cyan animate-pulse" />
                  <span className="font-bold text-white tracking-wide">Notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.some(n => !n.read) && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-brand-cyan hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5 bg-[#0a1628]/40">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-center text-xs font-semibold border-b transition-all ${
                      activeTab === tab
                        ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5'
                        : 'border-transparent text-text-secondary hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-text-secondary/50">
                  <Bell className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs">No alerts found</p>
                </div>
              ) : (
                filteredNotifications.map(notification => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-xl border transition-all flex space-x-3 relative ${
                        notification.read
                          ? 'bg-transparent border-white/5 opacity-60'
                          : 'bg-[#112255]/40 border-white/8 hover:bg-[#112255]/60'
                      }`}
                    >
                      <div className={`p-2 rounded-lg border h-fit flex-shrink-0 ${notification.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-text-secondary">{notification.category}</span>
                          <span className="text-[9px] text-text-secondary/50">{notification.time}</span>
                        </div>
                        <p className="text-xs text-white leading-relaxed pr-6">{notification.message}</p>
                      </div>

                      {/* Action to Mark Read */}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="absolute bottom-2 right-2 p-1 bg-brand-cyan/15 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 rounded-md transition-all"
                          title="Mark Read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 text-center bg-[#0a1628]/25 text-[10px] text-text-secondary/30">
              Critical operations alert feed
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
