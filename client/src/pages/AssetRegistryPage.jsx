import React, { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import AssetTable from '../components/assets/AssetTable';
import AssetCard from '../components/assets/AssetCard';
import { assetAPI } from '../services/api';
import { Boxes, Plus, Search, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssetRegistryPage() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await assetAPI.getAssets({ search, category: categoryFilter, criticality: criticalityFilter });
        setAssets(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.warn("Error loading assets:", err);
      }
    }
    loadAssets();
  }, [search, categoryFilter, criticalityFilter]);

  const safeAssets = Array.isArray(assets) ? assets.filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Boxes className="w-6 h-6 text-accent-cyan" />
                Plant Asset Registry
              </h1>
              <p className="text-xs text-gray-400">
                Single source of truth for machinery tags, specifications, operating parameters, and criticality tiers.
              </p>
            </div>

            <Link
              to="/assets/new"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-accent-cyan/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Register New Asset
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-industrial-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tag, name, manufacturer, or location..."
                className="w-full bg-industrial-900 border border-industrial-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={criticalityFilter}
                onChange={(e) => setCriticalityFilter(e.target.value)}
                className="bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="">All Criticality Tiers</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <div className="flex items-center gap-1 bg-industrial-900 p-1 rounded-xl border border-industrial-border">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-accent-cyan text-industrial-900 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-accent-cyan text-industrial-900 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Asset List Content */}
          {viewMode === 'table' ? (
            <AssetTable assets={safeAssets} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
