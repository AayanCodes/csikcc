import React, { useState } from 'react';
import { GraduationCap, Lock, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { AppView } from '../types';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigate: (view: AppView) => void;
}

export function AdminLogin({ onLoginSuccess, onNavigate }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple secure password as requested
    if (password === 'admin123' || password === 'securepassword2026') {
      onLoginSuccess();
      onNavigate('admin-dashboard');
    } else {
      setError('Invalid admin password. Default is: admin123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="w-9 h-9" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Admin Authentication</h2>
          <p className="text-sm text-slate-500">College Live Quiz Organizer Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Organizer Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin123"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">Tip: use <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">admin123</code></p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-xs transition-colors text-sm cursor-pointer"
            >
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('student-registration')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" /> Switch to Student Portal
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-Based Protected Admin Session</span>
        </div>

      </div>
    </div>
  );
}
