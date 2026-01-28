'use client';

export default function LoadingResults() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl overflow-hidden relative"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[#1A1A1A]/50 to-transparent"></div>

          {/* Header skeleton */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-5 h-5 bg-[#1A1A1A] rounded animate-pulse"></div>
            <div className="h-3 bg-[#1A1A1A] rounded w-32 animate-pulse"></div>
            <div className="ml-auto h-6 bg-[#1A1A1A] rounded w-12 animate-pulse"></div>
          </div>

          {/* Title skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-5 bg-[#1A1A1A] rounded w-3/4 animate-pulse"></div>
            <div className="h-5 bg-[#1A1A1A] rounded w-1/2 animate-pulse"></div>
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-[#1A1A1A] rounded w-full animate-pulse"></div>
            <div className="h-4 bg-[#1A1A1A] rounded w-5/6 animate-pulse"></div>
          </div>

          {/* Footer skeleton */}
          <div className="pt-3 border-t border-[#1A1A1A] flex items-center justify-between">
            <div className="h-3 bg-[#1A1A1A] rounded w-2/3 animate-pulse"></div>
            <div className="h-3 bg-[#1A1A1A] rounded w-20 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
