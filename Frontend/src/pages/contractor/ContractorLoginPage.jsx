import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Mail, Lock, ShieldCheck, ArrowRight, Loader2, KeyRound, AlertCircle, HardHat } from 'lucide-react';

export default function ContractorLoginPage() {
  const [email, setEmail] = useState('contractor@gmail.com');
  const [password, setPassword] = useState('contractor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginOrRegister, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Sign out any existing session first to avoid state conflicts
      try {
        await logout();
      } catch (_) {}

      await loginOrRegister(email.trim(), password.trim(), 'Road Contractor');
      navigate('/contractor', { replace: true });
    } catch (err) {
      console.error('Contractor Login Error:', err);
      setError(err.message || 'Unable to authenticate contractor credentials. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-inner font-bold">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight">SnapFix</span>
            <span className="text-[10px] text-amber-400 font-mono ml-2 uppercase">Field Ops</span>
          </div>
        </Link>

        <Link
          to="/authority/login"
          className="text-xs text-slate-400 hover:text-blue-400 transition-colors font-medium"
        >
          Head Authority Portal →
        </Link>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Wrench className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Contractor Portal</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Municipal Department Field Contractor Access. Pick up assigned work orders, commence field repairs, and submit resolution evidence.
            </p>
          </div>

          {/* Quick Default Credentials Notice */}
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Default Department Contractor Account</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-amber-300 font-bold">contractor@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Password:</span>
                <span className="text-amber-300 font-bold">contractor</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-amber-900/40">
                <span>Assigned Dept:</span>
                <span className="text-amber-200">Road Department</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Contractor Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contractor@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter contractor password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>Sign In as Field Contractor</span>
            </button>
          </form>

          {/* Quick Switch Links */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">
              ← Citizen Sign In
            </Link>
            <Link to="/authority/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Head Authority Login →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 text-center text-xs text-slate-600">
        SnapFix Municipal Field Contractor Gateway • 2026
      </footer>
    </div>
  );
}
