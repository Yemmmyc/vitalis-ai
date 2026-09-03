import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { MedicationWidget } from './components/MedicationWidget.tsx';
import { VitalsWidget } from './components/VitalsWidget.tsx';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';
import { PillScannerModal } from './components/PillScannerModal.tsx';
import { CaregiverPortalModal } from './components/CaregiverPortalModal.tsx';
import { DeveloperInspector } from './components/DeveloperInspector.tsx';
import { PatientProfile, CaregiverAlert, MCPLogEntry } from './types.js';

export const App: React.FC = () => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [alerts, setAlerts] = useState<CaregiverAlert[]>([]);
  const [logs, setLogs] = useState<MCPLogEntry[]>([]);
  const [serverStatus, setServerStatus] = useState<any>(null);

  // Modals & Drawers
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCaregiverOpen, setIsCaregiverOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Fetch initial patient state and alerts
  const fetchData = async () => {
    try {
      const [ptRes, alertRes, healthRes] = await Promise.all([
        fetch('/api/patient'),
        fetch('/api/alerts'),
        fetch('/health')
      ]);

      if (ptRes.ok) setPatient(await ptRes.json());
      if (alertRes.ok) setAlerts(await alertRes.json());
      if (healthRes.ok) setServerStatus(await healthRes.json());
    } catch (err) {
      console.error("Error fetching state:", err);
    }
  };

  useEffect(() => {
    fetchData();

    // Connect to Server-Sent Events (SSE) Streamable HTTP
    const eventSource = new EventSource('/sse');

    eventSource.addEventListener('connected', (e: any) => {
      const data = JSON.parse(e.data);
      addLog('event', 'SSE Connected', data);
    });

    eventSource.addEventListener('mcp:request', (e: any) => {
      const data = JSON.parse(e.data);
      addLog('request', data.method, data);
    });

    eventSource.addEventListener('mcp:response', (e: any) => {
      const data = JSON.parse(e.data);
      addLog('response', data.method, data, data.latencyMs);
    });

    eventSource.addEventListener('tool:executed', (e: any) => {
      const data = JSON.parse(e.data);
      addLog('event', `Tool Executed: ${data.toolName}`, data);
      fetchData(); // Sync UI
    });

    eventSource.addEventListener('agent:turn', (e: any) => {
      fetchData(); // Sync UI
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const addLog = (type: 'request' | 'response' | 'event', title?: string, payload?: any, latencyMs?: number) => {
    const newEntry: MCPLogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      type,
      method: title,
      payload,
      latencyMs
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  // User takes dose
  const handleTakeDose = async (medId: string) => {
    try {
      const res = await fetch('/tools/log_medication_dose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pt-88219',
          medicationId: medId,
          status: 'taken',
          notes: 'Taken via Echo Show interface'
        })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add water
  const handleAddWater = () => {
    if (!patient) return;
    setPatient({
      ...patient,
      vitals: {
        ...patient.vitals,
        hydrationGlasses: Math.min(8, patient.vitals.hydrationGlasses + 1)
      }
    });
  };

  // Voice Chat
  const handleSendMessage = async (msg: string) => {
    setIsThinking(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, patientId: 'pt-88219' })
      });
      const data = await res.json();
      await fetchData();
      return {
        spokenResponse: data.spokenResponse,
        toolExecutions: data.toolExecutions
      };
    } catch (err) {
      console.error(err);
      return {
        spokenResponse: "I encountered a brief connection issue, Eleanor, but I am right here with you.",
        toolExecutions: []
      };
    } finally {
      setIsThinking(false);
    }
  };

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Echo Show Ambient Header */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenCaregiver={() => setIsCaregiverOpen(true)}
        onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
        unreadAlertsCount={unreadAlerts}
      />

      {/* Main Smart Display Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Assistant & Active Dialogue */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <VoiceAssistant onSendMessage={handleSendMessage} isThinking={isThinking} />
          <MedicationWidget patient={patient} onTakeDose={handleTakeDose} />
        </div>

        {/* Right Column: Vitals Telemetry & Quick Action Hub */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <VitalsWidget patient={patient} onAddWater={handleAddWater} />

          {/* Quick Hardware / Feature Banner */}
          <div className="glass-card rounded-3xl p-6 border border-sky-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">Alexa+ Innovation Highlights</span>
              <span className="text-[11px] text-slate-400">Streamable HTTP MCP</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Vitalis AI demonstrates how Alexa+ transforms from reactive speakers into proactive clinical advocates using open Model Context Protocol tools and Amazon Bedrock multi-agent reasoning.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-all"
              >
                Launch Pill Camera
              </button>
              <button
                onClick={() => setIsCaregiverOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
              >
                Caregiver Alerts ({alerts.length})
              </button>
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
              >
                Inspect Live JSON-RPC
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <PillScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={() => fetchData()}
      />

      <CaregiverPortalModal
        isOpen={isCaregiverOpen}
        onClose={() => setIsCaregiverOpen(false)}
        alerts={alerts}
        patient={patient}
      />

      <DeveloperInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        logs={logs}
        serverStatus={serverStatus}
      />
    </div>
  );
};

export default App;
