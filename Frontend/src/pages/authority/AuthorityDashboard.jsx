import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import { fetchAuthorityDashboard } from '../../services/api';
import {
  Inbox,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building2,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function AuthorityDashboard() {
  const [dashboardData, setDashboardData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('snapfix_authority_dashboard');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !dashboardData);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!dashboardData) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchAuthorityDashboard();
      setDashboardData(data);
      try {
        sessionStorage.setItem('snapfix_authority_dashboard', JSON.stringify(data));
      } catch {}
    } catch (err) {
      console.error('Failed to load authority dashboard:', err);
      if (!dashboardData) {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = dashboardData?.kpis || {
    total_reports: 0,
    total_reported: 0,
    total_pending: 0,
    total_in_progress: 0,
    total_resolved: 0,
    total_urgent_critical: 0,
    overall_resolution_rate: 0,
    avg_resolution_hours: 0
  };

  const departments = dashboardData?.department_performance || [];
  const recentUrgent = dashboardData?.recent_urgent || [];

  return (
    <AuthorityLayout
      title="Municipal Overview & Operations Dashboard"
      subtitle="Institutional tracking of civic issues, department performance, and resolution velocity."
      actions={
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      }
    >
      {loading && !dashboardData ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-medium text-slate-500">Compiling municipal data from records...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadData} className="text-xs font-bold underline hover:no-underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Reported */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">New Reports</span>
                <Inbox className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{kpis.total_reported}</span>
                <span className="text-[11px] text-blue-600 font-semibold">Unassigned</span>
              </div>
              <Link to="/authority/reported" className="mt-2 text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1">
                <span>Review queue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pending / Assigned */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Pending</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{kpis.total_pending}</span>
                <span className="text-[11px] text-amber-600 font-semibold">Assigned</span>
              </div>
              <Link to="/authority/pending" className="mt-2 text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-1">
                <span>View pending</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* In Progress */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">In Progress</span>
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{kpis.total_in_progress}</span>
                <span className="text-[11px] text-orange-600 font-semibold">Active work</span>
              </div>
              <Link to="/authority/in-progress" className="mt-2 text-[11px] font-semibold text-orange-700 hover:underline flex items-center gap-1">
                <span>Track active</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Resolved */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{kpis.total_resolved}</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Closed</span>
              </div>
              <Link to="/authority/resolved" className="mt-2 text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1">
                <span>View evidence</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Critical / Urgent */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Critical</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-red-600">{kpis.total_urgent_critical}</span>
                <span className="text-[11px] text-red-500 font-semibold">Urgent</span>
              </div>
              <span className="mt-2 text-[11px] font-semibold text-slate-400 block">High Priority</span>
            </div>

            {/* Overall Resolution Rate */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Resolution</span>
                <TrendingUp className="w-4 h-4 text-blue-700" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-700">{kpis.overall_resolution_rate}%</span>
              </div>
              <span className="mt-2 text-[11px] font-semibold text-slate-500 block">
                Avg ~{kpis.avg_resolution_hours}h turnaround
              </span>
            </div>
          </div>

          {/* SECTION 2: DEPARTMENT PERFORMANCE MATRIX */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Municipal Department Performance Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time resolution rates and active case volume per department</p>
              </div>
              <Link
                to="/authority/departments"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Department details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Department</th>
                    <th className="py-3.5 px-4 text-center">Unassigned</th>
                    <th className="py-3.5 px-4 text-center">Pending</th>
                    <th className="py-3.5 px-4 text-center">In Progress</th>
                    <th className="py-3.5 px-4 text-center">Resolved</th>
                    <th className="py-3.5 px-4 text-center">Total Assigned</th>
                    <th className="py-3.5 px-5 text-right">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-100">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <span>{dept.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                        {dept.reported}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-amber-700">
                        {dept.pending}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-orange-700">
                        {dept.in_progress}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">
                        {dept.resolved}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {dept.total_assigned}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, dept.resolution_rate)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-800 w-10 text-right">
                            {dept.resolution_rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: RECENT URGENT & CRITICAL QUEUE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>High Priority Civic Queue</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Issues requiring urgent assignment or contractor dispatch</p>
              </div>
              <Link
                to="/authority/reported"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                View all reports →
              </Link>
            </div>

            {recentUrgent.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No high-priority or urgent civic issues pending immediate review.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentUrgent.map((report) => (
                  <div key={report.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
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
                          <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">
                            {report.priority}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {report.issue_category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{report.location_name}</span>
                          <span>•</span>
                          <span>Reported: {report.reported_at}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                      <Link
                        to={`/authority/reports/${report.id}`}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                      >
                        Review & Assign
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AuthorityLayout>
  );
}
