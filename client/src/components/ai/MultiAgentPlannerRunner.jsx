import React from 'react';
import { Workflow, CheckCircle2, AlertTriangle, Calendar, Package, Sparkles, ShieldCheck, Download, Printer } from 'lucide-react';
import { generatePDFReport } from '../../utils/PDFReportGenerator';
import { useAuth } from '../../context/AuthContext';

export default function MultiAgentPlannerRunner({ planRun, onTriggerPlanner, isRunning = false }) {
  const { organization } = useAuth() || {};

  const steps = [
    { id: 1, title: 'Diagnostics Agent', key: 'diagnostics_output', icon: AlertTriangle, desc: 'Failure mode & telemetry diagnostics' },
    { id: 2, title: 'Risk Agent', key: 'risk_output', icon: ShieldCheck, desc: 'Criticality & downtime financial ranking' },
    { id: 3, title: 'Scheduling Agent', key: 'scheduling_output', icon: Calendar, desc: 'Optimal work window & crew assignment' },
    { id: 4, title: 'Parts Agent', key: 'parts_output', icon: Package, desc: 'Spare parts bill-of-materials & lead time' },
  ];

  const handleExportPDF = () => {
    generatePDFReport(
      planRun?.final_plan?.plan_title || 'Fleet Master Predictive Maintenance Strategy Report',
      planRun?.final_plan,
      organization?.name || 'Apex Precision Manufacturing Inc.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-industrial-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Workflow className="w-6 h-6 text-accent-cyan" />
            4-Agent Multi-Agent Maintenance Planner
          </h2>
          <p className="text-xs text-gray-400">
            Sequential agent pipeline: Diagnostics → Risk → Scheduling → Parts → Consolidated Strategy
          </p>
        </div>

        <div className="flex items-center gap-3">
          {planRun?.final_plan && (
            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-industrial-800 hover:bg-industrial-700 text-gray-200 border border-industrial-border rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-accent-cyan" />
              <span>Export Official PDF Report</span>
            </button>
          )}

          <button
            onClick={onTriggerPlanner}
            disabled={isRunning}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-xl transition-all ${
              isRunning
                ? 'bg-industrial-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-accent-cyan/20 hover:scale-105 cursor-pointer'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Orchestrating Agents...' : 'Execute Fleet Multi-Agent Planner'}
          </button>
        </div>
      </div>

      {/* Stepper Steps Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const hasOutput = Boolean(planRun?.[step.key]);
          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                hasOutput
                  ? 'bg-industrial-900/90 border-accent-cyan/40 shadow-lg shadow-accent-cyan/10'
                  : 'bg-industrial-800/60 border-industrial-border opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan flex items-center justify-center font-bold text-xs">
                  0{step.id}
                </div>
                {hasOutput ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <h4 className="font-bold text-xs text-white mb-0.5">{step.title}</h4>
              <p className="text-[10px] text-gray-400">{step.desc}</p>

              {hasOutput && (
                <div className="mt-3 pt-2 border-t border-industrial-border text-[10px] text-accent-cyan font-mono font-bold">
                  ✓ Output Complete
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Consolidated Master Plan */}
      {planRun?.final_plan && (
        <div className="glass-panel-glow p-6 rounded-2xl border border-accent-cyan/40 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-industrial-border pb-4">
            <div>
              <span className="text-[10px] text-accent-cyan font-mono uppercase font-bold tracking-wider">
                CONSOLIDATED MASTER PLAN
              </span>
              <h3 className="text-lg font-bold text-white">
                {planRun.final_plan.plan_title || 'Fleet Predictive Reliability Operations Strategy'}
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="bg-industrial-900 px-3 py-1.5 rounded-lg border border-industrial-border">
                <span className="text-gray-400">Total Downtime: </span>
                <span className="text-accent-amber font-bold">{planRun.final_plan.total_estimated_downtime_hours || 10}h</span>
              </div>
              <div className="bg-industrial-900 px-3 py-1.5 rounded-lg border border-industrial-border">
                <span className="text-gray-400">Avoided Downtime ROI: </span>
                <span className="text-emerald-400 font-bold">${planRun.final_plan.projected_roi_usd || '69,225'}</span>
              </div>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1 px-3 py-1.5 bg-accent-cyan text-industrial-900 font-bold rounded-lg hover:bg-cyan-300 transition-colors cursor-pointer text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF Sign-Off</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-200 bg-industrial-900/80 p-4 rounded-xl border border-industrial-border leading-relaxed">
            {planRun.final_plan.executive_summary}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Orchestrated Action Items & Directives
            </h4>
            <div className="space-y-2">
              {(planRun.final_plan.action_items || []).map((item, idx) => (
                <div key={idx} className="bg-industrial-900/90 p-3 rounded-xl border border-industrial-border flex items-start gap-2.5 text-xs text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-accent-cyan/20 text-accent-cyan font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
