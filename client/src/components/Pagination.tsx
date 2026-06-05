import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-150 px-4 py-3 sm:px-6 mt-4 dark:border-slate-800">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="relative inline-flex items-center rounded-xl border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="relative ml-3 inline-flex items-center rounded-xl border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-600 dark:text-slate-400">
            Page <span className="font-bold text-gray-905 dark:text-white">{currentPage}</span> of{' '}
            <span className="font-bold text-gray-905 dark:text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex rounded-xl shadow-sm gap-1" aria-label="Pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="relative inline-flex items-center rounded-xl p-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`relative inline-flex items-center justify-center rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                  currentPage === page
                    ? 'z-10 bg-indigo-650 text-white border-indigo-650 shadow-sm'
                    : 'bg-white text-gray-705 border-gray-300 hover:bg-gray-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-850'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="relative inline-flex items-center rounded-xl p-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-750 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
