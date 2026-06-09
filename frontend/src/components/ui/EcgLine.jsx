/**
 * Component Name: EcgLine
 * Props:
 *   - className (string): styles
 *   - height (number): height configuration of the SVG frame
 *   - color (string): hex color values (default brand-cyan)
 * Description: Displays an animated looping ECG pulse line representing health operations
 * Used on: Landing.jsx (hero banner), Login.jsx (left deck)
 */
import React from 'react';
import { motion } from 'framer-motion';

export const EcgLine = ({ className = '', height = 60, color = '#00d4ff', ...props }) => {
  return (
    <div className={`w-full overflow-hidden flex items-center justify-center ${className}`} style={{ height }} {...props}>
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full opacity-70">
        <motion.path
          d="M 0,50 L 150,50 L 170,30 L 180,70 L 195,5 L 210,95 L 225,50 L 240,50 L 400,50 L 420,30 L 430,70 L 445,5 L 460,95 L 475,50 L 490,50 L 650,50 L 670,30 L 680,70 L 695,5 L 710,95 L 725,50 L 740,50 L 900,50 L 920,30 L 930,70 L 945,5 L 960,95 L 975,50 L 1000,50"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 0.5
          }}
        />
      </svg>
    </div>
  );
};

export default EcgLine;
