import React, { useState } from 'react';
import { MapPin, AlertTriangle, ZapOff, Droplets, Trash2, Footprints, Layers, X, ShieldCheck, ExternalLink } from 'lucide-react';

export default function IssueMap({ reports, onSelectReport }) {
  const [activeReport, setActiveReport] = useState(reports[0] || null);

  // Map category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'pothole': return AlertTriangle;
      case 'streetlight': return ZapOff;
      case 'drainage': return Droplets;
      case 'garbage': return Trash2;
      case 'footpath': return Footprints;
      default: return MapPin;
    }
  };

  // Convert lat/lng to stylized map grid position (0-100%)
  const getMapCoordinates = (report) => {
    // Map bounds approximation for India city pins
    // Pune: ~18.5, 73.8
    // Mumbai: ~19.0, 72.8
    // Bengaluru: ~12.9, 77.6
    // Delhi: ~28.6, 77.2
    let x = 50;
    let y = 50;

    if (report.city === 'Pune') {
      x = 35 + ((report.longitude - 73.75) * 200);
      y = 55 + ((18.56 - report.latitude) * 200);
    } else if (report.city === 'Bengaluru') {
      x = 65 + ((report.longitude - 77.60) * 150);
      y = 75 + ((12.98 - report.latitude) * 150);
    } else if (report.city === 'Mumbai') {
      x = 25 + ((report.longitude - 72.80) * 150);
      y = 45 + ((19.05 - report.latitude) * 150);
    } else if (report.city === 'Delhi') {
      x = 55 + ((report.longitude - 77.15) * 120);
      y = 20 + ((28.65 - report.latitude) * 120);
    }

    // Clamp values
    x = Math.max(10, Math.min(85, x));
    y = Math.max(15, Math.min(85, y));

    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="relative bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden h-[500px] flex flex-col justify-between">

      {/* Top Map Control Bar */}
      <div className="bg-slate-950/90 text-white p-3 px-4 flex items-center justify-between border-b border-slate-800 z-10">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Interactive Civic Issue Map</span>
          <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] px-2 py-0.5 rounded">
            {reports.length} Active Pins
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
          Geospatial Grid • Click markers to view report info
        </div>
      </div>

      {/* SVG Canvas Map Surface */}
      <div className="relative flex-1 w-full h-full bg-[#0B1329] overflow-hidden select-none">

        {/* Decorative Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-blue-500" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Stylized road grid simulation */}
          <path d="M 0 150 Q 200 120 400 200 T 800 250" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 250 0 Q 300 250 350 500" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Map Markers */}
        {reports.map((report) => {
          const IconComp = getCategoryIcon(report.category);
          const pos = getMapCoordinates(report);
          const isSelected = activeReport?.id === report.id;

          return (
            <div
              key={report.id}
              onClick={() => setActiveReport(report)}
              style={pos}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 z-20"
            >
              <div className="relative group">
                {/* Ping Animation for Active Pin */}
                {isSelected && (
                  <span className="absolute -inset-1 rounded-full bg-blue-500/50 animate-ping"></span>
                )}

                {/* Marker Pin Icon Container */}
                <div className={`p-2 rounded-full border-2 shadow-lg flex items-center justify-center transition-all ${isSelected
                    ? 'bg-blue-600 border-white text-white scale-110 shadow-blue-500/50'
                    : report.status === 'resolved'
                      ? 'bg-emerald-700 border-emerald-300 text-white'
                      : 'bg-slate-800 border-blue-400 text-blue-300 hover:bg-blue-700 hover:text-white'
                  }`}>
                  <IconComp className="w-4 h-4" />
                </div>

                {/* Pin Tooltip label */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-md">
                  {report.categoryLabel} • {report.city}
                </div>
              </div>
            </div>
          );
        })}

        {/* Selected Marker Detail Card Overlay */}
        {activeReport && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl border border-slate-700 shadow-2xl z-30 space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded border border-blue-700">
                  {activeReport.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${activeReport.status === 'resolved' ? 'bg-emerald-800 text-emerald-100' : 'bg-amber-800 text-amber-100'
                  }`}>
                  {activeReport.statusLabel}
                </span>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3">
              <img
                src={activeReport.imageUrl}
                alt={activeReport.title}
                className="w-16 h-16 rounded-md object-cover border border-slate-700 shrink-0"
              />
              <div className="space-y-1 overflow-hidden">
                <h4 className="font-bold text-sm text-white line-clamp-1">
                  {activeReport.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{activeReport.locationName}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  GPS: {activeReport.latitude.toFixed(4)}, {activeReport.longitude.toFixed(4)}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectReport && onSelectReport(activeReport)}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Full Report Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Map Legend Footer */}
      <div className="bg-slate-950 p-2.5 px-4 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="font-semibold text-slate-300">Legend:</span>
          <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Potholes</span>
          <span className="flex items-center gap-1"><ZapOff className="w-3 h-3 text-blue-400" /> Streetlights</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-400" /> Drainage</span>
          <span className="flex items-center gap-1"><Trash2 className="w-3 h-3 text-emerald-400" /> Garbage</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Ready for Flask Backend GIS Feed
        </div>
      </div>

    </div>
  );
}
