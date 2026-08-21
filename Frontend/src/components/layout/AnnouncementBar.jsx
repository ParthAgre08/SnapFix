import React, { useState } from 'react';
import { AlertCircle, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const announcements = [
    "🚧 Help improve your neighborhood — Report civic issues in a few seconds.",
    "💡 Report potholes, damaged streetlights, drainage problems and waste issues.",
    "📍 Your report helps local authorities identify and resolve problems faster.",
    "🤝 Together, we can make our public spaces safer, cleaner, and more accountable."
  ];

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Public Notice Badge */}
        <div className="flex items-center gap-2 shrink-0 bg-blue-600/90 text-white px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider">
          <AlertCircle className="w-3 h-3" />
          <span>Public Notice</span>
        </div>

        {/* Scrolling / Animated Announcement Track */}
        <div className="overflow-hidden whitespace-nowrap flex-1 relative">
          <div className="animate-marquee flex items-center gap-12 font-medium text-slate-200">
            {announcements.map((msg, index) => (
              <span key={index} className="inline-flex items-center gap-2">
                <span>{msg}</span>
                <span className="text-slate-600">•</span>
              </span>
            ))}
            {/* Duplicated for smooth endless loop */}
            {announcements.map((msg, index) => (
              <span key={`dup-${index}`} className="inline-flex items-center gap-2">
                <span>{msg}</span>
                <span className="text-slate-600">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Quick CTA & Close */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-slate-300">
          <Link
            to="/report"
            className="hover:text-white flex items-center gap-1 text-[11px] font-medium underline underline-offset-2 transition-colors"
          >
            <span>Report Now</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white transition-colors"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
