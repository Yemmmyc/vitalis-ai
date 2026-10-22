import { IVitalisService, HealthStatus, ChatResponse, DoseLogResult, PillVisionResult } from './IVitalisService';
import { PatientProfile, CaregiverAlert, MCPLogEntry } from '../types';

export class HttpVitalisService implements IVitalisService {
  public async getPatient(): Promise<PatientProfile> {
    const res = await fetch('/api/patient');
    if (!res.ok) throw new Error('Failed to fetch patient state');
    return await res.json();
  }

  public async getAlerts(): Promise<CaregiverAlert[]> {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return await res.json();
  }

  public async getHealth(): Promise<HealthStatus> {
    const res = await fetch('/health');
    if (!res.ok) throw new Error('Failed to fetch health status');
    return await res.json();
  }

  public async sendMessage(message: string, patientId: string = "pt-88219"): Promise<ChatResponse> {
    const CHAT_TIMEOUT_MS = 25000;
    const controller = new AbortController();
    let isTimedOut = false;
    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, CHAT_TIMEOUT_MS);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, patientId }),
        signal: controller.signal
      });
      if (!res.ok) {
        throw new Error(`Server request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      if (isTimedOut || err?.name === 'AbortError') {
        const timeoutError = new Error('Request timed out after 25 seconds. The cloud server may be starting up—please try again.');
        (timeoutError as any).isTimeout = true;
        throw timeoutError;
      }
      if (err instanceof TypeError && err.message?.toLowerCase().includes('fetch')) {
        const networkError = new Error('Network connection issue. Please check your network and try again.');
        (networkError as any).isNetwork = true;
        throw networkError;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async logDose(
    medicationId: string,
    patientId: string = "pt-88219",
    status: 'taken' | 'skipped' | 'delayed' = 'taken',
    notes: string = "Taken via Echo Show interface"
  ): Promise<DoseLogResult> {
    const res = await fetch('/tools/log_medication_dose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, medicationId, status, notes })
    });
    if (!res.ok) throw new Error('Failed to log dose');
    const data = await res.json();
    return data.result || data;
  }

  public async verifyPillBottle(
    preset: string,
    patientId: string = "pt-88219"
  ): Promise<PillVisionResult> {
    const res = await fetch('/tools/verify_pill_bottle_vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, samplePillPreset: preset })
    });
    if (!res.ok) throw new Error('Failed to verify pill bottle');
    const data = await res.json();
    return data.result || data;
  }

  public subscribeTelemetry(callback: (entry: MCPLogEntry) => void): () => void {
    const eventSource = new EventSource('/sse');

    const addLog = (type: 'request' | 'response' | 'event', title?: string, payload?: any, latencyMs?: number) => {
      callback({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        type,
        method: title,
        payload,
        latencyMs
      });
    };

    const handleConnected = (e: MessageEvent) => {
      addLog('event', 'SSE Connected', JSON.parse(e.data));
    };

    const handleMcpRequest = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      addLog('request', data.method, data);
    };

    const handleMcpResponse = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      addLog('response', data.method, data, data.latencyMs);
    };

    const handleToolExecuted = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      addLog('event', `Tool Executed: ${data.toolName}`, data);
    };

    const handleAgentTurn = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      addLog('event', 'agent:turn', data);
    };

    eventSource.addEventListener('connected', handleConnected as any);
    eventSource.addEventListener('mcp:request', handleMcpRequest as any);
    eventSource.addEventListener('mcp:response', handleMcpResponse as any);
    eventSource.addEventListener('tool:executed', handleToolExecuted as any);
    eventSource.addEventListener('agent:turn', handleAgentTurn as any);

    return () => {
      eventSource.close();
    };
  }
}
