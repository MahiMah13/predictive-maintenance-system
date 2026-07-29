import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import { AlertOctagon, Activity, Database, Sparkles, ArrowRight } from 'lucide-react';

export default function FailurePredictionPanel({ prediction, onGenerateRecommendations }) {
  if (!prediction) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center">
        <Sparkles className="w-10 h-10 text-accent-cyan mx-auto mb-3 animate-pulse" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Prediction Loaded</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Click the "Run Failure Prediction" button to send sensor feeds and failure logs to Gemini 2.5 for reliability analysis.
        </p>
      </div>
    );
  }

  const risk = prediction.risk_score || 84;
  const factors = prediction.contributing_factors || [];
  const dataGaps = prediction.data_gaps || prediction.raw_ai_response?.data_gaps || [];

  return (
    <div className="glass-panel-glow p-6 rounded-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-industrial-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Gemini Failure Risk Analysis
            </h2>
            <ConfidenceBadge level={prediction.confidence_level} />
          </div>
          <p className="text-xs text-gray-400">
            Predicted Failure Mode: <span className="text-rose-400 font-bold">{prediction.predicted_failure_mode}</span>
          </p>
        </div>

        <button
          onClick={onGenerateRecommendations}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-accent-cyan/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          Generate Action Plan
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Circular Meter */}
        <div className="bg-industrial-900/90 p-5 rounded-2xl border border-industrial-border flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="58"
                stroke="#1f2937"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                stroke={risk > 75 ? '#f43f5e' : risk > 50 ? '#f59e0b' : '#10b981'}
                strokeWidth="12"
                strokeDasharray="364"
                strokeDashoffset={364 - (364 * risk) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-black font-mono ${risk > 75 ? 'text-rose-400' : risk > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {risk}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">RISK SCORE</span>
            </div>
          </div>

          <div className="text-xs text-gray-300 font-semibold">
            {risk > 75 ? 'HIGH FAILURE PROBABILITY' : risk > 50 ? 'MODERATE DEGRADATION' : 'LOW RISK STATE'}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Horizon: <span className="text-white font-mono">{prediction.raw_ai_response?.recommended_horizon_days || 5} Days</span>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-cyan" />
            Contributing Failure Evidence & Factors
          </h4>

          <div className="space-y-2">
            {factors.map((item, idx) => (
              <div key={idx} className="bg-industrial-900/80 p-3 rounded-xl border border-industrial-border flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{item.factor}</span>
                  </div>
                  <p className="text-[11px] text-gray-300">{item.evidence}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                  item.weight === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                  item.weight === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/40'
                }`}>
                  {item.weight} WEIGHT
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Gap Warnings */}
      {dataGaps.length > 0 && (
        <div className="bg-industrial-900/60 p-4 rounded-xl border border-amber-500/30">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2 mb-2">
            <Database className="w-4 h-4" />
            Telemetry & Data Gap Disclosures
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
            {dataGaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
