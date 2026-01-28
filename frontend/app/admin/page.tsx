'use client';

import { useState, useEffect } from 'react';
import {
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
      setMessage({ type: 'success', text: 'Domain added to queue. Crawling will begin automatically.' });
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
      setMessage({ type: 'success', text: 'Domain removed from queue' });
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
      setMessage({ type: 'success', text: 'Crawler stopped' });
      await fetchStatus();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to stop crawler',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearIndex = async () => {
    if (!confirm('Clear the entire search index? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await clearIndex();
      setMessage({ type: 'success', text: 'Index cleared successfully' });
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#00D9FF] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">
              Admin Console
            </h1>
          </Link>

          <Link
            href="/"
            className="px-3 py-2 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] rounded-lg transition-all text-sm"
          >
            Back to Search
          </Link>
        </header>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]'
                : 'bg-[#FF4757]/10 border-[#FF4757]/30 text-[#FF4757]'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {message.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-1">
              <svg className="w-5 h-5 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-medium text-[#909090]">Documents</h3>
            </div>
            <p className="text-2xl font-bold">
              {indexStats?.total_documents.toLocaleString() || '0'}
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className={`w-2 h-2 rounded-full ${crawlStatus?.is_running ? 'bg-[#00FF94]' : 'bg-[#606060]'}`}></div>
              <h3 className="text-sm font-medium text-[#909090]">Crawler</h3>
            </div>
            <p className="text-2xl font-bold">
              {crawlStatus?.is_running ? 'Running' : 'Idle'}
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-1">
              <svg className="w-5 h-5 text-[#909090]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              <h3 className="text-sm font-medium text-[#909090]">Queue</h3>
            </div>
            <p className="text-2xl font-bold">
              {crawlStatus?.queue_size.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {crawlStatus?.is_running && (
          <div className="bg-[#00FF94]/5 border border-[#00FF94]/20 rounded-xl p-5 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#00FF94] mb-1">Crawl in Progress</h3>
                <p className="text-sm text-[#909090]">
                  {crawlStatus.started_at && `Started ${new Date(crawlStatus.started_at).toLocaleString()}`}
                </p>
              </div>
              <button
                onClick={handleStopCrawl}
                disabled={loading}
                className="px-3 py-1.5 bg-[#FFD600] hover:bg-[#FFC700] text-black font-medium rounded-lg disabled:opacity-50 text-sm transition-all"
              >
                Stop
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#909090] mb-0.5">Crawled</p>
                <p className="text-xl font-bold">{crawlStatus.pages_crawled.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[#909090] mb-0.5">Indexed</p>
                <p className="text-xl font-bold">{crawlStatus.pages_indexed.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Seed Domains</h3>

            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2.5 bg-[#000000] border border-[#2A2A2A] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-[#00D9FF] transition-all text-sm"
              />
              <button
                onClick={handleAddUrl}
                disabled={loading}
                className="px-5 py-2.5 bg-[#00D9FF] hover:bg-[#00B8FF] text-black font-medium rounded-lg disabled:opacity-50 transition-all text-sm"
              >
                Add
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {queueDomains.length === 0 ? (
                <div className="text-center py-8 text-[#606060] text-sm">
                  <p>No domains in queue</p>
                  <p className="text-xs mt-1">Add a seed URL to start crawling</p>
                </div>
              ) : (
                queueDomains.map((domain, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[#000000] border border-[#2A2A2A] rounded-lg hover:border-[#3A3A3A] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-[#1A1A1A] rounded flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#606060]">
                            {domain.domain.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium truncate">{domain.domain}</p>
                        </div>
                        <p className="text-xs text-[#606060] truncate mb-2">{domain.url}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[#00FF94]">{domain.pages_crawled} crawled</span>
                          <span className="text-[#FFD600]">{domain.pages_pending} pending</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveUrl(domain.url)}
                        disabled={loading}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#FF4757] hover:bg-[#FF4757]/10 rounded transition-all disabled:opacity-50"
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
            <p className="text-xs text-[#606060] mt-3">
              Domains are crawled automatically and removed when complete
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Index Management</h3>

            <div className="space-y-4">
              {indexStats && (
                <div className="p-4 bg-[#000000] border border-[#2A2A2A] rounded-lg">
                  <h4 className="font-medium mb-3 text-sm">Index Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#909090]">Size</span>
                      <span className="font-medium">
                        {(indexStats.index_size_bytes / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#909090]">Last Updated</span>
                      <span className="font-medium">
                        {new Date(indexStats.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-[#FF4757]/5 border border-[#FF4757]/20 rounded-lg">
                <h4 className="font-medium mb-2 text-sm text-[#FF4757]">Danger Zone</h4>
                <p className="text-xs text-[#909090] mb-3">
                  Permanently delete all indexed documents
                </p>
                <button
                  onClick={handleClearIndex}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-[#FF4757] hover:bg-[#FF3747] text-white font-medium rounded-lg disabled:opacity-50 transition-all text-sm"
                >
                  Clear Index
                </button>
              </div>
            </div>
          </div>
        </div>

        {recentDocs.length > 0 && (
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#909090]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recently Indexed
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentDocs.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-[#000000] hover:bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#3A3A3A] rounded-lg transition-all group"
                >
                  <h4 className="font-medium text-[#00D9FF] group-hover:text-[#00B8FF] transition-colors line-clamp-1 mb-1 text-sm">
                    {doc.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-[#606060] mb-2 truncate font-mono">
                    {doc.url}
                  </p>
                  {doc.snippet && (
                    <p className="text-sm text-[#909090] line-clamp-2 mb-2">
                      {doc.snippet}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-[#606060]">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(doc.last_crawled).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
