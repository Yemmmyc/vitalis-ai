import { PatientProfile, CaregiverAlert, MCPLogEntry } from '../types';

export interface HealthStatus {
  status: string;
  service: string;
  mcpSpecVersion: string;
  transport: string;
  toolsCount: number;
  bedrock: {
    configured: boolean;
    region: string;
    modelId: string;
    mode: string;
  };
  uptimeSeconds: number;
  timestamp: string;
}

export interface ChatResponse {
  spokenResponse: string;
  toolExecutions: Array<{ tool: string; result: any }>;
  userMessage?: string;
  patientState?: PatientProfile;
  durationMs?: number;
  model?: string;
}

export interface DoseLogResult {
  success: boolean;
  status?: string;
  medicationName?: string;
  dosage?: string;
  takenTimestamp?: string;
  currentStreak?: number;
  newAdherenceRate?: string;
  message?: string;
  error?: string;
}

export interface PillVisionResult {
  detectedDrug: string;
  detectedDosage: string;
  detectedRxNumber: string;
  detectedPatient: string;
  expirationDate: string;
  confidence: number;
  matchStatus: string;
  safetyWarning: string;
  isPrescribed: boolean;
  isExpired: boolean;
  allergyWarning: boolean;
  recommendation: string;
  timestamp: string;
  visionEngine: string;
  simulationMode: boolean;
}

export interface IVitalisService {
  getPatient(): Promise<PatientProfile>;
  getAlerts(): Promise<CaregiverAlert[]>;
  getHealth(): Promise<HealthStatus>;
  sendMessage(message: string, patientId?: string): Promise<ChatResponse>;
  logDose(medicationId: string, patientId?: string, status?: 'taken' | 'skipped' | 'delayed', notes?: string): Promise<DoseLogResult>;
  verifyPillBottle(preset: string, patientId?: string): Promise<PillVisionResult>;
  subscribeTelemetry(callback: (entry: MCPLogEntry) => void): () => void;
}
