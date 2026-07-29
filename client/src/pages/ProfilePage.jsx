import React from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Factory, Mail, Key } from 'lucide-react';

export default function ProfilePage() {
  const { user, organization } = useAuth();

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-accent-cyan" />
              User Profile & Security
            </h1>
            <p className="text-xs text-gray-400">Manage plant access role and organization credentials.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-6">
            <div className="flex items-center gap-4 border-b border-industrial-border pb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-bold text-xl flex items-center justify-center">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user?.full_name || 'Dr. Sarah Jenkins'}</h2>
                <span className="text-xs text-accent-cyan font-mono capitalize">{user?.role ? user.role.replace('_', ' ') : 'Reliability Engineer'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-400 block">Work Email</span>
                  <span className="text-white font-semibold">{user?.email || 'sarah.jenkins@apexmanufacturing.com'}</span>
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
                  <span className="text-gray-400 block">Role Permissions</span>
                  <span className="text-emerald-400 font-bold capitalize">Full AI Advisory & Work Order Creation</span>
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
