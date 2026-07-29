import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import { assetAPI } from '../services/api';
import { Boxes, Save, ArrowLeft, Plus } from 'lucide-react';

export default function CreateAssetPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    asset_tag: 'PUMP-202-B',
    name: 'Secondary Cooling Water Booster Pump P-202',
    category: 'Rotating Equipment',
    manufacturer: 'KSB',
    model: 'Etanorm 80-200',
    serial_number: 'KSB-77102-M',
    install_date: '2022-09-01',
    location: 'Building C - Cooling Tower Bay',
    criticality_tier: 'high',
    operating_parameters: {
      max_rpm: 2900,
      design_flow_gpm: 850,
      max_vibration_mm_s: 4.5
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assetAPI.createAsset(formData);
      navigate('/assets');
    } catch (err) {
      console.error("Error creating asset:", err);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-industrial-800 hover:bg-industrial-700 text-gray-300 rounded-xl border border-industrial-border transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Boxes className="w-5 h-5 text-accent-cyan" />
                Register New Industrial Asset
              </h1>
              <p className="text-xs text-gray-400">Specify machine tag, category, criticality tier, and operating parameters.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Asset Tag *</label>
                <input
                  type="text"
                  required
                  value={formData.asset_tag}
                  onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                >
                  <option value="Rotating Equipment">Rotating Equipment (Motors, Pumps)</option>
                  <option value="Compressors">Compressors</option>
                  <option value="Production Line Machinery">Production Line Machinery</option>
                  <option value="Material Handling">Material Handling (Conveyors)</option>
                  <option value="HVAC">HVAC / Chillers</option>
                  <option value="Electrical Systems">Electrical Systems</option>
                  <option value="Utilities">Utilities (Boilers)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Criticality Tier *</label>
                <select
                  value={formData.criticality_tier}
                  onChange={(e) => setFormData({ ...formData, criticality_tier: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                >
                  <option value="critical">Critical (Production-Stopping)</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Model & Serial No.</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Plant Physical Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-industrial-border pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-industrial-800 hover:bg-industrial-700 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-accent-cyan/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save & Register Asset
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
