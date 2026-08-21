import React from 'react';
import { Camera, MapPin, Cpu, Users } from 'lucide-react';

export default function WhySnapFix() {
  const benefits = [
    {
      title: 'Photo First',
      description: 'Document civic problems visually without needing to write lengthy complex descriptions.',
      icon: Camera
    },
    {
      title: 'Location Aware',
      description: 'Attach precise GPS coordinates so municipal workers find the exact spot instantly.',
      icon: MapPin
    },
    {
      title: 'AI Assisted',
      description: 'Automatically categorize problem type and evaluate severity for faster routing.',
      icon: Cpu
    },
    {
      title: 'Community Driven',
      description: 'Citizens can upvote, track progress, and verify completed infrastructure repairs.',
      icon: Users
    }
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Choose SnapFix?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            A practical digital framework engineered for citizen participation and municipal transparency.
          </p>
        </div>

        {/* 4 Equal Benefit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                    <IconComp className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
