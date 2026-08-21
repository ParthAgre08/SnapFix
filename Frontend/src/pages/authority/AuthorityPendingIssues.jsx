import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import { fetchAuthorityReports, fetchDepartments } from '../../services/api';
import {
  Clock,
  Search,
  Building2,
  MapPin,
  Loader2,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  FileText
} from 'lucide-react';

export default function AuthorityPendingIssues() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [search, setSearch] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthorityReports({
        status: 'Pending',
        department_id: selectedDept !== 'all' ? selectedDept : undefined,
        search: search.trim() || undefined
      });
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load pending issues:', err);
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
      title="Pending Assigned Issues"
      subtitle="Issues assigned to municipal departments awaiting field contractor commencement."
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search pending issues..."
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
              Filter
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

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading pending issues queue...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Pending Issues</p>
              <p className="text-xs text-slate-500 mt-1">All assigned issues have either commenced work or have been resolved.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Report ID</th>
                    <th className="py-3.5 px-4">Issue / Title</th>
                    <th className="py-3.5 px-4">Assigned Department</th>
                    <th className="py-3.5 px-4">Contractor</th>
                    <th className="py-3.5 px-4">Assigned At</th>
                    <th className="py-3.5 px-4">Authority Note</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        #SF-2026-{report.id}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{report.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{report.location_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-[11px] font-semibold px-2.5 py-1 rounded border border-blue-200">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{report.department_name || 'Road Department'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{report.assigned_contractor_name || 'Department Pool'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {report.assigned_at || report.reported_at}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px] italic truncate">
                        {report.authority_note || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/authority/reports/${report.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3.5 h-3.5" />
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
    </AuthorityLayout>
  );
}
