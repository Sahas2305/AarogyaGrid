/**
 * Component Name: StatCard
 * Props:
 *   - title (string): stat name
 *   - value (string or number): value to display
 *   - icon (LucideIcon): icon element
 *   - trend (string): value of percentage trend (e.g. +12%)
 *   - trendType (string): success (green), warning (yellow), danger (red)
 *   - chart (ReactNode): optional sparkline graph component
 *   - small (boolean): small compact style for vitals metrics
 * Used on: Admin Dashboard, Doctor Dashboard, Patient Dashboard, Medical Records
 */
import React from 'react';
import Card from './Card';
import { useCountUp } from '../../hooks/useCountUp';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'success',
  chart,
  small = false,
  ...props
}) => {
  const isNumber = typeof value === 'number';
  const [count, countRef] = useCountUp(isNumber ? value : 0, 1500);

  const trendColors = {
    success: 'text-brand-success bg-brand-success/10 border-brand-success/20',
    warning: 'text-brand-warning bg-brand-warning/10 border-brand-warning/20',
    danger: 'text-brand-danger bg-brand-danger/10 border-brand-danger/20'
  };

  if (small) {
    return (
      <div className="flex items-center space-x-3 bg-surface-secondary/40 border border-white/5 rounded-xl p-3" ref={countRef}>
        {Icon && (
          <div className="p-2 bg-brand-cyan/10 rounded-lg text-brand-cyan">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <p className="text-[10px] uppercase text-text-secondary tracking-wide">{title}</p>
          <h4 className="text-sm font-bold text-white mt-0.5">
            {isNumber ? count : value}
          </h4>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col justify-between" ref={countRef} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-secondary font-medium tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-2">
            {isNumber ? count.toLocaleString('en-IN') : value}
          </h3>
        </div>
        {Icon && (
          <div className="p-2.5 bg-surface-secondary rounded-xl text-brand-cyan border border-white/5">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        {trend ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${trendColors[trendType]}`}>
            {trend}
          </span>
        ) : (
          <div />
        )}
        {chart && (
          <div className="w-24 h-8 flex items-center justify-end">
            {chart}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
