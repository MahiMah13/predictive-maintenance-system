import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, ShieldCheck, Sparkles, MapPin, Wrench } from 'lucide-react';

export default function AssetCard({ asset }) {
  const getCriticalityColor = (tier) => {
    switch (tier) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'degraded': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'under_maintenance': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const riskScore = asset.risk_score || (asset.lifecycle_status === 'degraded' ? 84 : 25);

  return (
    <div className="glass-panel rounded-2xl p-5 hover:border-accent-cyan/40 transition-all duration-300 flex flex-col justify-between group shadow-xl">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-[11px] font-bold text-accent-cyan bg-accent-cyan/10 px-2.5 py-1 rounded-md border border-accent-cyan/20">
            {asset.asset_tag}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getCriticalityColor(asset.criticality_tier)}`}>
              {asset.criticality_tier}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(asset.lifecycle_status)}`}>
              {asset.lifecycle_status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <Link to={`/assets/${asset.id}`} className="block">
          <h4 className="text-base font-bold text-white group-hover:text-accent-cyan transition-colors mb-1">
            {asset.name}
          </h4>
        </Link>

        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <span>{asset.location}</span>
        </p>

        <div className="bg-industrial-900/80 p-3 rounded-xl border border-industrial-border mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-accent-cyan" />
              AI Failure Risk Index
            </span>
            <span className={`font-mono font-bold ${riskScore > 75 ? 'text-rose-400' : riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {riskScore} / 100
            </span>
          </div>

          <div className="w-full h-2 bg-industrial-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                riskScore > 75 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : riskScore > 50 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${riskScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-industrial-border">
        <Link
          to={`/ai/failure-prediction/${asset.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 py-2 rounded-xl text-xs font-semibold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Predict Risk
        </Link>

        <Link
          to={`/assets/${asset.id}`}
          className="px-3 py-2 bg-industrial-700 hover:bg-industrial-600 text-gray-200 rounded-xl text-xs font-semibold transition-all"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
