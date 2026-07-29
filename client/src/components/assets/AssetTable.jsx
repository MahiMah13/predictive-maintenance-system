import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ExternalLink, Sparkles, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

export default function AssetTable({ assets = [] }) {
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortField === 'risk_score') {
      aVal = a.risk_score || (a.lifecycle_status === 'degraded' ? 84 : 25);
      bVal = b.risk_score || (b.lifecycle_status === 'degraded' ? 84 : 25);
    }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-industrial-border bg-industrial-800/80">
      <table className="w-full text-left text-xs">
        <thead className="bg-industrial-900/90 text-gray-400 font-semibold uppercase tracking-wider border-b border-industrial-border">
          <tr>
            <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('asset_tag')}>
              <div className="flex items-center gap-1.5">
                <span>Asset Tag</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
              <div className="flex items-center gap-1.5">
                <span>Asset Name & Category</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3.5 px-4">Location</th>
            <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('criticality_tier')}>
              <div className="flex items-center gap-1.5">
                <span>Criticality</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('lifecycle_status')}>
              <div className="flex items-center gap-1.5">
                <span>Status</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('risk_score')}>
              <div className="flex items-center gap-1.5">
                <span>AI Risk Score</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-industrial-border text-gray-200">
          {sortedAssets.map((asset) => {
            const risk = asset.risk_score || (asset.lifecycle_status === 'degraded' ? 84 : 25);
            return (
              <tr key={asset.id} className="hover:bg-industrial-700/50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-accent-cyan">
                  {asset.asset_tag}
                </td>
                <td className="py-3.5 px-4">
                  <Link to={`/assets/${asset.id}`} className="font-bold text-white hover:text-accent-cyan transition-colors block">
                    {asset.name}
                  </Link>
                  <span className="text-[10px] text-gray-400">{asset.category} • {asset.manufacturer}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span>{asset.location}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    asset.criticality_tier === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    asset.criticality_tier === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {asset.criticality_tier}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    asset.lifecycle_status === 'operational' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    asset.lifecycle_status === 'degraded' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {asset.lifecycle_status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-industrial-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          risk > 75 ? 'bg-rose-500' : risk > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${risk}%` }}
                      ></div>
                    </div>
                    <span className={`font-mono font-bold ${
                      risk > 75 ? 'text-rose-400' : risk > 50 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {risk}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/ai/failure-prediction/${asset.id}`}
                      className="p-1.5 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan rounded-lg border border-accent-cyan/30 transition-colors"
                      title="Run AI Prediction"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/assets/${asset.id}`}
                      className="p-1.5 bg-industrial-700 hover:bg-industrial-600 text-gray-300 rounded-lg transition-colors"
                      title="View Asset Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
