import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ReportCTA() {
  return (
    <section className="py-14 bg-blue-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-blue-800/60 rounded-2xl border border-blue-700/80 p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">

          <div className="inline-flex items-center gap-2 bg-blue-700/80 border border-blue-600 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>Take Action Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Found a Civic Problem?
          </h2>

          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Don't ignore it. A single photo can help bring immediate attention to a pothole, damaged streetlight, or open drain in your neighborhood.
          </p>

          <div className="pt-2">
            <Link
              to="/report"
              className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-100 text-blue-900 font-bold text-base px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Camera className="w-5 h-5 text-blue-700" />
              <span>📷 Report an Issue Now</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-200 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Quick Photo Upload</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Location-Aware</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Community-Driven</span>
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
