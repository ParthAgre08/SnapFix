import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, ShieldCheck, Menu, X, User, LogOut, Landmark, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchAuthorityMe } from '../../services/api';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const [authProfile, setAuthProfile] = useState(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    async function checkAuthority() {
      if (isLoggedIn) {
        try {
          const profile = await fetchAuthorityMe();
          setAuthProfile(profile);
        } catch (e) {
          setAuthProfile(null);
        }
      } else {
        setAuthProfile(null);
      }
    }
    checkAuthority();
  }, [isLoggedIn, user]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LEFT: SnapFix Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-800 transition-colors">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">SnapFix</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                    Civic Platform
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide -mt-0.5">
                  Public Infrastructure Reporting
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-700 bg-blue-50/80 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/how-it-works')
                  ? 'text-blue-700 bg-blue-50/80 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/community"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/community')
                  ? 'text-blue-700 bg-blue-50/80 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Community Feed
            </Link>
          </nav>

          {/* RIGHT SIDE: Auth buttons, Role Badges & Report CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Direct Authority Badge Link if Authority User */}
            {authProfile?.is_authority && authProfile?.role === 'head_authority' && (
              <Link
                to="/authority"
                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                title="Open Head Authority Operations Portal"
              >
                <Landmark className="w-3.5 h-3.5 text-blue-700" />
                <span>Authority HQ</span>
              </Link>
            )}

            {/* Direct Contractor Badge Link if Contractor User */}
            {authProfile?.is_authority && authProfile?.role === 'department_contractor' && (
              <Link
                to="/contractor"
                className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                title="Open Department Contractor Portal"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-700" />
                <span>Contractor Ops</span>
              </Link>
            )}

            {/* Logged Out View */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              /* Logged In View */
              <div className="flex items-center gap-3 border-r border-slate-200 pr-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-50 text-slate-800 transition-colors"
                >
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user?.name || 'Citizen'}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold leading-tight text-slate-900">
                      {user?.name || user?.email?.split('@')[0] || 'Citizen'}
                    </span>
                    <span className="text-[10px] text-slate-500">My Dashboard</span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Primary Action Button */}
            <Link
              to="/report"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm transition-all focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
            >
              <Camera className="w-4 h-4" />
              <span>Report an Issue</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-md"
          >
            Home
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-md"
          >
            How It Works
          </Link>
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-md"
          >
            Community Feed
          </Link>

          {/* Authority Portal Links in Mobile Menu */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Institutional Portals
            </p>
            <Link
              to="/authority"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-md"
            >
              <Landmark className="w-4 h-4" />
              <span>Head Authority Portal</span>
            </Link>
            <Link
              to="/contractor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 rounded-md"
            >
              <Wrench className="w-4 h-4" />
              <span>Contractor Portal</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-slate-800 font-medium rounded-md hover:bg-slate-50"
                >
                  <User className="w-5 h-5 text-blue-700" />
                  <span>My Profile & Reports ({user?.name || 'Citizen'})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-red-600 font-medium rounded-md hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm w-full"
            >
              <Camera className="w-4 h-4" />
              <span>Report an Issue</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
