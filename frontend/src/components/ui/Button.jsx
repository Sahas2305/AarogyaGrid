/**
 * Component Name: Button
 * Props:
 *   - children (ReactNode): label or content inside button
 *   - onClick (function): click event handler
 *   - type (string): button type (button, submit, reset)
 *   - variant (string): primary, secondary, outline, danger, success, ghost
 *   - className (string): extra utility classes
 *   - disabled (boolean): disabled state
 *   - loading (boolean): display loading spinner state
 * Used on: Various pages across dashboards
 */
import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white hover:opacity-95 shadow-[0_2px_10px_rgba(0,212,255,0.2)]',
    secondary: 'bg-surface-secondary text-white border border-white/10 hover:bg-surface-secondary/80',
    outline: 'bg-transparent text-brand-cyan border border-brand-cyan/30 hover:bg-brand-cyan/10 hover:border-brand-cyan',
    danger: 'bg-brand-danger/20 text-brand-danger border border-brand-danger/30 hover:bg-brand-danger/30',
    success: 'bg-brand-success/20 text-brand-success border border-brand-success/30 hover:bg-brand-success/30',
    ghost: 'bg-transparent text-text-secondary hover:text-white hover:bg-white/5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
export default Button;
