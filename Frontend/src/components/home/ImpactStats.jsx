import React from 'react';
import { DEMO_STATS } from '../../data/mockData';
import { Info, HeartHandshake } from 'lucide-react';

export default function ImpactStats() {
  return (
    <section className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title & Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Community Impact Metrics
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Every report contributes to a better, safer, and cleaner public environment.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-md border border-slate-200 shrink-0">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">Demo platform statistics</span>
          </div>
        </div>

        {/* 4 Large Number Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {DEMO_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-center items-center"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-800 tracking-tight font-mono">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-slate-900 mt-2">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {stat.note}
              </div>
            </div>
          ))}
        </div>

        {/* Subtitle commitment */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
          <HeartHandshake className="w-4 h-4 text-blue-700" />
          <span>Building transparent civic technology for citizens & local authorities.</span>
        </div>

      </div>
    </section>
  );
}
