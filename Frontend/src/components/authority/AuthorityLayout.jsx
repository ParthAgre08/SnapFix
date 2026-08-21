import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Inbox,
  Clock,
  Activity,
  CheckCircle2,
  Building2,
  BarChart3,
  Shield,
  LogOut,
  ExternalLink,
  ChevronRight,
  Landmark,
  UserCheck
} from 'lucide-react';

export default function AuthorityLayout({ children, title, subtitle, actions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/authority', icon: LayoutDashboard },
    { label: 'Reported Issues', path: '/authority/reported', icon: Inbox },
    { label: 'Pending Issues', path: '/authority/pending', icon: Clock },
    { label: 'In Progress', path: '/authority/in-progress', icon: Activity },
    { label: 'Resolved Issues', path: '/authority/resolved', icon: CheckCircle2 },
    { label: 'Departments', path: '/authority/departments', icon: Building2 },
    { label: 'Analytics', path: '/authority/analytics', icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === '/authority') {
      return location.pathname === '/authority';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 shrink-0 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Institution Header */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-inner">
                <Landmark className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-white tracking-tight text-base leading-tight">SnapFix</h1>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-400/30">
                    PORTAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Municipal Authority HQ
                </p>
              </div>
            </div>
          </div>

          {/* User Role Badge Card */}
          <div className="m-4 p-3 bg-slate-800/70 rounded-lg border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'Head Authority'}
                </p>
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Municipal Admin
                </p>
              </div>
            </div>
          </div>

          {/* Main Navigation List */}
          <nav className="px-3 py-2 space-y-1">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Civic Operations
            </p>
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/community"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Community Feed</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Portal</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP INSTITUTIONAL BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-0.5">
              <span>Authority Portal</span>
              <span>/</span>
              <span className="text-blue-700 font-semibold">{title}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                HQ Live Operations
              </span>
            </div>
          </div>
        </header>

        {/* CONTENT VIEWPORT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
