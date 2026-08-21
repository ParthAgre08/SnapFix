import React, { useState } from 'react';
import { MapPin, Clock, ThumbsUp, MessageSquare, ShieldCheck, ChevronRight, Sparkles, CheckCircle2, Building2 } from 'lucide-react';

export default function IssueCard({ report, onSelect }) {
  const [upvotes, setUpvotes] = useState(report.upvotes || 1);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [viewAfter, setViewAfter] = useState(false);

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
    }
  };

  const isResolved = report.status === 'resolved' || report.status === 'verified';
  const beforeImage = report.beforeImageUrl || report.annotatedImageUrl || report.imageUrl;
  const afterImage = report.afterImageUrl || report.resolutionImageUrl || report.annotatedImageUrl || report.imageUrl;

  const displayImage = isResolved && viewAfter ? afterImage : (report.annotatedImageUrl || report.imageUrl);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
      case 'verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'pending':
      case 'assigned':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const displayDescription = report.workCompleted || report.resolutionDescription || report.aiDescription || report.description;

  return (
    <div
      onClick={() => onSelect && onSelect(report)}
      className={`bg-white rounded-xl border shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between group ${
        isResolved ? 'border-emerald-200' : 'border-slate-200'
      }`}
    >
      <div>
        {/* Card Header & Photo */}
        <div className="relative h-52 bg-slate-900 overflow-hidden">
          <img
            src={displayImage}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />

          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded border border-slate-700">
            {report.id}
          </div>

          <div className="absolute top-3 right-3">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase ${getStatusBadge(report.status)}`}>
              {report.statusLabel}
            </span>
          </div>

          {/* If Resolved: Interactive BEFORE / AFTER Toggle */}
          {isResolved && report.afterImageUrl && (
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setViewAfter(!viewAfter);
                }}
                className="bg-slate-900/90 backdrop-blur-md rounded-lg p-1 border border-slate-700 flex items-center gap-1 text-[10px] font-bold text-white shadow-md"
              >
                <button
                  type="button"
                  className={`px-2 py-0.5 rounded transition-colors ${
                    !viewAfter ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BEFORE (YOLO)
                </button>
                <button
                  type="button"
                  className={`px-2 py-0.5 rounded transition-colors ${
                    viewAfter ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AFTER (Repaired)
                </button>
              </div>

              <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/30">
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200 uppercase">
              {report.categoryLabel}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="truncate">{report.locationName}</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors">
            {report.resolutionTitle || report.title}
          </h3>

          <div className="space-y-1">
            {isResolved ? (
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Gemma AI Verified Resolution</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>YOLO Detection & Assessment</span>
              </span>
            )}
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          </div>

          {report.departmentName && (
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 border-t border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{report.departmentName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 font-semibold transition-colors px-2 py-1 rounded hover:bg-slate-200/60 ${
              hasUpvoted ? 'text-blue-700 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-blue-700' : ''}`} />
            <span>{upvotes} Support</span>
          </button>
        </div>

        <span className="font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform flex items-center text-[11px]">
          View Report
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
