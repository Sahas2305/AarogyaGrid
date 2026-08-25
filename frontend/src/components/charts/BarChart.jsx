/**
 * Component Name: DepartmentBarChart
 * Props:
 *   - data (Array): list of { department, doctors } objects
 *   - height (number): default 300
 * Used on: AdminDashboard.jsx
 */
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CustomBarChart = ({ data, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="department"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={80}
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
          <Bar
            dataKey="doctors"
            fill="#0066cc"
            radius={[0, 4, 4, 0]}
            barSize={12}
            className="fill-brand-blue"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
