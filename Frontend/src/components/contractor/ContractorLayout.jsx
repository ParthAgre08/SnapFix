import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Wrench,
  Clock,
  CheckCircle2,
  Building2,
  LogOut,
  ExternalLink,
  ChevronRight,
  HardHat
} from 'lucide-react';

export default function ContractorLayout({ children, title, subtitle, departmentName, actions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Contractor Dashboard', path: '/contractor', icon: LayoutDashboard },
    { label: 'Assigned Issues', path: '/contractor/issues', icon: Clock },
    { label: 'In Progress Work', path: '/contractor/issues?status=In Progress', icon: Wrench },
    { label: 'Resolved Archive', path: '/contractor/resolved', icon: CheckCircle2 },
  ];

  const isActive = (path) => {
    if (path === '/contractor') {
      return location.pathname === '/contractor';
    }
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname.startsWith(path) && !location.search;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* CONTRACTOR SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 shrink-0 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-inner">
                <HardHat className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-white tracking-tight text-base leading-tight">SnapFix</h1>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-400/30">
                    FIELD OPS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Department Contractor Portal
                </p>
              </div>
            </div>
          </div>

          {/* Department Contractor Badge Card */}
          <div className="m-4 p-3 bg-slate-800/70 rounded-lg border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'Department Contractor'}
                </p>
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider truncate">
                  {departmentName || 'Assigned Department'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-2 space-y-1">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Field Work
            </p>
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/community"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Community Feed</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-0.5">
              <span>Department Contractor</span>
              <span>/</span>
              <span className="text-amber-700 font-semibold">{title}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                Active Department Duty
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
