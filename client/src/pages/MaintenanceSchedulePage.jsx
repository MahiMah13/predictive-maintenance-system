import React, { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import { maintenanceAPI } from '../services/api';
import { Calendar, ClipboardList, Clock, Plus, Filter, CheckCircle2, User, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MaintenanceSchedulePage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadSchedules() {
      try {
        const [woRes, schedRes] = await Promise.all([
          maintenanceAPI.getWorkOrders({ status: statusFilter }),
          maintenanceAPI.getSchedules()
        ]);
        setWorkOrders(woRes.data);
        setSchedules(schedRes.data);
      } catch (err) {
        console.warn("Error loading schedule data:", err);
      }
    }
    loadSchedules();
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-accent-cyan" />
                Maintenance Scheduling & Work Orders
              </h1>
              <p className="text-xs text-gray-400">
                Track preventive, predictive, and corrective maintenance tasks assigned to plant technicians.
              </p>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-industrial-800 border border-industrial-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Work Orders List */}
          <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Active Work Orders ({workOrders.length})</span>
            </h3>

            <div className="space-y-3">
              {workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="bg-industrial-900/90 p-4 rounded-xl border border-industrial-border hover:border-accent-cyan/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-accent-cyan font-bold text-xs">{wo.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        wo.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {wo.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{wo.title}</h4>
                    <p className="text-xs text-gray-400">{wo.description}</p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <span>Asset: <strong className="text-gray-200">{wo.asset_name || wo.asset_tag}</strong></span>
                      <span>Assigned to: <strong className="text-gray-200">{wo.assigned_to_name || 'Technician'}</strong></span>
                      <span>Due: <strong className="text-white font-mono">{wo.due_date ? new Date(wo.due_date).toLocaleDateString() : 'Asap'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase border ${
                      wo.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                      wo.status === 'in_progress' ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/40' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {wo.status.replace('_', ' ')}
                    </span>

                    <Link
                      to={`/work-orders/${wo.id}`}
                      className="px-3 py-1.5 bg-industrial-800 hover:bg-industrial-700 text-gray-200 rounded-lg text-xs font-bold transition-colors"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
