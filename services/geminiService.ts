import { GoogleGenAI, Type } from "@google/genai";
import { Patient, PatientInput, UrgencyColor } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateContentWithRetry = async (prompt: string, model: string = 'gemini-2.5-flash', jsonConfig: any = null) => {
  if (!API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      ...(jsonConfig && { config: jsonConfig }),
    });
    return response.text;
  } catch (error) {
    console.error(`Error generating content from Gemini (model: ${model}):`, error);
    throw new Error("Failed to generate AI response. Please check the console for details.");
  }
};


export const generateVitalsAnalysis = async (patient: Patient): Promise<string> => {
  const prompt = `
    Act as a clinical AI assistant. Analyze the following patient's vital signs and provide a brief, narrative summary for a healthcare professional.
    - Compare each vital to its normal range.
    - Highlight any abnormal readings and explain their potential significance.
    - Conclude with an overall assessment of the patient's stability based on these vitals.
    - Keep the explanation concise and to the point.

    Normal Ranges:
    - Temperature: 97.6-99.6 °F
    - Heart Rate: 60-100 bpm
    - Respiratory Rate: 12-20 /min
    - SpO2: 95-100%
    - BP Systolic: 90-120 mmHg
    - BP Diastolic: 60-80 mmHg

    Patient Vitals:
    - Temperature: ${patient.temperature_F} °F
    - Heart Rate: ${patient.heart_rate_bpm} bpm
    - Respiratory Rate: ${patient.respiration_rate} /min
    - SpO2: ${patient.oxygen_saturation} %
    - BP Systolic: ${patient.bp_systolic} mmHg
    - BP Diastolic: ${patient.bp_diastolic} mmHg

    Example Output: "The patient's heart rate is elevated at 130 bpm, placing it outside the normal range and contributing to the urgency score. All other vitals appear to be stable and within normal limits."
  `;
  try {
    return await generateContentWithRetry(prompt);
  } catch(e) {
    return (e as Error).message;
  }
};

export const generateTriageScoreExplanation = async (patient: Patient): Promise<string> => {
  const prompt = `
    Act as a clinical AI assistant. Explain how the patient's final triage score was calculated based on the provided rules.
    - List each factor that contributed points to the score.
    - State the final score and the corresponding urgency level (Green, Yellow, or Red).
    - Do not add any conversational filler. Be direct and analytical.

    Triage Scoring Rules:
    - Chest pain in symptoms: +4 points
    - Shortness of breath in symptoms: +4 points
    - Temperature > 101°F: +2 points
    - SpO2 < 90%: +3 points
    - Heart Rate > 120 bpm: +2 points
    - Respiratory Rate > 24 /min: +2 points
    - Consciousness 'Unconscious': +5 points
    - Consciousness 'Semi-conscious': +3 points
    - Age > 65: +2 points
    - Any comorbidities (if the comorbidities field is not 'none' or empty): +2 points

    Patient Data:
    - Age: ${patient.age}
    - Symptoms: ${patient.symptoms}
    - Vitals: Temp ${patient.temperature_F}°F, Heart Rate ${patient.heart_rate_bpm} bpm, SpO2 ${patient.oxygen_saturation}%, Resp. Rate ${patient.respiration_rate}/min
    - Consciousness: ${patient.consciousness}
    - Comorbidities: ${patient.comorbidities}
    - Final Urgency Score: ${patient.urgency_score} (${patient.urgency_color})

    Your task is to reverse-engineer the score based on the rules and patient data and explain it.
    Example Output: "The final score of 6 (Yellow) was calculated as follows: 4 points for 'Chest Pain' and 2 points for a Heart Rate over 120 bpm. This places the patient in the Moderate Urgency category."
  `;
  try {
    return await generateContentWithRetry(prompt);
  } catch(e) {
    return (e as Error).message;
  }
};


export const generateTriageSummaryAndRecommendation = async (
  patientInput: PatientInput, 
  urgencyScore: number, 
  urgencyColor: UrgencyColor
): Promise<{ recommendation: string; summary: string }> => {

  const prompt = `
    Based on the following patient data and triage score, generate a concise 'ai_recommendation_text' and a 'triage_ai_summary'.
    
    Patient Data:
    - Age: ${patientInput.age}
    - Gender: ${patientInput.gender}
    - Vitals: Temp ${patientInput.temperature_F}°F, Heart Rate ${patientInput.heart_rate_bpm}bpm, O2 Saturation ${patientInput.oxygen_saturation}%, BP ${patientInput.bp_systolic}/${patientInput.bp_diastolic}, Resp. Rate: ${patientInput.respiration_rate}
    - Symptoms: ${patientInput.symptoms.join(', ')}
    - Comorbidities: ${patientInput.comorbidities.join(', ')}
    - Consciousness: ${patientInput.consciousness}
    
    Triage Result:
    - Urgency: ${urgencyColor} (Score: ${urgencyScore})

    The 'recommendation' should be a user-friendly text describing the urgency and next steps.
    The 'summary' should be a single-line text for clinical dashboards, like this example: "${patientInput.patient_id}, ${patientInput.age}yo ${patientInput.gender}, ${patientInput.symptoms.join(', ')} → ${urgencyColor} (Score ${urgencyScore}). [Brief recommendation...]"
  `;

  try {
    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendation: { type: Type.STRING, description: "User-friendly text describing the urgency and next steps." },
          summary: { type: Type.STRING, description: "A single-line summary for clinical dashboards." },
        },
        required: ['recommendation', 'summary'],
      },
    };
    const jsonText = await generateContentWithRetry(prompt, 'gemini-2.5-flash', config);
    const parsed = JSON.parse(jsonText.trim());
    return parsed;
    
  } catch (error) {
    console.error("Error generating triage summary from Gemini:", error);
    return {
      recommendation: "Error generating AI summary.",
      summary: "Error generating AI summary."
    };
  }
};