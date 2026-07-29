import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import { Clock, ShieldCheck, Sliders, AlertTriangle, Info } from 'lucide-react';

export default function RULEstimatePanel({ rulData }) {
  if (!rulData) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center">
        <Clock className="w-10 h-10 text-accent-cyan mx-auto mb-3 animate-spin" />
        <h3 className="text-lg font-bold text-white mb-2">Calculating Remaining Useful Life...</h3>
        <p className="text-xs text-gray-400">Processing physical degradation models via Gemini engine.</p>
      </div>
    );
  }

  const rulHours = rulData.rul_estimate_hours || 120;
  const interval = rulData.raw_ai_response?.confidence_interval_hours || { min_hours: 90, max_hours: 150 };
  const mechanism = rulData.raw_ai_response?.primary_degradation_mechanism || rulData.predicted_failure_mode || "Rolling Element Spalling & Micro-fatigue";
  const frequency = rulData.raw_ai_response?.inspection_frequency_recommendation || "Daily vibration screening & acoustic check";

  return (
    <div className="glass-panel-glow p-6 rounded-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-industrial-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Remaining Useful Life (RUL) Estimation
            </h2>
            <ConfidenceBadge level={rulData.confidence_level} />
          </div>
          <p className="text-xs text-gray-400">
            Physical Degradation Model: <span className="text-accent-cyan font-bold">{mechanism}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-industrial-900 px-4 py-2 rounded-xl border border-industrial-border">
          <Clock className="w-5 h-5 text-accent-cyan" />
          <div>
            <div className="text-[10px] text-gray-400 font-mono">ESTIMATED RUL</div>
            <div className="text-lg font-black text-white font-mono">{rulHours} Hours</div>
          </div>
        </div>
      </div>

      {/* RUL Range Visualizer */}
      <div className="bg-industrial-900/90 p-5 rounded-2xl border border-industrial-border space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-rose-400">Pessimistic: {interval.min_hours} Hours</span>
          <span className="text-accent-cyan font-bold">Nominal AI Estimate: {rulHours} Hours</span>
          <span className="text-emerald-400">Optimistic: {interval.max_hours} Hours</span>
        </div>

        <div className="relative w-full h-4 bg-industrial-800 rounded-full overflow-hidden border border-industrial-border">
          <div
            className="absolute h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 opacity-80"
            style={{
              left: `${(interval.min_hours / (interval.max_hours * 1.3)) * 100}%`,
              width: `${((interval.max_hours - interval.min_hours) / (interval.max_hours * 1.3)) * 100}%`
            }}
          ></div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white"
            style={{ left: `${(rulHours / (interval.max_hours * 1.3)) * 100}%` }}
          ></div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Confidence Band: Asset expected to operate within continuous performance envelope between <span className="text-white font-mono font-bold">{interval.min_hours}</span> and <span className="text-white font-mono font-bold">{interval.max_hours}</span> hours.
        </p>
      </div>

      {/* Recommended Inspection Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-300 mb-2">
            <Sliders className="w-4 h-4 text-accent-amber" />
            Recommended Condition Inspection Frequency
          </div>
          <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30">
            {frequency}
          </p>
        </div>

        <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-300 mb-2">
            <Info className="w-4 h-4 text-accent-cyan" />
            Underlying Degradation Physics
          </div>
          <p className="text-xs text-gray-300">
            Micro-spalling in bearing inner raceways accelerates exponentially past 6.0 mm/s vibration. Failure curve follows standard P-F interval mechanics.
          </p>
        </div>
      </div>
    </div>
  );
}
