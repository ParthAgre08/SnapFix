import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Compass, MapPin, CheckCircle2, ShieldCheck, Clock, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-slate-100/90 via-white to-slate-50 border-b border-slate-200 py-12 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT COLUMN: Civic Messaging & CTAs */}
          <div className="lg:col-span-7 space-y-6">

            {/* Civic Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-md">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                SMART CIVIC ISSUE REPORTING
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              See an Issue? <br className="hidden sm:inline" />
              <span className="text-blue-700">Snap It.</span> Report It. Track It.
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              SnapFix helps citizens report civic problems using a photo, location, and AI-assisted analysis — making it easier to document potholes, drainage issues, damaged streetlights, and waste problems for municipal action.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base px-6 py-3.5 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>Report an Issue</span>
              </Link>

              <Link
                to="/community"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base px-6 py-3.5 rounded-lg border border-slate-300 shadow-xs transition-colors"
              >
                <Compass className="w-5 h-5 text-slate-600" />
                <span>Explore Community</span>
              </Link>
            </div>

            {/* Trust Indicators Bar */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Photo-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Location-Aware</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>AI-Assisted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Community-Driven</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Realistic Civic Report Preview Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden"
            >
              {/* Portal Header Strip */}
              <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-mono font-bold tracking-wider">REPORT #SF-2026-8941</span>
                </div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-medium text-[11px]">
                  Under Review
                </span>
              </div>

              {/* Report Photo */}
              <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
                  alt="Road Pothole reported in Pune"
                  className="w-full h-full object-cover"
                />

                {/* Simulated Bounding Box Overlay for AI detection */}
                <div className="absolute top-12 left-16 right-20 bottom-10 border-2 border-dashed border-amber-400 bg-amber-500/10 rounded flex items-start justify-end p-1">
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    Pothole • 94%
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-1 rounded flex items-center gap-1.5 font-mono">
                  <Clock className="w-3 h-3 text-slate-300" />
                  <span>Reported 2 hours ago</span>
                </div>
              </div>

              {/* Report Details Body */}
              <div className="p-5 space-y-3 bg-white text-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Road Surface Pothole</h3>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Paud Road Junction, Kothrud, Pune</span>
                    </div>
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded border border-slate-200">
                    High Priority
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                  Automated analysis verified hazard image. Routed to Pune Municipal Corporation Road Works Cell.
                </p>

                {/* Workflow Progress Bar */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1.5">
                    <span>Workflow Lifecycle</span>
                    <span className="text-blue-700">Stage 2 of 6</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-600 h-full w-1/6" title="Reported"></div>
                    <div className="bg-amber-500 h-full w-1/6" title="Under Review"></div>
                    <div className="bg-slate-300 h-full w-4/6" title="Pending"></div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
