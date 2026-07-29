import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import FailurePredictionPanel from '../components/ai/FailurePredictionPanel';
import RecommendationList from '../components/ai/RecommendationList';
import { aiAPI, assetAPI } from '../services/api';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

export default function FailurePredictionPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetId = assetId || 'ast-30001-pump-101';

  useEffect(() => {
    async function loadData() {
      try {
        const assetRes = await assetAPI.getAssetById(targetId);
        setAsset(assetRes.data);

        // Run or fetch failure risk analysis
        const predRes = await aiAPI.getFailurePrediction(targetId);
        setPrediction(predRes.data.raw_ai_response || predRes.data);
      } catch (err) {
        console.warn("Prediction loading warning:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [targetId]);

  const handleRunPrediction = async () => {
    setIsAnalyzing(true);
    try {
      const predRes = await aiAPI.getFailurePrediction(targetId);
      setPrediction(predRes.data.raw_ai_response || predRes.data);
    } catch (err) {
      console.error("Prediction trigger error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      const recRes = await aiAPI.generateRecommendations(targetId);
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-industrial-800 rounded-xl text-gray-400 hover:text-white cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent-cyan" />
                  Gemini AI Failure Risk Prediction
                </h1>
                <p className="text-xs text-gray-400">
                  Asset: <strong className="text-white">{asset?.name || 'Main Feed Pump P-101'}</strong> ({asset?.asset_tag || 'PUMP-101-A'})
                </p>
              </div>
            </div>

            <button
              onClick={handleRunPrediction}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-accent-cyan/20 transition-all hover:scale-105 cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Failure Analysis</span>
                </>
              )}
            </button>
          </div>

          {loading ? (
            <div className="glass-panel p-12 rounded-2xl text-center">
              <Loader2 className="w-8 h-8 text-accent-cyan mx-auto mb-3 animate-spin" />
              <h3 className="text-base font-bold text-white mb-1">Evaluating Asset Sensor Feeds...</h3>
              <p className="text-xs text-gray-400">Processing telemetry, vibration, and thermal parameters.</p>
            </div>
          ) : (
            <>
              <FailurePredictionPanel
                prediction={prediction}
                onRunPrediction={handleRunPrediction}
                onGenerateRecommendations={handleGenerateRecommendations}
                isAnalyzing={isAnalyzing}
              />

              {recommendations && (
                <RecommendationList
                  recommendationData={recommendations}
                  onConfirmPlan={handleConfirmPlan}
                  isSubmitting={isSubmitting}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
