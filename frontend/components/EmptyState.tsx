'use client';

import Link from 'next/link';

interface EmptyStateProps {
  query: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="text-center py-20 animate-fadeIn">
      {/* Icon */}
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#0A0A0A] to-[#000000] border-2 border-[#2A2A2A] rounded-2xl flex items-center justify-center shadow-xl">
          <svg
            className="w-10 h-10 text-[#606060]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4757] rounded-full border-2 border-[#000000]"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#00D9FF] rounded-full border-2 border-[#000000]"></div>
      </div>

      {/* Message */}
      <h3 className="text-white text-2xl font-bold mb-3">No results found</h3>
      <p className="text-[#909090] mb-2 text-base">
        Couldn't find anything matching{' '}
        <span className="text-[#00D9FF] font-medium">"{query}"</span>
      </p>
      <p className="text-[#606060] text-sm mb-8">Try a different search or adjust your filters</p>

      {/* Suggestions */}
      <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-[#0A0A0A] to-[#050505] border border-[#2A2A2A] rounded-xl shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h4 className="text-sm font-semibold text-white">Suggestions</h4>
        </div>
        <ul className="text-sm text-[#B8B8B8] space-y-2.5 text-left">
          <li className="flex items-start gap-3 group">
            <svg
              className="w-5 h-5 text-[#00D9FF] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Try different or more general keywords</span>
          </li>
          <li className="flex items-start gap-3 group">
            <svg
              className="w-5 h-5 text-[#00D9FF] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Check your spelling</span>
          </li>
          <li className="flex items-start gap-3 group">
            <svg
              className="w-5 h-5 text-[#00D9FF] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Remove filters to see more results</span>
          </li>
          <li className="flex items-start gap-3 group">
            <svg
              className="w-5 h-5 text-[#00D9FF] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Browse indexed sites via Admin Console</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#0A0A0A] hover:bg-[#141414] border border-[#2A2A2A] hover:border-[#00D9FF]/30 rounded-lg transition-all text-sm group"
        >
          <svg
            className="w-4 h-4 text-[#909090] group-hover:text-[#00D9FF] transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="text-[#B8B8B8] group-hover:text-white transition-colors">
            Add more pages to index
          </span>
        </Link>
      </div>
    </div>
  );
}
