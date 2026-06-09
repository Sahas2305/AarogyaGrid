/**
 * Component Name: SparkLine
 * Props:
 *   - data (Array): list of numeric values or { value } objects
 *   - stroke (string): color hex (default brand-cyan)
 *   - height (number): default 35
 * Used on: StatCard.jsx inside Admin / Doctor dashboards
 */
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export const SparkLine = ({ data, stroke = '#00d4ff', height = 35 }) => {
  // Normalize data if it's just array of numbers
  const chartData = data.map((val, idx) => (typeof val === 'number' ? { value: val } : val));

  return (
    <div style={{ width: '100px', height }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparkLine;
