/**
 * Component Name: AppointmentsAreaChart
 * Props:
 *   - data (Array): list of { date, value } objects
 *   - height (number): graphic height (default 300)
 * Used on: AdminDashboard.jsx
 */
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CustomAreaChart = ({ data, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0d2044',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            itemStyle={{ color: '#00d4ff', fontSize: '12px' }}
            labelStyle={{ fontSize: '11px', color: '#94a3b8' }}
          />
          <Area
            type="monotone"
            dataKey="appointments"
            stroke="#00d4ff"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCyan)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomAreaChart;
