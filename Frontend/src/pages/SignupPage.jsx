import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Mail, Lock, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/invalid-email':
        return 'Please provide a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'Registration was cancelled (popup closed).';
      case 'auth/cancelled-popup-request':
        return 'Only one popup request allowed at a time.';
      case 'auth/popup-blocked':
        return 'Registration popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address.';
      default:
        return 'Unable to register. Please verify your details and try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signup(email.trim(), password, name.trim());
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error('Firebase Signup Error:', err.code || err.message);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error('Firebase Google Signup Error:', err.code || err.message);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <div className="bg-slate-50 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">

        {/* Brand Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Registration</h1>
          <p className="text-xs text-slate-600">Create a profile to submit and track local civic issues.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={isAnyLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Kumar"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled={isAnyLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={isAnyLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={isAnyLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnyLoading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-sm py-3 px-4 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Citizen Account</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            OR
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Google Sign In/Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isAnyLoading}
          className="w-full bg-white hover:bg-slate-50 disabled:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm py-2.5 px-4 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <>
              <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
              <span className="text-slate-600">Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="text-center text-xs text-slate-600 border-t border-slate-200 pt-4">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-blue-700 hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
