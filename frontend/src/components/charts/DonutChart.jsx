/**
 * Component Name: DepartmentLoadDonut / DonutChart
 * Props:
 *   - data (Array): list of { name, value } objects
 *   - height (number): default 260
 * Used on: EmergencyTriage.jsx, BedManagement.jsx
 */
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00d4ff', '#0066cc', '#00c853', '#ffab00', '#ff1744', '#7c4dff'];

export const CustomDonutChart = ({ data, height = 260 }) => {
  return (
    <div style={{ width: '100%', height }} className="flex justify-center items-center select-none">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0d2044',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend
            iconSize={8}
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomDonutChart;
