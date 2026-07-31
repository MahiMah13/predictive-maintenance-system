import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await loginUser(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError('Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-industrial-border space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-cyan to-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-accent-cyan/20">
            <Cpu className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Plant Portal Sign In</h1>
          <p className="text-xs text-gray-400">AI-Powered Predictive Maintenance Platform</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@yourcompany.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-industrial-900 border border-industrial-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          { (import.meta.env.DEV || import.meta.env.MODE !== 'production') && (
            <div className="bg-industrial-900/60 p-3 rounded-xl border border-industrial-border text-xs text-gray-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Demo Account Seeded</span>
              </div>
              <span className="text-[10px] text-accent-cyan font-mono">Dev / Staging Mode</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-accent-cyan/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Platform'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 border-t border-industrial-border pt-4">
          Need a plant organization account?{' '}
          <Link to="/register" className="text-accent-cyan font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
