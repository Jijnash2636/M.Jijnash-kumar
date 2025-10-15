
import React from 'react';
import { Patient, UrgencyColor } from '../types';

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
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

const PatientList: React.FC<PatientListProps> = ({ patients, selectedPatient, onSelectPatient }) => {
  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50">
      <h2 className="text-lg font-semibold text-slate-200 p-4 border-b border-slate-700/50">Patient Queue ({patients.length})</h2>
      <div className="max-h-[calc(100vh-15rem)] overflow-y-auto">
        <ul className="divide-y divide-slate-700/50">
          {patients.map((patient) => (
            <li key={patient.patient_id}>
              <button
                onClick={() => onSelectPatient(patient)}
                className={`w-full text-left p-4 transition-colors duration-200 ${
                  selectedPatient?.patient_id === patient.patient_id
                    ? 'bg-sky-500/10'
                    : 'hover:bg-slate-700/30'
                }`}
              >
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
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PatientList;
