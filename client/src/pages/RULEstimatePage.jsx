import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import RULEstimatePanel from '../components/ai/RULEstimatePanel';
import { aiAPI, assetAPI } from '../services/api';
import { Clock, ArrowLeft } from 'lucide-react';

export default function RULEstimatePage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [rulData, setRulData] = useState(null);

  useEffect(() => {
    async function loadRUL() {
      try {
        const targetId = assetId || 'ast-30001-pump-101';
        const assetRes = await assetAPI.getAssetById(targetId);
        setAsset(assetRes.data);

        const rulRes = await aiAPI.getRULEstimate(targetId);
        setRulData(rulRes.data);
      } catch (err) {
        console.warn("RUL error:", err);
      }
    }
    loadRUL();
  }, [assetId]);

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-industrial-800 rounded-xl text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-6 h-6 text-accent-cyan" />
                Remaining Useful Life (RUL) Estimation
              </h1>
              <p className="text-xs text-gray-400">
                Asset: <strong className="text-white">{asset?.name || 'Main Feed Pump P-101'}</strong> ({asset?.asset_tag})
              </p>
            </div>
          </div>

          <RULEstimatePanel rulData={rulData} />
        </main>
      </div>
    </div>
  );
}
