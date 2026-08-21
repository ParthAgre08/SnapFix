import React from 'react';
import { Camera, MapPin, Cpu, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Capture',
      subtitle: 'Take a Photo',
      description: 'Take a clear photo of the pothole, streetlight, drainage, or garbage issue using your mobile camera or upload from gallery.',
      icon: Camera,
    },
    {
      step: '02',
      title: 'Locate',
      subtitle: 'Tag GPS Location',
      description: 'Your browser or device attaches precise latitude & longitude coordinates so authorities pinpoint the exact spot.',
      icon: MapPin,
    },
    {
      step: '03',
      title: 'Analyze & Report',
      subtitle: 'Structured Classification',
      description: 'AI model identifies problem type, evaluates confidence, and builds an official-formatted civic report automatically.',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'Track',
      subtitle: 'Follow to Resolution',
      description: 'Monitor status from Under Review to Assigned, In Progress, and Resolved with verified before/after proof.',
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            Clear 4-Step Process
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How SnapFix Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            A simple digital pipeline bridging citizen observations with municipal resolution.
          </p>
        </div>

        {/* Process Cards - Desktop Horizontal Grid / Mobile Vertical Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {steps.map((s, index) => {
            const IconComponent = s.icon;
            return (
              <div
                key={s.step}
                className="relative bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                      STEP {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-700" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 mb-3">{s.subtitle}</p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {/* Desktop Connecting Indicator */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 font-bold text-xs">
                    →
                  </div>
                )}
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
