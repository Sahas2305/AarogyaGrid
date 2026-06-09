/**
 * Component Name: Modal
 * Props:
 *   - isOpen (boolean): active visibility state
 *   - onClose (function): function to trigger closure
 *   - title (string): modal header title
 *   - children (ReactNode): content body
 *   - size (string): sm, md, lg, xl, full
 * Used on: Appointment Popovers, Invoices, Lab reports explanation cards, Triage modules
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4 h-[calc(100vh-2rem)]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`relative w-full ${sizeClasses[size]} mx-auto z-50 bg-[#0d2044] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-white/8">
                <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 ml-auto bg-transparent border-0 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-all outline-none focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="relative p-6 flex-auto overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default Modal;
