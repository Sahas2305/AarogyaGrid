/**
 * Component Name: PatientRiskScatterPlot
 * Props:
 *   - data (Array): list of patient objects with age, riskScore, riskLevel, and topFactor
 *   - height (number): default 300
 * Used on: RiskPrediction.jsx
 */
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';

const colors = {
  red: '#ff1744',
  amber: '#ffab00',
  green: '#00c853'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0d2044] border border-white/10 p-3 rounded-lg shadow-xl text-xs max-w-[220px] select-none">
        <p className="font-bold text-white mb-1 truncate">{data.patientName}</p>
        <p className="text-text-secondary">Age: <span className="text-white">{data.age} yrs</span></p>
        <p className="text-text-secondary">Risk Score: <span className="font-bold text-brand-cyan">{data.riskScore}%</span></p>
        <p className="text-[#ffab00] font-medium mt-1 leading-relaxed">Factor: {data.topFactor}</p>
      </div>
    );
  }
  return null;
};

export const CustomScatterPlot = ({ data, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }} className="select-none">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            type="number"
            dataKey="riskScore"
            name="Risk Score"
            unit="%"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <YAxis
            type="number"
            dataKey="age"
            name="Age"
            unit=" yrs"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <ZAxis range={[60, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
          <Scatter name="Patients" data={data}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[entry.riskLevel] || colors.green}
                stroke="#0a1628"
                strokeWidth={1.5}
                className="cursor-pointer"
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomScatterPlot;
