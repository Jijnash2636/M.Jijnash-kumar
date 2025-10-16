
import React from 'react';
import { Patient, UrgencyColor } from '../types';

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onDischargePatient: (patient: Patient) => void;
}

const urgencyColorClasses: Record<UrgencyColor, string> = {
  Green: 'bg-green-500/20 text-green-400 border-green-500/30',
  Yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const urgencyColorSelectedClasses: Record<UrgencyColor, string> = {
  Green: 'bg-green-500 text-slate-900',
  Yellow: 'bg-yellow-500 text-slate-900',
  Red: 'bg-red-500 text-white',
};

const PatientList: React.FC<PatientListProps> = ({ patients, selectedPatient, onSelectPatient, onDischargePatient }) => {
  const handleDischargeClick = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation(); // Prevent the onSelectPatient from firing
    onDischargePatient(patient);
  };
  
  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50">
      <h2 className="text-lg font-semibold text-slate-200 p-4 border-b border-slate-700/50">Active Patient Queue ({patients.length})</h2>
      <div className="max-h-[calc(100vh-15rem)] overflow-y-auto">
        <ul className="divide-y divide-slate-700/50">
          {patients.map((patient) => (
            <li
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={`w-full text-left p-4 transition-colors duration-200 group relative cursor-pointer ${
                selectedPatient?.patient_id === patient.patient_id
                  ? 'bg-sky-500/10'
                  : 'hover:bg-slate-700/30'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectPatient(patient)}}
            >
              <button 
                onClick={(e) => handleDischargeClick(e, patient)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-700/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label={`Discharge patient ${patient.patient_id}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-200">{patient.patient_id}</p>
                    <p className="text-sm text-slate-400">{patient.age}yo {patient.gender}</p>
                  </div>
                  <div
                    className={`px-3 py-1 text-sm font-bold rounded-full ${
                      selectedPatient?.patient_id === patient.patient_id
                        ? urgencyColorSelectedClasses[patient.urgency_color]
                        : urgencyColorClasses[patient.urgency_color]
                    }`}
                  >
                    {patient.urgency_color}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 truncate">{patient.symptoms}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PatientList;
