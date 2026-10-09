import { PatientProfile, Medication, CaregiverAlert } from '../../types';

export class InAppPatientStore {
  private static instance: InAppPatientStore;
  private patient: PatientProfile;
  private alerts: CaregiverAlert[] = [];

  private constructor() {
    this.patient = {
      id: "pt-88219",
      fullName: "Eleanor Ruth Vance",
      preferredName: "Eleanor",
      age: 78,
      conditions: ["Hypertension", "Type 2 Diabetes", "Mild Osteoarthritis"],
      allergies: ["Penicillin", "Sulfa Drugs"],
      emergencyContact: {
        name: "David Vance (Son)",
        relationship: "Son & Primary Caregiver",
        phone: "+1 (555) 382-9104",
        notifyOnMissedDose: true,
        notifyOnRedFlags: true
      },
      medications: [
        {
          id: "med-01",
          name: "Lisinopril",
          dosage: "20 mg",
          frequency: "Once daily (Morning)",
          scheduledTimes: ["08:00 AM"],
          instructions: "Take with a full glass of water. Avoid potassium supplements.",
          prescribingDoctor: "Dr. Robert Chen, MD (Cardiology)",
          rxNumber: "RX-4910284",
          refillsRemaining: 3,
          warnings: ["May cause dizziness upon standing", "Notify doctor if dry cough develops"],
          color: "Light Peach",
          shape: "Round tablet, debossed 'L 20'",
          takenToday: false
        },
        {
          id: "med-02",
          name: "Metformin ER",
          dosage: "500 mg",
          frequency: "Twice daily (Morning & Dinner)",
          scheduledTimes: ["08:00 AM", "06:30 PM"],
          instructions: "Take immediately following a meal to reduce stomach upset.",
          prescribingDoctor: "Dr. Sarah Jenkins, MD (Endocrinology)",
          rxNumber: "RX-8274011",
          refillsRemaining: 2,
          warnings: ["Take with meals", "Do not crush or chew extended-release tablets"],
          color: "White",
          shape: "Oval biconvex tablet",
          takenToday: false
        },
        {
          id: "med-03",
          name: "Atorvastatin Calcium",
          dosage: "40 mg",
          frequency: "Once daily at bedtime",
          scheduledTimes: ["09:00 PM"],
          instructions: "Take before bed. Avoid grapefruit and grapefruit juice.",
          prescribingDoctor: "Dr. Robert Chen, MD (Cardiology)",
          rxNumber: "RX-1948204",
          refillsRemaining: 4,
          warnings: ["Avoid grapefruit juice", "Report unexplained muscle soreness"],
          color: "White",
          shape: "Elliptical film-coated tablet",
          takenToday: false
        }
      ],
      adherenceRate: 94.2,
      streakDays: 14,
      vitals: {
        bloodPressure: "124/82 mmHg",
        heartRate: 72,
        bloodGlucose: 108,
        hydrationGlasses: 5,
        sleepHours: 7.5,
        lastUpdated: new Date().toISOString()
      }
    };

    this.alerts = [
      {
        id: "alert-001",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        patientId: this.patient.id,
        patientName: this.patient.fullName,
        urgency: "INFO",
        title: "Morning Vitals Logged",
        message: "Eleanor recorded normal blood pressure (124/82) and glucose (108 mg/dL).",
        suggestedAction: "Routine check-in scheduled for this evening.",
        read: true
      }
    ];
  }

  public static getInstance(): InAppPatientStore {
    if (!InAppPatientStore.instance) {
      InAppPatientStore.instance = new InAppPatientStore();
    }
    return InAppPatientStore.instance;
  }

  public getPatient(): PatientProfile {
    return this.patient;
  }

  public getMedicationById(id: string): Medication | undefined {
    return this.patient.medications.find(
      m => m.id === id || m.name.toLowerCase().includes(id.toLowerCase())
    );
  }

  public markMedicationTaken(medId: string): Medication | undefined {
    const med = this.getMedicationById(medId);
    if (med) {
      med.takenToday = true;
      med.lastTakenTimestamp = new Date().toISOString();
      this.patient.streakDays += 1;
      this.patient.adherenceRate = Math.min(100, +(this.patient.adherenceRate + 0.5).toFixed(1));
    }
    return med;
  }

  public resetDailyMedications(): void {
    this.patient.medications.forEach(m => m.takenToday = false);
  }

  public getAlerts(): CaregiverAlert[] {
    return [...this.alerts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addAlert(alert: Omit<CaregiverAlert, 'id' | 'timestamp' | 'read'>): CaregiverAlert {
    const newAlert: CaregiverAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  public updateVitals(vitalsUpdate: Partial<PatientProfile['vitals']>): PatientProfile['vitals'] {
    this.patient.vitals = {
      ...this.patient.vitals,
      ...vitalsUpdate,
      lastUpdated: new Date().toISOString()
    };
    return this.patient.vitals;
  }
}
