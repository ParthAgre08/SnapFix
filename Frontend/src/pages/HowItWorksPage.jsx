import React from 'react';
import { Link } from 'react-router-dom';
import HowItWorks from '../components/home/HowItWorks';
import ImpactLifecycle from '../components/home/ImpactLifecycle';
import WhySnapFix from '../components/home/WhySnapFix';
import ReportCTA from '../components/home/ReportCTA';
import { ShieldCheck, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Civic Platform Mechanics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How SnapFix Delivers Civic Impact
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            SnapFix converts citizen photos into structured geospatial reports, automatically classifying infrastructure damage and tracking municipal resolution from submission to repair verification.
          </p>
        </div>

      </div>

      <HowItWorks />
      <ImpactLifecycle />
      <WhySnapFix />

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
            <HelpCircle className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-sm text-slate-700">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Is SnapFix an official government portal?</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                SnapFix is an independent civic technology platform. Reports submitted are structured and forwarded to designated local municipal bodies and ward officers.
              </p>
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <h3 className="font-bold text-slate-900">How does the AI classification work?</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Our lightweight computer vision model (YOLO26 format) analyzes uploaded images to identify potholes, damaged streetlights, open drains, and garbage dumps with high accuracy.
              </p>
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <h3 className="font-bold text-slate-900">Can I report issues anonymously?</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Yes. While creating an account allows tracking your reported issues on your citizen dashboard, guest reporting is also supported.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReportCTA />
    </div>
  );
}
         