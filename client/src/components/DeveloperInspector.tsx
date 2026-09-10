import React, { useState } from 'react';
import { X, Code, Terminal, Zap, ShieldCheck, RefreshCw, Cpu, Layers } from 'lucide-react';
import { MCPLogEntry } from '../types.js';

interface DeveloperInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  logs: MCPLogEntry[];
  serverStatus: any;
}

export const DeveloperInspector: React.FC<DeveloperInspectorProps> = ({
  isOpen,
  onClose,
  logs,
  serverStatus
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'tools' | 'arch'>('events');

  if (!isOpen) return null;

  const toolsList = [
    { name: "check_medication_schedule", desc: "Lookup daily prescriptions and adherence streak" },
    { name: "log_medication_dose", desc: "Updates patient medication record and streaks" },
    { name: "verify_pill_bottle_vision", desc: "Multimodal Bedrock computer vision bottle inspection" },
    { name: "evaluate_health_symptoms", desc: "Clinical symptom triage & red flag escalation" },
    { name: "dispatch_caregiver_alert", desc: "Real-time caregiver alert push via webhooks" },
    { name: "get_daily_vital_summary", desc: "BP, glucose, heart rate, hydration telemetry" }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Alexa+ MCP Inspector</h3>
            <p className="text-xs text-slate-400 font-mono">Spec 2025-11-25 • Streamable HTTP</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Badges / Diagnostics */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b border-slate-800/80 bg-slate-900/30 text-xs">
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Transport</span>
          <span className="font-semibold text-emerald-400 font-mono">Streamable HTTP / SSE</span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">AI Core</span>
          <span className="font-semibold text-sky-400 font-mono">Amazon Bedrock</span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Tools Active</span>
          <span className="font-semibold text-amber-400 font-mono">{toolsList.length} MCP Tools</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 px-4 pt-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'events'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Dashboard Telemetry ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'tools'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Registered Tools ({toolsList.length})
        </button>
        <button
          onClick={() => setActiveTab('arch')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'arch'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Hackathon Tech Specs
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {activeTab === 'events' && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Awaiting MCP JSON-RPC 2.0 requests or tool calls...</p>
                <p className="text-[11px] mt-1">Speak into Alexa or take a dose to see telemetry.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-slate-700"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-sky-400 font-bold">{log.type.toUpperCase()}</span>
                    {log.latencyMs !== undefined && (
                      <span className="text-emerald-400 font-semibold">{log.latencyMs}ms</span>
                    )}
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre className="bg-slate-950 p-2.5 rounded-lg overflow-x-auto text-[11px] text-slate-300 border border-slate-800">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-2.5">
            {toolsList.map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300">{t.name}</span>
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
                    Tool
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1 font-sans">{t.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'arch' && (
          <div className="space-y-4 font-sans text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white mb-2">Alexa+ Open Protocol Compliance</h4>
              <p>
                Vitalis AI implements a self-hosted Model Context Protocol (MCP) server matching spec version <strong>2025-11-25</strong>. It utilizes Streamable HTTP with Server-Sent Events (SSE) for sub-50ms tool execution and bi-directional notifications.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white mb-2">Amazon Bedrock Integration</h4>
              <p>
                Powered by Amazon Bedrock (Claude 3.5 Sonnet / AWS Nova) for multimodal pill label OCR verification, allergy safety validation, and clinical triage decisioning.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
