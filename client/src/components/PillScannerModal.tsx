import React, { useState } from 'react';
import { X, Camera, CheckCircle, AlertOctagon, AlertTriangle, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface PillScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (result: any) => void;
}

export const PillScannerModal: React.FC<PillScannerModalProps> = ({ isOpen, onClose, onScanResult }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('lisinopril_20mg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<any>(null);

  if (!isOpen) return null;

  const presets = [
    { id: 'lisinopril_20mg', name: 'Lisinopril 20mg (Prescribed Blood Pressure)', status: 'SAFE' },
    { id: 'metformin_500mg', name: 'Metformin ER 500mg (Prescribed Diabetes)', status: 'SAFE' },
    { id: 'penicillin_mismatch', name: 'Amoxicillin / Penicillin (CRITICAL ALLERGY)', status: 'DANGER' },
    { id: 'expired_aspirin', name: 'Expired Aspirin 81mg (Expired 2023)', status: 'WARNING' }
  ];

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/tools/verify_pill_bottle_vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pt-88219',
          samplePillPreset: selectedPreset
        })
      });
      const data = await res.json();
      setScanData(data.result);
      onScanResult(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Echo Show Pill Bottle Camera Scanner</h3>
              <p className="text-xs text-slate-400">Multimodal Computer Vision • Amazon Bedrock • Rx Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Simulation */}
        <div className="my-5 relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden h-64 flex flex-col items-center justify-center p-6 text-center">
          {/* Simulated HUD Camera Overlay */}
          <div className="absolute inset-4 border-2 border-dashed border-sky-500/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between text-[11px] font-mono text-sky-400">
              <span>ECHO_SHOW_CAM_01 [1080p]</span>
              <span>AI_BOUNDING_BOX: ACTIVE</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-sky-400">
              <span>VISION_ENGINE: SIMULATED_VERIFICATION</span>
              <span>CONFIDENCE: 98.5%</span>
            </div>
          </div>

          <div className="z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-sky-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Hold bottle facing the Echo Show camera
            </p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Vitalis AI uses a simulated pill-bottle verification workflow to check drug identity, dosage, expiration, and patient safety rules.
            </p>
          </div>
        </div>

        {/* Prescription Sample Selectors */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Select Test Pill Bottle Sample to Inspect:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPreset(p.id);
                  setScanData(null);
                }}
                className={`text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                  selectedPreset === p.id
                    ? 'bg-sky-500/10 border-sky-500/60 text-sky-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="truncate pr-2">{p.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.status === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400' :
                  p.status === 'DANGER' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {p.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scan Results Card */}
        {scanData && (
          <div className={`p-4 rounded-2xl border mb-4 animate-fadeIn ${
            scanData.matchStatus === 'VERIFIED_SAFE'
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : scanData.matchStatus === 'CRITICAL_ALLERGY_ALERT'
              ? 'bg-rose-500/10 border-rose-500/40 glow-red'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <div className="flex items-start gap-3">
              {scanData.matchStatus === 'VERIFIED_SAFE' ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : scanData.matchStatus === 'CRITICAL_ALLERGY_ALERT' ? (
                <AlertOctagon className="w-6 h-6 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">
                    {scanData.detectedDrug} ({scanData.detectedDosage})
                  </span>
                  <span className="font-mono text-slate-400">Rx: {scanData.detectedRxNumber}</span>
                </div>
                <p className="mt-1 text-slate-200 font-medium">{scanData.recommendation}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                  <span>Patient: {scanData.detectedPatient}</span>
                  <span>•</span>
                  <span>Exp: {scanData.expirationDate}</span>
                  <span>•</span>
                  <span className="text-sky-400 font-mono">Confidence: {(scanData.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl alexa-gradient text-white text-xs font-bold shadow-lg shadow-sky-500/25 hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Bottle with Bedrock...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Verify Medication Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
