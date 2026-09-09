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

      const timeOfDay = args.timeOfDay || "all";

      const matchesTimeOfDay = (med: any): boolean => {
        if (timeOfDay === "all") {
          return true;
        }

        return med.scheduledTimes.some((time: string) => {
          const hourMatch = time.match(/^(\d{1,2}):/);

          if (!hourMatch) {
            return false;
          }

          let hour = Number(hourMatch[1]);

          if (time.toUpperCase().includes("PM") && hour !== 12) {
            hour += 12;
          }

          if (time.toUpperCase().includes("AM") && hour === 12) {
            hour = 0;
          }

          switch (timeOfDay) {
            case "morning":
              return hour >= 5 && hour < 12;
            case "afternoon":
              return hour >= 12 && hour < 17;
            case "evening":
              return hour >= 17 && hour < 21;
            case "bedtime":
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
      const patient = store.getPatient();
      const med = store.getMedicationById(args.medicationId);

      if (!med) {
        return {
          success: false,
          error: `Medication '${args.medicationId}' not found in active prescription list.`
        };
      }

      if (args.status === "taken") {
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
          urgency: "INFO",
          title: `Medication Taken: ${med.name}`,
          message: `${patient.preferredName} took ${med.name} (${med.dosage}) at ${new Date().toLocaleTimeString()}. ${args.notes ? "Note: " + args.notes : ""}`,
          suggestedAction: "No action required. Adherence streak incremented."
        });

        return {
          success: true,
          status: "taken",
          medicationName: med.name,
          dosage: med.dosage,
          takenTimestamp: med.lastTakenTimestamp,
          currentStreak: patient.streakDays,
          newAdherenceRate: `${patient.adherenceRate}%`,
          message: `Great job, ${patient.preferredName}! You have successfully taken your ${med.name} ${med.dosage}. Your adherence streak is now ${patient.streakDays} days.`
        };
      }

      if (args.status === "skipped") {
        if (patient.emergencyContact.notifyOnMissedDose) {
          store.addAlert({
            patientId: patient.id,
            patientName: patient.fullName,
            urgency: "WARNING",
            title: `Medication Skipped: ${med.name}`,
            message: `${patient.preferredName} reported skipping ${med.name} (${med.dosage}). ${args.notes ? "Note: " + args.notes : ""}`,
            suggestedAction: "Caregiver should follow up regarding the missed dose."
          });
        }

        return {
          success: true,
          status: "skipped",
          medicationName: med.name,
          dosage: med.dosage,
          takenToday: med.takenToday,
          currentStreak: patient.streakDays,
          newAdherenceRate: `${patient.adherenceRate}%`,
          message: `${patient.preferredName}, your ${med.name} ${med.dosage} has been recorded as skipped. Your medication was not marked as taken.`
        };
      }

      if (args.status === "delayed") {
        store.addAlert({
          patientId: patient.id,
          patientName: patient.fullName,
          urgency: "INFO",
          title: `Medication Delayed: ${med.name}`,
          message: `${patient.preferredName} reported delaying ${med.name} (${med.dosage}). ${args.notes ? "Note: " + args.notes : ""}`,
          suggestedAction: "Follow the prescribed medication instructions and record the dose when taken."
        });

        return {
          success: true,
          status: "delayed",
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
  }
];
