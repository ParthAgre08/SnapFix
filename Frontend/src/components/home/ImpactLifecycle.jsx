import React from 'react';
import { Camera, MapPin, Cpu, Send, Search, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ImpactLifecycle() {
  const stages = [
    {
      stage: '1. Citizen Spots Problem',
      status: 'Reported',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Camera,
      desc: 'Citizen captures high-resolution photo of pothole, damaged light, or garbage.'
    },
    {
      stage: '2. Photo & GPS Submitted',
      status: 'Reported',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: MapPin,
      desc: 'Geographic metadata tags exact street location and ward boundary.'
    },
    {
      stage: '3. AI Issue Detection',
      status: 'Under Review',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Cpu,
      desc: 'Computer vision classifies problem severity and filters duplicate reports.'
    },
    {
      stage: '4. Authority Dispatch',
      status: 'Assigned',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Send,
      desc: 'Structured report sent to responsible municipal department or contractor.'
    },
    {
      stage: '5. Work Execution',
      status: 'In Progress',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Clock,
      desc: 'Field crew dispatches equipment to repair infrastructure.'
    },
    {
      stage: '6. Resolution & Proof',
      status: 'Resolved & Verified',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      desc: 'After photo uploaded, citizen community verifies completion.'
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-md mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Resolution Workflow</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            From a Photo to Real-World Action
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Understand how citizen reports progress through municipal verification to physical repair.
          </p>
        </div>

        {/* Workflow Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div
                key={index}
                className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase ${item.badgeClass}`}>
                      {item.status}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                      <IconComp className="w-4 h-4 text-blue-700" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{item.stage}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>STAGE 0{index + 1} OF 06</span>
                  <span className="text-slate-400">Step Verified</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
