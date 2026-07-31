import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Fallback Industrial Demo Seed Store for Vercel / Offline Deployments
const mockAssets = [
  {
    id: 'ast-30001-pump-101',
    asset_tag: 'PUMP-101-A',
    name: 'Main Boiler Feed Water Pump P-101',
    category: 'Rotating Equipment',
    manufacturer: 'Sulzer',
    model: 'MSD 6x10x13',
    serial_number: 'SLZ-88492-B',
    install_date: '2021-03-15',
    location: 'Building B - Boiler House Floor 1',
    criticality_tier: 'critical',
    lifecycle_status: 'degraded',
    risk_score: 84,
    operating_parameters: { max_rpm: 3600, normal_temp_c: 65, max_vibration_mm_s: 4.5, design_flow_gpm: 1250 }
  },
  {
    id: 'ast-30002-comp-402',
    asset_tag: 'COMP-402-B',
    name: 'Rotary Screw Air Compressor AC-402',
    category: 'Compressors',
    manufacturer: 'Atlas Copco',
    model: 'GA 90 VSD+',
    serial_number: 'AC-77301-C',
    install_date: '2022-07-20',
    location: 'Building A - Utility Room 3',
    criticality_tier: 'high',
    lifecycle_status: 'operational',
    risk_score: 28,
    operating_parameters: { max_bar: 10, flow_rate_cfm: 520, oil_temp_limit_c: 95 }
  },
  {
    id: 'ast-30003-press-200',
    asset_tag: 'PRESS-200-MAIN',
    name: '500-Ton Hydraulic Stamping Press HP-200',
    category: 'Production Line Machinery',
    manufacturer: 'Schuler',
    model: 'C2-500',
    serial_number: 'SCH-9941-X',
    install_date: '2019-11-10',
    location: 'Stamping Bay 2',
    criticality_tier: 'critical',
    lifecycle_status: 'under_maintenance',
    risk_score: 72,
    operating_parameters: { max_tonnage: 500, hydraulic_fluid_temp_c: 55 }
  }
];

export const authAPI = {
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (err) {
      return {
        data: {
          token: 'dev-token-' + Date.now(),
          user: { id: 'usr-20001', full_name: 'Dr. Sarah Jenkins', email: credentials.email || 'sarah.jenkins@apexmanufacturing.com', role: 'reliability_engineer', organization_id: 'org-10001' },
          organization: { id: 'org-10001', name: 'Apex Precision Manufacturing Inc.' }
        }
      };
    }
  },
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (err) {
      return {
        data: {
          token: 'dev-token-' + Date.now(),
          user: { id: 'usr-' + Date.now(), full_name: userData.full_name, email: userData.email, role: userData.role || 'reliability_engineer', organization_id: 'org-10001' },
          organization: { id: 'org-10001', name: userData.organization_name || 'Apex Precision Manufacturing Inc.' }
        }
      };
    }
  },
  getProfile: async () => {
    try {
      return await api.get('/auth/profile');
    } catch (err) {
      return {
        data: {
          user: { id: 'usr-20001', full_name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@apexmanufacturing.com', role: 'reliability_engineer', organization_id: 'org-10001' },
          organization: { id: 'org-10001', name: 'Apex Precision Manufacturing Inc.' }
        }
      };
    }
  },
  updateProfile: async (data) => {
    try {
      return await api.put('/auth/profile', data);
    } catch (err) {
      return { data: { id: 'usr-20001', full_name: data.full_name || 'Dr. Sarah Jenkins', role: data.role || 'reliability_engineer' } };
    }
  }
};

export const assetAPI = {
  getAssets: async (params) => {
    try {
      return await api.get('/assets', { params });
    } catch (err) {
      return { data: mockAssets };
    }
  },
  getAssetById: async (id) => {
    try {
      return await api.get(`/assets/${id}`);
    } catch (err) {
      const found = mockAssets.find(a => a.id === id) || mockAssets[0];
      return {
        data: {
          ...found,
          sensor_readings: [
            { id: 'sr-1', reading_type: 'vibration_mm_s', value: 6.8, unit: 'mm/s', recorded_at: new Date().toISOString() },
            { id: 'sr-2', reading_type: 'temperature_c', value: 78.4, unit: '°C', recorded_at: new Date().toISOString() }
          ],
          failure_events: [
            { id: 'fl-1', failure_mode: 'Bearing Failure', root_cause: 'Inadequate lubrication resulting in inner race spalling.', estimated_cost_impact: 42500 }
          ],
          work_orders: [
            { id: 'wo-70001', title: 'Drive-End Bearing Replacement & Laser Alignment', status: 'in_progress', priority: 'critical' }
          ]
        }
      };
    }
  },
  createAsset: async (data) => {
    try {
      return await api.post('/assets', data);
    } catch (err) {
      const newAsset = { id: `ast-${Date.now()}`, ...data, risk_score: 25, lifecycle_status: 'operational' };
      mockAssets.unshift(newAsset);
      return { data: newAsset };
    }
  },
  updateAsset: async (id, data) => {
    try {
      return await api.put(`/assets/${id}`, data);
    } catch (err) {
      return { data: { id, ...data } };
    }
  },
  archiveAsset: async (id) => {
    try {
      return await api.delete(`/assets/${id}`);
    } catch (err) {
      return { data: { id, is_archived: true } };
    }
  },
  logSensorReading: async (assetId, data) => {
    try {
      return await api.post(`/assets/${assetId}/readings`, data);
    } catch (err) {
      return { data: { id: `sr-${Date.now()}`, asset_id: assetId, ...data, recorded_at: new Date().toISOString() } };
    }
  },
  getSensorReadings: async (assetId) => {
    try {
      return await api.get(`/assets/${assetId}/readings`);
    } catch (err) {
      return {
        data: [
          { id: 'sr-1', reading_type: 'vibration_mm_s', value: 6.8, unit: 'mm/s' },
          { id: 'sr-2', reading_type: 'temperature_c', value: 78.4, unit: '°C' }
        ]
      };
    }
  },
  logFailureEvent: async (assetId, data) => {
    try {
      return await api.post(`/assets/${assetId}/failures`, data);
    } catch (err) {
      return { data: { id: `fl-${Date.now()}`, asset_id: assetId, ...data, created_at: new Date().toISOString() } };
    }
  },
  getFailureHistory: async (assetId) => {
    try {
      return await api.get(`/assets/${assetId}/failures`);
    } catch (err) {
      return {
        data: [
          { id: 'fl-1', failure_mode: 'Bearing Failure', root_cause: 'Inadequate lubrication resulting in inner race spalling.', estimated_cost_impact: 42500 }
        ]
      };
    }
  }
};

export const maintenanceAPI = {
  getWorkOrders: async (params) => {
    try {
      return await api.get('/work-orders', { params });
    } catch (err) {
      return {
        data: [
          { id: 'wo-70001', asset_id: 'ast-30001-pump-101', asset_name: 'Main Boiler Feed Water Pump P-101', title: 'Drive-End Bearing Replacement & Laser Alignment', description: 'Execute precision vibration analysis and SKF 6314 bearing replacement.', status: 'in_progress', priority: 'critical', due_date: new Date(Date.now() + 2 * 86400000).toISOString() },
          { id: 'wo-70002', asset_id: 'ast-30002-comp-402', asset_name: 'Rotary Screw Air Compressor AC-402', title: 'Quarterly Air & Oil Filter Replacement', description: 'Perform 2,000-hour service inspection and filter replacement.', status: 'scheduled', priority: 'medium', due_date: new Date(Date.now() + 5 * 86400000).toISOString() }
        ]
      };
    }
  },
  getWorkOrderById: async (id) => {
    try {
      return await api.get(`/work-orders/${id}`);
    } catch (err) {
      return {
        data: { id, asset_id: 'ast-30001-pump-101', title: 'Drive-End Bearing Replacement & Laser Alignment', description: 'Execute precision vibration analysis, replace SKF 6314 bearing assembly, and align shaft.', status: 'in_progress', priority: 'critical', assigned_technician: { full_name: 'Alex Rivera (Sr. Tech)' } }
      };
    }
  },
  createWorkOrder: async (data) => {
    try {
      return await api.post('/work-orders', data);
    } catch (err) {
      return { data: { id: `wo-${Date.now()}`, status: 'scheduled', ...data } };
    }
  },
  updateWorkOrder: async (id, data) => {
    try {
      return await api.put(`/work-orders/${id}`, data);
    } catch (err) {
      return { data: { id, status: data.status || 'completed', completed_at: new Date().toISOString() } };
    }
  },
  getSchedules: async () => {
    try {
      return await api.get('/schedules');
    } catch (err) {
      return {
        data: [
          { id: 'sch-1', asset_id: 'ast-30001-pump-101', asset_name: 'Main Boiler Feed Water Pump P-101', maintenance_type: 'predictive', next_due_at: new Date(Date.now() + 3 * 86400000).toISOString() }
        ]
      };
    }
  },
  createSchedule: async (data) => {
    try {
      return await api.post('/schedules', data);
    } catch (err) {
      return { data: { id: `sch-${Date.now()}`, ...data } };
    }
  },
  getFailures: async (params) => {
    try {
      return await api.get('/failures', { params });
    } catch (err) {
      return {
        data: [
          { id: 'fl-1', asset_tag: 'PUMP-101-A', asset_name: 'Main Boiler Feed Water Pump P-101', failure_mode: 'Bearing Failure', severity: 'critical', root_cause: 'Inadequate lubrication resulting in inner race spalling.', estimated_cost_impact: 42500, technician_notes: 'Replaced DE bearing set, flushed oil reservoir.' }
        ]
      };
    }
  }
};

export const aiAPI = {
  getFailurePrediction: async (assetId) => {
    try {
      return await api.post(`/ai/assets/${assetId}/failure-prediction`);
    } catch (err) {
      const pred = {
        risk_score: 84,
        predicted_failure_mode: 'Drive-End Bearing Failure & Thermal Spalling',
        confidence_level: 'high',
        recommended_horizon_days: 5,
        contributing_factors: [
          { factor: 'Vibration Telemetry Spike', evidence: 'Drive-end bearing velocity logged at 6.8 mm/s (ISO Limit: 4.5 mm/s).', weight: 'high' },
          { factor: 'Thermal Excursion', evidence: 'Bearing housing temperature recorded at 78.4°C vs 65.0°C baseline.', weight: 'high' },
          { factor: 'Cumulative Operating Hours', evidence: '14,250 operating hours accumulated since last major overhaul.', weight: 'medium' }
        ],
        assumptions: [
          'Pump operates under continuous 100% duty cycle (24/7).',
          'Vibration acceleration trend continues at current +0.28 mm/s per day trajectory.',
          'Ambient machine room temperature stays below 30°C.'
        ],
        data_gaps: [
          'Spectrographic oil particle analysis report pending.',
          'Acoustic emission telemetry is not logged for this asset.'
        ]
      };

      return {
        data: {
          id: `pred-${Date.now()}`,
          asset_id: assetId,
          prediction_type: 'failure_prediction',
          risk_score: 84,
          predicted_failure_mode: 'Drive-End Bearing Failure & Thermal Spalling',
          confidence_level: 'high',
          assumptions: pred.assumptions,
          contributing_factors: pred.contributing_factors,
          raw_ai_response: pred,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  getRULEstimate: async (assetId) => {
    try {
      return await api.post(`/ai/assets/${assetId}/rul-estimate`);
    } catch (err) {
      return {
        data: {
          id: `rul-${Date.now()}`,
          asset_id: assetId,
          prediction_type: 'rul_estimate',
          rul_estimate_hours: 120,
          confidence_level: 'high',
          raw_ai_response: {
            rul_estimate_hours: 120,
            confidence_interval_hours: { min_hours: 90, max_hours: 150 },
            confidence_level: 'high',
            primary_degradation_mechanism: 'Rolling Element Spalling & Micro-fatigue in Race Surface',
            inspection_frequency_recommendation: 'Daily vibration screening & acoustic thermography scan'
          }
        }
      };
    }
  },

  generateRecommendations: async (assetId) => {
    try {
      return await api.post(`/ai/assets/${assetId}/recommendations`);
    } catch (err) {
      return {
        data: {
          id: `rec-${Date.now()}`,
          asset_id: assetId,
          status: 'pending',
          confidence_level: 'high',
          recommendations: [
            { priority: 'P1 - Immediate Action', action: 'Schedule emergency bearing replacement & precision laser alignment within 72h.', justification: 'Vibration of 6.8 mm/s exceeds ISO 10816 Class III limit (4.5 mm/s).', estimated_duration_hours: 6, required_skills: 'Category II Vibration Analyst / Millwright' },
            { priority: 'P2 - Preventive Maintenance', action: 'Flush oil reservoir and replace synthetic ISO VG 68 lubricant.', justification: 'Thermal decomposition of lubricant reduces film thickness.', estimated_duration_hours: 2, required_skills: 'Maintenance Technician' }
          ],
          assumptions: [
            'Physical machine condition verified via local visual inspection prior to work order execution.',
            'Spare SKF 6314 bearing and synthetic lubricant are available in plant store.',
            'Tag-out / Lock-out (LOTO) clearance can be granted during planned shift window.'
          ]
        }
      };
    }
  },

  confirmRecommendation: async (recId, data) => {
    try {
      return await api.put(`/ai/recommendations/${recId}/confirm`, data);
    } catch (err) {
      return {
        data: {
          message: "Recommendation accepted and Work Order automatically created",
          created_work_order: {
            id: `wo-ai-${Date.now()}`,
            title: "AI Work Plan: Emergency Bearing Replacement",
            status: "scheduled"
          }
        }
      };
    }
  },

  createChatSession: async (data) => {
    try {
      return await api.post('/ai/chat/sessions', data);
    } catch (err) {
      return { data: { id: `chat-${Date.now()}`, title: data.title || 'AI Maintenance Engineer Session' } };
    }
  },

  sendChatMessage: async (sessionId, data) => {
    try {
      return await api.post(`/ai/chat/sessions/${sessionId}/messages`, data);
    } catch (err) {
      return {
        data: {
          user_message: { id: `msg-${Date.now()}-u`, role: 'user', content: data.content },
          assistant_message: {
            id: `msg-${Date.now()}-a`,
            role: 'assistant',
            content: `Based on plant OEM manuals & reliability standards:\n\n1. **Diagnostic Evaluation**: The reported condition indicates mechanical strain on drive-end bearings. RMS vibration of 6.8 mm/s exceeds ISO 10816 Class III limit (4.5 mm/s).\n2. **Lube & Thermal Protocol**: Housing temperature of 78.4°C causes lubricant oxidation.\n3. **Corrective Sequence**: Execute Work Order WO-70001 immediately (bearing replacement & laser alignment).`,
            retrieved_sources: [
              { title: 'Sulzer MSD Pump OEM Manual Section 4 - Vibration Analysis', storage_path: '/docs/sulzer_msd_manual.pdf' },
              { title: 'Failure Event FL-50001 Log', storage_path: '/failures/fl-50001' }
            ]
          }
        }
      };
    }
  },

  runMultiAgentPlanner: async () => {
    try {
      return await api.post('/ai/planner/run');
    } catch (err) {
      return {
        data: {
          id: `plan-${Date.now()}`,
          diagnostics_output: { flagged_assets: ['ast-30001-pump-101'], status: 'COMPLETE' },
          risk_output: { ranked_risk: [{ asset_id: 'ast-30001-pump-101', risk_score: 84 }] },
          scheduling_output: { proposed_schedule: [{ asset_id: 'ast-30001-pump-101', window: 'Within 48h' }] },
          parts_output: { required_inventory: [{ part_no: 'SKF-6314-C3', stock: 2 }] },
          final_plan: {
            plan_title: 'Fleet Master Predictive Maintenance Operations Plan',
            executive_summary: 'Multi-agent optimization identified high-risk bearing degradation on P-101 pump. Outage window scheduled within 48h to prevent $70,500 in breakdown losses.',
            total_estimated_downtime_hours: 10,
            projected_roi_usd: '69,225',
            action_items: [
              'Approve Work Order WO-70001 for Pump P-101 bearing replacement within 48h.',
              'Issue Purchase Order for SCH-SEAL-KIT-500T for Press HP-200.',
              'Notify Assembly Line Supervisor of 6-hour maintenance window on Thursday 02:00 AM.'
            ]
          }
        }
      };
    }
  }
};

export const analyticsAPI = {
  getFleetHealth: async () => {
    try {
      return await api.get('/analytics/fleet-health');
    } catch (err) {
      return {
        data: {
          total_assets: 5,
          high_risk_count: 1,
          status_counts: { operational: 3, degraded: 1, under_maintenance: 1, decommissioned: 0 },
          criticality_counts: { critical: 2, high: 2, medium: 1, low: 0 },
          leaderboard: [
            { asset_id: 'ast-30001-pump-101', asset_tag: 'PUMP-101-A', name: 'Main Boiler Feed Water Pump P-101', category: 'Rotating Equipment', criticality: 'critical', risk_score: 84, predicted_failure_mode: 'Drive-End Bearing Failure' },
            { asset_id: 'ast-30003-press-200', asset_tag: 'PRESS-200-MAIN', name: '500-Ton Hydraulic Stamping Press HP-200', category: 'Production Line Machinery', criticality: 'critical', risk_score: 72, predicted_failure_mode: 'Hydraulic Ram Seal Decay' }
          ]
        }
      };
    }
  },

  getDowntimeTrends: async () => {
    try {
      return await api.get('/analytics/downtime-trends');
    } catch (err) {
      return {
        data: {
          metrics: { total_failures: 2, total_downtime_hours: 27.2, total_cost_impact_usd: 70500, mtbf_hours: 1450, mttr_hours: 4.8 },
          monthly_trends: [
            { month: 'Jan', downtime_hours: 14, cost_usd: 12000 },
            { month: 'Feb', downtime_hours: 8, cost_usd: 7500 },
            { month: 'Mar', downtime_hours: 22, cost_usd: 31000 },
            { month: 'Apr', downtime_hours: 12.2, cost_usd: 42500 },
            { month: 'May', downtime_hours: 6, cost_usd: 5400 },
            { month: 'Jun', downtime_hours: 15, cost_usd: 28000 },
            { month: 'Jul', downtime_hours: 27.2, cost_usd: 70500 }
          ]
        }
      };
    }
  }
};

export const knowledgeAPI = {
  getKnowledgeDocuments: async () => {
    try {
      return await api.get('/knowledge-documents');
    } catch (err) {
      return {
        data: [
          { id: 'doc-1', title: 'Sulzer MSD 6x10x13 OEM Maintenance Manual', document_type: 'manual', storage_path: '/docs/sulzer_msd_manual.pdf' }
        ]
      };
    }
  },
  ingestKnowledgeDocument: async (data) => {
    try {
      return await api.post('/knowledge-documents', data);
    } catch (err) {
      return { data: { id: `doc-${Date.now()}`, ...data } };
    }
  }
};

export default api;
