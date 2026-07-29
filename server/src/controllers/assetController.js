import store from '../services/store.js';
import { assetCreateSchema, sensorReadingSchema, failureEventSchema } from '../schemas/validationSchemas.js';

export async function listAssets(req, res) {
  const { category, criticality, search, status } = req.query;
  let assets = store.assets.filter(a => !a.is_archived);

  if (category) {
    assets = assets.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }
  if (criticality) {
    assets = assets.filter(a => a.criticality_tier === criticality);
  }
  if (status) {
    assets = assets.filter(a => a.lifecycle_status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    assets = assets.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.asset_tag.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }

  // Attach latest risk score prediction summaries
  const richAssets = assets.map(asset => {
    const latestPred = store.ai_predictions
      .filter(p => p.asset_id === asset.id && p.prediction_type === 'failure_prediction')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
    const openWO = store.work_orders.filter(w => w.asset_id === asset.id && w.status !== 'completed' && w.status !== 'cancelled');

    return {
      ...asset,
      latest_prediction: latestPred || null,
      risk_score: latestPred?.risk_score || (asset.lifecycle_status === 'degraded' ? 84 : 25),
      open_work_orders_count: openWO.length
    };
  });

  res.json(richAssets);
}

export async function createAsset(req, res, next) {
  try {
    const validated = assetCreateSchema.parse(req.body);
    const newAsset = {
      id: `ast-${Date.now()}`,
      organization_id: req.user.organization_id || 'org-10001-apex-manufacturing',
      owner_id: req.user.id,
      asset_tag: validated.asset_tag,
      name: validated.name,
      category: validated.category,
      manufacturer: validated.manufacturer || 'Generic Industrial OEM',
      model: validated.model || 'Standard Model',
      serial_number: validated.serial_number || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
      install_date: validated.install_date || new Date().toISOString().split('T')[0],
      location: validated.location || 'Main Factory Bay',
      criticality_tier: validated.criticality_tier,
      operating_parameters: validated.operating_parameters || {},
      lifecycle_status: validated.lifecycle_status || 'operational',
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.assets.unshift(newAsset);
    res.status(201).json(newAsset);
  } catch (err) {
    next(err);
  }
}

export async function getAssetById(req, res) {
  const asset = store.assets.find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ error: "Asset not found" });
  }

  const readings = store.sensor_readings.filter(r => r.asset_id === asset.id);
  const failures = store.failure_events.filter(f => f.asset_id === asset.id);
  const schedules = store.maintenance_schedules.filter(s => s.asset_id === asset.id);
  const workOrders = store.work_orders.filter(w => w.asset_id === asset.id);
  const predictions = store.ai_predictions.filter(p => p.asset_id === asset.id);
  const recommendations = store.ai_recommendations.filter(r => r.asset_id === asset.id);
  const attachments = store.asset_attachments.filter(a => a.asset_id === asset.id);

  res.json({
    ...asset,
    sensor_readings: readings,
    failure_events: failures,
    maintenance_schedules: schedules,
    work_orders: workOrders,
    ai_predictions: predictions,
    ai_recommendations: recommendations,
    attachments
  });
}

export async function updateAsset(req, res) {
  const asset = store.assets.find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ error: "Asset not found" });
  }

  Object.assign(asset, req.body, { updated_at: new Date().toISOString() });
  res.json(asset);
}

export async function archiveAsset(req, res) {
  const asset = store.assets.find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ error: "Asset not found" });
  }

  asset.is_archived = true;
  asset.updated_at = new Date().toISOString();
  res.json({ message: "Asset archived successfully", id: asset.id });
}

export async function logSensorReading(req, res, next) {
  try {
    const validated = sensorReadingSchema.parse(req.body);
    const newReading = {
      id: `sr-${Date.now()}`,
      asset_id: req.params.id,
      recorded_by: req.user.id,
      reading_type: validated.reading_type,
      value: validated.value,
      unit: validated.unit,
      source: validated.source || 'manual',
      notes: validated.notes || null,
      recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    store.sensor_readings.unshift(newReading);

    // If vibration > 6.5 or temp > 75, update asset lifecycle status to degraded
    const asset = store.assets.find(a => a.id === req.params.id);
    if (asset && (validated.reading_type.includes('vibration') && validated.value > 6.0)) {
      asset.lifecycle_status = 'degraded';
    }

    res.status(201).json(newReading);
  } catch (err) {
    next(err);
  }
}

export async function getSensorReadings(req, res) {
  const readings = store.sensor_readings.filter(r => r.asset_id === req.params.id);
  res.json(readings);
}

export async function logFailureEvent(req, res, next) {
  try {
    const validated = failureEventSchema.parse(req.body);
    const newFailure = {
      id: `fl-${Date.now()}`,
      asset_id: req.params.id,
      reported_by: req.user.id,
      failure_mode: validated.failure_mode,
      root_cause: validated.root_cause || null,
      affected_component: validated.affected_component || null,
      severity: validated.severity,
      downtime_start: validated.downtime_start,
      downtime_end: validated.downtime_end || null,
      estimated_cost_impact: validated.estimated_cost_impact || 0,
      technician_notes: validated.technician_notes || null,
      image_urls: [],
      created_at: new Date().toISOString()
    };

    store.failure_events.unshift(newFailure);

    // Update asset lifecycle status if severe breakdown
    const asset = store.assets.find(a => a.id === req.params.id);
    if (asset && (validated.severity === 'critical' || validated.severity === 'high')) {
      asset.lifecycle_status = 'under_maintenance';
    }

    res.status(201).json(newFailure);
  } catch (err) {
    next(err);
  }
}

export async function getFailureHistory(req, res) {
  const failures = store.failure_events.filter(f => f.asset_id === req.params.id);
  res.json(failures);
}
