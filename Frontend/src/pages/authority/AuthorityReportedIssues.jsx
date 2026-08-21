import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import { fetchAuthorityReports, fetchDepartments, fetchContractors, assignReportDepartment } from '../../services/api';
import {
  Inbox,
  Filter,
  Search,
  Building2,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle,
  Loader2,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function AuthorityReportedIssues() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [contractors, setContractors] = useState([]);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Quick Assign Modal
  const [assignModalReport, setAssignModalReport] = useState(null);
  const [assignDeptId, setAssignDeptId] = useState('');
  const [assignContractorId, setAssignContractorId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthorityReports({
        status: 'Reported',
        department_id: selectedDept !== 'all' ? selectedDept : undefined,
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        search: search.trim() || undefined
      });
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load reported issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedDept, selectedSeverity, selectedPriority]);

  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await fetchDepartments();
        setDepartments(data.departments || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadDepts();
  }, []);

  const openAssignModal = async (report) => {
    setAssignModalReport(report);
    setAssignDeptId(String(report.suggested_department_id || report.assigned_department_id || 1));
    setAssignContractorId('');
    setAssignNote('');
    setAssignSuccess(null);

    // Fetch contractors for suggested department
    try {
      const cData = await fetchContractors(report.suggested_department_id || 1);
      setContractors(cData.contractors || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeptChangeInModal = async (deptId) => {
    setAssignDeptId(deptId);
    try {
      const cData = await fetchContractors(deptId);
      setContractors(cData.contractors || []);
    } catch (e) {
      console.error(e);
    }
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    if (!assignModalReport || !assignDeptId) return;

    setAssigning(true);
    try {
      await assignReportDepartment(assignModalReport.id, {
        department_id: parseInt(assignDeptId),
        contractor_id: assignContractorId || null,
        authority_note: assignNote
      });
      setAssignSuccess('Issue assigned successfully to department.');
      setTimeout(() => {
        setAssignModalReport(null);
        loadReports();
      }, 1200);
    } catch (err) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <AuthorityLayout
      title="Reported Civic Issues (Unassigned Queue)"
      subtitle="Newly submitted citizen issues requiring Head Authority department classification & assignment."
    >
      <div className="space-y-6">
        {/* FILTERS & SEARCH HEADER */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by title, location, ID or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadReports()}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadReports}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {/* Severity */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Priority */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Department */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-600"
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

        {/* ISSUES TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading unassigned civic reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Reported Issues Queue is Clear</p>
              <p className="text-xs text-slate-500 mt-1">All incoming citizen reports have been reviewed and assigned.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Report ID</th>
                    <th className="py-3.5 px-4">Preview</th>
                    <th className="py-3.5 px-4">Issue / AI Title</th>
                    <th className="py-3.5 px-4">Priority / Severity</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Suggested Dept</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        #SF-2026-{report.id}
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-3.5 px-4">
                        <img
                          src={report.annotated_image_url || report.image_url}
                          alt={report.title}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100"
                        />
                      </td>

                      {/* Title & Category */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{report.title}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                            {report.issue_category}
                          </span>
                          <span>• {report.reported_at}</span>
                        </div>
                      </td>

                      {/* Priority & Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded border uppercase ${getPriorityBadge(report.priority)}`}>
                            {report.priority}
                          </span>
                          <div className="text-[10px] text-slate-500">
                            Severity: <strong className="text-slate-700">{report.severity}</strong>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-[160px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{report.location_name}</span>
                        </div>
                      </td>

                      {/* Suggested Department */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-[11px] font-semibold px-2 py-1 rounded border border-blue-200">
                          <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{report.suggested_department_name}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAssignModal(report)}
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors"
                          >
                            Assign Dept
                          </button>
                          <Link
                            to={`/authority/reports/${report.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="View Full Report Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* QUICK ASSIGN MODAL */}
      {assignModalReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Assign Civic Issue to Department</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">#SF-2026-{assignModalReport.id}</p>
              </div>
              <button
                onClick={() => setAssignModalReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAssignment} className="p-6 space-y-4">
              {/* Summary snippet */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                <img
                  src={assignModalReport.annotated_image_url || assignModalReport.image_url}
                  alt="Issue preview"
                  className="w-12 h-12 rounded object-cover border border-slate-200"
                />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">{assignModalReport.title}</div>
                  <div className="text-slate-600">{assignModalReport.location_name}</div>
                  <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Suggested: {assignModalReport.suggested_department_name} ({assignModalReport.suggestion_reasoning})
                  </div>
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Municipal Department *
                </label>
                <select
                  value={assignDeptId}
                  onChange={(e) => handleDeptChangeInModal(e.target.value)}
                  required
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Contractor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign Specific Contractor (Optional)
                </label>
                <select
                  value={assignContractorId}
                  onChange={(e) => setAssignContractorId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">Department General Pool (Any Contractor)</option>
                  {contractors.map((c) => (
                    <option key={c.firebase_uid} value={c.firebase_uid}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Authority Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Authority Operational Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Expedite due to high traffic volume on junction..."
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                ></textarea>
              </div>

              {assignSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{assignSuccess}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalReport(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {assigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Assignment (Pending)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthorityLayout>
  );
}
