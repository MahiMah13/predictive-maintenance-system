import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import { assetAPI } from '../services/api';
import { AlertTriangle, Save, ArrowLeft } from 'lucide-react';

export default function LogFailurePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetAssetId = searchParams.get('asset_id') || 'ast-30001-pump-101';

  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    asset_id: presetAssetId,
    failure_mode: 'Bearing Failure',
    root_cause: 'Inadequate lubrication resulting in inner race spalling.',
    affected_component: 'Drive-End Roller Bearing',
    severity: 'critical',
    downtime_start: new Date().toISOString().substring(0, 16),
    downtime_end: new Date().toISOString().substring(0, 16),
    estimated_cost_impact: 42500,
    technician_notes: 'Replaced DE bearing set, flushed oil reservoir, re-aligned coupling.'
  });

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await assetAPI.getAssets();
        setAssets(res.data);
      } catch (err) {
        console.warn("Error loading assets:", err);
      }
    }
    loadAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assetAPI.logFailureEvent(formData.asset_id, formData);
      navigate('/failures');
    } catch (err) {
      console.error("Error logging failure:", err);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-industrial-800 rounded-xl text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Log Breakdown & Failure Event
              </h1>
              <p className="text-xs text-gray-400">Record machine breakdown details to train predictive failure models.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Asset *</label>
                <select
                  value={formData.asset_id}
                  onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.asset_tag} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Failure Mode *</label>
                <select
                  value={formData.failure_mode}
                  onChange={(e) => setFormData({ ...formData, failure_mode: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                >
                  <option value="Bearing Failure">Bearing Failure</option>
                  <option value="Overheating">Overheating</option>
                  <option value="Vibration/Misalignment">Vibration/Misalignment</option>
                  <option value="Corrosion">Corrosion</option>
                  <option value="Electrical Fault">Electrical Fault</option>
                  <option value="Lubrication Failure">Lubrication Failure</option>
                  <option value="Fatigue/Wear">Fatigue/Wear</option>
                  <option value="Seal/Gasket Failure">Seal/Gasket Failure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Severity *</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                >
                  <option value="critical">Critical (Production-Stopping)</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Estimated Cost Impact ($ USD)</label>
                <input
                  type="number"
                  value={formData.estimated_cost_impact}
                  onChange={(e) => setFormData({ ...formData, estimated_cost_impact: parseFloat(e.target.value) })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Root Cause Explanation</label>
                <textarea
                  rows={2}
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Technician Repair Notes</label>
                <textarea
                  rows={2}
                  value={formData.technician_notes}
                  onChange={(e) => setFormData({ ...formData, technician_notes: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-industrial-border pt-4">
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-industrial-800 text-gray-300 rounded-xl text-xs">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Failure Log
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
