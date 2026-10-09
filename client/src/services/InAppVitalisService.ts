import { IVitalisService, HealthStatus, ChatResponse, DoseLogResult, PillVisionResult } from './IVitalisService';
import { PatientProfile, CaregiverAlert, MCPLogEntry } from '../types';
import { InAppPatientStore } from './core/patient-store';
import { BedrockEmulator } from './core/bedrock-emulator';
import { TelemetryBus } from './core/telemetry-bus';
import { executeMCPTool } from './core/tools';
import { processAgentChat } from './core/agent-orchestrator';

export class InAppVitalisService implements IVitalisService {
  private store = InAppPatientStore.getInstance();
  private bedrock = BedrockEmulator.getInstance();
  private telemetry = TelemetryBus.getInstance();
  private startTime = Date.now();

  public async getPatient(): Promise<PatientProfile> {
    return JSON.parse(JSON.stringify(this.store.getPatient()));
  }

  public async getAlerts(): Promise<CaregiverAlert[]> {
    return JSON.parse(JSON.stringify(this.store.getAlerts()));
  }

  public async getHealth(): Promise<HealthStatus> {
    return {
      status: "healthy",
      service: "vitalis-mobile-inapp-engine",
      mcpSpecVersion: "2025-11-25",
      transport: "In-App Standalone Memory",
      toolsCount: 6,
      bedrock: this.bedrock.getStatus(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString()
    };
  }

  public async sendMessage(message: string, patientId: string = "pt-88219"): Promise<ChatResponse> {
    return await processAgentChat(message, patientId);
  }

  public async logDose(
    medicationId: string,
    patientId: string = "pt-88219",
    status: 'taken' | 'skipped' | 'delayed' = 'taken',
    notes: string = "Logged via In-App Interface"
  ): Promise<DoseLogResult> {
    const startTime = Date.now();
    const args = { patientId, medicationId, status, notes };

    this.telemetry.emit({
      type: 'request',
      method: 'tools/call',
      payload: { name: 'log_medication_dose', arguments: args }
    });

    const result = await executeMCPTool('log_medication_dose', args);

    const latencyMs = Date.now() - startTime;
    this.telemetry.emit({
      type: 'response',
      method: 'Tool Executed: log_medication_dose',
      latencyMs,
      payload: { toolName: 'log_medication_dose', args, result }
    });

    return result;
  }

  public async verifyPillBottle(
    preset: string,
    patientId: string = "pt-88219"
  ): Promise<PillVisionResult> {
    const startTime = Date.now();
    const args = { patientId, samplePillPreset: preset };

    this.telemetry.emit({
      type: 'request',
      method: 'tools/call',
      payload: { name: 'verify_pill_bottle_vision', arguments: args }
    });

    const result = await executeMCPTool('verify_pill_bottle_vision', args);

    const latencyMs = Date.now() - startTime;
    this.telemetry.emit({
      type: 'response',
      method: 'Tool Executed: verify_pill_bottle_vision',
      latencyMs,
      payload: { toolName: 'verify_pill_bottle_vision', args, result }
    });

    return result;
  }

  public subscribeTelemetry(callback: (entry: MCPLogEntry) => void): () => void {
    // Send initial connection event
    setTimeout(() => {
      callback({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'event',
        method: 'In-App Telemetry Connected',
        payload: {
          message: "Connected to Vitalis Mobile In-App Telemetry Stream",
          protocol: "2025-11-25 (Standalone APK)"
        }
      });
    }, 0);

    return this.telemetry.subscribe(callback);
  }
}
