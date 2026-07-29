import React from 'react';
import { AlertCircle, CheckSquare, Info } from 'lucide-react';

export default function AssumptionsDisclosure({ 
  assumptions = [], 
  verified = false, 
  onVerifyChange,
  notes = '',
  onNotesChange
}) {
  return (
    <div className="bg-industrial-800/80 border border-amber-500/30 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold text-sm">
        <Info className="w-4 h-4" />
        <span>Gemini AI Operational Assumptions & Plant Condition Verification</span>
      </div>

      <p className="text-xs text-gray-300 mb-3">
        AI predictions are computed probabilistically based on historical sensor feeds and operating parameters. The following operational assumptions were assumed during calculation:
      </p>

      <ul className="space-y-2 mb-5">
        {assumptions.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-gray-300 bg-industrial-900/60 p-2.5 rounded-lg border border-industrial-border">
            <span className="text-amber-400 font-bold">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-industrial-border pt-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => onVerifyChange && onVerifyChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-industrial-border text-accent-cyan focus:ring-accent-cyan bg-industrial-900"
          />
          <div className="text-xs text-gray-200 group-hover:text-white font-medium select-none">
            <span className="text-rose-400 font-bold">* MANDATORY REQUIREMENT: </span>
            <span className="italic">
              "I have verified local plant operating conditions and confirm these AI assumptions match physical machine status before accepting this work plan."
            </span>
          </div>
        </label>

        {verified && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Optional Verification Notes / Physical Inspection Remarks:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
              placeholder="e.g. Verified drive-end housing temp at 78°C using handheld thermography camera."
              className="w-full bg-industrial-900 border border-industrial-border rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-accent-cyan"
            />
          </div>
        )}
      </div>
    </div>
  );
}
