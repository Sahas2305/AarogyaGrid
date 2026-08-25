/**
 * Component Name: PageHeader
 * Props:
 *   - title (string): page name
 *   - subtitle (string): page detailed description
 *   - action (ReactNode): buttons or options displayed on top right
 *   - icon (LucideIcon): page icon
 * Used on: All dashboard views and list screens
 */
import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  action,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-5 border-b border-white/5 select-none" {...props}>
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="p-2.5 bg-brand-cyan/10 rounded-xl text-brand-cyan border border-brand-cyan/20">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-wide">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-text-secondary mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <div className="mt-4 md:mt-0 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
