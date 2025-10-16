
import { Patient, PatientInput, UrgencyColor } from '../types';
import { generateTriageSummaryAndRecommendation } from './geminiService';

export const runTriage = async (input: PatientInput): Promise<Omit<Patient, 'id' | 'submission_timestamp' | 'status'>> => {
    let score = 0;

    // Rule-based scoring from the provided logic
    if (input.symptoms.includes('chest pain')) score += 4;
    if (input.symptoms.includes('shortness of breath')) score += 4;
    if (parseFloat(input.temperature_F) > 101) score += 2;
    if (parseInt(input.oxygen_saturation) < 90) score += 3;
    if (parseInt(input.heart_rate_bpm) > 120) score += 2;
    if (parseInt(input.respiration_rate) > 24) score += 2;
    if (input.consciousness === 'Unconscious') score += 5;
    if (input.consciousness === 'Semi-conscious') score += 3;
    if (parseInt(input.age) > 65) score += 2;
    if (input.comorbidities.length > 0 && input.comorbidities[0] !== 'none') score += 2;
    
    let color: UrgencyColor;
    if (score >= 8) {
        color = 'Red';
    } else if (score >= 4) {
        color = 'Yellow';
    } else {
        color = 'Green';
    }

    const { recommendation, summary } = await generateTriageSummaryAndRecommendation(input, score, color);
    
    // Create a complete patient object. Some fields are placeholders as they aren't in the form.
    const newPatient: Omit<Patient, 'id' | 'submission_timestamp' | 'status'> = {
        patient_id: input.patient_id,
        age: parseInt(input.age) || 0,
        gender: input.gender || 'Other',
        temperature_F: parseFloat(input.temperature_F) || 0,
        heart_rate_bpm: parseInt(input.heart_rate_bpm) || 0,
        respiration_rate: parseInt(input.respiration_rate) || 0,
        bp_systolic: parseInt(input.bp_systolic) || 0,
        bp_diastolic: parseInt(input.bp_diastolic) || 0,
        oxygen_saturation: parseInt(input.oxygen_saturation) || 0,
        symptoms: input.symptoms.join(', '),
        pain_level: 0, 
        symptom_severity_weight: 0, 
        consciousness: input.consciousness || 'Alert',
        duration_of_symptoms_hrs: 1,
        comorbidities: input.comorbidities.join(', '),
        urgency_score: score,
        urgency_color: color,
        recommended_drugs: "AI will provide initial recommendations.",
        patient_actions_during_symptoms: "Follow AI guidance and seek professional medical advice.",
        patient_actions_after_drug: "Monitor for changes and report to healthcare provider.",
        estimated_recovery_time_hrs: 24, 
        follow_up_reminder_flag: "Follow up based on AI recommendation and clinical assessment.",
        ai_recommendation_text: recommendation,
        triage_ai_summary: summary,
        ...(input.pregnancy_status !== undefined && { pregnancy_status: input.pregnancy_status }),
    };

    return newPatient;
};
