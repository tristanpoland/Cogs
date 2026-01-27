'use client';

import { useState, useEffect } from 'react';
import {
  startCrawl,
  stopCrawl,
  getCrawlStatus,
  getIndexStats,
  clearIndex,
  getRecentDocuments,
  getQueue,
  addToQueue,
  removeFromQueue,
  CrawlStatus,
  IndexStats,
  SearchResult,
  SeedDomain,
} from '@/lib/api';
import Link from 'next/link';

export default function AdminConsole() {
  const [queueDomains, setQueueDomains] = useState<SeedDomain[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState('3');
  const [maxPages, setMaxPages] = useState('1000');
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus | null>(null);
  const [indexStats, setIndexStats] = useState<IndexStats | null>(null);
  const [recentDocs, setRecentDocs] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const [crawlData, indexData, recentData, queueData] = await Promise.all([
        getCrawlStatus(),
        getIndexStats(),
        getRecentDocuments(20),
        getQueue(),
      ]);
      setCrawlStatus(crawlData);
      setIndexStats(indexData);
      setRecentDocs(recentData);
      setQueueDomains(queueData);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleAddUrl = async () => {
    const trimmedUrl = newUrl.trim();

    if (!trimmedUrl) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setMessage({ type: 'error', text: 'URL must start with http:// or https://' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await addToQueue(trimmedUrl);
      setMessage({ type: 'success', text: 'Seed domain added! Crawling will start automatically.' });
      setNewUrl('');
      await fetchStatus();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add URL',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUrl = async (url: string) => {
    setLoading(true);
    setMessage(null);

    try {
      await removeFromQueue(url);
      setMessage({ type: 'success', text: 'Seed domain removed from queue!' });
      await fetchStatus();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to remove URL',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStopCrawl = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await stopCrawl();
      setMessage({ type: 'success', text: 'Crawl stopped successfully!' });
      await fetchStatus();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to stop crawl',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearIndex = async () => {
    if (!confirm('Are you sure you want to clear the entire index? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await clearIndex();
      setMessage({ type: 'success', text: 'Index cleared successfully!' });
      await fetchStatus();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to clear index',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00D9FF] to-[#7B61FF] rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] bg-clip-text text-transparent">
              Admin Console
            </h1>
          </Link>

          <Link
            href="/"
            className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] rounded-lg transition-colors text-sm"
          >
            Back to Search
          </Link>
        </header>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success'
                ? 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]'
                : 'bg-[#FF4757]/10 border-[#FF4757]/30 text-[#FF4757]'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#00D9FF]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#B8B8B8]">Total Documents</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {indexStats?.total_documents.toLocaleString() || '0'}
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                crawlStatus?.is_running ? 'bg-[#00FF94]/10 animate-pulse' : 'bg-[#7B61FF]/10'
              }`}>
                <svg className={`w-5 h-5 ${crawlStatus?.is_running ? 'text-[#00FF94]' : 'text-[#7B61FF]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#B8B8B8]">Crawler Status</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {crawlStatus?.is_running ? 'Running' : 'Idle'}
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FF00D6]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#FF00D6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#B8B8B8]">Queue Size</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {crawlStatus?.queue_size.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {crawlStatus?.is_running && (
          <div className="bg-gradient-to-r from-[#00D9FF]/10 to-[#7B61FF]/10 border border-[#00D9FF]/30 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-[#00D9FF]">Crawl Progress</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#B8B8B8] text-sm mb-1">Pages Crawled</p>
                <p className="text-2xl font-bold">{crawlStatus.pages_crawled.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[#B8B8B8] text-sm mb-1">Pages Indexed</p>
                <p className="text-2xl font-bold">{crawlStatus.pages_indexed.toLocaleString()}</p>
              </div>
            </div>
            {crawlStatus.started_at && (
              <p className="text-[#B8B8B8] text-sm mt-4">
                Started: {new Date(crawlStatus.started_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Crawl Queue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                  Seed Domains ({queueDomains.length})
                </label>

                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-3 bg-[#141414] border border-[#2A2A2A] rounded-lg text-white placeholder-[#909090] focus:outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/20 transition-all"
                  />
                  <button
                    onClick={handleAddUrl}
                    disabled={loading}
                    className="px-5 py-3 bg-gradient-to-r from-[#00D9FF] to-[#00B8FF] hover:from-[#00B8FF] hover:to-[#0097FF] text-black font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="max-h-[280px] overflow-y-auto space-y-2 bg-[#141414] border border-[#2A2A2A] rounded-lg p-3">
                  {queueDomains.length === 0 ? (
                    <p className="text-[#909090] text-sm text-center py-6">
                      No domains in queue. Add a seed URL to start automatic crawling.
                    </p>
                  ) : (
                    queueDomains.map((domain, index) => (
                      <div
                        key={index}
                        className="p-3 bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg group transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 bg-gradient-to-br from-[#00D9FF]/20 to-[#7B61FF]/20 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-[#00D9FF]">
                                  {domain.domain.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-white truncate" title={domain.url}>
                                {domain.domain}
                              </p>
                            </div>
                            <p className="text-xs text-[#7B61FF] truncate mb-2" title={domain.url}>
                              {domain.url}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-[#00FF94]">
                                {domain.pages_crawled} crawled
                              </span>
                              <span className="text-[#FFD600]">
                                {domain.pages_pending} pending
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveUrl(domain.url)}
                            disabled={loading}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-[#FF4757] hover:bg-[#FF4757]/10 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            title="Remove domain"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-[#909090] mt-2">
                  Crawling runs automatically. Domains are removed only when fully indexed.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Index Management</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                <h4 className="font-medium mb-2">Crawler Control</h4>
                <p className="text-sm text-[#B8B8B8] mb-4">
                  Stop the currently running crawler
                </p>
                <button
                  onClick={handleStopCrawl}
                  disabled={loading || !crawlStatus?.is_running}
                  className="w-full px-6 py-3 bg-[#FFD600] hover:bg-[#FFC700] text-black font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Stop Crawl
                </button>
              </div>

              <div className="p-4 bg-[#141414] rounded-lg border border-[#FF4757]/30">
                <h4 className="font-medium mb-2 text-[#FF4757]">Danger Zone</h4>
                <p className="text-sm text-[#A0A0A0] mb-4">
                  Clear all documents from the search index
                </p>
                <button
                  onClick={handleClearIndex}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#FF4757] hover:bg-[#FF3747] text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Clear Index
                </button>
              </div>

              {indexStats && (
                <div className="p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                  <h4 className="font-medium mb-2">Index Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#B8B8B8]">Index Size:</span>
                      <span className="text-white">
                        {(indexStats.index_size_bytes / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B8B8B8]">Last Updated:</span>
                      <span className="text-white">
                        {new Date(indexStats.last_updated).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {recentDocs.length > 0 && (
          <div className="mt-8 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Recently Indexed Pages
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentDocs.map((doc, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#141414] hover:bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg transition-colors"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h4 className="font-medium text-[#00D9FF] group-hover:text-[#00B8FF] transition-colors line-clamp-1 mb-1">
                      {doc.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-[#7B61FF] mb-2 truncate">
                      {doc.url}
                    </p>
                    {doc.snippet && (
                      <p className="text-sm text-[#B8B8B8] line-clamp-2 mb-2">
                        {doc.snippet}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[#909090]">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(doc.last_crawled).toLocaleString()}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
