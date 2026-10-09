import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Sparkles, Flame, Check } from 'lucide-react';
import { Medication, PatientProfile } from '../types.js';

interface MedicationWidgetProps {
  patient: PatientProfile | null;
  onTakeDose: (medId: string) => void;
}

export const MedicationWidget: React.FC<MedicationWidgetProps> = ({ patient, onTakeDose }) => {
  if (!patient) return null;

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-xl max-w-full">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Today's Medications</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Scheduled regimens for {patient.preferredName}</p>
          </div>
        </div>

        {/* Adherence Streak Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs sm:text-sm">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
            <span>{patient.streakDays} Day Streak</span>
          </div>
          <div className="h-3.5 w-px bg-slate-800" />
          <div className="text-[11px] sm:text-xs font-semibold text-emerald-400">
            {patient.adherenceRate}% Adherence
          </div>
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-3.5">
        {patient.medications.map((med) => (
          <div
            key={med.id}
            className={`p-4 rounded-2xl border transition-all ${
              med.takenToday
                ? 'bg-slate-900/40 border-emerald-500/30 opacity-80'
                : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/40'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white">{med.name}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium border border-slate-700">
                    {med.dosage}
                  </span>
                  <span className="text-xs text-sky-400 font-medium">
                    {med.frequency}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{med.instructions}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                  <span>Rx: {med.rxNumber}</span>
                  <span>•</span>
                  <span>{med.prescribingDoctor}</span>
                  {med.warnings.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {med.warnings[0]}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {med.takenToday ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    <Check className="w-4 h-4" />
                    <span>Taken</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onTakeDose(med.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl alexa-gradient hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-105"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Take Dose</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
