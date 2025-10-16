import React from 'react';
import { Patient } from '../types';
import { generateVitalsAnalysis, generateTriageScoreExplanation } from '../services/geminiService';
import VitalsChart from './VitalsChart';

interface PatientDetailProps {
  patient: Patient | null;
}

const UrgencyColorClasses: Record<string, string> = {
  Green: 'bg-green-500/20 text-green-400 border-green-500/30',
  Yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const VitalSign: React.FC<{ label: string; value: string | number; unit: string }> = ({ label, value, unit }) => (
    <div className="flex flex-col p-3 bg-slate-800/60 rounded-lg text-center">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xl font-bold text-slate-100">{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></span>
    </div>
);

const HelpTooltip: React.FC<{ content: string, title?: string }> = ({ content, title }) => (
  <div className="relative group">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 hover:text-sky-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-900 border border-slate-600 text-slate-300 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
      {title && <h4 className="font-bold text-slate-100 mb-1">{title}</h4>}
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  </div>
);

const AiExplanationCard: React.FC<{ title: string; onGenerate: () => Promise<string> }> = ({ title, onGenerate }) => {
  const [explanation, setExplanation] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  // Effect to reset state when the patient context changes (proxied by onGenerate function changing)
  React.useEffect(() => {
    setExplanation('');
    setError('');
    setIsLoading(false);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGenerate]);

  // Cleanup effect for when the component unmounts
  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleGenerate = async () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
    setIsLoading(true);
    setError('');
    setExplanation('');
    try {
      const result = await onGenerate();
      setExplanation(result.replace(/\n/g, '<br />'));
    } catch (err) {
      setError((err as Error).message || 'Failed to generate AI explanation.');
      console.error(err);
    }
    setIsLoading(false);
  };
  
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    } else if (explanation) {
      const plainText = explanation.replace(/<br\s*\/?>/gi, ' ');
      const utterance = new SpeechSynthesisUtterance(plainText);
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setError('Could not play audio explanation.');
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50 p-6">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
            {explanation && !isLoading && (
                 <button 
                    onClick={handleToggleSpeak} 
                    className={`transition-colors ${isSpeaking ? 'text-sky-400' : 'text-slate-400 hover:text-sky-400'}`}
                    aria-label={isSpeaking ? 'Stop reading aloud' : 'Read explanation aloud'}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.474 3.235a.75.75 0 01.696-.035l6.25 4.25a.75.75 0 010 1.099l-6.25 4.25a.75.75 0 01-1.196-.55V3.785a.75.75 0 01.5-.55zM3 5.75A.75.75 0 013.75 5h1.5a.75.75 0 01.75.75v8.5a.75.75 0 01-.75.75h-1.5A.75.75 0 013 14.25v-8.5z" />
                    </svg>
                 </button>
            )}
        </div>
        <button onClick={handleGenerate} disabled={isLoading} className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center text-sm">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : "Generate"}
        </button>
      </div>
      {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm">{error}</p>}
      {explanation && (
        <div className="text-sm text-slate-300 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 leading-relaxed" dangerouslySetInnerHTML={{ __html: explanation }}></div>
      )}
      {!explanation && !isLoading && (
        <div className="text-center py-4 text-sm text-slate-500">Click "Generate" to get an AI-powered explanation.</div>
      )}
    </div>
  );
};


const PatientDetail: React.FC<PatientDetailProps> = ({ patient }) => {
  if (!patient) {
    return (
      <div className="bg-slate-800/50 rounded-lg shadow-lg p-6 border border-slate-700/50 h-full flex items-center justify-center">
        <p className="text-slate-400">Select a patient to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50 p-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white">{patient.patient_id}</h2>
                <p className="text-slate-400">{patient.age} year-old {patient.gender}</p>
            </div>
            <div className={`px-4 py-1.5 text-md font-bold rounded-full ${UrgencyColorClasses[patient.urgency_color]}`}>
                Score: {patient.urgency_score} - {patient.urgency_color}
            </div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <VitalSign label="Temp" value={patient.temperature_F} unit="°F" />
            <VitalSign label="Heart Rate" value={patient.heart_rate_bpm} unit="bpm" />
            <VitalSign label="Resp. Rate" value={patient.respiration_rate} unit="/min" />
            <VitalSign label="O₂ Sat" value={patient.oxygen_saturation} unit="%" />
        </div>
      </div>

      <VitalsChart patient={patient} />

       <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Triage Summary</h3>
        <div className="space-y-4 text-sm">
           <p><strong className="text-slate-400">Symptoms:</strong> <span className="text-sky-300">{patient.symptoms.split(',').join(', ')}</span></p>
           <p><strong className="text-slate-400">Comorbidities:</strong> {patient.comorbidities}</p>
           <p><strong className="text-slate-400">Consciousness:</strong> {patient.consciousness}</p>
           <div className="flex items-start gap-2">
             <strong className="text-slate-400 flex items-center gap-1.5 flex-shrink-0 pt-0.5">AI Triage Summary: 
               <HelpTooltip content="The AI's one-line, human-readable conclusion. It combines the urgency level, main finding, and initial recommended action for quick clinical assessment." />
             </strong>
             <span className="text-slate-300">{patient.triage_ai_summary}</span>
           </div>
        </div>
      </div>
      
      <AiExplanationCard 
        title="Vitals Analysis Explanation"
        onGenerate={() => generateVitalsAnalysis(patient)} 
      />
      
      <AiExplanationCard 
        title="Triage Score Explanation"
        onGenerate={() => generateTriageScoreExplanation(patient)}
      />
    </div>
  );
};

export default PatientDetail;