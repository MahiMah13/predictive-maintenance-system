import store from '../services/store.js';
import { runFailurePrediction, runRULEstimate, generateRecommendations } from '../services/predictionService.js';
import { runMultiAgentPlanner } from '../services/agentOrchestrator.js';
import { askAIMaintenanceEngineer } from '../services/ragService.js';
import { confirmRecommendationSchema } from '../schemas/validationSchemas.js';

export async function triggerFailurePrediction(req, res, next) {
  try {
    const assetId = req.params.id;
    const asset = store.assets.find(a => a.id === assetId);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    const sensorReadings = store.sensor_readings.filter(r => r.asset_id === assetId);
    const maintenanceHistory = store.work_orders.filter(w => w.asset_id === assetId);
    const failureHistory = store.failure_events.filter(f => f.asset_id === assetId);

    const prediction = await runFailurePrediction(asset, sensorReadings, maintenanceHistory, failureHistory);

    const newPredRecord = {
      id: `pred-${Date.now()}`,
      asset_id: assetId,
      prediction_type: 'failure_prediction',
      risk_score: prediction.risk_score,
      predicted_failure_mode: prediction.predicted_failure_mode,
      rul_estimate_hours: null,
      confidence_level: prediction.confidence_level,
      assumptions: prediction.assumptions,
      contributing_factors: prediction.contributing_factors,
      raw_ai_response: prediction,
      generated_by: req.user.id,
      created_at: new Date().toISOString()
    };

    store.ai_predictions.unshift(newPredRecord);
    res.json(newPredRecord);
  } catch (err) {
    next(err);
  }
}

export async function triggerReanalysis(req, res, next) {
  try {
    const assetId = req.params.id;
    const asset = store.assets.find(a => a.id === assetId);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const sensorReadings = store.sensor_readings.filter(r => r.asset_id === assetId);
    const maintenanceHistory = store.work_orders.filter(w => w.asset_id === assetId);
    const failureHistory = store.failure_events.filter(f => f.asset_id === assetId);

    const prediction = await runFailurePrediction(asset, sensorReadings, maintenanceHistory, failureHistory);

    const newPredRecord = {
      id: `pred-rean-${Date.now()}`,
      asset_id: assetId,
      prediction_type: 'failure_reanalysis',
      risk_score: prediction.risk_score,
      predicted_failure_mode: prediction.predicted_failure_mode,
      confidence_level: prediction.confidence_level,
      assumptions: prediction.assumptions,
      contributing_factors: prediction.contributing_factors,
      raw_ai_response: prediction,
      generated_by: req.user.id,
      created_at: new Date().toISOString()
    };
    store.ai_predictions.unshift(newPredRecord);
    res.json(newPredRecord);
  } catch (err) {
    next(err);
  }
}

export async function triggerRULEstimate(req, res, next) {
  try {
    const assetId = req.params.id;
    const asset = store.assets.find(a => a.id === assetId);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    const sensorReadings = store.sensor_readings.filter(r => r.asset_id === assetId);
    const maintenanceHistory = store.work_orders.filter(w => w.asset_id === assetId);
    const failureHistory = store.failure_events.filter(f => f.asset_id === assetId);

    const rulResult = await runRULEstimate(asset, sensorReadings, maintenanceHistory, failureHistory);

    const newPredRecord = {
      id: `pred-rul-${Date.now()}`,
      asset_id: assetId,
      prediction_type: 'rul_estimate',
      risk_score: null,
      predicted_failure_mode: rulResult.primary_degradation_mechanism,
      rul_estimate_hours: rulResult.rul_estimate_hours,
      confidence_level: rulResult.confidence_level,
      assumptions: rulResult.assumptions,
      contributing_factors: [],
      raw_ai_response: rulResult,
      generated_by: req.user.id,
      created_at: new Date().toISOString()
    };

    store.ai_predictions.unshift(newPredRecord);
    res.json(newPredRecord);
  } catch (err) {
    next(err);
  }
}

export async function generateAIRecommendations(req, res, next) {
  try {
    const assetId = req.params.id;
    const asset = store.assets.find(a => a.id === assetId);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    const latestPrediction = store.ai_predictions
      .filter(p => p.asset_id === assetId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    const recResult = await generateRecommendations(asset, latestPrediction?.raw_ai_response);

    const newRecRecord = {
      id: `rec-${Date.now()}`,
      asset_id: assetId,
      prediction_id: latestPrediction?.id || null,
      recommendations: recResult.recommendations,
      confidence_level: recResult.confidence_level,
      status: 'pending',
      confirmed_by: null,
      confirmed_at: null,
      created_at: new Date().toISOString()
    };

    store.ai_recommendations.unshift(newRecRecord);
    res.json(newRecRecord);
  } catch (err) {
    next(err);
  }
}

export async function confirmRecommendation(req, res, next) {
  try {
    const recId = req.params.id;
    const validated = confirmRecommendationSchema.parse(req.body);

    const rec = store.ai_recommendations.find(r => r.id === recId);
    if (!rec) return res.status(404).json({ error: "Recommendation not found" });

    rec.status = 'accepted';
    rec.confirmed_by = req.user.id;
    rec.confirmed_at = new Date().toISOString();

    const topAction = rec.recommendations?.[0] || { action: 'AI Recommended Maintenance Plan' };

    // Automatically create Work Order upon explicit human confirmation
    const newWorkOrder = {
      id: `wo-ai-${Date.now()}`,
      asset_id: rec.asset_id,
      schedule_id: null,
      assigned_to: req.user.id,
      title: `AI Work Plan: ${topAction.action || 'Preventive Maintenance'}`,
      description: `Generated by Gemini AI Advisory (Confidence: ${rec.confidence_level}).\n\nVerified Plant Conditions: ${validated.notes || 'User confirmed physical condition matches AI assumptions.'}\n\nActions:\n` +
        rec.recommendations.map(r => `- [${r.priority}] ${r.action} (${r.justification})`).join('\n'),
      status: 'scheduled',
      priority: rec.confidence_level === 'high' ? 'high' : 'medium',
      due_date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.work_orders.unshift(newWorkOrder);

    res.json({
      message: "Recommendation accepted and Work Order automatically created",
      recommendation: rec,
      created_work_order: newWorkOrder
    });
  } catch (err) {
    next(err);
  }
}

export async function createChatSession(req, res) {
  const { asset_id, title } = req.body;
  const newSession = {
    id: `chat-${Date.now()}`,
    user_id: req.user.id,
    asset_id: asset_id || null,
    title: title || 'AI Maintenance Troubleshooting Session',
    created_at: new Date().toISOString()
  };
  store.ai_chat_sessions.unshift(newSession);
  res.status(201).json(newSession);
}

export async function postChatMessage(req, res, next) {
  try {
    const sessionId = req.params.id;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Message content is required" });

    const session = store.ai_chat_sessions.find(s => s.id === sessionId);

    // Save user message
    const userMsg = {
      id: `msg-${Date.now()}-u`,
      session_id: sessionId,
      role: 'user',
      content,
      retrieved_sources: [],
      created_at: new Date().toISOString()
    };
    store.ai_chat_messages.push(userMsg);

    // Run RAG answer generation
    const ragResult = await askAIMaintenanceEngineer(content, session?.asset_id);

    const assistantMsg = {
      id: `msg-${Date.now()}-a`,
      session_id: sessionId,
      role: 'assistant',
      content: ragResult.answer,
      retrieved_sources: ragResult.retrieved_sources,
      created_at: new Date().toISOString()
    };
    store.ai_chat_messages.push(assistantMsg);

    res.json({
      user_message: userMsg,
      assistant_message: assistantMsg
    });
  } catch (err) {
    next(err);
  }
}

export async function runPlanner(req, res, next) {
  try {
    const fleetData = store.assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      tag: asset.asset_tag,
      category: asset.category,
      criticality: asset.criticality_tier,
      status: asset.lifecycle_status,
      latest_vibration: store.sensor_readings.find(r => r.asset_id === asset.id && r.reading_type.includes('vibration'))?.value || 3.0,
      latest_temp: store.sensor_readings.find(r => r.asset_id === asset.id && r.reading_type.includes('temp'))?.value || 60,
      recent_failures: store.failure_events.filter(f => f.asset_id === asset.id).length
    }));

    const plannerResult = await runMultiAgentPlanner(fleetData);

    const newRun = {
      id: `plan-${Date.now()}`,
      organization_id: req.user.organization_id || 'org-10001-apex-manufacturing',
      requested_by: req.user.id,
      scope: 'Fleet-wide Industrial Assets',
      ...plannerResult,
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    store.agent_planning_runs.unshift(newRun);
    res.json(newRun);
  } catch (err) {
    next(err);
  }
}
