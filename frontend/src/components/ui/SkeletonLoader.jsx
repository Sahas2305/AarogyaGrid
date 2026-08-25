/**
 * Component Name: SkeletonLoader
 * Props:
 *   - variant (string): card, text, list, table
 *   - lines (number): quantity of text lines to display (for text variant)
 * Used on: AI Copilot, Symptom Checker, Lab report explainer delay feeds
 */
import React from 'react';

export const SkeletonLoader = ({
  variant = 'text',
  lines = 3,
  ...props
}) => {
  const lineArray = Array.from({ length: lines });

  if (variant === 'card') {
    return (
      <div className="animate-pulse bg-surface-card border border-white/5 rounded-2xl p-6 space-y-4 w-full" {...props}>
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-5/6" />
          <div className="h-3 bg-white/5 rounded w-4/5" />
        </div>
        <div className="h-8 bg-white/10 rounded w-1/4 mt-4" />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="animate-pulse space-y-3 w-full" {...props}>
        {lineArray.map((_, i) => (
          <div key={i} className="flex items-center space-x-3 py-2 border-b border-white/5">
            <div className="h-8 w-8 rounded-full bg-white/10" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-white/10 rounded w-1/4" />
              <div className="h-2 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="animate-pulse bg-[#0d2044]/30 border border-white/8 rounded-xl p-4 space-y-4 w-full" {...props}>
        <div className="h-6 bg-white/10 rounded w-full mb-4" />
        {lineArray.map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-3 bg-white/5 rounded flex-1" />
            <div className="h-3 bg-white/5 rounded flex-1" />
            <div className="h-3 bg-white/5 rounded flex-1" />
            <div className="h-3 bg-white/5 rounded flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-2 w-full" {...props}>
      {lineArray.map((_, i) => (
        <div
          key={i}
          className="h-3 bg-white/10 rounded"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
