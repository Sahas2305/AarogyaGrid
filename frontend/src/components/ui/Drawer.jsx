/**
 * Component Name: Drawer
 * Props:
 *   - isOpen (boolean): visibility trigger
 *   - onClose (function): click outside or button dismiss action
 *   - title (string): drawer header title
 *   - children (ReactNode): content layout
 *   - size (string): sm, md, lg, xl, full
 * Used on: Manage Doctors page, Manage Patients page, Doctor Consultation logs, Records adding panel
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  ...props
}) => {
  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`relative w-full ${widthClasses[size]} z-50 bg-[#0d2044] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 ml-auto bg-transparent border-0 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-all outline-none focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="relative p-6 flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default Drawer;
