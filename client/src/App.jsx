import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IoTStreamProvider } from './context/IoTStreamContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssetRegistryPage from './pages/AssetRegistryPage';
import CreateAssetPage from './pages/CreateAssetPage';
import AssetDetailPage from './pages/AssetDetailPage';
import MaintenanceSchedulePage from './pages/MaintenanceSchedulePage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import FailuresPage from './pages/FailuresPage';
import LogFailurePage from './pages/LogFailurePage';
import FailurePredictionPage from './pages/FailurePredictionPage';
import RULEstimatePage from './pages/RULEstimatePage';
import AIMaintenanceEngineerPage from './pages/AIMaintenanceEngineerPage';
import MultiAgentPlannerPage from './pages/MultiAgentPlannerPage';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-industrial-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-industrial-800 p-8 rounded-3xl border border-industrial-border space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-accent-cyan">Plant View Recovery</h2>
            <p className="text-xs text-gray-300">The application encountered a transient render condition.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/dashboard';
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-accent-cyan/20 cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/register" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/register"} replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><AssetRegistryPage /></ProtectedRoute>} />
      <Route path="/assets/new" element={<ProtectedRoute><CreateAssetPage /></ProtectedRoute>} />
      <Route path="/assets/:assetId" element={<ProtectedRoute><AssetDetailPage /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><MaintenanceSchedulePage /></ProtectedRoute>} />
      <Route path="/work-orders/:id" element={<ProtectedRoute><WorkOrderDetailPage /></ProtectedRoute>} />
      <Route path="/failures" element={<ProtectedRoute><FailuresPage /></ProtectedRoute>} />
      <Route path="/failures/new" element={<ProtectedRoute><LogFailurePage /></ProtectedRoute>} />
      <Route path="/ai/failure-prediction/:assetId" element={<ProtectedRoute><FailurePredictionPage /></ProtectedRoute>} />
      <Route path="/ai/rul/:assetId" element={<ProtectedRoute><RULEstimatePage /></ProtectedRoute>} />
      <Route path="/ai/maintenance-engineer" element={<ProtectedRoute><AIMaintenanceEngineerPage /></ProtectedRoute>} />
      <Route path="/ai/planner" element={<ProtectedRoute><MultiAgentPlannerPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><PredictiveAnalyticsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/register"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <IoTStreamProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </IoTStreamProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
