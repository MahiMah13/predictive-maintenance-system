import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, DollarSign, Clock, Download, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FleetHealthDashboard({ fleetHealth, downtimeData }) {
  const statusPieData = [
    { name: 'Operational', value: fleetHealth?.status_counts?.operational ?? 3, color: '#10b981' },
    { name: 'Degraded', value: fleetHealth?.status_counts?.degraded ?? 1, color: '#f59e0b' },
    { name: 'Under Maintenance', value: fleetHealth?.status_counts?.under_maintenance ?? 1, color: '#f43f5e' }
  ];

  const metrics = downtimeData?.metrics || {
    total_failures: 2,
    total_downtime_hours: 27.2,
    total_cost_impact_usd: 70500,
    mtbf_hours: 1450,
    mttr_hours: 4.8
  };

  const costImpact = metrics?.total_cost_impact_usd ?? 70500;
  const failureCount = metrics?.total_failures ?? 2;
  const mtbfHours = metrics?.mtbf_hours ?? 1450;
  const mttrHours = metrics?.mttr_hours ?? 4.8;

  const monthlyTrends = downtimeData?.monthly_trends || [
    { month: 'Jan', downtime_hours: 14, cost_usd: 12000 },
    { month: 'Feb', downtime_hours: 8, cost_usd: 7500 },
    { month: 'Mar', downtime_hours: 22, cost_usd: 31000 },
    { month: 'Apr', downtime_hours: 12.2, cost_usd: 42500 },
    { month: 'May', downtime_hours: 6, cost_usd: 5400 },
    { month: 'Jun', downtime_hours: 15, cost_usd: 28000 },
    { month: 'Jul', downtime_hours: 27.2, cost_usd: 70500 }
  ];

  const leaderboard = fleetHealth?.leaderboard || [
    { asset_id: 'ast-30001-pump-101', asset_tag: 'PUMP-101-A', name: 'Main Boiler Feed Water Pump P-101', category: 'Rotating Equipment', criticality: 'critical', risk_score: 84, predicted_failure_mode: 'Drive-End Bearing Failure' },
    { asset_id: 'ast-30003-press-200', asset_tag: 'PRESS-200-MAIN', name: '500-Ton Hydraulic Stamping Press HP-200', category: 'Production Line Machinery', criticality: 'critical', risk_score: 72, predicted_failure_mode: 'Hydraulic Ram Seal Decay' }
  ];

  return (
    <div className="space-y-6">
      {/* Fleet KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-industrial-border">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Fleet Availability Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">94.8%</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">+1.2% vs last month</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-industrial-border">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Mean Time Between Failures (MTBF)</span>
            <Clock className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-2xl font-black text-accent-cyan font-mono">{mtbfHours} Hours</div>
          <div className="text-[10px] text-gray-400 mt-1">Fleet reliability benchmark</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-industrial-border">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Mean Time To Repair (MTTR)</span>
            <Activity className="w-4 h-4 text-accent-amber" />
          </div>
          <div className="text-2xl font-black text-accent-amber font-mono">{mttrHours} Hours</div>
          <div className="text-[10px] text-gray-400 mt-1">Average corrective duration</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-industrial-border">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Unplanned Downtime Cost</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">${Number(costImpact).toLocaleString()}</div>
          <div className="text-[10px] text-rose-400 mt-1 font-semibold">{failureCount} breakdown events logged</div>
        </div>
      </div>

      {/* Fleet Distribution & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-industrial-border flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-2">Fleet Operational State Distribution</h3>
          
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white font-mono">{fleetHealth?.total_assets || 5}</span>
              <span className="text-[10px] text-gray-400 uppercase">Total Assets</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-300 font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Downtime Cost Trend Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-industrial-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Monthly Unplanned Downtime Cost ($ USD)</h3>
            <button className="flex items-center gap-1 px-3 py-1 bg-industrial-900 hover:bg-industrial-700 text-gray-300 rounded-lg text-xs border border-industrial-border">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="cost_usd" name="Downtime Cost ($)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Failure Risk Leaderboard */}
      <div className="glass-panel p-5 rounded-2xl border border-industrial-border">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
          <span>Fleet Failure Risk Leaderboard</span>
          <span className="text-xs text-rose-400 font-mono font-bold">High Risk: {fleetHealth?.high_risk_count || 1} Asset</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-industrial-900/90 text-gray-400 font-semibold uppercase border-b border-industrial-border">
              <tr>
                <th className="py-3 px-4">Asset Tag & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Criticality</th>
                <th className="py-3 px-4">Predicted Failure Mode</th>
                <th className="py-3 px-4">Risk Index</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-border">
              {leaderboard.map((row) => (
                <tr key={row.asset_id} className="hover:bg-industrial-700/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="font-mono text-accent-cyan">{row.asset_tag}</div>
                    <div className="text-gray-300 font-semibold">{row.name}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{row.category}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      {row.criticality}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 font-medium">{row.predicted_failure_mode}</td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-bold ${row.risk_score > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {row.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/ai/failure-prediction/${row.asset_id}`}
                      className="inline-flex items-center gap-1 text-accent-cyan hover:underline font-bold text-xs"
                    >
                      <span>Analyze</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
