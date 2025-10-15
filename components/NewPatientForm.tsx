import React, { useState, useEffect, useRef } from 'react';
import { Patient, PatientInput } from '../types';
import { runTriage } from '../services/triageService';
import { commonSymptoms, commonComorbidities } from './SymptomAndComorbidityData';

interface NewPatientFormProps {
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
  nextPatientId: string;
}

const helpTexts = {
  temperature_F: {
    title: "Temperature (°F)",
    content: "Explanation: Body's core temperature. Normal: 97.6°F−99.6°F. Risk: Fever>101°F→+2 urgency points."
  },
  heart_rate_bpm: {
    title: "Heart Rate (bpm)",
    content: "Explanation: Beats per minute. Normal: 60−100 bpm. Risk: HR>120 bpm→+2 urgency points."
  },
  oxygen_saturation: {
    title: "SpO₂ (%)",
    content: "Explanation: Oxygen saturation in blood. Normal: 95%−100%. Risk: SpO₂<90%→+3 urgency points."
  },
  respiration_rate: {
    title: "Resp. Rate (/min)",
    content: "Explanation: Breaths per minute. Normal: 12−20 /min. Risk: RR>24 /min→+2 urgency points."
  },
  bp_systolic: {
    title: "Blood Pressure (Systolic/Diastolic)",
    content: "Explanation: Blood pressure (top/bottom number). Normal: 90−120/60−80 mmHg. Used to guide diagnosis (e.g., shock, hypertension), not a primary urgency score trigger."
  },
};


const InputField: React.FC<{ label: string, id: keyof PatientInput, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, type?: string, required?: boolean, children?: React.ReactNode, helpText?: { title: string, content: string } }> = ({ label, id, value, onChange, type = 'text', required = false, children, helpText }) => (
    <div>
        <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1">
            <span>{label}{required && <span className="text-red-400">*</span>}</span>
            {helpText && (
              <div className="relative group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 hover:text-sky-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-900 border border-slate-600 text-slate-300 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
                  <h4 className="font-bold text-slate-100 mb-1">{helpText.title}</h4>
                  <p className="whitespace-pre-wrap">{helpText.content}</p>
                </div>
              </div>
            )}
        </label>
        {children ? (
            <select id={id} name={id} value={value} onChange={onChange} required={required} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                {children}
            </select>
        ) : (
            <input type={type} id={id} name={id} value={value} onChange={onChange} required={required} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
        )}
    </div>
);


const Chip: React.FC<{ text: string, onRemove: () => void }> = ({ text, onRemove }) => (
    <div className="bg-sky-500/20 text-sky-300 text-sm rounded-full pl-3 pr-2 py-1 flex items-center gap-2">
        <span>{text}</span>
        <button onClick={onRemove} type="button" className="text-sky-200 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
);

const NewPatientForm: React.FC<NewPatientFormProps> = ({ onClose, onAddPatient, nextPatientId }) => {
    const [formData, setFormData] = useState<PatientInput>({
        patient_id: nextPatientId,
        age: '',
        gender: '',
        pregnancy_status: false,
        temperature_F: '',
        heart_rate_bpm: '',
        oxygen_saturation: '',
        bp_systolic: '',
        bp_diastolic: '',
        respiration_rate: '',
        symptoms: [],
        consciousness: 'Alert',
        comorbidities: []
    });
    const [symptomInput, setSymptomInput] = useState('');
    const [comorbidityInput, setComorbidityInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSymptomInput(transcript);
                const matchedSymptom = commonSymptoms.find(s => transcript.toLowerCase().includes(s.replace(/_/g, ' ')));
                if(matchedSymptom && !formData.symptoms.includes(matchedSymptom)) {
                    setFormData(prev => ({...prev, symptoms: [...prev.symptoms, matchedSymptom]}));
                    setSymptomInput('');
                }
            };
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const addChip = (type: 'symptoms' | 'comorbidities', value: string) => {
        if (value && !formData[type].includes(value)) {
            setFormData(prev => ({ ...prev, [type]: [...prev[type], value] }));
        }
    };

    const removeChip = (type: 'symptoms' | 'comorbidities', index: number) => {
        setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const triageResult = await runTriage(formData);
            onAddPatient(triageResult);
        } catch (error) {
            console.error("Triage failed:", error);
            alert("Failed to run triage. Please check the console.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Triage New Patient</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField label="Patient ID" id="patient_id" value={formData.patient_id} onChange={handleChange} required />
                                <InputField label="Age" id="age" value={formData.age} onChange={handleChange} type="number" required />
                                <InputField label="Gender" id="gender" value={formData.gender} onChange={handleChange} required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </InputField>
                            </div>
                            {formData.gender === 'Female' && (
                                <div className="flex items-center">
                                    <input id="pregnancy_status" name="pregnancy_status" type="checkbox" checked={formData.pregnancy_status} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-sky-600 focus:ring-sky-500" />
                                    <label htmlFor="pregnancy_status" className="ml-2 block text-sm text-slate-300">Possibly Pregnant?</label>
                                </div>
                            )}
                            <h3 className="text-md font-semibold text-slate-300 pt-2 border-b border-slate-700 pb-1">Vitals (Optional)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <InputField label="Temperature" id="temperature_F" value={formData.temperature_F} onChange={handleChange} type="number" helpText={helpTexts.temperature_F} />
                                <InputField label="Heart Rate" id="heart_rate_bpm" value={formData.heart_rate_bpm} onChange={handleChange} type="number" helpText={helpTexts.heart_rate_bpm}/>
                                <InputField label="SpO₂" id="oxygen_saturation" value={formData.oxygen_saturation} onChange={handleChange} type="number" helpText={helpTexts.oxygen_saturation} />
                                <InputField label="Resp. Rate" id="respiration_rate" value={formData.respiration_rate} onChange={handleChange} type="number" helpText={helpTexts.respiration_rate} />
                                <InputField label="BP Systolic" id="bp_systolic" value={formData.bp_systolic} onChange={handleChange} type="number" helpText={helpTexts.bp_systolic} />
                                <InputField label="BP Diastolic" id="bp_diastolic" value={formData.bp_diastolic} onChange={handleChange} type="number" />
                            </div>

                            <h3 className="text-md font-semibold text-slate-300 pt-2 border-b border-slate-700 pb-1">Symptoms & Conditions</h3>
                            
                            <div>
                                <label htmlFor="symptoms" className="block text-sm font-medium text-slate-300 mb-1">Symptoms</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="symptoms"
                                        type="text"
                                        list="symptom-list"
                                        value={symptomInput}
                                        onChange={(e) => setSymptomInput(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter'){ e.preventDefault(); addChip('symptoms', symptomInput); setSymptomInput(''); }}}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    />
                                    <datalist id="symptom-list">
                                        {commonSymptoms.map(s => <option key={s} value={s.replace(/_/g, ' ')} />)}
                                    </datalist>
                                    <button type="button" onClick={() => { addChip('symptoms', symptomInput); setSymptomInput(''); }} className="bg-sky-600 text-white px-3 py-2 rounded-md text-sm">Add</button>
                                    {recognitionRef.current && (
                                        <button type="button" onClick={() => recognitionRef.current.start()} disabled={isListening} className={`p-2 rounded-md ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
                                        </svg>
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.symptoms.map((s, i) => <Chip key={i} text={s} onRemove={() => removeChip('symptoms', i)} />)}
                                </div>
                            </div>

                            <div>
                                <InputField label="Consciousness" id="consciousness" value={formData.consciousness} onChange={handleChange} required>
                                    <option value="Alert">Alert</option>
                                    <option value="Semi-conscious">Semi-conscious</option>
                                    <option value="Unconscious">Unconscious</option>
                                </InputField>
                            </div>

                            <div>
                                <label htmlFor="comorbidities" className="block text-sm font-medium text-slate-300 mb-1">Comorbidities</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="comorbidities"
                                        type="text"
                                        list="comorbidity-list"
                                        value={comorbidityInput}
                                        onChange={(e) => setComorbidityInput(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter'){ e.preventDefault(); addChip('comorbidities', comorbidityInput); setComorbidityInput(''); }}}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    />
                                    <datalist id="comorbidity-list">
                                        {commonComorbidities.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                    <button type="button" onClick={() => { addChip('comorbidities', comorbidityInput); setComorbidityInput(''); }} className="bg-sky-600 text-white px-3 py-2 rounded-md text-sm">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.comorbidities.length === 0 && <Chip text="none" onRemove={() => {}} />}
                                    {formData.comorbidities.map((c, i) => <Chip key={i} text={c} onRemove={() => removeChip('comorbidities', i)} />)}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                 <footer className="p-4 bg-slate-800/50 border-t border-slate-700 mt-auto">
                    <button type="submit" onClick={handleSubmit} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center text-lg">
                        {isLoading ? (
                           <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Running Triage...
                            </>
                        ) : "Run Triage"}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default NewPatientForm;