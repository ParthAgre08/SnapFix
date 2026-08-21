import React from 'react';
import { CIVIC_CATEGORIES, CIVIC_STATUSES } from '../../data/mockData';
import { Search, Filter, MapPin, X } from 'lucide-react';

export default function IssueFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedCity,
  setSelectedCity,
  onReset
}) {
  const cities = ['All', 'Pune', 'Bengaluru', 'Mumbai', 'Delhi'];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by keyword, landmark, or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          {/* City Filter */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold py-2.5 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold py-2.5 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {CIVIC_STATUSES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] shrink-0 mr-1">
          Category:
        </span>
        {CIVIC_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat.id
                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
              }`}
          >
            {cat.label}
          </button>
        ))}

        {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedCity !== 'All' || searchQuery !== '') && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-red-600 hover:underline px-2 py-1 shrink-0 ml-auto flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

    </div>
  );
}
