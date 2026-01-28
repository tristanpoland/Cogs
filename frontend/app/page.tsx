'use client';

import { useState, useEffect } from 'react';
import { search, SearchResult, getSearchStats } from '@/lib/api';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import SearchFiltersPanel, { SearchFilters, SortOption } from '@/components/SearchFilters';
import SearchResultCard from '@/components/SearchResult';
import EmptyState from '@/components/EmptyState';
import LoadingResults from '@/components/LoadingResults';
import Pagination from '@/components/Pagination';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [indexedDocs, setIndexedDocs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    domain: '',
    dateFrom: '',
    dateTo: '',
    sort: 'relevance',
  });

  useEffect(() => {
    getSearchStats()
      .then((stats) => setIndexedDocs(stats.total_documents))
      .catch(() => {});

    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // Escape to clear/blur
      if (e.key === 'Escape') {
        const input = document.getElementById('search-input') as HTMLInputElement;
        if (input === document.activeElement) {
          input.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const newHistory = [trimmed, ...searchHistory.filter((q) => q !== trimmed)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleSearch = async (page: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    saveToHistory(query);

    try {
      const response = await search({
        query: query.trim(),
        page,
        per_page: 10,
      });

      let filteredResults = response.results;

      // Apply client-side filters
      if (filters.domain) {
        filteredResults = filteredResults.filter((r) =>
          new URL(r.url).hostname.includes(filters.domain)
        );
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredResults = filteredResults.filter(
          (r) => new Date(r.last_crawled) >= fromDate
        );
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredResults = filteredResults.filter((r) => new Date(r.last_crawled) <= toDate);
      }

      // Apply sorting
      if (filters.sort === 'date-desc') {
        filteredResults.sort(
          (a, b) => new Date(b.last_crawled).getTime() - new Date(a.last_crawled).getTime()
        );
      } else if (filters.sort === 'date-asc') {
        filteredResults.sort(
          (a, b) => new Date(a.last_crawled).getTime() - new Date(b.last_crawled).getTime()
        );
      }

      setResults(filteredResults);
      setSearchTime(response.query_time_ms);
      setTotal(filteredResults.length);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (historyQuery: string) => {
    setQuery(historyQuery);
    setTimeout(() => handleSearch(), 100);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const resetFilters = () => {
    setFilters({
      domain: '',
      dateFrom: '',
      dateTo: '',
      sort: 'relevance',
    });
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header
          className={`flex items-center ${hasSearched ? 'justify-between' : 'justify-center'} mb-${hasSearched ? '6' : '0'}`}
        >
          {hasSearched && (
            <Link
              href="/"
              onClick={() => {
                setHasSearched(false);
                setQuery('');
                setResults([]);
                resetFilters();
              }}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 bg-[#00D9FF] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Cogs</h1>
            </Link>
          )}

          {hasSearched && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showFilters
                    ? 'bg-[#00D9FF] text-black'
                    : 'bg-[#0A0A0A] text-[#B8B8B8] hover:bg-[#141414] border border-[#2A2A2A]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </span>
              </button>
              <Link
                href="/admin"
                className="px-3 py-2 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] rounded-lg transition-all text-sm"
              >
                Admin
              </Link>
            </div>
          )}
        </header>

        {!hasSearched ? (
          <div className="min-h-[85vh] flex flex-col items-center justify-center">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-[#00D9FF] rounded-xl flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-6xl font-black mb-4 tracking-tight text-white">Cogs Search</h1>
              <p className="text-lg text-[#909090] mb-2">
                Fast, powerful search across{' '}
                {indexedDocs > 0 ? indexedDocs.toLocaleString() : '...'} indexed pages
              </p>
              <p className="text-sm text-[#606060]">
                Built with Rust + Tantivy for blazing fast full-text search
              </p>
            </div>

            <div className="w-full max-w-2xl mb-8">
              <SearchInput
                value={query}
                onChange={setQuery}
                onSearch={() => handleSearch()}
                loading={loading}
                autoFocus
                size="large"
                showHistory
                searchHistory={searchHistory}
                onSelectHistory={handleSelectHistory}
                onClearHistory={clearHistory}
              />

              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#606060]">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded text-[#909090] font-mono">
                    /
                  </kbd>
                  <span>to focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded text-[#909090] font-mono">
                    Esc
                  </kbd>
                  <span>to clear</span>
                </div>
              </div>
            </div>

            <Link
              href="/admin"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] hover:border-[#3A3A3A] rounded-lg transition-all text-sm"
            >
              <svg
                className="w-4 h-4 text-[#909090]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-[#B8B8B8]">Manage Index</span>
            </Link>
          </div>
        ) : (
          <div className="flex gap-6">
            {showFilters && (
              <SearchFiltersPanel
                filters={filters}
                onChange={setFilters}
                onApply={() => handleSearch(1)}
                onReset={resetFilters}
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  onSearch={() => handleSearch()}
                  loading={loading}
                  size="small"
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-[#FF4757]/10 border border-[#FF4757]/30 rounded-xl text-[#FF4757] flex items-start gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Search Error</p>
                    <p className="text-sm opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {searchTime > 0 && !loading && (
                <div className="mb-5 flex items-center justify-between text-sm">
                  <p className="text-[#909090]">
                    Found <span className="text-white font-medium">{total.toLocaleString()}</span>{' '}
                    results
                  </p>
                  <p className="text-[#606060]">{(searchTime / 1000).toFixed(3)}s</p>
                </div>
              )}

              {loading && <LoadingResults />}

              {!loading && results.length > 0 && (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <SearchResultCard key={index} result={result} />
                  ))}
                </div>
              )}

              {!loading && results.length === 0 && query && !error && <EmptyState query={query} />}

              {!loading && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handleSearch} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
