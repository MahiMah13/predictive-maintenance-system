import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import RULEstimatePanel from '../components/ai/RULEstimatePanel';
import { aiAPI, assetAPI } from '../services/api';
import { Clock, ArrowLeft, Boxes, Loader2 } from 'lucide-react';

export default function RULEstimatePage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [allAssets, setAllAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [asset, setAsset] = useState(null);
  const [rulData, setRulData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await assetAPI.getAssets();
        const list = Array.isArray(res?.data) ? res.data : [];
        setAllAssets(list);

        let targetId = assetId;
        if (!targetId || targetId === 'default' || !list.find(a => a.id === targetId)) {
          targetId = list[0]?.id || 'ast-30001-pump-101';
        }
        setSelectedAssetId(targetId);

        const assetRes = await assetAPI.getAssetById(targetId);
        setAsset(assetRes.data);

        const rulRes = await aiAPI.getRULEstimate(targetId);
        setRulData(rulRes.data);
      } catch (err) {
        console.warn("RUL error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [assetId]);

  const handleSelectAsset = async (newId) => {
    setSelectedAssetId(newId);
    setLoading(true);
    try {
      const assetRes = await assetAPI.getAssetById(newId);
      setAsset(assetRes.data);
      const rulRes = await aiAPI.getRULEstimate(newId);
      setRulData(rulRes.data);
    } catch (err) {
      console.warn("Error selecting asset for RUL:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-industrial-800 rounded-xl text-gray-400 hover:text-white cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-6 h-6 text-accent-cyan" />
                  Remaining Useful Life (RUL) Estimation
                </h1>
                <p className="text-xs text-gray-400">
                  Target Asset: <strong className="text-white">{asset?.name || 'Selected Machine'}</strong> ({asset?.asset_tag || 'AST-N/A'})
                </p>
              </div>
            </div>

            {allAssets.length > 0 && (
              <div className="flex items-center gap-2 bg-industrial-800 px-3 py-1.5 rounded-xl border border-industrial-border">
                <Boxes className="w-4 h-4 text-accent-cyan" />
                <select
                  value={selectedAssetId}
                  onChange={(e) => handleSelectAsset(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  {allAssets.map(a => (
                    <option key={a.id} value={a.id} className="bg-industrial-900 text-white">
                      {a.asset_tag} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="glass-panel p-12 rounded-2xl text-center">
              <Loader2 className="w-8 h-8 text-accent-cyan mx-auto mb-3 animate-spin" />
              <h3 className="text-base font-bold text-white mb-1">Calculating RUL Degradation Models...</h3>
            </div>
          ) : (
            <RULEstimatePanel rulData={rulData} />
          )}
        </main>
      </div>
    </div>
  );
}
