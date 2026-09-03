export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  instructions: string;
  prescribingDoctor: string;
  rxNumber: string;
  refillsRemaining: number;
  warnings: string[];
  color: string;
  shape: string;
  takenToday: boolean;
  lastTakenTimestamp?: string;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  preferredName: string;
  age: number;
  conditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    notifyOnMissedDose: boolean;
    notifyOnRedFlags: boolean;
  };
  medications: Medication[];
  adherenceRate: number;
  streakDays: number;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    bloodGlucose: number;
    hydrationGlasses: number;
    sleepHours: number;
    lastUpdated: string;
  };
}

export interface CaregiverAlert {
  id: string;
  timestamp: string;
  patientId: string;
  patientName: string;
  urgency: 'INFO' | 'WARNING' | 'URGENT' | 'EMERGENCY';
  title: string;
  message: string;
  suggestedAction: string;
  read: boolean;
}

export interface MCPLogEntry {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'event';
  method?: string;
  toolName?: string;
  latencyMs?: number;
  payload: any;
}
