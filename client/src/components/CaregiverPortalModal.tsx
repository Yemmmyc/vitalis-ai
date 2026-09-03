import React from 'react';
import { X, Shield, Bell, AlertTriangle, AlertOctagon, Info, PhoneCall, CheckCircle2 } from 'lucide-react';
import { CaregiverAlert, PatientProfile } from '../types.js';

interface CaregiverPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: CaregiverAlert[];
  patient: PatientProfile | null;
}

export const CaregiverPortalModal: React.FC<CaregiverPortalModalProps> = ({
  isOpen,
  onClose,
  alerts,
  patient
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Caregiver Oversight Portal</h3>
              <p className="text-xs text-slate-400">Family & Care Advocate Feed • Connected to David Vance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Summary Card */}
        <div className="my-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">{patient.fullName}</span>
              <span className="text-xs text-slate-400">({patient.age} yo)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Conditions: {patient.conditions.join(', ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${patient.emergencyContact.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Primary Caregiver</span>
            </a>
          </div>
        </div>

        {/* Alert Timeline Feed */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 my-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Real-Time Telemetry & Alert Stream
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No recent alerts. Eleanor is doing great!
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.urgency === 'EMERGENCY'
                    ? 'bg-rose-500/10 border-rose-500/40 glow-red'
                    : alert.urgency === 'URGENT' || alert.urgency === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {alert.urgency === 'EMERGENCY' ? (
                    <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                  ) : alert.urgency === 'URGENT' || alert.urgency === 'WARNING' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100">{alert.title}</h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                    <div className="mt-2 text-[11px] font-medium text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-block">
                      Action: {alert.suggestedAction}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
};
