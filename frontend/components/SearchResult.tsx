'use client';

import { SearchResult as SearchResultType } from '@/lib/api';
import { useState } from 'react';

interface SearchResultProps {
  result: SearchResultType;
}

export default function SearchResult({ result }: SearchResultProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const domain = new URL(result.url).hostname.replace('www.', '');
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const copyUrl = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="group relative">
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-5 bg-[#0A0A0A] hover:bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#00D9FF]/30 rounded-xl transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Favicon */}
            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#1A1A1A]">
              <img
                src={faviconUrl}
                alt=""
                className="w-4 h-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-xs font-bold text-[#606060]">${domain.charAt(0).toUpperCase()}</span>`;
                  }
                }}
              />
            </div>

            {/* Domain */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-[#909090] truncate group-hover:text-[#00D9FF] transition-colors font-medium">
                {domain}
              </span>
              <svg
                className="w-3.5 h-3.5 text-[#606060] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs px-2.5 py-1 bg-[#00D9FF]/10 text-[#00D9FF] rounded-lg border border-[#00D9FF]/20 font-medium">
              {result.score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-[#00D9FF] group-hover:text-[#00B8FF] transition-colors mb-2 line-clamp-2 leading-snug">
          {result.title}
        </h2>

        {/* Snippet */}
        <p
          className={`text-[#B8B8B8] leading-relaxed mb-3 text-sm ${
            expanded ? '' : 'line-clamp-2'
          }`}
        >
          {result.snippet || 'No description available.'}
        </p>

        {/* Expand/Collapse Button */}
        {result.snippet && result.snippet.length > 150 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            className="text-xs text-[#606060] hover:text-[#00D9FF] transition-colors mb-3 font-medium"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
          <div className="flex items-center gap-1 text-xs text-[#606060] truncate flex-1 mr-4 font-mono">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="truncate">{result.url}</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-xs text-[#606060]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatDate(result.last_crawled)}</span>
            </div>
          </div>
        </div>
      </a>

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyUrl}
          className="p-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg transition-all"
          title="Copy URL"
        >
          {copied ? (
            <svg className="w-4 h-4 text-[#00FF94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[#909090]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Hover Effect Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00D9FF] to-[#00B8FF] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
}
