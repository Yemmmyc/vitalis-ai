import React, { useState, useEffect } from 'react';
import { Wifi, Sparkles, Shield, Bell, Code, Pill } from 'lucide-react';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenCaregiver: () => void;
  onToggleInspector: () => void;
  unreadAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenCaregiver,
  onToggleInspector,
  unreadAlertsCount
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      {/* Brand & Time */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl alexa-gradient flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-xl text-white">Vitalis<span className="text-sky-400">AI</span></span>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wider rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">ALEXA+ PREVIEW</span>
            </div>
            <p className="text-xs text-slate-400">Echo Show Smart Display Edition</p>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-800 hidden md:block" />

        <div className="hidden md:flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-slate-100">{currentTime}</span>
          <span className="text-xs font-medium text-slate-400">{currentDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Pill Camera Scanner */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-sky-500/30 transition-all hover:scale-[1.02] shadow-sm"
        >
          <Pill className="w-4 h-4 text-sky-400" />
          <span>Camera Pill Scanner</span>
        </button>

        {/* Caregiver Portal Button */}
        <button
          onClick={onOpenCaregiver}
          className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all hover:scale-[1.02] shadow-sm"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Caregiver Portal</span>
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce shadow-md shadow-rose-500/50">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* MCP Dev Inspector Button */}
        <button
          onClick={onToggleInspector}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-[1.02] shadow-sm"
        >
          <Code className="w-4 h-4 text-emerald-400" />
          <span>MCP Inspector</span>
        </button>

        {/* Ambient status indicators */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" title="MCP Streamable HTTP Live" />
        </div>
      </div>
    </header>
  );
};
