
import React from 'react';
import { Patient, UrgencyColor } from '../types';

interface DischargedViewProps {
  dischargedPatients: Patient[];
  onBackToDashboard: () => void;
}

const urgencyColorClasses: Record<UrgencyColor, string> = {
    Green: 'bg-green-500/20 text-green-400',
    Yellow: 'bg-yellow-500/20 text-yellow-400',
    Red: 'bg-red-500/20 text-red-400',
};

const DischargedView: React.FC<DischargedViewProps> = ({ dischargedPatients, onBackToDashboard }) => {
  return (
    <div className="p-4 lg:p-6 max-w-[100rem] mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Discharged Patients ({dischargedPatients.length})</h2>
            <button
                onClick={onBackToDashboard}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
            >
                &larr; Back to Dashboard
            </button>
        </div>
        <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-15rem)]">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-800 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Patient ID</th>
                            <th scope="col" className="px-6 py-3">Discharged On</th>
                            <th scope="col" className="px-6 py-3">Age</th>
                            <th scope="col" className="px-6 py-3">Gender</th>
                            <th scope="col" className="px-6 py-3">Symptoms</th>
                            <th scope="col" className="px-6 py-3">Final Urgency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dischargedPatients.map((patient) => (
                            <tr key={patient.id} className="bg-slate-900/50 border-b border-slate-700/50 hover:bg-slate-800/70">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">{patient.patient_id}</th>
                                <td className="px-6 py-4">{new Date(patient.submission_timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4">{patient.age}</td>
                                <td className="px-6 py-4">{patient.gender}</td>
                                <td className="px-6 py-4 truncate max-w-xs">{patient.symptoms}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 font-semibold rounded-full text-xs ${urgencyColorClasses[patient.urgency_color]}`}>
                                        {patient.urgency_score} - {patient.urgency_color}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {dischargedPatients.length === 0 && (
                <p className="text-center py-8 text-slate-500">No discharged patients.</p>
            )}
        </div>
    </div>
  );
};

export default DischargedView;
