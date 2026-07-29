import React, { useState } from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import AssumptionsDisclosure from './AssumptionsDisclosure';
import { CheckCircle2, ClipboardPlus, Clock, Wrench, ShieldAlert, Sparkles } from 'lucide-react';

export default function RecommendationList({ 
  recommendationData, 
  onConfirmPlan,
  isSubmitting = false
}) {
  const [verified, setVerified] = useState(false);
  const [notes, setNotes] = useState('');

  if (!recommendationData) {
    return null;
  }

  const items = recommendationData.recommendations || [];
  const assumptions = recommendationData.assumptions || [
    "Machine operates under continuous load.",
    "Physical operating temperature matches telemetry sensor logs.",
    "Required spare parts are available in plant store."
  ];

  const handleAccept = () => {
    if (!verified) return;
    onConfirmPlan && onConfirmPlan(recommendationData.id, { confirmed: true, notes });
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-industrial-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-cyan" />
                Gemini Maintenance Advisory Plan
              </h3>
              <ConfidenceBadge level={recommendationData.confidence_level} />
            </div>
            <p className="text-xs text-gray-400">
              Actionable maintenance tasks generated from failure prediction & sensor trends.
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase border ${
            recommendationData.status === 'accepted'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          }`}>
            Status: {recommendationData.status || 'Pending Verification'}
          </span>
        </div>

        {/* Prioritized Recommendation Cards */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="bg-industrial-900/90 p-4 rounded-xl border border-industrial-border hover:border-accent-cyan/40 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30">
                  {item.priority || `P${idx + 1}`}
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  Est. Duration: <strong className="text-white">{item.estimated_duration_hours || 4}h</strong>
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{item.action}</h4>
              <p className="text-xs text-gray-300 mb-2">{item.justification}</p>

              {item.required_skills && (
                <div className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                  <Wrench className="w-3 h-3 text-accent-amber" />
                  Skill Level: {item.required_skills}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions & Required Verification */}
      <AssumptionsDisclosure
        assumptions={assumptions}
        verified={verified}
        onVerifyChange={setVerified}
        notes={notes}
        onNotesChange={setNotes}
      />

      {/* Accept & Create Work Order Action */}
      <div className="flex items-center justify-end gap-4">
        {!verified && (
          <span className="text-xs text-amber-400 flex items-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            Check physical verification box above to unlock Work Order creation
          </span>
        )}

        <button
          disabled={!verified || isSubmitting}
          onClick={handleAccept}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-xl transition-all ${
            verified && !isSubmitting
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20 hover:scale-105 cursor-pointer'
              : 'bg-industrial-800 text-gray-500 border border-industrial-border cursor-not-allowed opacity-60'
          }`}
        >
          <ClipboardPlus className="w-4 h-4" />
          {isSubmitting ? 'Creating Work Order...' : 'Confirm Assumptions & Create Work Order'}
        </button>
      </div>
    </div>
  );
}
