import React from 'react';
import { Patient } from '../types';
import SeverityChart from './SeverityChart';
import SymptomChart from './SymptomChart';
import TriageSummaryDashboard from './TriageSummaryDashboard';

interface DashboardProps {
  patients: Patient[];
}

const HelpTooltip: React.FC<{ content: string, title?: string }> = ({ content, title }) => (
    <div className="relative group">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 hover:text-sky-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="absolute bottom-full right-0 mb-2 w-72 bg-slate-900 border border-slate-600 text-slate-300 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
        {title && <h4 className="font-bold text-slate-100 mb-1">{title}</h4>}
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ patients }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50 p-4">
        <div className="flex justify-center items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Urgency Distribution</h3>
          <HelpTooltip content="A breakdown of all patients by their calculated risk level (Red: ≥8, Yellow: 4−7, Green: ≤3). Essential for deciding which queue is prioritized." />
        </div>
        <div className="h-64">
          <SeverityChart patients={patients} />
        </div>
      </div>
      <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50 p-4">
        <div className="flex justify-center items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Symptom Frequency</h3>
          <HelpTooltip content="Shows the count of each unique symptom across all active patients. Used by staff to monitor prevalent health issues and allocate resources (e.g., high 'chest pain' frequency requires more cardiology staff)." />
        </div>
         <div className="h-80">
          <SymptomChart patients={patients} />
        </div>
      </div>
      <TriageSummaryDashboard patients={patients} />
    </div>
  );
};

export default Dashboard;