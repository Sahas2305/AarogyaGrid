/**
 * Component Name: Card
 * Props:
 *   - children (ReactNode): internal card elements
 *   - className (string): custom styles to extend
 *   - aiPowered (boolean): if true, attaches a pulsing cyan glow border
 *   - onClick (function): action if clickable
 * Used on: Hero sections, Admin, Doctor, and Patient dashboards, AI Copilots
 */
import React from 'react';

export const Card = ({
  children,
  className = '',
  aiPowered = false,
  onClick,
  ...props
}) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl 
        bg-surface-card 
        shadow-[0_4px_24px_rgba(0,0,0,0.4)] 
        p-6 
        transition-all 
        duration-300
        ${aiPowered ? 'border-2 border-brand-cyan/40 animate-pulse-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)]' : 'border border-white/8'}
        ${isClickable ? 'cursor-pointer hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] active:scale-[0.99]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
