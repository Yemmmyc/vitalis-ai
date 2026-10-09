import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { MedicationWidget } from './components/MedicationWidget.tsx';
import { VitalsWidget } from './components/VitalsWidget.tsx';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';
import { PillScannerModal } from './components/PillScannerModal.tsx';
import { CaregiverPortalModal } from './components/CaregiverPortalModal.tsx';
import { DeveloperInspector } from './components/DeveloperInspector.tsx';
import { PatientProfile, CaregiverAlert, MCPLogEntry } from './types.js';
import { VitalisServiceFactory } from './services/VitalisServiceFactory.ts';

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
      const service = VitalisServiceFactory.getService();
      const [ptData, alertData, healthData] = await Promise.all([
        service.getPatient(),
        service.getAlerts(),
        service.getHealth()
      ]);

      setPatient(ptData);
      setAlerts(alertData);
      setServerStatus(healthData);
    } catch (err) {
      console.error("Error fetching state:", err);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to telemetry stream (SSE on Web, In-Memory TelemetryBus on Mobile)
    const service = VitalisServiceFactory.getService();
    const unsubscribe = service.subscribeTelemetry((logEntry) => {
      setLogs((prev) => [logEntry, ...prev.slice(0, 49)]);

      if (
        logEntry.method?.includes('Tool Executed') ||
        logEntry.method === 'agent:turn' ||
        logEntry.type === 'response'
      ) {
        fetchData(); // Sync UI
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // User takes dose
  const handleTakeDose = async (medId: string) => {
    try {
      const service = VitalisServiceFactory.getService();
      await service.logDose(medId);
      await fetchData();
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
      const service = VitalisServiceFactory.getService();
      const res = await service.sendMessage(msg);
      await fetchData();
      return {
        spokenResponse: res.spokenResponse,
        toolExecutions: res.toolExecutions || []
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 max-w-full overflow-x-hidden pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Left Column: Voice Assistant & Active Dialogue */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6">
          <VoiceAssistant onSendMessage={handleSendMessage} isThinking={isThinking} />
          <MedicationWidget patient={patient} onTakeDose={handleTakeDose} />
        </div>

        {/* Right Column: Vitals Telemetry & Quick Action Hub */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
          <VitalsWidget patient={patient} onAddWater={handleAddWater} />

          {/* Quick Hardware / Feature Banner */}
          <div className="glass-card rounded-3xl p-4 sm:p-6 border border-sky-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-sky-400 tracking-wider uppercase">Alexa+ Innovation Highlights</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Streamable HTTP MCP</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Vitalis AI demonstrates how Alexa+ can support proactive care coordination using open Model Context Protocol tools and Amazon Bedrock conversational responses.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-all active:scale-95"
              >
                Launch Pill Camera
              </button>
              <button
                onClick={() => setIsCaregiverOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all active:scale-95"
              >
                Caregiver Alerts ({alerts.length})
              </button>
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all active:scale-95"
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
