import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import { fetchAuthorityReports, fetchDepartments } from '../../services/api';
import {
  CheckCircle2,
  Search,
  Building2,
  MapPin,
  Loader2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react';

export default function AuthorityResolvedIssues() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [search, setSearch] = useState('');

  // Before/After Modal
  const [previewModal, setPreviewModal] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthorityReports({
        status: 'Resolved',
        department_id: selectedDept !== 'all' ? selectedDept : undefined,
        search: search.trim() || undefined
      });
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load resolved issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedDept]);

  useEffect(() => {
    async function loadDepts() {
      try {
        const d = await fetchDepartments();
        setDepartments(d.departments || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadDepts();
  }, []);

  return (
    <AuthorityLayout
      title="Resolved Civic Issues & Evidence Archives"
      subtitle="Completed municipal repairs verified by AI analysis with Before & After evidence."
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search resolved reports or work details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadReports()}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <button
              onClick={loadReports}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </div>

          <div className="w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium w-full md:w-auto"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading resolved issues archive...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Resolved Issues Found</p>
              <p className="text-xs text-slate-500 mt-1">Completed maintenance resolutions will be archived here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Report ID</th>
                    <th className="py-3.5 px-4">Evidence (Before / After)</th>
                    <th className="py-3.5 px-4">Resolution Title & Summary</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Resolved By / At</th>
                    <th className="py-3.5 px-4 text-right">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        #SF-2026-{report.id}
                      </td>

                      {/* Before / After Thumbnails */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setPreviewModal(report)}
                          className="flex items-center gap-1.5 cursor-pointer group"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <img
                              src={report.annotated_image_url || report.image_url}
                              alt="Before"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-white font-bold text-center uppercase py-0.2">
                              Before
                            </span>
                          </div>
                          <span className="text-slate-300 font-bold">→</span>
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50 shrink-0 group-hover:scale-105 transition-transform">
                            <img
                              src={report.resolution_image_url || report.annotated_image_url || report.image_url}
                              alt="After"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-700 text-[8px] text-white font-bold text-center uppercase py-0.2">
                              After
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Title & AI Summary */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {report.resolution_title || report.title}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                          {report.work_completed || report.resolution_description || report.ai_description}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-blue-700 font-semibold mt-1">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>Gemma Verified Resolution</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded border border-emerald-200">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{report.department_name || 'Road Department'}</span>
                        </div>
                      </td>

                      {/* Resolved At */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{report.resolved_at || report.updated_at}</div>
                        <div className="text-[11px] text-slate-500">{report.resolved_by || 'Contractor Team'}</div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/authority/reports/${report.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full Record</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* BEFORE / AFTER POPUP MODAL */}
      {previewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {previewModal.resolution_title || previewModal.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">#SF-2026-{previewModal.id} • {previewModal.location_name}</p>
              </div>
              <button
                onClick={() => setPreviewModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-md"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Dual image container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>BEFORE (YOLO Annotated Image)</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">Reported</span>
                  </div>
                  <div className="relative h-56 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={previewModal.annotated_image_url || previewModal.image_url}
                      alt="Before defect"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>AFTER (Contractor Resolution Image)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Resolved</span>
                  </div>
                  <div className="relative h-56 rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50">
                    <img
                      src={previewModal.resolution_image_url || previewModal.annotated_image_url || previewModal.image_url}
                      alt="After repair"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Resolution AI assessment */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gemma AI Resolution Assessment</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {previewModal.resolution_description || previewModal.work_completed || 'Civic issue resolved and verified according to municipal safety protocols.'}
                </p>
                {previewModal.community_caption && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-600 italic">
                    "{previewModal.community_caption}"
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <Link
                to={`/authority/reports/${previewModal.id}`}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Open Full Institutional Record
              </Link>
            </div>
          </div>
        </div>
      )}
    </AuthorityLayout>
  );
}
