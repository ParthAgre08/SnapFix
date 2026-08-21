// SnapFix Realistic Civic Issues Dataset

export const CIVIC_CATEGORIES = [
  { id: 'all', label: 'All Issues', icon: 'Layers' },
  { id: 'pothole', label: 'Pothole & Roads', icon: 'AlertTriangle' },
  { id: 'streetlight', label: 'Damaged Streetlights', icon: 'ZapOff' },
  { id: 'drainage', label: 'Drainage & Sewage', icon: 'Droplets' },
  { id: 'garbage', label: 'Waste & Garbage', icon: 'Trash2' },
  { id: 'footpath', label: 'Broken Footpath', icon: 'Footprints' },
];

export const CIVIC_STATUSES = [
  { id: 'all', label: 'All Statuses' },
  { id: 'reported', label: 'Reported', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'under_review', label: 'Under Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'assigned', label: 'Assigned', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'resolved', label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'verified', label: 'Verified', color: 'bg-teal-100 text-teal-800 border-teal-200' },
];

export const INITIAL_REPORTS = [];

export const DEMO_STATS = [
  { value: '1,248+', label: 'Reports Submitted', note: 'Across registered communities' },
  { value: '786+', label: 'Issues Resolved', note: 'Verified by local authorities & citizens' },
  { value: '524+', label: 'Active Citizens', note: 'Contributing photo reports' },
  { value: '42', label: 'Communities Connected', note: 'Neighborhood civic groups' }
];

export const MOCK_USER = {
  name: 'Rajesh Kumar',
  email: 'rajesh.k@example.com',
  city: 'Pune, Maharashtra',
  memberSince: 'March 2026',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  stats: {
    submitted: 4,
    resolved: 2,
    pending: 2
  }
};
