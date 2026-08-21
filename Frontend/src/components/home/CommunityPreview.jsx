import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCommunityReports, supportReport } from '../../services/api';
import { ThumbsUp, MessageSquare, MapPin, ArrowRight, Clock, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

function normalizePreviewReport(r) {
  return {
    id: typeof r.id === 'number' ? `#SF-2026-${r.id}` : (r.id || '#SF-2026-1001'),
    rawId: r.id,
    imageUrl: r.image_url || r.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    title: r.title || (r.issue_category ? `${r.issue_category} Reported` : 'Civic Issue'),
    locationName: r.location_name || r.locationName || 'Pune, Maharashtra',
    description: r.ai_description || r.user_description || r.description || 'No description provided.',
    status: (r.status || 'Reported').toLowerCase().replace(/\s+/g, '_'),
    statusLabel: r.status || 'Reported',
    upvotes: r.community_support_count || r.upvotes || 1,
    commentsCount: r.commentsCount || 0,
    createdAt: r.reported_at || 'Recently'
  };
}

export default function CommunityPreview() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreview() {
      setLoading(true);
      const data = await fetchCommunityReports(1, 3);
      if (data && data.reports && data.reports.length > 0) {
        setReports(data.reports.map(normalizePreviewReport));
      } else {
        setReports([]);
      }
      setLoading(false);
    }
    loadPreview();
  }, []);

  const handleUpvote = async (id, rawId) => {
    if (rawId) {
      await supportReport(rawId, 'usr_citizen_01');
    }
    setReports(prev => prev.map(item => {
      if (item.id === id) {
        const isUpvoted = item.hasUpvoted;
        return {
          ...item,
          upvotes: isUpvoted ? item.upvotes - 1 : item.upvotes + 1,
          hasUpvoted: !isUpvoted
        };
      }
      return item;
    }));
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Public Feed</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              See What's Happening Around Your Community
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Discover civic issues reported by citizens in your neighborhood and see real-time status updates.
            </p>
          </div>

          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline shrink-0"
          >
            <span>View All Community Reports</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured Community Feed Cards */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-blue-700 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading Public Feed from Database...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Reports Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Be the first citizen to report a civic infrastructure issue in your area using SnapFix AI portal.
            </p>
            <Link
              to="/report"
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors"
            >
              Report an Issue Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image & Header */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-1 rounded border border-slate-700">
                        {report.id}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${report.status === 'resolved' ? 'bg-emerald-600 text-white border-emerald-700' :
                          report.status === 'in_progress' ? 'bg-orange-600 text-white border-orange-700' :
                            'bg-blue-700 text-white border-blue-800'
                        }`}>
                        {report.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{report.locationName}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{report.createdAt}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {report.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleUpvote(report.id, report.rawId)}
                      className={`flex items-center gap-1.5 font-semibold transition-colors ${report.hasUpvoted ? 'text-blue-700' : 'hover:text-blue-700'
                        }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${report.hasUpvoted ? 'fill-blue-700' : ''}`} />
                      <span>{report.upvotes} Support</span>
                    </button>

                    <div className="flex items-center gap-1.5 font-medium text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{report.commentsCount} Notes</span>
                    </div>
                  </div>

                  <Link
                    to={`/community`}
                    className="font-semibold text-blue-700 hover:text-blue-800 hover:underline text-[11px]"
                  >
                    View Details
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
