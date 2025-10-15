
import React, { useState } from 'react';
import { patientData } from './data/patientData';
import { Patient } from './types';
import Header from './components/Header';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import Dashboard from './components/Dashboard';
import NewPatientForm from './components/NewPatientForm';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(patientData);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addPatient = (patient: Patient) => {
    setPatients(prevPatients => [patient, ...prevPatients]);
    setSelectedPatient(patient);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      <Header onNewPatientClick={() => setIsModalOpen(true)} />
      <main className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[100rem] mx-auto">
        <div className="lg:col-span-3">
          <PatientList 
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
          />
        </div>
        <div className="lg:col-span-6">
          <PatientDetail patient={selectedPatient} />
        </div>
        <div className="lg:col-span-3">
          <Dashboard patients={patients} />
        </div>
      </main>
      {isModalOpen && (
        <NewPatientForm 
          onClose={() => setIsModalOpen(false)}
          onAddPatient={addPatient}
          nextPatientId={`P${(patients.length + 1).toString().padStart(4, '0')}`}
        />
      )}
    </div>
  );
};

export default App;
