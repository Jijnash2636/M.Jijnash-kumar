import React from 'react';
import { Patient, UrgencyColor } from '../types';

interface TriageSummaryDashboardProps {
  patients: Patient[];
}

const urgencyDotClasses: Record<UrgencyColor, string> = {
    Red: 'bg-red-500',
    Yellow: 'bg-yellow-500',
    Green: 'bg-green-500',
};


const TriageSummaryDashboard: React.FC<TriageSummaryDashboardProps> = ({ patients }) => {
  const sortedPatients = [...patients]
    .sort((a, b) => b.urgency_score - a.urgency_score)
    .slice(0, 5);

  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50 p-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">High-Urgency Patient Summaries</h3>
      {sortedPatients.length > 0 ? (
        <ul className="space-y-3">
          {sortedPatients.map((patient) => (
            <li key={patient.patient_id} className="text-xs p-2.5 bg-slate-900/40 rounded-md border border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${urgencyDotClasses[patient.urgency_color]}`}></div>
                <p className="text-slate-300">
                  <strong className="text-slate-100">{patient.patient_id}: </strong>
                  {patient.triage_ai_summary}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 text-center text-sm py-4">No patients in queue.</p>
      )}
    </div>
  );
};

export default TriageSummaryDashboard;
