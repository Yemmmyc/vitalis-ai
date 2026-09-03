import { PatientStore } from "../data/patient-store.js";

export const medicationTools = [
  {
    name: "check_medication_schedule",
    description: "Retrieves the patient's daily medication schedule, dosage instructions, adherence status, and current streak.",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "Unique identifier for the patient (e.g. 'pt-88219')"
        },
        timeOfDay: {
          type: "string",
          enum: ["all", "morning", "afternoon", "evening", "bedtime"],
          description: "Optional filter for a specific segment of the day"
        }
      },
      required: ["patientId"]
    },
    handler: async (args: any) => {
      const store = PatientStore.getInstance();
      const patient = store.getPatient();
      const pendingMeds = patient.medications.filter(m => !m.takenToday);
      const takenMeds = patient.medications.filter(m => m.takenToday);

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
        recommendation: pendingMeds.length > 0 
          ? `Patient has ${pendingMeds.length} pending medication(s) to take: ${pendingMeds.map(m => m.name).join(", ")}.`
          : "All scheduled medications for today have been successfully taken!"
      };
    }
  },
  {
    name: "log_medication_dose",
    description: "Logs that a patient has taken, skipped, or delayed a specific scheduled medication dosage.",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "Unique identifier for the patient"
        },
        medicationId: {
          type: "string",
          description: "Medication ID (e.g. 'med-01' or name like 'Lisinopril')"
        },
        status: {
          type: "string",
          enum: ["taken", "skipped", "delayed"],
          description: "Action status of the dose"
        },
        notes: {
          type: "string",
          description: "Optional notes from patient (e.g. 'took after oatmeal')"
        }
      },
      required: ["patientId", "medicationId", "status"]
    },
    handler: async (args: any) => {
      const store = PatientStore.getInstance();
      const med = store.markMedicationTaken(args.medicationId);
      const patient = store.getPatient();

      if (!med) {
        return {
          success: false,
          error: `Medication '${args.medicationId}' not found in active prescription list.`
        };
      }

      // Log an info alert for caregiver visibility
      store.addAlert({
        patientId: patient.id,
        patientName: patient.fullName,
        urgency: "INFO",
        title: `Medication Taken: ${med.name}`,
        message: `${patient.preferredName} took ${med.name} (${med.dosage}) at ${new Date().toLocaleTimeString()}. ${args.notes ? 'Note: ' + args.notes : ''}`,
        suggestedAction: "No action required. Adherence streak incremented."
      });

      return {
        success: true,
        medicationName: med.name,
        dosage: med.dosage,
        takenTimestamp: med.lastTakenTimestamp,
        currentStreak: patient.streakDays,
        newAdherenceRate: `${patient.adherenceRate}%`,
        message: `Great job, ${patient.preferredName}! You have successfully taken your ${med.name} ${med.dosage}. Your adherence streak is now ${patient.streakDays} days.`
      };
    }
  }
];
