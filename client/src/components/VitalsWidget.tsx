import React from 'react';
import { Activity, Heart, Droplets, Moon, Plus } from 'lucide-react';
import { PatientProfile } from '../types.js';

interface VitalsWidgetProps {
  patient: PatientProfile | null;
  onAddWater: () => void;
}

export const VitalsWidget: React.FC<VitalsWidgetProps> = ({ patient, onAddWater }) => {
  if (!patient) return null;

  return (
    <div className="glass-card rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Biometric Vitals & Health</h2>
            <p className="text-xs text-slate-400">Ambient telemetry synced with Amazon Bedrock</p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Updated just now</span>
      </div>

      {/* Grid of Vitals Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Blood Pressure */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Blood Pressure</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {patient.vitals.bloodPressure}
          </div>
          <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            Optimal Target
          </span>
        </div>

        {/* Blood Glucose */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Blood Glucose</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {patient.vitals.bloodGlucose} <span className="text-xs font-normal text-slate-400">mg/dL</span>
          </div>
          <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            Fasting Normal
          </span>
        </div>

        {/* Hydration */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Daily Hydration</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-extrabold text-white tracking-tight">
              {patient.vitals.hydrationGlasses} <span className="text-xs font-normal text-slate-400">/ 8 glasses</span>
            </div>
            <button
              onClick={onAddWater}
              className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 transition-all"
              title="Add 1 glass of water"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(patient.vitals.hydrationGlasses / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Restorative Sleep */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Sleep Duration</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {patient.vitals.sleepHours} <span className="text-xs font-normal text-slate-400">hours</span>
          </div>
          <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
            Restorative Quality
          </span>
        </div>
      </div>
    </div>
  );
};
