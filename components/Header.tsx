
import React from 'react';

export type ViewType = 'dashboard' | 'archive' | 'discharged';

interface HeaderProps {
  onNewPatientClick: () => void;
  onSetView: (view: ViewType) => void;
  currentView: ViewType;
}

const Header: React.FC<HeaderProps> = ({ onNewPatientClick, onSetView, currentView }) => {
  
  const NavButton: React.FC<{ view: ViewType, label: string }> = ({ view, label }) => (
    <button
      onClick={() => onSetView(view)}
      className={`font-bold py-2 px-4 rounded-lg transition duration-200 ${
        currentView === view
          ? 'bg-sky-600 text-white cursor-default'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-700/50">
      <div className="max-w-[100rem] mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-sky-500/10 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20.5c.5-5.5 5.5-7.5 5.5-12.5" transform="rotate(90 12 12)" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.5c-.5 5.5-5.5 7.5-5.5 12.5" transform="rotate(90 12 12)" />
                </svg>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Emergency Brain 360</h1>
                <p className="text-sm text-slate-400">AI-Powered Triage & Diagnosis System</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1">
                <NavButton view="dashboard" label="Dashboard" />
                <NavButton view="archive" label="Archive" />
                <NavButton view="discharged" label="Discharged" />
            </div>
            <button
                onClick={onNewPatientClick}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2 ml-4"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Triage New Patient
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
