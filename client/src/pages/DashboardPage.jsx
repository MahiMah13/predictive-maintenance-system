import React, { useEffect, useState } from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import FleetHealthDashboard from '../components/analytics/FleetHealthDashboard';
import AssetCard from '../components/assets/AssetCard';
import { assetAPI, analyticsAPI, maintenanceAPI } from '../services/api';
import { Activity, Sparkles, AlertTriangle, ClipboardList, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [fleetHealth, setFleetHealth] = useState(null);
  const [downtimeData, setDowntimeData] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assetRes, healthRes, downtimeRes, woRes] = await Promise.all([
          assetAPI.getAssets(),
          analyticsAPI.getFleetHealth(),
          analyticsAPI.getDowntimeTrends(),
          maintenanceAPI.getWorkOrders({ status: 'in_progress' })
        ]);
        setAssets(assetRes.data);
        setFleetHealth(healthRes.data);
        setDowntimeData(downtimeRes.data);
        setWorkOrders(woRes.data);
      } catch (err) {
        console.warn("Error fetching dashboard telemetry:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const highRiskAssets = assets.filter(a => a.lifecycle_status === 'degraded' || (a.risk_score && a.risk_score > 70));

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto">
          {/* Top Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-industrial-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Operational Baseline Normal</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Fleet Reliability & Predictive Intelligence</h1>
              <p className="text-xs text-gray-400">Monitoring 5 active plant assets, real-time sensor feeds, and Gemini failure risk engines.</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/ai/planner"
                className="flex items-center gap-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-accent-cyan/20 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Run Multi-Agent Planner
              </Link>
              <Link
                to="/assets/new"
                className="flex items-center gap-1.5 bg-industrial-800 hover:bg-industrial-700 text-gray-200 border border-industrial-border font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                New Asset
              </Link>
            </div>
          </div>

          {/* Fleet Health Analytics Section */}
          <FleetHealthDashboard fleetHealth={fleetHealth} downtimeData={downtimeData} />

          {/* Asset Health Overview Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-cyan" />
                High-Risk & Degraded Machinery
              </h2>
              <Link to="/assets" className="text-xs text-accent-cyan font-bold hover:underline flex items-center gap-1">
                <span>View All Assets ({assets.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.slice(0, 3).map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>

          {/* Active Work Orders Quick Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-accent-amber" />
                Active Maintenance Work Orders ({workOrders.length})
              </h3>
              <Link to="/schedule" className="text-xs text-accent-cyan font-bold hover:underline">
                View Schedule →
              </Link>
            </div>

            <div className="space-y-2">
              {workOrders.map((wo) => (
                <div key={wo.id} className="bg-industrial-900/80 p-3.5 rounded-xl border border-industrial-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-accent-cyan font-bold mr-2">{wo.id}</span>
                    <span className="text-white font-bold">{wo.title}</span>
                    <span className="text-gray-400 block text-[11px] mt-0.5">{wo.description}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    {wo.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
