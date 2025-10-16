import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Patient } from '../types';

interface SymptomChartProps {
  patients: Patient[];
}

const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16'];

const SymptomChart: React.FC<SymptomChartProps> = ({ patients }) => {
  // Fix: Explicitly typing the accumulator `acc` in the reduce function ensures
  // that `symptomCounts` is correctly typed as `Record<string, number>`.
  // This allows TypeScript to correctly infer that `a` and `b` in the subsequent
  // `.sort()` method are numbers, resolving the arithmetic operation error.
  const symptomCounts = patients.reduce((acc: Record<string, number>, patient) => {
    const symptoms = patient.symptoms.split(',').map(s => s.trim().replace(/_/g, ' '));
    symptoms.forEach(symptom => {
      const capitalizedSymptom = symptom.charAt(0).toUpperCase() + symptom.slice(1);
      acc[capitalizedSymptom] = (acc[capitalizedSymptom] || 0) + 1;
    });
    return acc;
  // FIX: The initial value for reduce must be correctly typed. An untyped `{}` can lead to
  // incorrect type inference for the accumulator, causing downstream errors.
  }, {} as Record<string, number>);
  
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
    
  const data = sortedSymptoms.map(([name, value]) => ({ name, count: value })).reverse();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          width={100}
          tick={{ textAnchor: 'end', fill: '#94a3b8' }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
          contentStyle={{
            background: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#475569',
            borderRadius: '0.5rem'
          }}
        />
        <Bar dataKey="count" barSize={20} radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SymptomChart;
