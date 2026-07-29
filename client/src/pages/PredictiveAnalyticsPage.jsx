import React, { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import FleetHealthDashboard from '../components/analytics/FleetHealthDashboard';
import { analyticsAPI } from '../services/api';
import { BarChart3 } from 'lucide-react';

export default function PredictiveAnalyticsPage() {
  const [fleetHealth, setFleetHealth] = useState(null);
  const [downtimeData, setDowntimeData] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [healthRes, downtimeRes] = await Promise.all([
          analyticsAPI.getFleetHealth(),
          analyticsAPI.getDowntimeTrends()
        ]);
        setFleetHealth(healthRes.data);
        setDowntimeData(downtimeRes.data);
      } catch (err) {
        console.warn("Analytics error:", err);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-accent-cyan" />
              Fleet Predictive Analytics & Reliability KPIs
            </h1>
            <p className="text-xs text-gray-400">
              Fleet MTBF, MTTR, unplanned downtime financial forecasts, and high-risk leaderboards.
            </p>
          </div>

          <FleetHealthDashboard fleetHealth={fleetHealth} downtimeData={downtimeData} />
        </main>
      </div>
    </div>
  );
}
