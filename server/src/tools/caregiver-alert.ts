import { PatientStore, CaregiverAlert } from "../data/patient-store.js";

export const caregiverAlertTools = [
  {
    name: "dispatch_caregiver_alert",
    description: "Escalates a real-time notification to the patient's family, nurse, or designated emergency caregiver circle.",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "Patient identifier"
        },
        urgency: {
          type: "string",
          enum: ["INFO", "WARNING", "URGENT", "EMERGENCY"],
          description: "Severity level of the notification"
        },
        title: {
          type: "string",
          description: "Brief summary heading of the notification"
        },
        message: {
          type: "string",
          description: "Detailed description of what occurred and patient status"
        },
        suggestedAction: {
          type: "string",
          description: "Specific recommendation for the caregiver"
        }
      },
      required: ["patientId", "urgency", "title", "message"]
    },
    handler: async (args: any) => {
      const store = PatientStore.getInstance();
      const patient = store.getPatient();

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
            channel: "Push Notification + SMS Fallback"
          }
        ],
        timestamp: newAlert.timestamp,
        status: "DELIVERED_TO_CAREGIVER_PORTAL"
      };
    }
  }
];
