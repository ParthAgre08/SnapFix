import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Users, BarChart3, ArrowRight } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      id: 'report',
      title: 'Report an Issue',
      description: 'Capture a civic problem with a photo and submit it for authority action.',
      icon: Camera,
      link: '/report',
      color: 'bg-blue-600 text-white',
      border: 'border-slate-200 hover:border-blue-400'
    },
    {
      id: 'find',
      title: 'Find Issues Near You',
      description: 'Explore geotagged infrastructure problems reported around your city.',
      icon: MapPin,
      link: '/community',
      color: 'bg-slate-800 text-white',
      border: 'border-slate-200 hover:border-slate-400'
    },
    {
      id: 'community',
      title: 'Join the Community',
      description: 'See what citizens are reporting, upvote issues, and add local feedback.',
      icon: Users,
      link: '/community',
      color: 'bg-slate-800 text-white',
      border: 'border-slate-200 hover:border-slate-400'
    },
    {
      id: 'track',
      title: 'Track Your Reports',
      description: 'Follow the lifecycle status of your submitted reports from review to fix.',
      icon: BarChart3,
      link: '/profile',
      color: 'bg-slate-800 text-white',
      border: 'border-slate-200 hover:border-slate-400'
    }
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How can we help?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Select a service shortcut to participate in neighborhood improvement.
          </p>
        </div>

        {/* 4 Quick Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.id}
                to={item.link}
                className={`group bg-slate-50/70 hover:bg-white p-6 rounded-xl border ${item.border} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <IconComponent className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:text-blue-800">
                  <span>Open Service</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
