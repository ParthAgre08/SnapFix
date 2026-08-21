import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContractorLayout from '../../components/contractor/ContractorLayout';
import { fetchContractorReports, startContractorWork } from '../../services/api';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  ArrowRight,
  Loader2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Play
} from 'lucide-react';

export default function ContractorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchContractorReports();
      setData(res);
    } catch (err) {
      console.error('Failed to load contractor dashboard:', err);
      setError(err.message || 'Failed to fetch assigned contractor reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartWork = async (e, reportId) => {
    e.preventDefault();
    e.stopPropagation();
    setActionLoading(reportId);
    try {
      await startContractorWork(reportId);
      await loadData();
    } catch (err) {
      alert(`Could not start work: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const stats = data?.stats || { total: 0, pending: 0, in_progress: 0, resolved: 0, urgent: 0 };
  const reports = data?.reports || [];
  const deptName = data?.department_name || 'Assigned Department';

  const pendingOrActive = reports.filter((r) => r.status === 'Pending' || r.status === 'In Progress');

  return (
    <ContractorLayout
      title={`${deptName} Dashboard`}
      subtitle="Field contractor queue, work commencement, and resolution evidence submission."
      departmentName={deptName}
      actions={
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      }
    >
      {loading && !data ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading department assigned caseload...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI METRIC CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pending */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Pending Start</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{stats.pending}</span>
                <span className="text-[11px] text-amber-600 font-semibold">Awaiting Field Work</span>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">In Progress</span>
                <Wrench className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-orange-600">{stats.in_progress}</span>
                <span className="text-[11px] text-orange-600 font-semibold">Active Work</span>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">{stats.resolved}</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Verified</span>
              </div>
            </div>

            {/* Urgent */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Urgent Priority</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-red-600">{stats.urgent}</span>
                <span className="text-[11px] text-red-500 font-semibold">Expedite</span>
              </div>
            </div>
          </div>

          {/* ACTIVE ASSIGNED QUEUE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Active Field Assignments</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assigned issues requiring maintenance or resolution submission</p>
              </div>
              <Link to="/contractor/issues" className="text-xs font-semibold text-amber-700 hover:text-amber-900">
                View all department issues →
              </Link>
            </div>

            {pendingOrActive.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Pending or Active Assignments</p>
                <p className="text-xs text-slate-500 mt-1">All issues assigned to {deptName} are currently resolved.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingOrActive.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={report.annotated_image_url || report.image_url}
                        alt={report.title}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            #SF-2026-{report.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            report.status === 'In Progress'
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {report.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {report.issue_category}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{report.location_name}</span>
                          </div>
                          <span>•</span>
                          <span>Priority: <strong className="text-slate-700">{report.priority}</strong></span>
                        </div>

                        {report.authority_note && (
                          <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded border border-amber-200 mt-1">
                            Authority Directive: <em>"{report.authority_note}"</em>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                      {report.status === 'Pending' && (
                        <button
                          onClick={(e) => handleStartWork(e, report.id)}
                          disabled={actionLoading === report.id}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                        >
                          {actionLoading === report.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>Start Work</span>
                        </button>
                      )}

                      <Link
                        to={`/contractor/issues/${report.id}`}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-colors ${
                          report.status === 'In Progress'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        {report.status === 'In Progress' ? 'Submit Resolution Evidence' : 'Inspect Details'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ContractorLayout>
  );
}
