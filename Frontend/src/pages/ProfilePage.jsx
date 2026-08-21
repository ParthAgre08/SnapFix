import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserReports } from '../services/api';
import {
  User,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Award,
  PlusCircle,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Activity,
  ArrowRight,
  Settings,
  Check,
  Shield,
  Zap,
  Eye,
  Star,
  Trophy,
  Loader2,
  Sparkles
} from 'lucide-react';

function normalizeProfileReport(r) {
  return {
    id: typeof r.id === 'number' ? `#SF-2026-${r.id}` : (r.id || '#SF-2026-8941'),
    rawId: r.id,
    title: r.title || (r.issue_category ? `${r.issue_category}` : 'Civic Infrastructure Issue'),
    categoryLabel: r.issue_category || r.categoryLabel || 'Road Pothole',
    locationName: r.location_name || r.locationName || 'Kothrud, Pune',
    userDescription: r.user_description || r.userDescription || '',
    aiDescription: r.ai_description || r.aiDescription || '',
    description: r.ai_description || r.user_description || r.description || 'No description available.',
    severity: r.severity || 'Medium',
    priority: r.priority || 'Medium',
    recommendedAction: r.recommended_action || r.recommendedAction || '',
    roadDamagePercentage: r.road_damage_percentage || r.roadDamagePercentage || '',
    status: (r.status || 'Reported').toLowerCase().replace(/\s+/g, '_'),
    statusLabel: r.status || 'Reported',
    imageUrl: r.image_url || r.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    annotatedImageUrl: r.annotated_image_url || r.annotatedImageUrl,
    createdAt: r.reported_at || 'Recently',
    upvotes: r.community_support_count || r.upvotes || 1,
    authorityAssigned: 'Public Works Department (PWD)'
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.uid || user?.id || 'usr_citizen_01';

  const [userReports, setUserReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    under_review: 0,
    in_progress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);
      const data = await fetchUserReports(userId);
      if (data && data.reports) {
        const normReports = data.reports.map(normalizeProfileReport);
        setUserReports(normReports);
        if (normReports.length > 0) {
          setSelectedReport(normReports[0]);
        } else {
          setSelectedReport(null);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setUserReports([]);
        setSelectedReport(null);
        setStats({
          total: 0,
          reported: 0,
          under_review: 0,
          in_progress: 0,
          resolved: 0
        });
      }
      setLoading(false);
    }
    loadProfileData();
  }, [userId]);

  // Filter reports
  const filteredReports = userReports.filter((report) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return report.status === 'reported' || report.status === 'under_review';
    if (statusFilter === 'in_progress') return report.status === 'assigned' || report.status === 'in_progress';
    if (statusFilter === 'resolved') return report.status === 'resolved' || report.status === 'verified';
    return true;
  });

  const displayedReports = filteredReports.slice(0, visibleCount);

  // Horizontal status stages for detail panel
  const statusStages = [
    { key: 'reported', label: 'Reported' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' }
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'reported': return 0;
      case 'under_review': return 1;
      case 'assigned': return 2;
      case 'in_progress': return 3;
      case 'resolved':
      case 'verified': return 4;
      default: return 0;
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'resolved':
      case 'verified':
        return 'bg-[#18794E]/10 text-[#18794E] border-[#18794E]/30';
      case 'under_review':
        return 'bg-[#C77700]/10 text-[#C77700] border-[#C77700]/30';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reported':
      default:
        return 'bg-[#005A9C]/10 text-[#005A9C] border-[#005A9C]/30';
    }
  };

  return (
    <div className="bg-[#F5F7F9] min-h-screen py-6 md:py-8 text-[#12355B]">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 space-y-6">

        {/* 1. COMPACT PROFILE HEADER */}
        <div className="bg-white rounded-lg border border-[#D6DCE2] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name || 'Citizen'}
              className="w-16 h-16 rounded-full object-cover border border-[#D6DCE2] shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#12355B]">{user?.name || user?.email?.split('@')[0] || 'Citizen'}</h1>
                <span className="text-[11px] font-semibold text-[#005A9C] bg-[#005A9C]/10 px-2.5 py-0.5 rounded border border-[#005A9C]/20">
                  Active Citizen
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>📧 {user?.email || 'citizen@snapfix.gov'}</span>
                <span>•</span>
                <span>Member since {user?.memberSince || 'August 2026'}</span>
              </p>
              <p className="text-xs italic text-slate-600 mt-1">
                "Active citizen contributing to safer and cleaner public spaces."
              </p>
            </div>
          </div>

          <button className="px-3.5 py-1.5 text-xs font-medium text-[#12355B] bg-white border border-[#D6DCE2] rounded-md hover:bg-slate-50 transition-colors shrink-0 self-start sm:self-center">
            Edit Profile
          </button>
        </div>

        {/* 2. DYNAMIC PROFILE STATISTICS FROM DATABASE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white rounded-lg border border-[#D6DCE2] p-4 text-center shadow-xs">
            <div className="text-2xl font-bold text-[#12355B]">{stats.total}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
              TOTAL REPORTED
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#D6DCE2] p-4 text-center shadow-xs">
            <div className="text-2xl font-bold text-[#18794E]">{stats.resolved}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
              RESOLVED
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#D6DCE2] p-4 text-center shadow-xs">
            <div className="text-2xl font-bold text-[#C77700]">{stats.in_progress}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
              IN PROGRESS
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#D6DCE2] p-4 text-center shadow-xs">
            <div className="text-2xl font-bold text-[#005A9C]">{stats.under_review}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
              UNDER REVIEW
            </div>
          </div>
        </div>

        {/* 3. TAB NAVIGATION */}
        <div className="border-b border-[#D6DCE2] flex gap-6 overflow-x-auto text-xs sm:text-sm font-medium pt-1">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-[#005A9C] text-[#005A9C] font-semibold'
                : 'border-transparent text-slate-600 hover:text-[#12355B]'
            }`}
          >
            My Reported Issues ({userReports.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'border-[#005A9C] text-[#005A9C] font-semibold'
                : 'border-transparent text-slate-600 hover:text-[#12355B]'
            }`}
          >
            Achievements & Badges
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#005A9C] text-[#005A9C] font-semibold'
                : 'border-transparent text-slate-600 hover:text-[#12355B]'
            }`}
          >
            Account Settings
          </button>
        </div>

        {/* 4. TAB CONTENT: MY REPORTED ISSUES */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-[#12355B]">
                  My Reported Issues ({filteredReports.length})
                </h2>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-[#D6DCE2] text-xs">
                  {['all', 'pending', 'in_progress', 'resolved'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setStatusFilter(filter);
                        setVisibleCount(5);
                      }}
                      className={`px-2.5 py-1 rounded font-medium capitalize transition-colors ${
                        statusFilter === filter
                          ? 'bg-white text-[#005A9C] shadow-xs border border-[#D6DCE2]'
                          : 'text-slate-600 hover:text-[#12355B]'
                      }`}
                    >
                      {filter === 'in_progress' ? 'In Progress' : filter}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005A9C] hover:bg-[#004a82] text-white text-xs font-semibold rounded-md transition-colors shadow-xs shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report New Issue</span>
              </Link>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg border border-[#D6DCE2] p-12 text-center">
                <Loader2 className="w-6 h-6 text-[#005A9C] animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Fetching User Reports from Database...</p>
              </div>
            ) : (
              /* Issue Cards & Selected Report Details Panel */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Issue Cards List */}
                <div className="lg:col-span-5 space-y-3">
                  {displayedReports.length > 0 ? (
                    <>
                      {displayedReports.map((report) => {
                        const isSelected = selectedReport?.id === report.id;
                        return (
                          <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#005A9C] ring-1 ring-[#005A9C]/30 shadow-xs'
                                : 'border-[#D6DCE2] hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadgeStyle(report.status)}`}>
                                {report.statusLabel}
                              </span>
                              <span className="text-xs font-mono font-medium text-slate-500">{report.id}</span>
                            </div>

                            <h3 className="text-sm font-bold text-[#12355B] line-clamp-1">{report.title}</h3>

                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                              <span className="truncate">{report.locationName}</span>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                              {report.description}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                              <span>Reported: {report.createdAt}</span>
                              <span className="text-[#005A9C] font-semibold flex items-center gap-0.5">
                                {report.upvotes} Support • View Details <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {visibleCount < filteredReports.length && (
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 5)}
                          className="w-full py-2.5 bg-white border border-[#D6DCE2] hover:bg-slate-50 text-[#005A9C] text-xs font-semibold rounded-md transition-colors shadow-xs flex items-center justify-center gap-1.5 mt-2"
                        >
                          <span>Load More Reports</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="bg-white rounded-lg border border-[#D6DCE2] p-8 text-center text-slate-500 text-xs">
                      No reported issues matching this filter.
                    </div>
                  )}
                </div>

                {/* Right Column: Simple Report Details Panel */}
                <div className="lg:col-span-7 bg-white rounded-lg border border-[#D6DCE2] p-5 shadow-xs space-y-5">
                  {selectedReport ? (
                    <>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#D6DCE2]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-500">
                              {selectedReport.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadgeStyle(selectedReport.status)}`}>
                              {selectedReport.statusLabel}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#12355B] mt-1.5">{selectedReport.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#005A9C]" />
                              {selectedReport.locationName}
                            </span>
                            <span>•</span>
                            <span>Reported: {selectedReport.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Image & Main Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {selectedReport.imageUrl && (
                          <img
                            src={selectedReport.imageUrl}
                            alt={selectedReport.title}
                            className="w-full h-32 object-cover rounded-md border border-[#D6DCE2]"
                          />
                        )}
                        <div className={`space-y-2 text-xs ${selectedReport.imageUrl ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
                          <div className="space-y-2">
                            {selectedReport.aiDescription && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-md border border-blue-200 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#005A9C] flex items-center gap-1 text-[11px] uppercase tracking-wider">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                                    <span>Gemma 4 AI Municipal Assessment</span>
                                  </span>
                                  {selectedReport.severity && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                      Severity: {selectedReport.severity}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                  {selectedReport.aiDescription}
                                </p>
                              </div>
                            )}

                            {selectedReport.userDescription && (
                              <div>
                                <span className="font-semibold text-slate-700 block mb-1">Citizen Notes:</span>
                                <p className="text-slate-600 bg-[#F5F7F9] p-2.5 rounded-md border border-[#D6DCE2] leading-relaxed">
                                  {selectedReport.userDescription}
                                </p>
                              </div>
                            )}

                            {!selectedReport.aiDescription && !selectedReport.userDescription && (
                              <div>
                                <span className="font-semibold text-slate-700 block mb-1">Description:</span>
                                <p className="text-slate-600 bg-[#F5F7F9] p-3 rounded-md border border-[#D6DCE2] leading-relaxed">
                                  {selectedReport.description}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div className="bg-slate-50 p-2 rounded border border-[#D6DCE2]">
                              <span className="text-slate-500 block">Category:</span>
                              <span className="font-semibold text-[#12355B]">{selectedReport.categoryLabel}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded border border-[#D6DCE2]">
                              <span className="text-slate-500 block">Community Support:</span>
                              <span className="font-semibold text-[#12355B] block">{selectedReport.upvotes} Citizens</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* HORIZONTAL STATUS PROGRESSION */}
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-[#12355B] uppercase tracking-wider mb-3">
                          Complaint Status Progression
                        </h4>
                        
                        <div className="bg-[#F5F7F9] p-4 rounded-md border border-[#D6DCE2]">
                          <div className="flex items-center justify-between relative">
                            {/* Background line */}
                            <div className="absolute left-4 right-4 top-3 h-0.5 bg-slate-300 -z-0" />

                            {statusStages.map((stage, idx) => {
                              const currentIdx = getStageIndex(selectedReport.status);
                              const isCompleted = idx < currentIdx;
                              const isCurrent = idx === currentIdx;

                              return (
                                <div key={stage.key} className="flex flex-col items-center relative z-10 text-center">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                                      isCurrent
                                        ? 'bg-[#005A9C] text-white ring-4 ring-[#005A9C]/20'
                                        : isCompleted
                                        ? 'bg-[#18794E] text-white'
                                        : 'bg-white text-slate-400 border border-[#D6DCE2]'
                                    }`}
                                  >
                                    {isCompleted ? '✓' : idx + 1}
                                  </div>
                                  <span
                                    className={`text-[11px] mt-1.5 font-medium ${
                                      isCurrent
                                        ? 'text-[#005A9C] font-bold'
                                        : isCompleted
                                        ? 'text-[#18794E]'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {stage.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      Select an issue card to view details.
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* 5. TAB CONTENT: ACHIEVEMENTS & BADGES */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#D6DCE2] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#12355B]">Your Civic Impact</h2>
                  <p className="text-xs text-slate-500">Track your community points and contributor level</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-[#005A9C]">420</span>
                    <span className="text-xs font-semibold text-slate-500 ml-1">Civic Points</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold text-[#005A9C] bg-[#005A9C]/10 rounded border border-[#005A9C]/20">
                    Level 4 Contributor
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Level 4 Contributor Progress</span>
                  <span className="text-slate-500">80 points to Level 5</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-[#D6DCE2]">
                  <div className="h-full bg-[#005A9C] rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
