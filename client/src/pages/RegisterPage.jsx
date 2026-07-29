import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, ShieldCheck, Factory, User, Lock, Mail, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser, loading } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'reliability_engineer',
    organization_name: 'Apex Precision Manufacturing Inc.'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await registerUser(formData);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError('Registration failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-industrial-border space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-cyan to-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-accent-cyan/20">
            <Cpu className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Register Organization</h1>
          <p className="text-xs text-gray-400">Join the AI Predictive Maintenance Platform</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Dr. Sarah Jenkins"
                className="w-full bg-industrial-900 border border-industrial-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah.jenkins@apexmanufacturing.com"
                className="w-full bg-industrial-900 border border-industrial-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-industrial-900 border border-industrial-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="reliability_engineer">Reliability Engineer</option>
                <option value="admin">Plant Admin</option>
                <option value="technician">Technician</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Plant / Organization</label>
              <input
                type="text"
                required
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                placeholder="Apex Manufacturing"
                className="w-full bg-industrial-900 border border-industrial-border rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-accent-cyan/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 border-t border-industrial-border pt-4">
          Already registered?{' '}
          <Link to="/login" className="text-accent-cyan font-bold hover:underline">
            Log in to Plant Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
