'use client';

export type SortOption = 'relevance' | 'date-desc' | 'date-asc';

export interface SearchFilters {
  domain: string;
  dateFrom: string;
  dateTo: string;
  sort: SortOption;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function SearchFiltersPanel({
  filters,
  onChange,
  onApply,
  onReset,
}: SearchFiltersProps) {
  const hasActiveFilters =
    filters.domain || filters.dateFrom || filters.dateTo || filters.sort !== 'relevance';
  const activeFilterCount = [
    filters.domain,
    filters.dateFrom,
    filters.dateTo,
    filters.sort !== 'relevance',
  ].filter(Boolean).length;

  return (
    <aside className="w-64 flex-shrink-0 animate-slideIn">
      <div className="sticky top-6 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <h3 className="font-semibold text-white">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-[#00D9FF] text-black text-xs font-bold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-[#606060] hover:text-[#00D9FF] transition-colors font-medium"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Domain Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#909090] mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Domain
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.domain}
                onChange={(e) => onChange({ ...filters, domain: e.target.value })}
                placeholder="example.com"
                className="w-full px-3 py-2.5 bg-[#000000] border border-[#2A2A2A] focus:border-[#00D9FF] rounded-lg text-white text-sm placeholder-[#606060] focus:outline-none transition-all"
              />
              {filters.domain && (
                <button
                  onClick={() => onChange({ ...filters, domain: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#1A1A1A] rounded transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#909090] mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Date Range
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#000000] border border-[#2A2A2A] focus:border-[#00D9FF] rounded-lg text-white text-sm focus:outline-none transition-all"
                  placeholder="From"
                />
                {filters.dateFrom && (
                  <button
                    onClick={() => onChange({ ...filters, dateFrom: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#1A1A1A] rounded transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#000000] border border-[#2A2A2A] focus:border-[#00D9FF] rounded-lg text-white text-sm focus:outline-none transition-all"
                  placeholder="To"
                />
                {filters.dateTo && (
                  <button
                    onClick={() => onChange({ ...filters, dateTo: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#1A1A1A] rounded transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#909090] mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
              Sort By
            </label>
            <div className="space-y-2">
              {[
                { value: 'relevance', label: 'Relevance', icon: '⚡' },
                { value: 'date-desc', label: 'Newest First', icon: '↓' },
                { value: 'date-asc', label: 'Oldest First', icon: '↑' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ ...filters, sort: option.value as SortOption })}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between ${
                    filters.sort === option.value
                      ? 'bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF]'
                      : 'bg-[#000000] border border-[#2A2A2A] text-[#909090] hover:border-[#3A3A3A] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </span>
                  {filters.sort === option.value && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={onApply}
            className="w-full px-4 py-3 bg-[#00D9FF] hover:bg-[#00B8FF] active:scale-95 text-black font-semibold rounded-lg transition-all text-sm shadow-lg shadow-[#00D9FF]/20"
          >
            Apply Filters
          </button>
        </div>

        {/* Quick Presets */}
        {!hasActiveFilters && (
          <div className="mt-5 pt-5 border-t border-[#2A2A2A]">
            <p className="text-xs text-[#606060] mb-2 font-medium">Quick Filters</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onChange({ ...filters, sort: 'date-desc' });
                  setTimeout(onApply, 0);
                }}
                className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-[#909090] hover:text-white transition-all"
              >
                Recent
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 7);
                  onChange({
                    ...filters,
                    dateFrom: yesterday.toISOString().split('T')[0],
                    sort: 'date-desc',
                  });
                  setTimeout(onApply, 0);
                }}
                className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] rounded-lg text-xs text-[#909090] hover:text-white transition-all"
              >
                Past Week
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
