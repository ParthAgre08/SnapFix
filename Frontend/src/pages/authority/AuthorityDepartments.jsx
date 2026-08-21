import React, { useState, useEffect } from 'react';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import { fetchDepartments, fetchAuthorityDashboard } from '../../services/api';
import { Building2, Tag, Loader2, Users, CheckCircle2, Clock } from 'lucide-react';

export default function AuthorityDepartments() {
  const [departments, setDepartments] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dRes, dashRes] = await Promise.all([
          fetchDepartments(),
          fetchAuthorityDashboard().catch(() => null)
        ]);
        setDepartments(dRes.departments || []);
        setDashboardData(dashRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const deptMetrics = dashboardData?.department_performance || [];

  return (
    <AuthorityLayout
      title="Municipal Departments & Classification System"
      subtitle="Configured municipal departments, auto-classification keywords, and real-time caseloads."
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading municipal department configurations...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => {
              const metric = deptMetrics.find((m) => m.id === dept.id) || {
                pending: 0,
                in_progress: 0,
                resolved: 0,
                total_assigned: 0,
                resolution_rate: 0
              };

              return (
                <div key={dept.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-tight">{dept.name}</h3>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border">
                            {dept.code}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                        Active
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {dept.description || 'Dedicated municipal maintenance division.'}
                    </p>

                    {/* Classification Keywords */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>Auto-Classification Keywords</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(dept.keywords_list || []).slice(0, 10).map((kw, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Metrics footer */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Pending</span>
                      <span className="font-bold text-amber-700 text-sm">{metric.pending}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Active</span>
                      <span className="font-bold text-orange-700 text-sm">{metric.in_progress}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Resolved</span>
                      <span className="font-bold text-emerald-700 text-sm">{metric.resolved}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Rate</span>
                      <span className="font-bold text-blue-700 text-sm">{metric.resolution_rate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AuthorityLayout>
  );
}
