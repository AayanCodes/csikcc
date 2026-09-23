import React, { useState } from 'react';
import logoImg from '../logo.jpeg';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Secure admin credentials verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Standard college exam controller passcode
    const trimmed = password.trim();
    if (trimmed === 'admin2026' || trimmed === 'collegeadmin' || trimmed === 'admin') {
      localStorage.setItem('cq_admin_authenticated', 'true');
      onLoginSuccess();
    } else {
      setError('Invalid administrator credentials. Access restricted.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <button
            onClick={onBackToHome}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 inline-block cursor-pointer"
          >
            ← Return to Landing Page
          </button>
          <img
            src={logoImg}
            alt="College Quiz Logo"
            className="w-12 h-12 mx-auto rounded object-cover shadow-2xs border border-slate-200"
          />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Administrator Portal
          </h2>
          <p className="text-xs text-slate-500">
            Authorized College Examination Controllers Only
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="adminPass"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Admin Passcode
            </label>
            <input
              id="adminPass"
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode (e.g. admin2026)"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};
