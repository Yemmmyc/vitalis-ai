import { MCPLogEntry } from '../../types';

type TelemetryListener = (entry: MCPLogEntry) => void;

export class TelemetryBus {
  private static instance: TelemetryBus;
  private listeners: Set<TelemetryListener> = new Set();

  public static getInstance(): TelemetryBus {
    if (!TelemetryBus.instance) {
      TelemetryBus.instance = new TelemetryBus();
    }
    return TelemetryBus.instance;
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(entry: Omit<MCPLogEntry, 'id' | 'timestamp'> & { timestamp?: string }): MCPLogEntry {
    const fullEntry: MCPLogEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    this.listeners.forEach((fn) => {
      try {
        fn(fullEntry);
      } catch (err) {
        console.error('[TelemetryBus] Listener error:', err);
      }
    });
    return fullEntry;
  }
}
