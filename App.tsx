
import React, { useState, useEffect } from 'react';
import { Patient } from './types';
import Header, { ViewType } from './components/Header';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import Dashboard from './components/Dashboard';
import NewPatientForm from './components/NewPatientForm';
import ArchiveView from './components/ArchiveView';
import DischargedView from './components/DischargedView';
import * as patientDB from './services/patientDBService';

const App: React.FC = () => {
  const [activePatients, setActivePatients] = useState<Patient[]>([]);
  const [allArchivedPatients, setAllArchivedPatients] = useState<Patient[]>([]);
  const [dischargedPatients, setDischargedPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard');
  const [nextPatientId, setNextPatientId] = useState('P0001');
  const [patientToDischarge, setPatientToDischarge] = useState<Patient | null>(null);

  useEffect(() => {
    patientDB.initializeDB();
    reloadData();
  }, []);

  const reloadData = () => {
    const active = patientDB.getLatestActivePatients();
    const all = patientDB.getAllPatients();
    const discharged = patientDB.getDischargedPatients();

    setActivePatients(active);
    setAllArchivedPatients(all);
    setDischargedPatients(discharged);
    setNextPatientId(patientDB.getNextPatientId());

    if (selectedPatient) {
      const stillActive = active.find(p => p.id === selectedPatient.id);
      // FIX: Corrected typo from `still-active` to `stillActive`. This resolves three errors: an undefined variable error, an invalid arithmetic operation error, and a state setter type mismatch error.
      setSelectedPatient(stillActive || active[0] || null);
    } else {
      setSelectedPatient(active[0] || null);
    }
  };

  const handleAddPatient = (patientFromTriage: Omit<Patient, 'id' | 'submission_timestamp' | 'status'>) => {
    patientDB.insertPatient(patientFromTriage);
    reloadData();
    const latestActivePatients = patientDB.getLatestActivePatients();
    setSelectedPatient(latestActivePatients[0] || null);
    setIsModalOpen(false);
  };

  const handleRequestDischarge = (patient: Patient) => {
    setPatientToDischarge(patient);
  };

  const handleConfirmDischarge = () => {
    if (patientToDischarge) {
      patientDB.updatePatientStatus(patientToDischarge.id, 'DISCHARGED');
      reloadData();
    }
    setPatientToDischarge(null);
  };

  const handleCancelDischarge = () => {
    setPatientToDischarge(null);
  };

  const renderView = () => {
    switch (view) {
      case 'archive':
        return <ArchiveView allPatients={allArchivedPatients} onBackToDashboard={() => setView('dashboard')} />;
      case 'discharged':
        return <DischargedView dischargedPatients={dischargedPatients} onBackToDashboard={() => setView('dashboard')} />;
      case 'dashboard':
      default:
        return (
          <main className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[100rem] mx-auto">
            <div className="lg:col-span-3">
              <PatientList 
                patients={activePatients}
                selectedPatient={selectedPatient}
                onSelectPatient={setSelectedPatient}
                onDischargePatient={handleRequestDischarge}
              />
            </div>
            <div className="lg:col-span-6">
              <PatientDetail patient={selectedPatient} />
            </div>
            <div className="lg:col-span-3">
              <Dashboard patients={activePatients} />
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      <Header 
        onNewPatientClick={() => setIsModalOpen(true)}
        onSetView={setView}
        currentView={view}
      />
      {renderView()}
      {isModalOpen && (
        <NewPatientForm 
          onClose={() => setIsModalOpen(false)}
          onAddPatient={handleAddPatient}
          nextPatientId={nextPatientId}
        />
      )}
      {patientToDischarge && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4" onClick={handleCancelDischarge} aria-modal="true" role="alertdialog">
          <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md border border-yellow-500/50 transform transition-all" onClick={(e) => e.stopPropagation()}>
            <header className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-yellow-400">Discharge Patient Confirmation</h3>
            </header>
            <div className="p-6">
              <p className="text-slate-300 leading-relaxed">
                Are you sure you want to discharge Patient <strong>{patientToDischarge.patient_id}</strong>? This action will clear their slot from the active triage queue.
              </p>
            </div>
            <footer className="p-4 flex justify-end items-center gap-4 bg-slate-900/50 rounded-b-lg">
              <button onClick={handleCancelDischarge} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                CANCEL
              </button>
              <button onClick={handleConfirmDischarge} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                YES, DISCHARGE
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
