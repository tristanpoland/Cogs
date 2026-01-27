'use client';

import { useState, useEffect } from 'react';
import { search, SearchResult, getSearchStats } from '@/lib/api';
import Link from 'next/link';

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

  useEffect(() => {
    getSearchStats().then(stats => setIndexedDocs(stats.total_documents)).catch(() => {});
  }, []);

  const handleSearch = async (page: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await search({
        query: query.trim(),
        page,
        per_page: 10,
      });

      setResults(response.results);
      setSearchTime(response.query_time_ms);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-[#000000] text-white relative overflow-hidden">
      {!hasSearched && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#00D9FF]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#7B61FF]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#FF00D6]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        <header className={`flex items-center ${hasSearched ? 'justify-between' : 'justify-center'} mb-${hasSearched ? '8' : '0'} transition-all`}>
          {hasSearched && (
            <Link href="/" onClick={() => {setHasSearched(false); setQuery(''); setResults([]);}} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00D9FF] via-[#7B61FF] to-[#FF00D6] rounded-xl flex items-center justify-center shadow-lg shadow-[#00D9FF]/30 animate-glow">
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] bg-clip-text text-transparent">
                Cogs
              </h1>
            </Link>
          )}

          {hasSearched && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] rounded-lg transition-all hover:border-[#00D9FF]/30 text-sm group"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#7B61FF] group-hover:text-[#00D9FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </span>
            </Link>
          )}
        </header>

        {!hasSearched ? (
          <div className="min-h-[90vh] flex flex-col items-center justify-center">
            <div className="text-center mb-12 animate-slide-up">
              <div className="inline-flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00D9FF] via-[#7B61FF] to-[#FF00D6] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#00D9FF]/30 animate-glow">
                  <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-7xl font-black mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-[#00D9FF] via-[#7B61FF] to-[#FF00D6] bg-clip-text text-transparent">
                  Cogs Search
                </span>
              </h1>
              <p className="text-xl text-[#B8B8B8] mb-3">
                The next generation search engine
              </p>
              <p className="text-sm text-[#909090]">
                {indexedDocs > 0 ? `Searching across ${indexedDocs.toLocaleString()} indexed pages` : 'Powered by Rust + Tantivy'}
              </p>
            </div>

            <div className="w-full max-w-3xl animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search the web..."
                    autoFocus
                    className="w-full px-8 py-6 pr-40 bg-[#0A0A0A] border-2 border-blue-500 rounded-3xl text-white placeholder-[#909090] focus:outline-none focus:border-blue-400 focus:bg-[#000000] transition-all text-lg shadow-2xl"
                  />
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading || !query.trim()}
                    className="absolute right-3 top-0 bottom-0 my-auto h-12 flex items-center px-4 bg-transparent text-[#7B61FF] font-bold rounded-2xl hover:text-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{ height: '3rem' }}
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-[#7B61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75" /></svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] hover:border-[#7B61FF]/50 rounded-xl transition-all group"
                >
                  <svg className="w-5 h-5 text-[#7B61FF] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Admin Console</span>
                </Link>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8 text-xs text-[#909090]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00FF94] rounded-full animate-pulse"></div>
                <span>Rust Backend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00D9FF] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>Tantivy Search</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>Next.js Frontend</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="relative mb-8">
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search the web..."
                  className="w-full px-6 py-4 pr-32 bg-[#0A0A0A] border-2 border-blue-500 rounded-2xl text-white placeholder-[#909090] focus:outline-none focus:border-blue-400 focus:bg-[#000000] transition-all text-lg"
                />
                <button
                  onClick={() => handleSearch()}
                  disabled={loading || !query.trim()}
                  className="absolute right-2 top-0 bottom-0 my-auto h-10 flex items-center px-3 bg-transparent text-[#7B61FF] font-bold rounded-xl hover:text-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ height: '2.5rem' }}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-[#7B61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75" /></svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-5 bg-gradient-to-r from-[#FF4757]/10 to-[#FF4757]/5 border border-[#FF4757]/40 rounded-2xl text-[#FF4757] flex items-start gap-4 shadow-lg">
                <div className="w-10 h-10 bg-[#FF4757]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Search Error</h3>
                  <p className="text-sm text-[#FFB3B3]">{error}</p>
                </div>
              </div>
            )}

            {searchTime > 0 && !loading && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#0A0A0A] to-[#050505] border border-[#2A2A2A] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00D9FF]/20 to-[#7B61FF]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#B8B8B8] text-sm">Found</p>
                    <p className="text-white font-bold text-lg">{total.toLocaleString()} results</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#B8B8B8] text-sm">Query time</p>
                  <p className="text-[#00D9FF] font-bold text-lg">{(searchTime / 1000).toFixed(3)}s</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 bg-gradient-to-br from-[#0A0A0A] to-[#050505] border border-[#2A2A2A] rounded-2xl animate-pulse">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#2A2A2A] rounded-lg"></div>
                      <div className="h-4 bg-[#2A2A2A] rounded-lg w-32"></div>
                    </div>
                    <div className="h-6 bg-[#2A2A2A] rounded-lg w-3/4 mb-3"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-[#2A2A2A] rounded-lg w-full"></div>
                      <div className="h-4 bg-[#2A2A2A] rounded-lg w-5/6"></div>
                    </div>
                    <div className="pt-3 border-t border-[#2A2A2A]">
                      <div className="h-3 bg-[#2A2A2A] rounded-lg w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-6 animate-slide-up">
                {results.map((result, index) => {
                  const domain = new URL(result.url).hostname.replace('www.', '');
                  return (
                    <div
                      key={index}
                      className="group relative p-6 bg-gradient-to-br from-[#0A0A0A] to-[#050505] hover:from-[#141414] hover:to-[#0A0A0A] border border-[#2A2A2A] hover:border-[#00D9FF]/40 rounded-2xl transition-all hover:shadow-lg hover:shadow-[#00D9FF]/5"
                    >
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-[#00D9FF]/20 to-[#7B61FF]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-[#00D9FF]">
                                  {domain.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-[#8B7AFF] group-hover:text-[#00D9FF] transition-colors font-medium">
                                {domain}
                              </span>
                              <svg className="w-3.5 h-3.5 text-[#909090] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white group-hover:text-[#00D9FF] transition-colors mb-2 line-clamp-2 leading-tight">
                              {result.title}
                            </h2>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-[#00D9FF]/15 to-[#7B61FF]/15 text-[#00D9FF] rounded-lg border border-[#00D9FF]/30 shadow-sm">
                              {result.score.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <p className="text-[#D0D0D0] leading-relaxed mb-3 line-clamp-3 text-[15px]">
                          {result.snippet || 'No description available for this page.'}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                          <p className="text-xs text-[#909090] truncate flex-1 mr-4 font-mono">
                            {result.url}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-[#909090] flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(result.last_crawled).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && results.length === 0 && query && !error && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#0A0A0A] to-[#050505] border border-[#2A2A2A] rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#909090]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-white text-2xl font-bold mb-3">No results found</h3>
                <p className="text-[#B8B8B8] mb-2">We couldn't find any pages matching "<span className="text-[#00D9FF]">{query}</span>"</p>
                <div className="max-w-md mx-auto mt-6 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl">
                  <p className="text-sm text-[#7B61FF] font-medium mb-2">Suggestions:</p>
                  <ul className="text-sm text-[#B8B8B8] space-y-1.5 text-left">
                    <li className="flex items-start gap-2">
                      <span className="text-[#00D9FF] mt-0.5">•</span>
                      <span>Try different or more general keywords</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00D9FF] mt-0.5">•</span>
                      <span>Check your spelling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00D9FF] mt-0.5">•</span>
                      <span>Use the admin console to index more pages</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {totalPages > 1 && !loading && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handleSearch(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] hover:border-[#00D9FF]/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center gap-2">
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
                        onClick={() => handleSearch(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-all font-bold text-base ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white shadow-lg shadow-[#00D9FF]/30 border-2 border-[#00D9FF]'
                            : 'bg-transparent border-2 border-[#3A3A3A] text-[#7B61FF] hover:border-[#00D9FF] hover:text-[#00D9FF]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handleSearch(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-transparent border-2 border-[#3A3A3A] text-[#7B61FF] hover:border-[#00D9FF] hover:text-[#00D9FF] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-bold text-base"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
