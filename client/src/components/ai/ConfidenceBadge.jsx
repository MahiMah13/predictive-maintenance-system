import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function ConfidenceBadge({ level = 'medium' }) {
  const normalized = level.toLowerCase();
  
  if (normalized === 'high') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <ShieldCheck className="w-3.5 h-3.5" />
        High Confidence (90%+)
      </span>
    );
  }
  
  if (normalized === 'medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        Medium Confidence (70-89%)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
      <ShieldAlert className="w-3.5 h-3.5" />
      Low Confidence (&lt;70%)
    </span>
  );
}
