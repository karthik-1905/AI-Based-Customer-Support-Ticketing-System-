import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import JobCard from '../../components/jobs/JobCard.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { mockJobs } from '../../data/mockData.js';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../../utils/formatters.js';
import { SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import toast from 'react-hot-toast';

const LOCATIONS = ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL'];

const JobsListing = () => {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', location: '', experience: '' });

  const PAGE_SIZE = 6;

  const filtered = mockJobs.filter((job) => {
    const q = search.toLowerCase();
    const matchSearch = !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.skills?.some(s => s.toLowerCase().includes(q));
    const matchType = !filters.type || job.type === filters.type;
    const matchLocation = !filters.location || job.location.includes(filters.location);
    const matchExp = !filters.experience || job.experience === filters.experience;
    return matchSearch && matchType && matchLocation && matchExp;
  });

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const filterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => setFilters({ type: '', location: '', experience: '' });

  const handleApply = (job) => {
    toast.success(`Applied to ${job.title} at ${job.company}!`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-text">Browse Jobs</h1>
          <p className="text-text-muted text-sm mt-0.5">{filtered.length} positions available</p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 flex-wrap">
          <SearchBar
            placeholder="Search jobs, companies, skills..."
            onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
            showFilter
            filterCount={filterCount}
            onFilterClick={() => setShowFilters(!showFilters)}
            className="flex-1 min-w-48"
          />
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('grid')} className={`p-2.5 ${view === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'} transition-colors`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setView('list')} className={`p-2.5 ${view === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'} transition-colors`}>
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </h3>
              {filterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Job Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setCurrentPage(1); }}
                  className="input-field"
                >
                  <option value="">All types</option>
                  {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => { setFilters({ ...filters, location: e.target.value }); setCurrentPage(1); }}
                  className="input-field"
                >
                  <option value="">All locations</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Experience Level</label>
                <select
                  value={filters.experience}
                  onChange={(e) => { setFilters({ ...filters, experience: e.target.value }); setCurrentPage(1); }}
                  className="input-field"
                >
                  <option value="">All levels</option>
                  {EXPERIENCE_LEVELS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Filters */}
        {filterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).filter(([, v]) => v).map(([key, val]) => (
              <span key={key} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full font-medium">
                {val}
                <button onClick={() => { setFilters({ ...filters, [key]: '' }); setCurrentPage(1); }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Job Grid/List */}
        {paginated.length > 0 ? (
          <div className={view === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
            {paginated.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} onApply={handleApply} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal size={28} className="text-slate-300" />
            </div>
            <h3 className="font-semibold text-text mb-1">No jobs found</h3>
            <p className="text-text-muted text-sm">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(''); clearFilters(); }} className="text-primary text-sm font-medium hover:underline mt-2">Clear all filters</button>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showCount
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      </div>
    </DashboardLayout>
  );
};

export default JobsListing;
