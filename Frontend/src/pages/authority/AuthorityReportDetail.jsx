import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import {
  fetchAuthorityReportDetails,
  fetchDepartments,
  fetchContractors,
  assignReportDepartment
} from '../../services/api';
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Loader2,
  FileText,
  Camera,
  Layers,
  Wrench,
  CheckCircle
} from 'lucide-react';

export default function AuthorityReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Departments & Contractors
  const [departments, setDepartments] = useState([]);
  const [contractors, setContractors] = useState([]);

  // Assignment Form State
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [authorityNote, setAuthorityNote] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignmentFeedback, setAssignmentFeedback] = useState(null);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuthorityReportDetails(id);
      setReport(data);
      setSelectedDeptId(String(data.assigned_department_id || data.suggested_department_id || 1));
      setSelectedContractorId(data.assigned_contractor_id || '');
      setAuthorityNote(data.authority_note || '');
    } catch (err) {
      setError(err.message || 'Report not found or unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  useEffect(() => {
    async function loadDeptsAndContractors() {
      try {
        const dData = await fetchDepartments();
        setDepartments(dData.departments || []);
        if (selectedDeptId) {
          const cData = await fetchContractors(selectedDeptId);
          setContractors(cData.contractors || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadDeptsAndContractors();
  }, [selectedDeptId]);

  const handleDeptChange = async (deptId) => {
    setSelectedDeptId(deptId);
    try {
      const cData = await fetchContractors(deptId);
      setContractors(cData.contractors || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeptId) return;

    setAssigning(true);
    setAssignmentFeedback(null);
    try {
      const res = await assignReportDepartment(id, {
        department_id: parseInt(selectedDeptId),
        contractor_id: selectedContractorId || null,
        authority_note: authorityNote
      });
      setAssignmentFeedback({
        success: true,
        message: 'Department assignment successfully saved. Status updated to Pending.'
      });
      setReport(res.report);
    } catch (err) {
      setAssignmentFeedback({
        success: false,
        message: err.message || 'Assignment update failed'
      });
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'in progress':
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'pending':
      case 'assigned':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <AuthorityLayout
      title={`Civic Report #SF-2026-${id}`}
      subtitle="Complete institutional evaluation, dual image analysis, and departmental assignment."
      actions={
        <Link
          to="/authority/reported"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Queue</span>
        </Link>
      }
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading civic report details...</p>
        </div>
      ) : error || !report ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error || 'Report could not be retrieved.'}
        </div>
      ) : (
        <div className="space-y-8">
          {/* HEADER SUMMARY CARD */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  #SF-2026-{report.id}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border uppercase ${getStatusBadge(report.status)}`}>
                  {report.status}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                  {report.issue_category}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{report.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{report.location_name}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reported: {report.reported_at}</span>
                </div>
                <span>•</span>
                <span>Citizen Support: <strong>{report.community_support_count} Upvotes</strong></span>
              </div>
            </div>

            {report.assigned_department_id && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1 shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Currently Assigned</div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>{report.department_name || 'Road Department'}</span>
                </div>
                {report.assigned_contractor_name && (
                  <div className="text-[11px] text-slate-600">
                    Contractor: <strong>{report.assigned_contractor_name}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DUAL IMAGE EVIDENCE SECTION */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-700" />
              <span>Visual Evidence & YOLO Annotation Analysis</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Citizen Original Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">1. Citizen Submitted Image</span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border">Raw Capture</span>
                </div>
                <div className="relative h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                  <img
                    src={report.image_url}
                    alt="Citizen Raw"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* YOLO Annotated Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>2. YOLO AI Object Annotation</span>
                  </span>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                    Confidence: {(report.ai_confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-72 rounded-xl overflow-hidden border border-blue-200 bg-slate-900 shadow-inner">
                  <img
                    src={report.annotated_image_url || report.image_url}
                    alt="YOLO Annotated"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI ASSESSMENT & METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Assessment Card */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Gemma Municipal Assessment</span>
              </h3>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    AI Municipal Description
                  </h4>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
                    {report.ai_description || 'Municipal inspection required to determine structural degradation.'}
                  </p>
                </div>

                {report.recommended_action && (
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Recommended Action
                    </h4>
                    <p className="text-slate-800 bg-blue-50/50 p-3 rounded-lg border border-blue-100 font-medium">
                      {report.recommended_action}
                    </p>
                  </div>
                )}

                {report.user_description && (
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Citizen Submitted Notes
                    </h4>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                      "{report.user_description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Severity, Priority & GPS Location */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Civic Metadata</h3>

              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-slate-500 font-medium">Severity Level</span>
                  <span className="font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded border">
                    {report.severity}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500 font-medium">Operational Priority</span>
                  <span className={`font-bold px-2 py-0.5 rounded border uppercase ${
                    report.priority === 'Urgent' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-orange-100 text-orange-800 border-orange-300'
                  }`}>
                    {report.priority}
                  </span>
                </div>

                {report.road_damage_percentage && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500 font-medium">Damage Estimation</span>
                    <span className="font-bold text-blue-700">{report.road_damage_percentage}</span>
                  </div>
                )}

                <div className="pt-2 space-y-1">
                  <span className="text-slate-500 font-medium block">GPS Coordinates</span>
                  <div className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                    Lat: {report.latitude.toFixed(5)}, Lon: {report.longitude.toFixed(5)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESOLUTION EVIDENCE IF RESOLVED */}
          {report.resolution_image_url && (
            <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Completed Resolution Evidence</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="relative h-64 rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50">
                  <img
                    src={report.resolution_image_url}
                    alt="Resolution Evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-emerald-900/90 text-white text-xs font-bold px-2.5 py-1 rounded">
                    After Repair Evidence
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Resolution Headline</h4>
                    <p className="text-slate-900 font-bold text-sm mt-0.5">
                      {report.resolution_title || 'Civic Issue Resolved'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Work Completed</h4>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium leading-relaxed">
                      {report.work_completed || report.resolution_description}
                    </p>
                  </div>
                  {report.verification_notes && (
                    <div>
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Verification Notes</h4>
                      <p className="text-slate-600 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 leading-relaxed">
                        {report.verification_notes}
                      </p>
                    </div>
                  )}
                  <div className="text-slate-500 pt-2 border-t border-slate-100">
                    Resolved by: <strong>{report.resolved_by}</strong> on {report.resolved_at}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEPARTMENT ASSIGNMENT WORKFLOW FORM */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Head Authority Department Assignment</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select target municipal department. You may override the AI suggested department if necessary.
              </p>
            </div>

            {/* Suggestion Chip */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI Suggested Department: {report.suggested_department_name}</span>
                </div>
                <div className="text-blue-700">{report.suggestion_reasoning}</div>
              </div>
              <button
                type="button"
                onClick={() => handleDeptChange(String(report.suggested_department_id))}
                className="px-3 py-1.5 bg-blue-700 text-white rounded-md font-semibold text-xs shrink-0 hover:bg-blue-800 transition-colors"
              >
                Apply Suggestion
              </button>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Department *
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    required
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contractor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Contractor (Optional)
                  </label>
                  <select
                    value={selectedContractorId}
                    onChange={(e) => setSelectedContractorId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">Department General Pool</option>
                    {contractors.map((c) => (
                      <option key={c.firebase_uid} value={c.firebase_uid}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Authority Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Authority Directive / Operational Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter specific instructions or urgency timeline for the field team..."
                  value={authorityNote}
                  onChange={(e) => setAuthorityNote(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                ></textarea>
              </div>

              {assignmentFeedback && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                  assignmentFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  {assignmentFeedback.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                  <span>{assignmentFeedback.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{report.status === 'Reported' ? 'Confirm Assignment (Pending)' : 'Update Department Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthorityLayout>
  );
}
