import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, DotProps } from 'recharts';
import { Patient } from '../types';

interface VitalsChartProps {
  patient: Patient | null;
}

const vitalsConfig = [
  { key: 'temperature_F', name: 'Temp (°F)', label: 'Temp', unit: '°F', normalMin: 97.6, normalMax: 99.6 },
  { key: 'heart_rate_bpm', name: 'HR (bpm)', label: 'HR', unit: 'bpm', normalMin: 60, normalMax: 100 },
  { key: 'respiration_rate', name: 'RR (/min)', label: 'RR', unit: '/min', normalMin: 12, normalMax: 20 },
  { key: 'oxygen_saturation', name: 'SpO₂ (%)', label: 'SpO₂', unit: '%', normalMin: 95, normalMax: 100 },
  { key: 'bp_systolic', name: 'BPs (mmHg)', label: 'BPs', unit: 'mmHg', normalMin: 90, normalMax: 120 },
  { key: 'bp_diastolic', name: 'BPd (mmHg)', label: 'BPd', unit: 'mmHg', normalMin: 60, normalMax: 80 },
];

const CustomDot: React.FC<DotProps & { isAbnormal: boolean }> = (props) => {
  const { cx, cy, isAbnormal } = props;
  if (!isAbnormal) {
    return <circle cx={cx} cy={cy} r={4} stroke="#38bdf8" fill="#38bdf8" />;
  }
  return <circle cx={cx} cy={cy} r={5} stroke="#ef4444" fill="#ef4444" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-600 rounded-lg p-3 text-sm shadow-lg">
        <p className="font-bold text-slate-100 mb-1">{data.fullName}</p>
        <p className="text-sky-300">Patient Value: <span className="font-semibold">{data.patientValue} {data.unit}</span></p>
        <p className="text-green-400">Normal Range: {data.normalLow} - {data.normalHigh} {data.unit}</p>
      </div>
    );
  }
  return null;
};

const VitalsChart: React.FC<VitalsChartProps> = ({ patient }) => {
  if (!patient) return null;

  const data = vitalsConfig.map(config => {
    const patientValue = patient[config.key as keyof Patient] as number;
    return {
      name: config.label,
      fullName: config.name,
      patientValue: patientValue,
      normalRange: [config.normalMin, config.normalMax],
      normalLow: config.normalMin,
      normalHigh: config.normalMax,
      isAbnormal: patientValue < config.normalMin || patientValue > config.normalMax,
      unit: config.unit,
    };
  });
  
  const allValues = data.flatMap(d => [d.patientValue, d.normalLow, d.normalHigh]);
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yDomain = [Math.floor(yMin * 0.9), Math.ceil(yMax * 1.1)];

  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Vitals Analysis Chart</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" domain={yDomain} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "12px", paddingTop: '10px'}}/>

            <Area 
                type="monotone" 
                dataKey="normalRange" 
                fill="#22c55e" 
                stroke="none" 
                fillOpacity={0.2} 
                name="Normal Zone"
            />
            
            <Line 
                type="monotone" 
                dataKey="normalHigh" 
                stroke="#22c55e" 
                strokeWidth={1.5} 
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                name="Normal High"
            />
            <Line 
                type="monotone" 
                dataKey="normalLow" 
                stroke="#22c55e" 
                strokeWidth={1.5} 
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                name="Normal Low"
            />

            <Line 
                type="monotone" 
                dataKey="patientValue" 
                stroke="#38bdf8" 
                strokeWidth={2}
                dot={(props) => <CustomDot {...props} isAbnormal={data[props.index as number]?.isAbnormal} />}
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
                name="Patient Value"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VitalsChart;
