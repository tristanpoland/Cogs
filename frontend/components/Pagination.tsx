'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] hover:border-[#00D9FF]/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium group flex items-center gap-2"
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={i}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[40px] px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                currentPage === pageNum
                  ? 'bg-[#00D9FF] text-black shadow-lg shadow-[#00D9FF]/20 scale-110'
                  : 'bg-[#0A0A0A] text-[#909090] hover:bg-[#141414] hover:text-white border border-[#2A2A2A] hover:border-[#3A3A3A]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Show ellipsis and last page if needed */}
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className="text-[#606060] px-2">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="min-w-[40px] px-3 py-2 rounded-lg transition-all text-sm font-medium bg-[#0A0A0A] text-[#909090] hover:bg-[#141414] hover:text-white border border-[#2A2A2A] hover:border-[#3A3A3A]"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] hover:border-[#00D9FF]/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium group flex items-center gap-2"
      >
        <span className="hidden sm:inline">Next</span>
        <svg
          className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Page Info */}
      <div className="text-xs text-[#606060] sm:ml-4">
        Page <span className="text-[#00D9FF] font-medium">{currentPage}</span> of{' '}
        <span className="text-white font-medium">{totalPages}</span>
      </div>
    </div>
  );
}
