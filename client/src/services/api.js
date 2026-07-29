import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const assetAPI = {
  getAssets: (params) => api.get('/assets', { params }),
  getAssetById: (id) => api.get(`/assets/${id}`),
  createAsset: (data) => api.post('/assets', data),
  updateAsset: (id, data) => api.put(`/assets/${id}`, data),
  archiveAsset: (id) => api.delete(`/assets/${id}`),
  logSensorReading: (assetId, data) => api.post(`/assets/${assetId}/readings`, data),
  getSensorReadings: (assetId) => api.get(`/assets/${assetId}/readings`),
  logFailureEvent: (assetId, data) => api.post(`/assets/${assetId}/failures`, data),
  getFailureHistory: (assetId) => api.get(`/assets/${assetId}/failures`)
};

export const maintenanceAPI = {
  getWorkOrders: (params) => api.get('/work-orders', { params }),
  getWorkOrderById: (id) => api.get(`/work-orders/${id}`),
  createWorkOrder: (data) => api.post('/work-orders', data),
  updateWorkOrder: (id, data) => api.put(`/work-orders/${id}`, data),
  getSchedules: () => api.get('/schedules'),
  createSchedule: (data) => api.post('/schedules', data),
  getFailures: (params) => api.get('/failures', { params })
};

export const aiAPI = {
  getFailurePrediction: (assetId) => api.post(`/ai/assets/${assetId}/failure-prediction`),
  getRULEstimate: (assetId) => api.post(`/ai/assets/${assetId}/rul-estimate`),
  generateRecommendations: (assetId) => api.post(`/ai/assets/${assetId}/recommendations`),
  confirmRecommendation: (recId, data) => api.put(`/ai/recommendations/${recId}/confirm`, data),
  createChatSession: (data) => api.post('/ai/chat/sessions', data),
  sendChatMessage: (sessionId, data) => api.post(`/ai/chat/sessions/${sessionId}/messages`, data),
  runMultiAgentPlanner: () => api.post('/ai/planner/run')
};

export const analyticsAPI = {
  getFleetHealth: () => api.get('/analytics/fleet-health'),
  getDowntimeTrends: () => api.get('/analytics/downtime-trends')
};

export const knowledgeAPI = {
  getKnowledgeDocuments: () => api.get('/knowledge-documents'),
  ingestKnowledgeDocument: (data) => api.post('/knowledge-documents', data)
};

export default api;
