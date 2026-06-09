/**
 * Component Name: RevenueLineChart / LineChart
 * Props:
 *   - data (Array): list of items
 *   - dataKey (string): name of key for value (default "revenue")
 *   - xKey (string): name of key for labels (default "month")
 *   - height (number): default 300
 * Used on: BillingPage.jsx, BedManagement.jsx, RiskPrediction.jsx
 */
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CustomLineChart = ({ data, dataKey = 'revenue', xKey = 'month', height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey={xKey}
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
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#00d4ff"
            strokeWidth={2.5}
            activeDot={{ r: 6, fill: '#00d4ff', stroke: '#0a1628', strokeWidth: 2 }}
            dot={{ r: 3, fill: '#0d2044', stroke: '#00d4ff', strokeWidth: 1.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
