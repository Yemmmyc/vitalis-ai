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
    <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3.5 py-2.5 sm:px-8 sm:py-5 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 max-w-full overflow-x-hidden pt-[calc(0.625rem+env(safe-area-inset-top,0px))] gap-2 sm:gap-4">
      {/* Brand & Time */}
      <div className="flex items-center justify-between sm:justify-start gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl alexa-gradient flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold tracking-tight text-lg sm:text-xl text-white">Vitalis<span className="text-sky-400">AI</span></span>
              <span className="px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold tracking-wider rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">ALEXA+</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">Echo Show Smart Display Edition</p>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-800 hidden md:block" />

        <div className="flex flex-col text-right sm:text-left">
          <span className="text-base sm:text-2xl font-bold tracking-tight text-slate-100">{currentTime}</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-400 hidden sm:block">{currentDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 max-w-full no-scrollbar">
        {/* Pill Camera Scanner */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-sky-500/30 transition-all shadow-sm shrink-0 active:scale-95"
        >
          <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
          <span>Scanner</span>
        </button>

        {/* Caregiver Portal Button */}
        <button
          onClick={onOpenCaregiver}
          className="relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all shadow-sm shrink-0 active:scale-95"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span>Caregiver</span>
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-[9px] sm:text-[10px] font-bold text-white flex items-center justify-center animate-bounce shadow-md shadow-rose-500/50">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* MCP Dev Inspector Button */}
        <button
          onClick={onToggleInspector}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm shrink-0 active:scale-95"
        >
          <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          <span>Inspector</span>
        </button>

        {/* Ambient status indicators */}
        <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-slate-800 shrink-0">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </div>
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping" title="MCP Streamable HTTP Live" />
        </div>
      </div>
    </header>
  );
};
