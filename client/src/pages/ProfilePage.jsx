import React from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Factory, Mail, Key, CheckCircle2, Wrench, Sparkles, Building, Eye } from 'lucide-react';

export default function ProfilePage() {
  const { user, organization, switchRole } = useAuth();
  const currentRole = user?.role || 'reliability_engineer';

  const roleDescriptions = {
    admin: 'Full top-level authority over user provisioning, plant assets, system security, and global configuration.',
    reliability_engineer: 'Technical lead with full access to Gemini AI engines (Failure Risk, RUL, Multi-Agent Planner), asset registers, and optimization controls.',
    technician: 'Factory-floor execution layer restricted to viewing and closing assigned Work Orders and logging sensor readings.',
    viewer: 'Read-only stakeholder/auditor role for tracking high-level plant health scores, ROI metrics, and executive dashboards.'
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col select-none">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-accent-cyan" />
              User Profile & Security
            </h1>
            <p className="text-xs text-gray-400">Manage plant access role, persona scope, and organization credentials.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-6">
            <div className="flex items-center gap-4 border-b border-industrial-border pb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-bold text-xl flex items-center justify-center">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user?.full_name || 'Dr. Sarah Jenkins'}</h2>
                <span className="text-xs text-accent-cyan font-mono capitalize font-bold">{currentRole.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* 4-Tier RBAC Persona Switcher Grid */}
            <div className="bg-industrial-900/90 p-5 rounded-2xl border border-industrial-border space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  4-Tier Enterprise RBAC Persona Switcher
                </h3>
                <p className="text-xs text-gray-400">Select an operating persona to simulate factory-floor security scopes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role 1: Admin */}
                <div
                  onClick={() => switchRole('admin')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    currentRole === 'admin'
                      ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                      : 'bg-industrial-800/60 border-industrial-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Building className="w-4 h-4 text-purple-400" />
                      <span>Plant Administrator</span>
                    </div>
                    {currentRole === 'admin' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{roleDescriptions.admin}</p>
                </div>

                {/* Role 2: Reliability Engineer */}
                <div
                  onClick={() => switchRole('reliability_engineer')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    currentRole === 'reliability_engineer'
                      ? 'bg-accent-cyan/10 border-accent-cyan/50 shadow-lg shadow-accent-cyan/10'
                      : 'bg-industrial-800/60 border-industrial-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Sparkles className="w-4 h-4 text-accent-amber" />
                      <span>Reliability Engineer</span>
                    </div>
                    {currentRole === 'reliability_engineer' && <CheckCircle2 className="w-4 h-4 text-accent-cyan" />}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{roleDescriptions.reliability_engineer}</p>
                </div>

                {/* Role 3: Technician */}
                <div
                  onClick={() => switchRole('technician')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    currentRole === 'technician'
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'bg-industrial-800/60 border-industrial-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>Field Technician</span>
                    </div>
                    {currentRole === 'technician' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{roleDescriptions.technician}</p>
                </div>

                {/* Role 4: Viewer / Auditor */}
                <div
                  onClick={() => switchRole('viewer')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    currentRole === 'viewer'
                      ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-industrial-800/60 border-industrial-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>Executive Viewer (Auditor)</span>
                    </div>
                    {currentRole === 'viewer' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{roleDescriptions.viewer}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-400 block">Work Email</span>
                  <span className="text-white font-semibold">{user?.email || 'engineer@apexmanufacturing.com'}</span>
                </div>
              </div>

              <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border flex items-center gap-3">
                <Factory className="w-5 h-5 text-accent-amber" />
                <div>
                  <span className="text-gray-400 block">Organization</span>
                  <span className="text-white font-semibold">{organization?.name || 'Apex Precision Manufacturing Inc.'}</span>
                </div>
              </div>

              <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-gray-400 block">Active Scope</span>
                  <span className="text-emerald-400 font-bold capitalize">{currentRole.replace(/_/g, ' ')} Scope Active</span>
                </div>
              </div>

              <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border flex items-center gap-3">
                <Key className="w-5 h-5 text-accent-cyan" />
                <div>
                  <span className="text-gray-400 block">Authentication Scope</span>
                  <span className="text-white font-mono">Supabase JWT + PostgreSQL RLS</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
