import React, { useState, useEffect } from 'react';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import { fetchAuthorityDashboard } from '../../services/api';
import { BarChart3, Clock, TrendingUp, ShieldAlert, Loader2, Building2, CheckCircle2 } from 'lucide-react';

export default function AuthorityAnalytics() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAuthorityDashboard();
        setDashboardData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kpis = dashboardData?.kpis || {};
  const departments = dashboardData?.department_performance || [];

  return (
    <AuthorityLayout
      title="Municipal Operations Analytics & Turnaround Times"
      subtitle="Resolution velocity, departmental efficiency metrics, and performance comparisons."
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Computing municipal analytics metrics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Velocity KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Average Turnaround</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                ~{kpis.avg_resolution_hours || '0'} hrs
              </div>
              <p className="text-xs text-slate-500">From initial citizen submission to verified resolution</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Resolution Efficiency</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700">
                {kpis.overall_resolution_rate || '0'}%
              </div>
              <p className="text-xs text-slate-500">Completed maintenance across all municipal departments</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Caseload</span>
                <Building2 className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {(kpis.total_pending || 0) + (kpis.total_in_progress || 0)} cases
              </div>
              <p className="text-xs text-slate-500">Combined pending and in-progress field operations</p>
            </div>
          </div>

          {/* Department Comparison Chart / Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Departmental Resolution Efficiency Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Comparative analysis of active cases vs resolved maintenance</p>
            </div>

            <div className="space-y-4">
              {departments.map((dept) => (
                <div key={dept.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">{dept.name}</span>
                    <span className="text-blue-700">{dept.resolved} / {dept.total_assigned} Resolved ({dept.resolution_rate}%)</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full transition-all"
                      style={{ width: `${dept.resolution_rate}%` }}
                      title={`Resolved: ${dept.resolved}`}
                    ></div>
                    <div
                      className="bg-orange-500 h-full transition-all"
                      style={{ width: `${dept.total_assigned > 0 ? (dept.in_progress / dept.total_assigned) * 100 : 0}%` }}
                      title={`In Progress: ${dept.in_progress}`}
                    ></div>
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{ width: `${dept.total_assigned > 0 ? (dept.pending / dept.total_assigned) * 100 : 0}%` }}
                      title={`Pending: ${dept.pending}`}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Resolved: {dept.resolved}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Active: {dept.in_progress}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending: {dept.pending}
                      </span>
                    </div>
                    <span>Avg Turnaround: <strong>~{dept.avg_resolution_hours || '0'}h</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AuthorityLayout>
  );
}
