import React, { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import { maintenanceAPI } from '../services/api';
import { AlertTriangle, Plus, Search, DollarSign, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FailuresPage() {
  const [failures, setFailures] = useState([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    async function loadFailures() {
      try {
        const res = await maintenanceAPI.getFailures({ search, severity: severityFilter });
        setFailures(res.data);
      } catch (err) {
        console.warn("Error loading failure logs:", err);
      }
    }
    loadFailures();
  }, [search, severityFilter]);

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
                Fleet Failure History Log
              </h1>
              <p className="text-xs text-gray-400">
                Log and track repeat breakdown modes, root causes, downtime durations, and financial impacts.
              </p>
            </div>

            <Link
              to="/failures/new"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-rose-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Log Failure Event
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-industrial-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by failure mode, root cause, or asset tag..."
                className="w-full bg-industrial-900 border border-industrial-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Failures List */}
          <div className="space-y-4">
            {failures.map((f) => (
              <div key={f.id} className="glass-panel p-5 rounded-2xl border border-industrial-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-industrial-border pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">
                        {f.asset_tag}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        f.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {f.severity} Severity
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{f.failure_mode}</h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono font-bold">
                    <span className="text-rose-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      Cost Impact: ${f.estimated_cost_impact?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-industrial-900/80 p-3 rounded-xl border border-industrial-border">
                    <span className="text-gray-400 font-bold block mb-1">Root Cause</span>
                    <p className="text-gray-200">{f.root_cause || 'Under technical evaluation'}</p>
                  </div>
                  <div className="bg-industrial-900/80 p-3 rounded-xl border border-industrial-border">
                    <span className="text-gray-400 font-bold block mb-1">Technician Repair Notes</span>
                    <p className="text-gray-200">{f.technician_notes || 'Overhaul executed per standard procedure'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
