
export interface Patient {
  patient_id: string;
  age: number;
  gender: string;
  temperature_F: number;
  heart_rate_bpm: number;
  respiration_rate: number;
  bp_systolic: number;
  bp_diastolic: number;
  oxygen_saturation: number;
  symptoms: string;
  pain_level: number;
  symptom_severity_weight: number;
  consciousness: string;
  duration_of_symptoms_hrs: number;
  comorbidities: string;
  urgency_score: number;
  urgency_color: 'Green' | 'Yellow' | 'Red';
  recommended_drugs: string;
  patient_actions_during_symptoms: string;
  patient_actions_after_drug: string;
  estimated_recovery_time_hrs: number;
  follow_up_reminder_flag: string;
  ai_recommendation_text: string;
  triage_ai_summary: string;
  pregnancy_status?: boolean;
}

export type UrgencyColor = 'Green' | 'Yellow' | 'Red';

export interface PatientInput {
  patient_id: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  pregnancy_status: boolean;
  temperature_F: string;
  heart_rate_bpm: string;
  oxygen_saturation: string;
  bp_systolic: string;
  bp_diastolic: string;
  respiration_rate: string;
  symptoms: string[];
  consciousness: 'Alert' | 'Semi-conscious' | 'Unconscious' | '';
  comorbidities: string[];
}
