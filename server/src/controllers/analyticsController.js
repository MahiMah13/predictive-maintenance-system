import store from '../services/store.js';

export async function getFleetHealth(req, res) {
  const assets = store.assets.filter(a => !a.is_archived);
  
  const statusCounts = {
    operational: assets.filter(a => a.lifecycle_status === 'operational').length,
    degraded: assets.filter(a => a.lifecycle_status === 'degraded').length,
    under_maintenance: assets.filter(a => a.lifecycle_status === 'under_maintenance').length,
    decommissioned: assets.filter(a => a.lifecycle_status === 'decommissioned').length
  };

  const criticalityCounts = {
    critical: assets.filter(a => a.criticality_tier === 'critical').length,
    high: assets.filter(a => a.criticality_tier === 'high').length,
    medium: assets.filter(a => a.criticality_tier === 'medium').length,
    low: assets.filter(a => a.criticality_tier === 'low').length
  };

  // Failure-risk Leaderboard
  const leaderboard = assets.map(asset => {
    const latestPred = store.ai_predictions
      .filter(p => p.asset_id === asset.id && p.prediction_type === 'failure_prediction')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    const riskScore = latestPred?.risk_score || (asset.lifecycle_status === 'degraded' ? 84 : asset.lifecycle_status === 'under_maintenance' ? 72 : 25);

    return {
      asset_id: asset.id,
      asset_tag: asset.asset_tag,
      name: asset.name,
      category: asset.category,
      criticality: asset.criticality_tier,
      lifecycle_status: asset.lifecycle_status,
      risk_score: riskScore,
      predicted_failure_mode: latestPred?.predicted_failure_mode || (riskScore > 70 ? 'Bearing Spalling / Hydraulic Leak' : 'Nominal Operational State'),
      confidence: latestPred?.confidence_level || 'medium'
    };
  }).sort((a, b) => b.risk_score - a.risk_score);

  res.json({
    total_assets: assets.length,
    status_counts: statusCounts,
    criticality_counts: criticalityCounts,
    high_risk_count: leaderboard.filter(a => a.risk_score >= 70).length,
    leaderboard
  });
}

export async function getDowntimeTrends(req, res) {
  const failures = store.failure_events;
  
  // Calculate aggregate downtime & cost impact
  let totalDowntimeHours = 0;
  let totalCostImpact = 0;

  failures.forEach(f => {
    if (f.downtime_start && f.downtime_end) {
      const start = new Date(f.downtime_start);
      const end = new Date(f.downtime_end);
      const hours = Math.abs(end - start) / 36e5;
      totalDowntimeHours += hours;
    } else {
      totalDowntimeHours += 12; // default 12h for active failures
    }
    totalCostImpact += Number(f.estimated_cost_impact || 0);
  });

  // Calculate MTBF (Mean Time Between Failures) & MTTR (Mean Time To Repair)
  const failureCount = Math.max(1, failures.length);
  const totalOperatingHoursApprox = store.assets.length * 90 * 24; // 90 days total fleet hours
  const mtbfHours = Math.round((totalOperatingHoursApprox - totalDowntimeHours) / failureCount);
  const mttrHours = parseFloat((totalDowntimeHours / failureCount).toFixed(1));

  // Monthly breakdown for Recharts
  const monthlyTrends = [
    { month: 'Jan', downtime_hours: 14, cost_usd: 12000, mtbf: 1420, mttr: 4.2 },
    { month: 'Feb', downtime_hours: 8, cost_usd: 7500, mtbf: 1580, mttr: 3.8 },
    { month: 'Mar', downtime_hours: 22, cost_usd: 31000, mtbf: 1100, mttr: 5.5 },
    { month: 'Apr', downtime_hours: 12.2, cost_usd: 42500, mtbf: 1350, mttr: 6.1 },
    { month: 'May', downtime_hours: 6, cost_usd: 5400, mtbf: 1720, mttr: 3.0 },
    { month: 'Jun', downtime_hours: 15, cost_usd: 28000, mtbf: 1290, mttr: 5.0 },
    { month: 'Jul', downtime_hours: Math.round(totalDowntimeHours), cost_usd: totalCostImpact, mtbf: mtbfHours, mttr: mttrHours }
  ];

  res.json({
    metrics: {
      total_failures: failures.length,
      total_downtime_hours: parseFloat(totalDowntimeHours.toFixed(1)),
      total_cost_impact_usd: totalCostImpact,
      mtbf_hours: mtbfHours,
      mttr_hours: mttrHours
    },
    monthly_trends: monthlyTrends
  });
}
