import { InAppPatientStore } from './patient-store';
import { BedrockEmulator } from './bedrock-emulator';

export async function executeMCPTool(toolName: string, args: any): Promise<any> {
  const store = InAppPatientStore.getInstance();
  const patient = store.getPatient();
  const bedrock = BedrockEmulator.getInstance();

  switch (toolName) {
    case 'check_medication_schedule': {
      const timeOfDay = args.timeOfDay || 'all';

      const matchesTimeOfDay = (med: any): boolean => {
        if (timeOfDay === 'all') return true;

        return med.scheduledTimes.some((time: string) => {
          const hourMatch = time.match(/^(\d{1,2}):/);
          if (!hourMatch) return false;

          let hour = Number(hourMatch[1]);
          if (time.toUpperCase().includes('PM') && hour !== 12) hour += 12;
          if (time.toUpperCase().includes('AM') && hour === 12) hour = 0;

          switch (timeOfDay) {
            case 'morning':
              return hour >= 5 && hour < 12;
            case 'afternoon':
              return hour >= 12 && hour < 17;
            case 'evening':
              return hour >= 17 && hour < 21;
            case 'bedtime':
              return hour >= 21 || hour < 5;
            default:
              return false;
          }
        });
      };

      const scheduledMeds = patient.medications.filter(matchesTimeOfDay);
      const pendingMeds = scheduledMeds.filter(m => !m.takenToday);
      const takenMeds = scheduledMeds.filter(m => m.takenToday);

      return {
        patientName: patient.fullName,
        preferredName: patient.preferredName,
        adherenceRate: `${patient.adherenceRate}%`,
        streakDays: patient.streakDays,
        totalMedications: patient.medications.length,
        pendingDoses: pendingMeds.map(m => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          scheduledTimes: m.scheduledTimes,
          instructions: m.instructions,
          warnings: m.warnings
        })),
        completedDoses: takenMeds.map(m => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          lastTakenTimestamp: m.lastTakenTimestamp
        })),
        recommendation:
          pendingMeds.length > 0
            ? `Patient has ${pendingMeds.length} pending medication(s) to take: ${pendingMeds.map(m => m.name).join(', ')}.`
            : 'All scheduled medications for today have been successfully taken!'
      };
    }

    case 'log_medication_dose': {
      const med = store.getMedicationById(args.medicationId);
      if (!med) {
        return {
          success: false,
          error: `Medication '${args.medicationId}' not found in active prescription list.`
        };
      }

      if (args.status === 'taken') {
        const updatedMed = store.markMedicationTaken(args.medicationId);
        if (!updatedMed) {
          return {
            success: false,
            error: `Medication '${args.medicationId}' could not be marked as taken.`
          };
        }

        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: 'INFO',
          title: `Medication Taken: ${med.name}`,
          message: `${patient.preferredName} took ${med.name} (${med.dosage}) at ${new Date().toLocaleTimeString()}. ${args.notes ? 'Note: ' + args.notes : ''}`,
          suggestedAction: 'No action required. Adherence streak incremented.'
        });

        return {
          success: true,
          status: 'taken',
          medicationName: med.name,
          dosage: med.dosage,
          takenTimestamp: med.lastTakenTimestamp,
          currentStreak: patient.streakDays,
          newAdherenceRate: `${patient.adherenceRate}%`,
          message: `Great job, ${patient.preferredName}! You have successfully taken your ${med.name} ${med.dosage}. Your adherence streak is now ${patient.streakDays} days.`
        };
      }

      if (args.status === 'skipped') {
        if (patient.emergencyContact.notifyOnMissedDose) {
          store.addAlert({
            patientId: patient.id,
            patientName: patient.fullName,
            urgency: 'WARNING',
            title: `Medication Skipped: ${med.name}`,
            message: `${patient.preferredName} reported skipping ${med.name} (${med.dosage}). ${args.notes ? 'Note: ' + args.notes : ''}`,
            suggestedAction: 'Caregiver should follow up regarding the missed dose.'
          });
        }

        return {
          success: true,
          status: 'skipped',
          medicationName: med.name,
          dosage: med.dosage,
          takenToday: med.takenToday,
          currentStreak: patient.streakDays,
          newAdherenceRate: `${patient.adherenceRate}%`,
          message: `${patient.preferredName}, your ${med.name} ${med.dosage} has been recorded as skipped. Your medication was not marked as taken.`
        };
      }

      if (args.status === 'delayed') {
        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: 'INFO',
          title: `Medication Delayed: ${med.name}`,
          message: `${patient.preferredName} reported delaying ${med.name} (${med.dosage}). ${args.notes ? 'Note: ' + args.notes : ''}`,
          suggestedAction: 'Follow the prescribed medication instructions and record the dose when taken.'
        });

        return {
          success: true,
          status: 'delayed',
          medicationName: med.name,
          dosage: med.dosage,
          takenToday: med.takenToday,
          currentStreak: patient.streakDays,
          newAdherenceRate: `${patient.adherenceRate}%`,
          message: `${patient.preferredName}, your ${med.name} ${med.dosage} has been recorded as delayed. It has not been marked as taken yet.`
        };
      }

      return {
        success: false,
        error: `Unsupported medication status: ${args.status}`
      };
    }

    case 'verify_pill_bottle_vision': {
      const preset = args.samplePillPreset || 'lisinopril_20mg';

      let analysisResult = {
        detectedDrug: 'Lisinopril',
        detectedDosage: '20 mg',
        detectedRxNumber: 'RX-4910284',
        detectedPatient: 'Eleanor Ruth Vance',
        expirationDate: '2027-08-15',
        confidence: 0.985,
        matchStatus: 'VERIFIED_SAFE',
        safetyWarning: 'Take with a full glass of water. Avoid potassium-rich substitutes.',
        isPrescribed: true,
        isExpired: false,
        allergyWarning: false,
        recommendation: "Safe to take. This matches Eleanor's morning prescription for hypertension."
      };

      if (preset === 'metformin_500mg') {
        analysisResult = {
          detectedDrug: 'Metformin ER',
          detectedDosage: '500 mg',
          detectedRxNumber: 'RX-8274011',
          detectedPatient: 'Eleanor Ruth Vance',
          expirationDate: '2027-11-20',
          confidence: 0.978,
          matchStatus: 'VERIFIED_SAFE',
          safetyWarning: 'Take immediately following a meal to avoid gastrointestinal upset.',
          isPrescribed: true,
          isExpired: false,
          allergyWarning: false,
          recommendation: 'Safe to take. Remember to eat a meal first.'
        };
      } else if (preset === 'atorvastatin_40mg') {
        analysisResult = {
          detectedDrug: 'Atorvastatin Calcium',
          detectedDosage: '40 mg',
          detectedRxNumber: 'RX-1948204',
          detectedPatient: 'Eleanor Ruth Vance',
          expirationDate: '2027-04-10',
          confidence: 0.991,
          matchStatus: 'VERIFIED_SAFE',
          safetyWarning: 'Take in the evening before bed. Avoid grapefruit juice.',
          isPrescribed: true,
          isExpired: false,
          allergyWarning: false,
          recommendation: 'Safe to take before bedtime.'
        };
      } else if (preset === 'penicillin_mismatch') {
        analysisResult = {
          detectedDrug: 'Amoxicillin / Penicillin V',
          detectedDosage: '500 mg',
          detectedRxNumber: 'RX-9921400',
          detectedPatient: 'Eleanor Ruth Vance',
          expirationDate: '2026-12-01',
          confidence: 0.995,
          matchStatus: 'CRITICAL_ALLERGY_ALERT',
          safetyWarning: 'PATIENT ALLERGY: Eleanor is severely allergic to Penicillin compounds.',
          isPrescribed: false,
          isExpired: false,
          allergyWarning: true,
          recommendation: 'DO NOT TAKE! This bottle contains Penicillin, which Eleanor is allergic to. An immediate caregiver alert has been dispatched.'
        };

        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: 'EMERGENCY',
          title: 'Allergy Alert: Penicillin Bottle Scanned',
          message: 'Eleanor held up a bottle of Amoxicillin / Penicillin to the camera. Vitalis AI blocked administration due to documented Penicillin allergy.',
          suggestedAction: 'Contact Eleanor immediately and ensure she does not ingest this medication.'
        });
      } else if (preset === 'expired_aspirin') {
        analysisResult = {
          detectedDrug: 'Enteric Coated Aspirin',
          detectedDosage: '81 mg',
          detectedRxNumber: 'OTC-00219',
          detectedPatient: 'Over The Counter',
          expirationDate: '2023-01-15',
          confidence: 0.962,
          matchStatus: 'EXPIRED_MEDICATION',
          safetyWarning: 'Medication expired over 3 years ago.',
          isPrescribed: false,
          isExpired: true,
          allergyWarning: false,
          recommendation: 'DO NOT TAKE. This medication has expired and should be safely disposed of.'
        };

        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: 'WARNING',
          title: 'Expired Medication Detected',
          message: 'Eleanor scanned an expired bottle of Aspirin (expired Jan 2023).',
          suggestedAction: 'Help Eleanor discard expired medications during next visit.'
        });
      }

      return {
        timestamp: new Date().toISOString(),
        visionEngine: 'Vitalis AI Pill Verification Simulator',
        simulationMode: true,
        ...analysisResult
      };
    }

    case 'evaluate_health_symptoms': {
      const symptoms = (args.reportedSymptoms || '').toLowerCase();
      const isRedFlag =
        symptoms.includes('chest pain') ||
        symptoms.includes('cannot breathe') ||
        symptoms.includes('difficulty breathing') ||
        symptoms.includes('slurred speech') ||
        symptoms.includes('face drooping') ||
        symptoms.includes('weakness on one side') ||
        (symptoms.includes('severe dizziness') && symptoms.includes('fall'));

      let triageLevel: 'EMERGENCY' | 'URGENT' | 'MONITOR' | 'MILD' = 'MILD';
      let immediateGuidance = '';

      if (isRedFlag) {
        triageLevel = 'EMERGENCY';
        immediateGuidance =
          'EMERGENCY PROTOCOL ACTIVATED: High risk of acute cardiovascular or neurological event. 911 dispatch recommendation and emergency caregiver dispatch.';

        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: 'EMERGENCY',
          title: '🚨 RED FLAG SYMPTOM: Potential Emergency',
          message: `Eleanor reported acute symptoms: "${args.reportedSymptoms}". High risk identified.`,
          suggestedAction: 'Call Eleanor immediately or dial emergency services (911).'
        });
      } else if (symptoms.includes('dizzy') || symptoms.includes('nause') || symptoms.includes('headache')) {
        triageLevel = 'URGENT';
        immediateGuidance =
          'Patient advised to sit or lie down. Hydration check recommended. Monitoring blood pressure.';

        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: 'WARNING',
          title: 'Moderate Symptom Alert: Dizziness/Discomfort',
          message: `Eleanor reported: "${args.reportedSymptoms}". Advised to sit down and hydrate.`,
          suggestedAction: 'Check in with Eleanor via video call or phone.'
        });
      } else {
        triageLevel = 'MONITOR';
        immediateGuidance =
          'Symptoms appear mild. Comfort measures advised. Will re-evaluate in 60 minutes.';
      }

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

    case 'dispatch_caregiver_alert': {
      const newAlert = store.addAlert({
        patientId: patient.id,
        patientName: patient.fullName,
        urgency: args.urgency,
        title: args.title,
        message: args.message,
        suggestedAction: args.suggestedAction || "Review Eleanor's dashboard."
      });

      return {
        success: true,
        alertId: newAlert.id,
        dispatchedTo: [
          {
            name: patient.emergencyContact.name,
            relationship: patient.emergencyContact.relationship,
            phone: patient.emergencyContact.phone,
            channel: 'Caregiver Portal Simulation'
          }
        ],
        timestamp: newAlert.timestamp,
        status: 'RECORDED_IN_CAREGIVER_PORTAL'
      };
    }

    case 'get_daily_vital_summary': {
      return {
        patientName: patient.fullName,
        vitals: patient.vitals,
        status: 'Normal ranges maintained for age and chronic condition profile.'
      };
    }

    default:
      throw new Error(`Tool '${toolName}' not found in in-app tool execution engine.`);
  }
}
