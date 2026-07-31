import React, { useEffect, useState } from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import { assetAPI, analyticsAPI, maintenanceAPI, aiAPI } from '../services/api';
import { useIoTStream } from '../context/IoTStreamContext';
import { 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  ClipboardList, 
  Plus, 
  ArrowUpRight, 
  Radio, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Boxes, 
  BarChart2, 
  Check, 
  X 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [fleetHealth, setFleetHealth] = useState(null);
  const [downtimeData, setDowntimeData] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // HITL Pending Action Items State
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'hitl-101',
      title: 'Emergency Drive-End Bearing Replacement',
      asset_tag: 'PUMP-101-A',
      asset_name: 'Main Boiler Feed Water Pump P-101',
      priority: 'critical',
      ai_confidence: '94%',
      reason: 'Vibration of 6.8 mm/s exceeds ISO Class III limit (4.5 mm/s). Thermal spalling risk high.',
      estimated_duration: '6 Hours',
      status: 'pending'
    },
    {
      id: 'hitl-102',
      title: 'Hydraulic Ram Seal Replacement & Oil Flush',
      asset_tag: 'PRESS-200-MAIN',
      asset_name: '500-Ton Hydraulic Stamping Press HP-200',
      priority: 'high',
      ai_confidence: '88%',
      reason: 'Hydraulic pressure drop of 12% over 7 days with thermal fluid rise to 55°C.',
      estimated_duration: '4 Hours',
      status: 'pending'
    }
  ]);

  const { isStreaming, telemetryData, anomalyEvent, toggleStreaming, triggerManualAnomaly, clearAnomaly } = useIoTStream() || {};

  useEffect(() => {
    async function fetchData() {
      try {
        const [assetRes, healthRes, downtimeRes, woRes] = await Promise.all([
          assetAPI.getAssets(),
          analyticsAPI.getFleetHealth(),
          analyticsAPI.getDowntimeTrends(),
          maintenanceAPI.getWorkOrders({ status: 'in_progress' })
        ]);
        setAssets(Array.isArray(assetRes?.data) ? assetRes.data : []);
        setFleetHealth(healthRes?.data || null);
        setDowntimeData(downtimeRes?.data || null);
        setWorkOrders(Array.isArray(woRes?.data) ? woRes.data : []);
      } catch (err) {
        console.warn("Error fetching dashboard telemetry:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const safeAssets = Array.isArray(assets) ? assets.filter(Boolean) : [];
  const safeWorkOrders = Array.isArray(workOrders) ? workOrders.filter(Boolean) : [];

  // Sort Watchlist by Risk Score descending
  const sortedWatchlist = [...safeAssets].sort((a, b) => {
    const riskA = a.risk_score || (a.lifecycle_status === 'degraded' ? 84 : 25);
    const riskB = b.risk_score || (b.lifecycle_status === 'degraded' ? 84 : 25);
    return riskB - riskA;
  });

  const handleApproveAction = (id) => {
    setPendingApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
  };

  const handleRejectAction = (id) => {
    setPendingApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col select-none">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-[1600px] mx-auto">
          
          {/* Top-Level Health Bar Ticker */}
          <div className="glass-panel p-4 rounded-2xl border border-industrial-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center shadow-xl">
            {/* KPI 1: Plant Health Score */}
            <div className="flex items-center gap-3 px-4 py-2 bg-industrial-900/90 rounded-xl border border-industrial-border">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Plant Health Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white font-mono">94.8%</span>
                  <span className="text-[10px] text-emerald-400 font-bold">+1.2% optimal</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Active Critical Alerts */}
            <div className="flex items-center gap-3 px-4 py-2 bg-industrial-900/90 rounded-xl border border-industrial-border">
              <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Active Critical Alerts</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-rose-400 font-mono">2 Assets</span>
                  <span className="text-[10px] text-rose-400 font-bold uppercase">High Risk</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Unplanned Downtime Risk */}
            <div className="flex items-center gap-3 px-4 py-2 bg-industrial-900/90 rounded-xl border border-industrial-border">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Unplanned Downtime Risk</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-amber-400 font-mono">$70,500</span>
                  <span className="text-[10px] text-gray-400 font-medium">Avoided ROI</span>
                </div>
              </div>
            </div>

            {/* Live Sensor Stream Toggle Switch */}
            <div className="flex items-center justify-between px-4 py-2 bg-industrial-900/90 rounded-xl border border-industrial-border">
              <div>
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">IoT Telemetry Feed</span>
                <span className={`text-xs font-bold ${isStreaming ? 'text-rose-400 animate-pulse' : 'text-gray-300'}`}>
                  {isStreaming ? 'Live Stream Active' : 'Sensor Stream Offline'}
                </span>
              </div>
              <button
                onClick={toggleStreaming}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isStreaming 
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/20' 
                    : 'bg-industrial-800 text-gray-400 border-industrial-border hover:text-white'
                }`}
                title="Toggle Live IoT Stream (Simulated)"
              >
                <Radio className={`w-4 h-4 ${isStreaming ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Anomaly Trigger Banner */}
          {anomalyEvent && (
            <div className="bg-gradient-to-r from-rose-900/90 to-industrial-800 p-5 rounded-2xl border-2 border-rose-500/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/40 text-rose-400 animate-bounce">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500 text-white font-mono">Critical Telemetry Spike</span>
                    <span className="text-xs text-rose-300 font-mono">{anomalyEvent.timestamp}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">{anomalyEvent.message}</h4>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/ai/planner"
                  className="flex items-center gap-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-accent-cyan/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Feed Event to Multi-Agent Planner
                </Link>
                <button
                  onClick={clearAnomaly}
                  className="px-3 py-2 bg-industrial-900 hover:bg-industrial-700 text-gray-300 rounded-xl text-xs border border-industrial-border cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Mission Control 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column 1: Critical Asset Watchlist (5 Cols) */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-industrial-border flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-400" />
                    Critical Asset Watchlist
                  </h2>
                  <p className="text-[11px] text-gray-400">Prioritized by Gemini AI Risk Score</p>
                </div>
                <Link to="/assets" className="text-xs text-accent-cyan font-bold hover:underline flex items-center gap-1">
                  <span>View All ({safeAssets.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 flex-1">
                {sortedWatchlist.slice(0, 4).map((asset) => {
                  const risk = asset.risk_score || (asset.lifecycle_status === 'degraded' ? 84 : 25);
                  return (
                    <div
                      key={asset.id}
                      className="bg-industrial-900/90 p-4 rounded-xl border border-industrial-border hover:border-accent-cyan/40 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">
                            {asset.asset_tag}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            asset.criticality_tier === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {asset.criticality_tier || 'high'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{asset.name}</h4>
                        <p className="text-[10px] text-gray-400">{asset.location}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className={`font-mono font-black text-sm ${risk > 75 ? 'text-rose-400' : risk > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {risk}
                          </span>
                          <span className="text-[10px] text-gray-500">/ 100</span>
                        </div>
                        <div className="w-20 h-1.5 bg-industrial-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${risk > 75 ? 'bg-rose-500' : risk > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(100, Math.max(0, risk))}%` }}
                          ></div>
                        </div>
                        <Link
                          to={`/ai/failure-prediction/${asset.id}`}
                          className="inline-flex items-center gap-1 text-[10px] text-accent-cyan font-bold hover:underline mt-1.5"
                        >
                          <span>Analyze</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Real-Time Telemetry Stream (4 Cols) */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-industrial-border flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio className={`w-5 h-5 ${isStreaming ? 'text-rose-400 animate-spin' : 'text-accent-cyan'}`} />
                    Telemetry Live Stream
                  </h2>
                  <p className="text-[11px] text-gray-400">Continuous sensor feeds & sparklines</p>
                </div>
                <button
                  onClick={triggerManualAnomaly}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Inject Spike
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {/* Metric 1: Vibration */}
                <div className="bg-industrial-900 p-3.5 rounded-xl border border-industrial-border">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400 font-mono text-[10px] uppercase">Vibration Velocity (RMS)</span>
                    <span className={`font-mono font-bold ${telemetryData?.vibration_mm_s > 6.5 ? 'text-rose-400 animate-pulse' : 'text-accent-cyan'}`}>
                      {telemetryData?.vibration_mm_s || 6.8} mm/s
                    </span>
                  </div>
                  {/* Visual Sparkline Bar */}
                  <div className="flex items-end gap-1 h-8 pt-2">
                    {[3.2, 3.8, 4.1, 4.5, 5.2, 6.0, telemetryData?.vibration_mm_s || 6.8].map((val, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t transition-all ${val > 6.5 ? 'bg-rose-500' : val > 4.5 ? 'bg-amber-400' : 'bg-accent-cyan/60'}`}
                        style={{ height: `${Math.min(100, (val / 8.0) * 100)}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Metric 2: Bearing Temp */}
                <div className="bg-industrial-900 p-3.5 rounded-xl border border-industrial-border">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400 font-mono text-[10px] uppercase">Drive-End Bearing Temp</span>
                    <span className={`font-mono font-bold ${telemetryData?.temperature_c > 75.0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      {telemetryData?.temperature_c || 78.4} °C
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-8 pt-2">
                    {[62.0, 64.5, 66.0, 70.2, 74.0, telemetryData?.temperature_c || 78.4].map((val, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t transition-all ${val > 75 ? 'bg-rose-500' : 'bg-emerald-400/60'}`}
                        style={{ height: `${Math.min(100, (val / 90.0) * 100)}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Metric 3: Pressure & Current */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-industrial-900 p-3 rounded-xl border border-industrial-border">
                    <span className="text-gray-400 font-mono text-[9px] uppercase block">Hydraulic Pressure</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {telemetryData?.pressure_bar || 8.4} bar
                    </span>
                  </div>
                  <div className="bg-industrial-900 p-3 rounded-xl border border-industrial-border">
                    <span className="text-gray-400 font-mono text-[9px] uppercase block">Motor Current</span>
                    <span className="font-mono font-bold text-blue-400 text-sm">
                      {telemetryData?.current_amps || 42.1} A
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Action Center & HITL Approval Gateway (3 Cols) */}
            <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-industrial-border flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-accent-amber" />
                  HITL Action Gateway
                </h2>
                <p className="text-[11px] text-gray-400">Review & approve AI multi-agent recommendations</p>
              </div>

              <div className="space-y-3 flex-1">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="bg-industrial-900 p-4 rounded-xl border border-industrial-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-accent-cyan font-bold bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">
                        {item.asset_tag}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        AI Conf: {item.ai_confidence}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{item.reason}</p>
                    </div>

                    {item.status === 'pending' ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-industrial-border">
                        <button
                          onClick={() => handleApproveAction(item.id)}
                          className="flex-1 py-1.5 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg text-[11px] shadow-md flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Dispatch</span>
                        </button>
                        <button
                          onClick={() => handleRejectAction(item.id)}
                          className="p-1.5 bg-industrial-800 hover:bg-industrial-700 text-gray-400 hover:text-rose-400 rounded-lg border border-industrial-border cursor-pointer"
                          title="Reject Recommendation"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : item.status === 'approved' ? (
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-bold text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Work Order Dispatched</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-[10px] font-bold text-center flex items-center justify-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Plan Rejected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Access Action Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-industrial-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl text-accent-cyan">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Multi-Agent Predictive Engine</h4>
                <p className="text-xs text-gray-400">Orchestrate Diagnostics, Risk, Scheduling, and Parts agents in one unified workflow.</p>
              </div>
            </div>

            <Link
              to="/ai/planner"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-xl shadow-accent-cyan/20 transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Multi-Agent Planner</span>
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}
