import React, { useState, useEffect, useMemo } from 'react';
import { fetchCommunityReports, supportReport } from '../services/api';
import IssueCard from '../components/community/IssueCard';
import IssueFilter from '../components/community/IssueFilter';
import IssueMap from '../components/community/IssueMap';
import { Map, Grid, Layers, ShieldCheck, X, ThumbsUp, MessageSquare, MapPin, Clock, Loader2, Sparkles, Cpu } from 'lucide-react';

function normalizeReport(r) {
  const isResolved = (r.status || '').toLowerCase() === 'resolved' || (r.status || '').toLowerCase() === 'verified';
  return {
    id: typeof r.id === 'number' ? `#SF-2026-${r.id}` : (r.id || '#SF-2026-1001'),
    rawId: r.id,
    user_id: r.user_id,
    imageUrl: r.image_url || r.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    annotatedImageUrl: r.annotated_image_url || r.annotatedImageUrl,
    primaryImageUrl: r.primary_image_url || r.annotated_image_url || r.image_url,
    beforeImageUrl: r.before_image_url || r.annotated_image_url || r.image_url,
    afterImageUrl: r.after_image_url || r.resolution_image_url,
    resolutionImageUrl: r.resolution_image_url,
    resolutionTitle: r.resolution_title,
    resolutionDescription: r.resolution_description,
    workCompleted: r.work_completed,
    beforeCondition: r.before_condition,
    afterCondition: r.after_condition,
    verificationNotes: r.verification_notes,
    communityCaption: r.community_caption,
    departmentName: r.department_name,
    isResolved,
    title: r.resolution_title || r.title || (r.issue_category ? `${r.issue_category} Reported` : 'Civic Infrastructure Issue'),
    category: r.issue_category ? r.issue_category.toLowerCase() : (r.category || 'pothole'),
    categoryLabel: r.issue_category || r.categoryLabel || 'Road Pothole',
    locationName: r.location_name || r.locationName || 'Pune, Maharashtra',
    latitude: r.latitude || 18.5074,
    longitude: r.longitude || 73.8077,
    userDescription: r.user_description || r.userDescription || '',
    aiDescription: r.ai_description || r.aiDescription || '',
    description: r.work_completed || r.resolution_description || r.ai_description || r.user_description || r.description || 'No description provided.',
    severity: r.severity || 'Medium',
    priority: r.priority || 'Medium',
    recommendedAction: r.recommended_action || r.recommendedAction || '',
    socialCaption: r.social_caption || r.socialCaption || '',
    roadDamagePercentage: r.road_damage_percentage || r.roadDamagePercentage || '',
    status: (r.status || 'Reported').toLowerCase().replace(/\s+/g, '_'),
    statusLabel: r.status || 'Reported',
    upvotes: r.community_support_count || r.upvotes || 1,
    commentsCount: r.commentsCount || 0,
    createdAt: r.reported_at || 'Recently',
    city: 'Pune'
  };
}

export default function CommunityPage() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedReportModal, setSelectedReportModal] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCity, setSelectedCity] = useState('All');

  // Load initial 5 reports from MySQL DB single source of truth
  useEffect(() => {
    async function loadInitialReports() {
      setLoading(true);
      const data = await fetchCommunityReports(1, 5);
      if (data && data.reports) {
        setReports(data.reports.map(normalizeReport));
        setHasMore(data.has_more);
      } else {
        setReports([]);
        setHasMore(false);
      }
      setLoading(false);
    }
    loadInitialReports();
  }, []);

  // Handle Load More (fetch next 5 reports)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchCommunityReports(nextPage, 5);
    if (data && data.reports && data.reports.length > 0) {
      const newNormalized = data.reports.map(normalizeReport);
      setReports(prev => [...prev, ...newNormalized]);
      setPage(nextPage);
      setHasMore(data.has_more);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  // Filter Logic
  const filteredReports = useMemo(() => {
    return reports.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      if (selectedCity !== 'All' && item.city !== selectedCity) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesLoc = item.locationName.toLowerCase().includes(query);
        const matchesId = String(item.id).toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        return matchesTitle || matchesLoc || matchesId || matchesDesc;
      }
      return true;
    });
  }, [reports, selectedCategory, selectedStatus, selectedCity, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedCity('All');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Page Title & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Public Civic Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Civic Feed
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Explore geotagged infrastructure reports directly powered by single MySQL reports table.
            </p>
          </div>

          {/* Grid vs Map Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Feed Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${viewMode === 'map'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Geospatial Map</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Component */}
        <IssueFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          onReset={handleResetFilters}
        />

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center py-20">
            <Loader2 className="w-8 h-8 text-blue-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Fetching Community Reports from Database...</p>
          </div>
        ) : viewMode === 'map' ? (
          <IssueMap
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReportModal(report)}
          />
        ) : (
          <div className="space-y-8">
            {filteredReports.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">No matching reports found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search keywords, city filter, or category pills to see community reports.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map(report => (
                  <IssueCard
                    key={report.id}
                    report={report}
                    onSelect={(rep) => setSelectedReportModal(rep)}
                  />
                ))}
              </div>
            )}

            {/* Load More Pagination Section */}
            {hasMore && (
              <div className="text-center pt-4 pb-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-white hover:bg-slate-100 text-blue-700 font-bold text-sm px-8 py-3 rounded-xl border border-blue-200 shadow-sm transition-all inline-flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                      <span>Loading Next 5 Reports...</span>
                    </>
                  ) : (
                    <span>Load More Reports</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Detailed Report Modal */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedReportModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                {selectedReportModal.id}
              </span>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 uppercase">
                {selectedReportModal.statusLabel}
              </span>
            </div>

            {selectedReportModal.isResolved && selectedReportModal.afterImageUrl ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">1. Before (YOLO Annotated)</span>
                  <div className="h-52 rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                    <img
                      src={selectedReportModal.beforeImageUrl || selectedReportModal.imageUrl}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">2. After (Repaired by {selectedReportModal.departmentName || 'Authority'})</span>
                  <div className="h-52 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-300">
                    <img
                      src={selectedReportModal.afterImageUrl}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={selectedReportModal.primaryImageUrl || selectedReportModal.imageUrl}
                  alt={selectedReportModal.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between flex-wrap gap-2 text-slate-500 font-medium pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-700" />
                  <span>{selectedReportModal.locationName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{selectedReportModal.createdAt}</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-blue-800">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{selectedReportModal.upvotes} Citizens Supported</span>
                </span>
              </div>

              {/* AI GENERATED DESCRIPTION & MUNICIPAL ASSESSMENT SECTION */}
              <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 p-4 rounded-xl border border-blue-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>Gemma 4 AI Municipal Assessment</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedReportModal.severity && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        Severity: {selectedReportModal.severity}
                      </span>
                    )}
                    {selectedReportModal.priority && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                        Priority: {selectedReportModal.priority}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {selectedReportModal.aiDescription || selectedReportModal.description}
                </p>

                {selectedReportModal.recommendedAction && (
                  <div className="pt-2 border-t border-blue-200/80 text-xs">
                    <span className="font-bold text-blue-900 block mb-0.5">Recommended Action:</span>
                    <span className="text-slate-700">{selectedReportModal.recommendedAction}</span>
                  </div>
                )}

                {selectedReportModal.roadDamagePercentage && (
                  <div className="text-[11px] font-mono font-bold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded inline-block">
                    Road Damage: {selectedReportModal.roadDamagePercentage}
                  </div>
                )}
              </div>

              {/* USER DESCRIPTION SECTION */}
              {selectedReportModal.userDescription && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Citizen Description / Notes:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedReportModal.userDescription}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
