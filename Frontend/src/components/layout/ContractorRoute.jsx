import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAuthorityMe } from '../../services/api';
import { ArrowLeft, Loader2, Wrench, Lock } from 'lucide-react';

export default function ContractorRoute({ children }) {
  const { isLoggedIn, loading: authLoading, loginOrRegister, logout } = useAuth();
  const [authorityUser, setAuthorityUser] = useState(() => {
    try {
      const cached = sessionStorage.getItem('snapfix_contractor_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [checkingRole, setCheckingRole] = useState(() => !authorityUser);
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  const checkRole = async () => {
    if (!isLoggedIn) {
      setCheckingRole(false);
      return;
    }
    try {
      const profile = await fetchAuthorityMe();
      setAuthorityUser(profile);
      try {
        sessionStorage.setItem('snapfix_contractor_profile', JSON.stringify(profile));
      } catch {}
    } catch (err) {
      console.error('Error checking contractor access:', err);
    } finally {
      setCheckingRole(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      checkRole();
    }
  }, [isLoggedIn, authLoading]);

  const handleQuickSwitchToContractor = async () => {
    setSwitching(true);
    try {
      try {
        await logout();
      } catch (_) {}
      await loginOrRegister('contractor@gmail.com', 'contractor', 'Road Contractor');
      const profile = await fetchAuthorityMe();
      setAuthorityUser(profile);
      setCheckingRole(false);
    } catch (err) {
      console.error('Quick switch error:', err);
      navigate('/contractor/login');
    } finally {
      setSwitching(false);
    }
  };

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-slate-400 font-medium text-sm">Verifying Department Contractor Credentials...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/contractor/login" replace />;
  }

  const isContractor = authorityUser?.is_authority && (
    authorityUser?.role === 'department_contractor' || authorityUser?.role === 'head_authority'
  );

  if (!isContractor) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8 text-center text-slate-100">
          <div className="w-14 h-14 bg-amber-950/60 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-800/60">
            <Wrench className="w-7 h-7 stroke-[2]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Contractor Portal Access Required</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            This portal is designated for authorized municipal department contractors. Your account is not currently linked to a contractor profile.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleQuickSwitchToContractor}
              disabled={switching}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {switching && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign In with Contractor Account (contractor@gmail.com)</span>
            </button>
            <Link
              to="/authority"
              className="block w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Go to Head Authority Portal
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-4 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Citizen Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
