
import { Patient } from '../types';
import { patientData as initialSeedData } from '../data/patientData';

const DB_KEY = 'EMERGENCY_BRAIN_360_DB';

const getAllPatientsFromStorage = (): Patient[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveAllPatientsToStorage = (patients: Patient[]): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(patients));
};

export const initializeDB = (): void => {
  if (localStorage.getItem(DB_KEY)) {
    return;
  }
  let currentTimestamp = Date.now();
  const seededPatients: Patient[] = initialSeedData.map((p: any, index: number) => ({
    ...p,
    id: index + 1,
    submission_timestamp: currentTimestamp - (initialSeedData.length - index) * 300000, // Stagger timestamps by 5 minutes
    status: 'ACTIVE',
  }));
  saveAllPatientsToStorage(seededPatients);
};

export const getAllPatients = (): Patient[] => {
  const patients = getAllPatientsFromStorage();
  return patients.sort((a, b) => b.submission_timestamp - a.submission_timestamp);
};

export const getLatestActivePatients = (limit: number = 15): Patient[] => {
  return getAllPatients()
    .filter(p => p.status === 'ACTIVE')
    .slice(0, limit);
};

export const getDischargedPatients = (): Patient[] => {
    return getAllPatients()
        .filter(p => p.status === 'DISCHARGED');
};

export const insertPatient = (patientData: Omit<Patient, 'id' | 'submission_timestamp' | 'status'>): Patient => {
  const allPatients = getAllPatientsFromStorage();
  const newId = allPatients.length > 0 ? Math.max(...allPatients.map(p => p.id)) + 1 : 1;
  
  const newPatient: Patient = {
    ...patientData,
    id: newId,
    submission_timestamp: Date.now(),
    status: 'ACTIVE',
  };

  allPatients.push(newPatient);
  saveAllPatientsToStorage(allPatients);
  return newPatient;
};

export const updatePatientStatus = (id: number, newStatus: 'ACTIVE' | 'DISCHARGED'): void => {
    let allPatients = getAllPatientsFromStorage();
    const patientIndex = allPatients.findIndex(p => p.id === id);
    if (patientIndex !== -1) {
        allPatients[patientIndex].status = newStatus;
        saveAllPatientsToStorage(allPatients);
    }
};

export const getNextPatientId = (): string => {
    const totalPatients = getAllPatientsFromStorage().length;
    return `P${(totalPatients + 1).toString().padStart(4, '0')}`;
};
