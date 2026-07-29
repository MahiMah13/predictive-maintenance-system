import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import SensorTrendChart from '../components/maintenance/SensorTrendChart';
import FailurePredictionPanel from '../components/ai/FailurePredictionPanel';
import RULEstimatePanel from '../components/ai/RULEstimatePanel';
import RecommendationList from '../components/ai/RecommendationList';
import { assetAPI, aiAPI } from '../services/api';
import { 
  Boxes, 
  Activity, 
  AlertTriangle, 
  ClipboardList, 
  Sparkles, 
  Plus, 
  MapPin, 
  Calendar,
  Clock,
  ArrowLeft,
  FileText
} from 'lucide-react';

export default function AssetDetailPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, telemetry, failures, work_orders, ai
  const [prediction, setPrediction] = useState(null);
  const [rul, setRul] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states for logging sensor readings / failure events
  const [showLogModal, setShowLogModal] = useState(false);
  const [newReading, setNewReading] = useState({ reading_type: 'vibration_mm_s', value: 6.8, unit: 'mm/s', notes: 'Manual vibration audit' });

  useEffect(() => {
    async function loadAssetDetails() {
      try {
        const res = await assetAPI.getAssetById(assetId);
        setAsset(res.data);
        if (res.data.ai_predictions && res.data.ai_predictions.length > 0) {
          const latestPred = res.data.ai_predictions.find(p => p.prediction_type === 'failure_prediction');
          const latestRUL = res.data.ai_predictions.find(p => p.prediction_type === 'rul_estimate');
          if (latestPred) setPrediction(latestPred.raw_ai_response || latestPred);
          if (latestRUL) setRul(latestRUL);
        }
        if (res.data.ai_recommendations && res.data.ai_recommendations.length > 0) {
          setRecommendations(res.data.ai_recommendations[0]);
        }
      } catch (err) {
        console.error("Error loading asset detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssetDetails();
  }, [assetId]);

  const handleRunPrediction = async () => {
    try {
      const predRes = await aiAPI.getFailurePrediction(assetId);
      setPrediction(predRes.data.raw_ai_response || predRes.data);
      const rulRes = await aiAPI.getRULEstimate(assetId);
      setRul(rulRes.data);
      setActiveTab('ai');
    } catch (err) {
      console.error("Prediction trigger error:", err);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      const recRes = await aiAPI.generateRecommendations(assetId);
      setRecommendations(recRes.data);
    } catch (err) {
      console.error("Recommendations error:", err);
    }
  };

  const handleConfirmRecommendation = async (recId, payload) => {
    setIsSubmitting(true);
    try {
      await aiAPI.confirmRecommendation(recId, payload);
      navigate('/schedule');
    } catch (err) {
      console.error("Confirm plan error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogReadingSubmit = async (e) => {
    e.preventDefault();
    try {
      await assetAPI.logSensorReading(assetId, newReading);
      setShowLogModal(false);
      const refreshed = await assetAPI.getAssetById(assetId);
      setAsset(refreshed.data);
    } catch (err) {
      console.error("Error logging reading:", err);
    }
  };

  if (loading || !asset) {
    return (
      <div className="min-h-screen bg-industrial-900 flex items-center justify-center text-white">
        <Activity className="w-8 h-8 text-accent-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="glass-panel p-6 rounded-3xl border border-industrial-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/assets')} className="p-1.5 bg-industrial-800 rounded-lg text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2.5 py-1 rounded-md border border-accent-cyan/20">
                  {asset.asset_tag}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  asset.criticality_tier === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {asset.criticality_tier}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{asset.name}</h1>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <span>{asset.category}</span> • <span>{asset.location}</span> • <span>Installed: {asset.install_date}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-1.5 bg-industrial-800 hover:bg-industrial-700 text-gray-200 border border-industrial-border font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                Log Telemetry Reading
              </button>

              <button
                onClick={handleRunPrediction}
                className="flex items-center gap-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-accent-cyan/20 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Analyze AI Failure Risk
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-industrial-border pb-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview & Parameters', icon: Boxes },
              { id: 'telemetry', label: 'Sensor Telemetry', icon: Activity },
              { id: 'failures', label: 'Failure History', icon: AlertTriangle },
              { id: 'work_orders', label: 'Work Orders', icon: ClipboardList },
              { id: 'ai', label: 'Gemini AI Advisory & RUL', icon: Sparkles },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 shadow-sm'
                      : 'text-gray-400 hover:bg-industrial-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Specifications</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-industrial-border pb-2">
                    <span className="text-gray-400">Manufacturer</span>
                    <span className="text-white font-bold">{asset.manufacturer || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-industrial-border pb-2">
                    <span className="text-gray-400">Model</span>
                    <span className="text-white font-bold">{asset.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-industrial-border pb-2">
                    <span className="text-gray-400">Serial Number</span>
                    <span className="text-white font-mono">{asset.serial_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-industrial-border pb-2">
                    <span className="text-gray-400">Lifecycle Status</span>
                    <span className="text-amber-400 font-bold uppercase">{asset.lifecycle_status}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Operating Design Limits</h3>
                <div className="space-y-2 text-xs">
                  {Object.entries(asset.operating_parameters || {}).map(([key, val]) => (
                    <div key={key} className="bg-industrial-900/80 p-3 rounded-xl border border-industrial-border flex justify-between">
                      <span className="text-gray-300 font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-accent-cyan font-bold font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <SensorTrendChart readings={asset.sensor_readings} assetName={asset.name} />
          )}

          {activeTab === 'failures' && (
            <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Historical Failure Events ({asset.failure_events?.length || 0})</h3>
                <Link to={`/failures/new?asset_id=${asset.id}`} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl text-xs font-bold">
                  Log Breakdown Event
                </Link>
              </div>

              <div className="space-y-3">
                {(asset.failure_events || []).map((f) => (
                  <div key={f.id} className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400">{f.failure_mode}</span>
                      <span className="text-gray-400 font-mono">Downtime Cost: ${f.estimated_cost_impact?.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300">Root Cause: {f.root_cause}</p>
                    <p className="text-gray-400 text-[11px]">Technician Notes: {f.technician_notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'work_orders' && (
            <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-4">
              <h3 className="text-sm font-bold text-white">Work Orders ({asset.work_orders?.length || 0})</h3>
              <div className="space-y-3">
                {(asset.work_orders || []).map((wo) => (
                  <div key={wo.id} className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-accent-cyan font-bold mr-2">{wo.id}</span>
                      <span className="font-bold text-white">{wo.title}</span>
                      <p className="text-gray-400 mt-1">{wo.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      {wo.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <FailurePredictionPanel 
                prediction={prediction} 
                onRunPrediction={handleRunPrediction}
                onGenerateRecommendations={handleGenerateRecommendations} 
              />
              <RULEstimatePanel rulData={rul} />
              {recommendations && (
                <RecommendationList
                  recommendationData={recommendations}
                  onConfirmPlan={handleConfirmRecommendation}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          )}

          {/* Modal for Telemetry Logging */}
          {showLogModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-industrial-800 border border-industrial-border rounded-3xl p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-bold text-white">Log Sensor Telemetry Reading</h3>
                <form onSubmit={handleLogReadingSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Reading Metric Type</label>
                    <select
                      value={newReading.reading_type}
                      onChange={(e) => setNewReading({ ...newReading, reading_type: e.target.value })}
                      className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="vibration_mm_s">Vibration (mm/s RMS)</option>
                      <option value="temperature_c">Temperature (°C)</option>
                      <option value="pressure_psi">Pressure (PSI)</option>
                      <option value="runtime_hours">Runtime Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Observed Value</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newReading.value}
                      onChange={(e) => setNewReading({ ...newReading, value: parseFloat(e.target.value) })}
                      className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Unit</label>
                    <input
                      type="text"
                      required
                      value={newReading.unit}
                      onChange={(e) => setNewReading({ ...newReading, unit: e.target.value })}
                      className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 bg-industrial-700 text-gray-300 rounded-xl text-xs">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-accent-cyan text-industrial-900 font-bold rounded-xl text-xs">
                      Save Reading
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
