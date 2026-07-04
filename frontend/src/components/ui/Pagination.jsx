import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showCount = false,
  totalItems = 0,
  pageSize = 10,
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      pages.push(i);
    }
    if (currentPage - delta > 2) pages.unshift('...');
    if (currentPage + delta < totalPages - 1) pages.push('...');
    pages.unshift(1);
    if (totalPages > 1) pages.push(totalPages);
    return [...new Set(pages)];
  };

  const pages = getPages();
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between mt-6">
      {showCount ? (
        <p className="text-sm text-text-muted">
          Showing <span className="font-semibold text-text">{start}–{end}</span> of <span className="font-semibold text-text">{totalItems}</span> results
        </p>
      ) : <div />}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`dot-${i}`} className="px-3 py-2 text-slate-400 text-sm">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200
                ${currentPage === page
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-slate-200 text-text-light hover:bg-slate-50'
                }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
