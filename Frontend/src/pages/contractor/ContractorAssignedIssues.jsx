import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ContractorLayout from '../../components/contractor/ContractorLayout';
import { fetchContractorReports, startContractorWork } from '../../services/api';
import {
  Wrench,
  Search,
  MapPin,
  Loader2,
  ExternalLink,
  Play,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function ContractorAssignedIssues() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchContractorReports({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: search.trim() || undefined
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const handleStartWork = async (e, reportId) => {
    e.preventDefault();
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

  const reports = data?.reports || [];
  const deptName = data?.department_name || 'Assigned Department';

  return (
    <ContractorLayout
      title="Department Field Assignments"
      subtitle={`All issues assigned to ${deptName}.`}
      departmentName={deptName}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search assigned issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <button
              onClick={loadData}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </div>

          <div className="w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium w-full md:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Start</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading department issues...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Assignments Found</p>
              <p className="text-xs text-slate-500 mt-1">No reports matching the selected criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Report ID</th>
                    <th className="py-3.5 px-4">Preview</th>
                    <th className="py-3.5 px-4">Issue / Title</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        #SF-2026-{report.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <img
                          src={report.annotated_image_url || report.image_url}
                          alt={report.title}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100"
                        />
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{report.title}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {report.issue_category} • {report.reported_at}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[160px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{report.location_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          report.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : report.status === 'In Progress'
                            ? 'bg-orange-100 text-orange-800 border-orange-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-700">
                        {report.priority}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {report.status === 'Pending' && (
                            <button
                              onClick={(e) => handleStartWork(e, report.id)}
                              disabled={actionLoading === report.id}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center gap-1"
                            >
                              {actionLoading === report.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3 fill-current" />
                              )}
                              <span>Start Work</span>
                            </button>
                          )}
                          <Link
                            to={`/contractor/issues/${report.id}`}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md shadow-2xs transition-colors ${
                              report.status === 'In Progress'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {report.status === 'In Progress' ? 'Resolve' : 'View'}
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
    </ContractorLayout>
  );
}
