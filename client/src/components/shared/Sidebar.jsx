import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Boxes, 
  Calendar, 
  ClipboardList, 
  AlertTriangle, 
  Sparkles, 
  Bot, 
  Workflow, 
  BarChart3, 
  User,
  Clock,
  Wrench,
  ShieldCheck,
  Building,
  Eye
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'reliability_engineer';

  const isTechnician = role === 'technician';
  const isViewer = role === 'viewer';
  const isAdmin = role === 'admin';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Asset Registry', path: '/assets', icon: Boxes },
    { label: 'Maintenance Schedule', path: '/schedule', icon: Calendar, badge: isTechnician ? 'Assigned' : null },
    { label: 'Work Orders', path: '/work-orders', icon: ClipboardList, badge: isTechnician ? 'Action Needed' : null },
    { label: 'Failure History', path: '/failures', icon: AlertTriangle },
  ];

  const aiItems = isTechnician ? [
    { label: 'AI Engineer (RAG Chat)', path: '/ai/maintenance-engineer', icon: Bot, subtitle: 'Technician Assistance' },
    { label: 'Failure Prediction', path: '/ai/failure-prediction/default', icon: Sparkles },
  ] : isViewer ? [
    { label: 'AI Engineer (RAG Chat)', path: '/ai/maintenance-engineer', icon: Bot, badge: 'Read-Only' },
    { label: 'Failure Prediction', path: '/ai/failure-prediction/default', icon: Sparkles, badge: 'Read-Only' }
  ] : [
    { label: 'Failure Prediction', path: '/ai/failure-prediction/default', icon: Sparkles },
    { label: 'RUL Estimator', path: '/ai/rul/default', icon: Clock },
    { label: 'AI Engineer (RAG Chat)', path: '/ai/maintenance-engineer', icon: Bot },
    { label: 'Multi-Agent Planner', path: '/ai/planner', icon: Workflow },
  ];

  const analyticsItems = [
    { label: 'Predictive Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'User Profile & Settings', path: '/profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-industrial-800/90 border-r border-industrial-border min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between select-none">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Plant Operations
            </h3>
            {isTechnician && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono px-1.5 py-0.5 rounded font-bold">
                Tech View
              </span>
            )}
            {isViewer && (
              <span className="text-[9px] bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.5 rounded font-bold">
                Auditor View
              </span>
            )}
            {isAdmin && (
              <span className="text-[9px] bg-purple-500/20 text-purple-400 font-mono px-1.5 py-0.5 rounded font-bold">
                Admin Scope
              </span>
            )}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 shadow-sm'
                        : 'text-gray-300 hover:bg-industrial-700 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold bg-accent-cyan/20 text-accent-cyan px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-accent-cyan flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent-amber" />
              Gemini AI Engines
            </h3>
            <span className="text-[9px] bg-accent-cyan/20 text-accent-cyan font-mono px-1.5 py-0.5 rounded">v2.5</span>
          </div>
          <nav className="space-y-1">
            {aiItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-accent-cyan/20 to-blue-600/20 text-white border border-accent-cyan/40 shadow-md shadow-accent-cyan/10'
                        : 'text-gray-300 hover:bg-industrial-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-accent-cyan" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
            Analytics & System
          </h3>
          <nav className="space-y-1">
            {analyticsItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-industrial-700 text-white border border-gray-600'
                        : 'text-gray-300 hover:bg-industrial-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-8 p-3 bg-industrial-900/90 rounded-xl border border-industrial-border text-center">
        <div className="text-[10px] text-gray-400 font-mono mb-1">SYSTEM MODE</div>
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-accent-cyan">
          {isAdmin ? (
            <Building className="w-3.5 h-3.5 text-purple-400" />
          ) : isViewer ? (
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          ) : isTechnician ? (
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="capitalize">{role.replace('_', ' ')}</span>
        </div>
      </div>
    </aside>
  );
}
