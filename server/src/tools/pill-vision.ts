import { PatientStore } from "../data/patient-store.js";
import { BedrockService } from "../bedrock-service.js";

export const pillVisionTools = [
  {
    name: "verify_pill_bottle_vision",
    description: "Simulated pill-bottle verification workflow using predefined test scenarios. Validates medication identity, dosage, prescription matching, expiration, and allergy safety rules against the patient's medication profile.",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "Patient ID"
        },
        samplePillPreset: {
          type: "string",
          enum: ["lisinopril_20mg", "metformin_500mg", "atorvastatin_40mg", "penicillin_mismatch", "expired_aspirin"],
          description: "Pre-configured verified test bottle image/metadata for instant simulation"
        },
        imageBase64: {
          type: "string",
          description: "Optional raw Base64 image captured by Echo Show camera"
        }
      },
      required: ["patientId"]
    },
    handler: async (args: any) => {
      const store = PatientStore.getInstance();
      const patient = store.getPatient();

      const preset = args.samplePillPreset || "lisinopril_20mg";

      let analysisResult = {
        detectedDrug: "Lisinopril",
        detectedDosage: "20 mg",
        detectedRxNumber: "RX-4910284",
        detectedPatient: "Eleanor Ruth Vance",
        expirationDate: "2027-08-15",
        confidence: 0.985,
        matchStatus: "VERIFIED_SAFE",
        safetyWarning: "Take with a full glass of water. Avoid potassium-rich substitutes.",
        isPrescribed: true,
        isExpired: false,
        allergyWarning: false,
        recommendation: "Safe to take. This matches Eleanor's morning prescription for hypertension."
      };

      if (preset === "metformin_500mg") {
        analysisResult = {
          detectedDrug: "Metformin ER",
          detectedDosage: "500 mg",
          detectedRxNumber: "RX-8274011",
          detectedPatient: "Eleanor Ruth Vance",
          expirationDate: "2027-11-20",
          confidence: 0.978,
          matchStatus: "VERIFIED_SAFE",
          safetyWarning: "Take immediately following a meal to avoid gastrointestinal upset.",
          isPrescribed: true,
          isExpired: false,
          allergyWarning: false,
          recommendation: "Safe to take. Remember to eat a meal first."
        };
      } else if (preset === "atorvastatin_40mg") {
        analysisResult = {
          detectedDrug: "Atorvastatin Calcium",
          detectedDosage: "40 mg",
          detectedRxNumber: "RX-1948204",
          detectedPatient: "Eleanor Ruth Vance",
          expirationDate: "2027-04-10",
          confidence: 0.991,
          matchStatus: "VERIFIED_SAFE",
          safetyWarning: "Take in the evening before bed. Avoid grapefruit juice.",
          isPrescribed: true,
          isExpired: false,
          allergyWarning: false,
          recommendation: "Safe to take before bedtime."
        };
      } else if (preset === "penicillin_mismatch") {
        analysisResult = {
          detectedDrug: "Amoxicillin / Penicillin V",
          detectedDosage: "500 mg",
          detectedRxNumber: "RX-9921400",
          detectedPatient: "Eleanor Ruth Vance",
          expirationDate: "2026-12-01",
          confidence: 0.995,
          matchStatus: "CRITICAL_ALLERGY_ALERT",
          safetyWarning: "PATIENT ALLERGY: Eleanor is severely allergic to Penicillin compounds.",
          isPrescribed: false,
          isExpired: false,
          allergyWarning: true,
          recommendation: "DO NOT TAKE! This bottle contains Penicillin, which Eleanor is allergic to. An immediate caregiver alert has been dispatched."
        };

        // Dispatch alert immediately
        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: "EMERGENCY",
          title: "Allergy Alert: Penicillin Bottle Scanned",
          message: `Eleanor held up a bottle of Amoxicillin / Penicillin to the camera. Vitalis AI blocked administration due to documented Penicillin allergy.`,
          suggestedAction: "Contact Eleanor immediately and ensure she does not ingest this medication."
        });
      } else if (preset === "expired_aspirin") {
        analysisResult = {
          detectedDrug: "Enteric Coated Aspirin",
          detectedDosage: "81 mg",
          detectedRxNumber: "OTC-00219",
          detectedPatient: "Over The Counter",
          expirationDate: "2023-01-15",
          confidence: 0.962,
          matchStatus: "EXPIRED_MEDICATION",
          safetyWarning: "Medication expired over 3 years ago.",
          isPrescribed: false,
          isExpired: true,
          allergyWarning: false,
          recommendation: "DO NOT TAKE. This medication has expired and should be safely disposed of."
        };

        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: "WARNING",
          title: "Expired Medication Detected",
          message: "Eleanor scanned an expired bottle of Aspirin (expired Jan 2023).",
          suggestedAction: "Help Eleanor discard expired medications during next visit."
        });
      }

      return {
        timestamp: new Date().toISOString(),
        visionEngine: "Vitalis AI Pill Verification Simulator",
        simulationMode: true,
        ...analysisResult
      };
    }
  }
];
