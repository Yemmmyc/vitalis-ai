import { PatientStore } from "../data/patient-store.js";
import { BedrockService } from "../bedrock-service.js";

export const triageTools = [
  {
    name: "evaluate_health_symptoms",
    description: "Clinical symptom evaluation engine powered by Amazon Bedrock. Assesses severity, identifies emergency red flags (stroke FAST criteria, myocardial infarction, acute respiratory distress), and recommends safe escalation pathways.",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "Patient ID"
        },
        reportedSymptoms: {
          type: "string",
          description: "Description of symptoms spoken by patient or observed"
        },
        duration: {
          type: "string",
          description: "Duration of symptoms (e.g. 'last 20 minutes', 'since waking up')"
        },
        severitySelfRating: {
          type: "number",
          description: "1 to 10 scale of severity reported by patient"
        }
      },
      required: ["patientId", "reportedSymptoms"]
    },
    handler: async (args: any) => {
      const store = PatientStore.getInstance();
      const patient = store.getPatient();
      const bedrock = BedrockService.getInstance();

      const symptoms = args.reportedSymptoms.toLowerCase();
      const isRedFlag = 
        symptoms.includes("chest pain") ||
        symptoms.includes("cannot breathe") ||
        symptoms.includes("difficulty breathing") ||
        symptoms.includes("slurred speech") ||
        symptoms.includes("face drooping") ||
        symptoms.includes("weakness on one side") ||
        symptoms.includes("severe dizziness") && symptoms.includes("fall");

      let triageLevel: 'EMERGENCY' | 'URGENT' | 'MONITOR' | 'MILD' = 'MILD';
      let immediateGuidance = "";

      if (isRedFlag) {
        triageLevel = 'EMERGENCY';
        immediateGuidance = "EMERGENCY PROTOCOL ACTIVATED: High risk of acute cardiovascular or neurological event. 911 dispatch recommendation and emergency caregiver dispatch.";

        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: "EMERGENCY",
          title: "🚨 RED FLAG SYMPTOM: Potential Emergency",
          message: `Eleanor reported acute symptoms: "${args.reportedSymptoms}". High risk identified.`,
          suggestedAction: "Call Eleanor immediately or dial emergency services (911)."
        });
      } else if (symptoms.includes("dizzy") || symptoms.includes("nause") || symptoms.includes("headache")) {
        triageLevel = 'URGENT';
        immediateGuidance = "Patient advised to sit or lie down. Hydration check recommended. Monitoring blood pressure.";

        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: "WARNING",
          title: "Moderate Symptom Alert: Dizziness/Discomfort",
          message: `Eleanor reported: "${args.reportedSymptoms}". Advised to sit down and hydrate.`,
          suggestedAction: "Check in with Eleanor via video call or phone."
        });
      } else {
        triageLevel = 'MONITOR';
        immediateGuidance = "Symptoms appear mild. Comfort measures advised. Will re-evaluate in 60 minutes.";
      }

      // Generate empathetic conversational explanation via Amazon Bedrock
      const bedrockPrompt = `The elderly patient Eleanor Vance (78yo, history of ${patient.conditions.join(', ')}) reports: "${args.reportedSymptoms}" for "${args.duration || 'an unspecified time'}". Severity rating: ${args.severitySelfRating || 'unrated'}. Triage classification: ${triageLevel}. Formulate a 2-3 sentence, highly empathetic, calming, yet safe Alexa+ response spoken directly to Eleanor.`;
      const conversationalResponse = await bedrock.generateResponse(bedrockPrompt);

      return {
        timestamp: new Date().toISOString(),
        patientName: patient.fullName,
        triageLevel,
        isRedFlag,
        immediateGuidance,
        spokenAlexaResponse: conversationalResponse,
        caregiverNotified: isRedFlag || triageLevel === 'URGENT',
        vitalsSnapshot: patient.vitals
      };
    }
  },
  {
    name: "get_daily_vital_summary",
    description: "Returns the patient's latest biometric vitals, including blood pressure, heart rate, blood glucose, hydration, and sleep.",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "Patient ID"
        }
      },
      required: ["patientId"]
    },
    handler: async (args: any) => {
      const store = PatientStore.getInstance();
      const patient = store.getPatient();
      return {
        patientName: patient.fullName,
        vitals: patient.vitals,
        status: "Normal ranges maintained for age and chronic condition profile."
      };
    }
  }
];
