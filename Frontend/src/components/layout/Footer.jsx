import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Landmark, Wrench, ExternalLink, Lock, KeyRound } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">

          {/* Brand & Mission Column */}
          <div className="sm:col-span-2 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">SnapFix</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Making civic issue reporting simpler, smarter, and more transparent. Documenting potholes, streetlights, drainage, and waste management for stronger communities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Serving Municipalities & Citizens Nationwide</span>
            </div>
          </div>

          {/* Column 1: Citizen Navigation */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Citizen Platform</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">Community Feed</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition-colors font-medium text-blue-400">Report an Issue</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">My Submissions</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Institutional & Authority Portals */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-400" />
              <span>Authority & Field Ops</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/authority/login"
                  className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Head Authority Login</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/authority"
                  className="hover:text-white transition-colors"
                >
                  Authority HQ Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/authority/reported"
                  className="hover:text-white transition-colors"
                >
                  Unassigned Reports Queue
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <Link
                  to="/contractor/login"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Contractor Field Login</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contractor"
                  className="hover:text-white transition-colors"
                >
                  Contractor Ops Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/contractor/issues"
                  className="hover:text-white transition-colors"
                >
                  Assigned Work Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Information */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Accounts & Support</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Citizen Sign In</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition-colors">Citizen Registration</Link>
              </li>
              <li>
                <Link to="/authority/resolved" className="hover:text-white transition-colors">Resolved Case Archives</Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Municipal Admin Help</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Notice & Mandatory Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p>© 2026 SnapFix. Built for better, safer, and cleaner communities.</p>
          </div>
          <div className="bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700/60 max-w-lg text-center md:text-right">
            <p className="text-[11px] text-slate-300">
              <span className="font-semibold text-amber-400">Institutional Portals:</span> Use dedicated Head Authority & Contractor login portals for one-click access.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
