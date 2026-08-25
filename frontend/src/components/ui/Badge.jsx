/**
 * Component Name: Badge
 * Props:
 *   - variant (string): success, warning, danger, info, purple, cyan
 *   - children (ReactNode): status label
 *   - className (string): custom class extension
 * Used on: Admin Dashboard tables, Doctor queue tables, Bed lists, Audit Logs
 */
import React from 'react';

export const Badge = ({
  variant = 'info',
  children,
  className = '',
  ...props
}) => {
  const styles = {
    success: 'bg-brand-success/20 text-brand-success border border-brand-success/30',
    warning: 'bg-brand-warning/20 text-brand-warning border border-brand-warning/30',
    danger: 'bg-brand-danger/20 text-brand-danger border border-brand-danger/30',
    info: 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30',
    purple: 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30',
    cyan: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${styles[variant] || styles.info} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
export default Badge;
