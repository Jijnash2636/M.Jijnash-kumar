
import React from 'react';

interface HeaderProps {
  onNewPatientClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewPatientClick }) => {
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
        <button
          onClick={onNewPatientClick}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Triage New Patient
        </button>
      </div>
    </header>
  );
};

export default Header;
