import React, { useState } from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import MultiAgentPlannerRunner from '../components/ai/MultiAgentPlannerRunner';
import { aiAPI } from '../services/api';

export default function MultiAgentPlannerPage() {
  const [planRun, setPlanRun] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleTriggerPlanner = async () => {
    setIsRunning(true);
    try {
      const res = await aiAPI.runMultiAgentPlanner();
      setPlanRun(res.data);
    } catch (err) {
      console.error("Multi-agent planner execution error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          <MultiAgentPlannerRunner
            planRun={planRun}
            onTriggerPlanner={handleTriggerPlanner}
            isRunning={isRunning}
          />
        </main>
      </div>
    </div>
  );
}
