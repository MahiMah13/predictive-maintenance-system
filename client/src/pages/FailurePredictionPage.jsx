import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import FailurePredictionPanel from '../components/ai/FailurePredictionPanel';
import RecommendationList from '../components/ai/RecommendationList';
import { aiAPI, assetAPI } from '../services/api';
import { Sparkles, ArrowLeft, Activity } from 'lucide-react';

export default function FailurePredictionPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const targetId = assetId || 'ast-30001-pump-101';
        const assetRes = await assetAPI.getAssetById(targetId);
        setAsset(assetRes.data);

        // Run failure risk analysis
        const predRes = await aiAPI.getFailurePrediction(targetId);
        setPrediction(predRes.data.raw_ai_response || predRes.data);
      } catch (err) {
        console.warn("Prediction loading warning:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [assetId]);

  const handleGenerateRecommendations = async () => {
    try {
      const recRes = await aiAPI.generateRecommendations(asset?.id || 'ast-30001-pump-101');
      setRecommendations(recRes.data);
    } catch (err) {
      console.error("Recommendations error:", err);
    }
  };

  const handleConfirmPlan = async (recId, payload) => {
    setIsSubmitting(true);
    try {
      await aiAPI.confirmRecommendation(recId, payload);
      navigate('/schedule');
    } catch (err) {
      console.error("Confirm error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <Sparkles className="w-6 h-6 text-accent-cyan" />
                Gemini AI Failure Risk Prediction
              </h1>
              <p className="text-xs text-gray-400">
                Asset: <strong className="text-white">{asset?.name || 'Main Feed Pump P-101'}</strong> ({asset?.asset_tag})
              </p>
            </div>
          </div>

          <FailurePredictionPanel
            prediction={prediction}
            onGenerateRecommendations={handleGenerateRecommendations}
          />

          {recommendations && (
            <RecommendationList
              recommendationData={recommendations}
              onConfirmPlan={handleConfirmPlan}
              isSubmitting={isSubmitting}
            />
          )}
        </main>
      </div>
    </div>
  );
}
