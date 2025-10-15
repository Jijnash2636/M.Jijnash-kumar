
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Patient, UrgencyColor } from '../types';

interface SeverityChartProps {
  patients: Patient[];
}

const COLORS: Record<UrgencyColor, string> = {
  Red: '#ef4444',
  Yellow: '#f59e0b',
  Green: '#22c55e',
};

const SeverityChart: React.FC<SeverityChartProps> = ({ patients }) => {
  const data = (['Red', 'Yellow', 'Green'] as UrgencyColor[]).map(color => ({
    name: color,
    count: patients.filter(p => p.urgency_color === color).length,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
          contentStyle={{
            background: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#475569',
            borderRadius: '0.5rem'
          }}
        />
        <Bar dataKey="count" barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SeverityChart;
