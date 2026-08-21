import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ContractorLayout from '../../components/contractor/ContractorLayout';
import {
  fetchContractorReportDetails,
  startContractorWork,
  resolveContractorReport
} from '../../services/api';
import {
  ArrowLeft,
  Wrench,
  Camera,
  Upload,
  Play,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle,
  Video,
  X,
  FileText
} from 'lucide-react';

export default function ContractorIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Resolution Form States
  const [resolutionDesc, setResolutionDesc] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [resolveFeedback, setResolveFeedback] = useState(null);

  // Camera Live Stream state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContractorReportDetails(id);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Access denied or report not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    return () => {
      stopCamera();
    };
  }, [id]);

  // Camera helpers
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access camera. Please allow camera permissions or upload an image file.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `live_resolution_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setResolutionFile(file);
        setResolutionPreview(URL.createObjectURL(file));
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResolutionFile(file);
      setResolutionPreview(URL.createObjectURL(file));
    }
  };

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const res = await startContractorWork(id);
      setReport(res.report);
    } catch (err) {
      alert(`Failed to start work: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionFile) {
      alert('Resolution image evidence is required. Please capture a camera photo or upload an image file.');
      return;
    }
    if (!resolutionDesc.trim()) {
      alert('Please provide a description of the completed maintenance work.');
      return;
    }

    setResolving(true);
    setResolveFeedback(null);
    try {
      const res = await resolveContractorReport(id, resolutionFile, resolutionDesc.trim());
      setResolveFeedback({
        success: true,
        message: 'Resolution submitted successfully! Gemma resolution report generated and status marked as Resolved.'
      });
      setReport(res.report);
    } catch (err) {
      setResolveFeedback({
        success: false,
        message: err.message || 'Resolution submission failed.'
      });
    } finally {
      setResolving(false);
    }
  };

  const deptName = report?.department_name || 'Department Contractor';

  return (
    <ContractorLayout
      title={`Work Order #SF-2026-${id}`}
      subtitle="Detailed civic defect assessment, work execution, and resolution evidence submission."
      departmentName={deptName}
      actions={
        <Link
          to="/contractor/issues"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assignments</span>
        </Link>
      }
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading work order details...</p>
        </div>
      ) : error || !report ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error || 'Work order not found.'}
        </div>
      ) : (
        <div className="space-y-8">
          {/* TOP SUMMARY */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  #SF-2026-{report.id}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border uppercase ${
                  report.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : report.status === 'In Progress'
                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
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
                  <span>Assigned: {report.assigned_at || report.reported_at}</span>
                </div>
              </div>
            </div>

            {report.status === 'Pending' && (
              <button
                onClick={handleStartWork}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0 self-start md:self-center"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>Start Field Work (In Progress)</span>
              </button>
            )}
          </div>

          {/* DUAL IMAGE INSPECTION */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Original Citizen Defect & YOLO Bounding Analysis</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-700">1. Citizen Submitted Image</div>
                <div className="relative h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={report.image_url}
                    alt="Citizen defect"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-blue-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. YOLO AI Object Annotation</span>
                </div>
                <div className="relative h-64 rounded-xl overflow-hidden border border-blue-200 bg-slate-900">
                  <img
                    src={report.annotated_image_url || report.image_url}
                    alt="YOLO defect"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DEFECT SPECIFICATIONS & AUTHORITY DIRECTIVES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Assessment & Instructions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Defect Specifications</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">AI Assessment</h4>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
                    {report.ai_description}
                  </p>
                </div>
                {report.recommended_action && (
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Recommended Maintenance</h4>
                    <p className="text-slate-800 bg-amber-50/50 p-3 rounded-lg border border-amber-100 font-medium">
                      {report.recommended_action}
                    </p>
                  </div>
                )}
                {report.user_description && (
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Citizen Description</h4>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                      "{report.user_description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Authority Directives & GPS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Authority Directives & Location</h3>
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="pb-2">
                  <span className="text-slate-500 font-medium block mb-1">Head Authority Note</span>
                  <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900 font-semibold">
                    {report.authority_note || 'No specific note provided. Proceed with standard department repair protocol.'}
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Priority</span>
                  <span className="font-bold text-red-600 uppercase">{report.priority}</span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Estimated Damage</span>
                  <span className="font-bold text-slate-800">{report.road_damage_percentage || 'Standard'}</span>
                </div>

                <div className="pt-2">
                  <span className="text-slate-500 font-medium block mb-1">GPS Coordinates</span>
                  <div className="font-mono text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                    Lat: {report.latitude.toFixed(5)}, Lon: {report.longitude.toFixed(5)} ({report.location_name})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESOLUTION SUBMISSION SECTION (WHEN IN PROGRESS) */}
          {report.status === 'In Progress' && (
            <div className="bg-white rounded-xl border-2 border-emerald-500 shadow-md p-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded text-xs uppercase tracking-wider mb-2">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Step 2: Submit Resolution Evidence</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Mark Issue as Resolved</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload or capture photographic evidence of the rectified site. The backend strictly requires image evidence to verify and close this civic report.
                </p>
              </div>

              <form onSubmit={handleResolveSubmit} className="space-y-6">
                {/* Evidence Image Capture / Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Resolution Photographic Evidence * (Live Camera OR File Upload)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Live Camera Option */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">Capture via Live Camera</h4>
                        <p className="text-[11px] text-slate-500">Take an instant photo from your mobile/desktop device</p>
                      </div>
                      {!cameraActive ? (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Open Live Camera</span>
                        </button>
                      ) : (
                        <div className="w-full space-y-2">
                          <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-black h-48 flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Take Snapshot</span>
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* File Upload Option */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">Upload Photo File</h4>
                        <p className="text-[11px] text-slate-500">Select JPEG/PNG photo from local storage</p>
                      </div>
                      <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preview Selected Resolution Image */}
                  {resolutionPreview && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolutionPreview}
                          alt="Resolution Preview"
                          className="w-16 h-16 rounded-lg object-cover border border-emerald-300 shadow-xs"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-emerald-900 block">Resolution Evidence Attached</span>
                          <span className="text-emerald-700 text-[11px]">{resolutionFile?.name || 'Captured Photo'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResolutionFile(null);
                          setResolutionPreview(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Work Completed Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Description of Completed Work *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="e.g. Cleared debris, applied high-grade asphalt mix, compacted surface, and verified road safety..."
                    value={resolutionDesc}
                    onChange={(e) => setResolutionDesc(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  ></textarea>
                </div>

                {resolveFeedback && (
                  <div className={`p-4 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                    resolveFeedback.success
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-red-50 text-red-900 border-red-200'
                  }`}>
                    {resolveFeedback.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span>{resolveFeedback.message}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={resolving || !resolutionFile}
                    className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    {resolving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{resolving ? 'Analyzing & Verifying Resolution...' : 'Submit Resolution Evidence & Close Issue'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* COMPLETED RESOLUTION DISPLAY */}
          {report.status === 'Resolved' && report.resolution_image_url && (
            <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Verified Field Resolution</h3>
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
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Resolution Title</h4>
                    <p className="text-slate-900 font-bold text-sm mt-0.5">{report.resolution_title}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Work Completed</h4>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium leading-relaxed">
                      {report.work_completed || report.resolution_description}
                    </p>
                  </div>
                  {report.verification_notes && (
                    <div>
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Verification Assessment</h4>
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
        </div>
      )}
    </ContractorLayout>
  );
}
