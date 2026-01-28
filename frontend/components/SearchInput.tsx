'use client';

import { useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'small' | 'medium' | 'large';
  showHistory?: boolean;
  searchHistory?: string[];
  onSelectHistory?: (query: string) => void;
  onClearHistory?: () => void;
}

export default function SearchInput({
  value,
  onChange,
  onSearch,
  loading = false,
  placeholder = 'Search the web...',
  autoFocus = false,
  size = 'large',
  showHistory = false,
  searchHistory = [],
  onSelectHistory,
  onClearHistory,
}: SearchInputProps) {
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
      setShowHistoryDropdown(false);
    }
  };

  const handleClear = () => {
    onChange('');
    document.getElementById('search-input')?.focus();
  };

  const sizeClasses = {
    small: {
      container: 'h-12',
      input: 'px-5 py-3 pr-24 text-base',
      button: 'px-4 py-2',
      buttonText: 'text-sm',
      icon: 'w-5 h-5',
    },
    medium: {
      container: 'h-14',
      input: 'px-6 py-3.5 pr-28 text-base',
      button: 'px-5 py-2.5',
      buttonText: 'text-sm',
      icon: 'w-5 h-5',
    },
    large: {
      container: 'h-16',
      input: 'px-6 py-4 pl-14 pr-32 text-lg',
      button: 'px-6 py-3',
      buttonText: 'text-base',
      icon: 'w-6 h-6',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="relative w-full">
      <div className="relative group">
        {/* Search Icon */}
        {size === 'large' && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className={`${classes.icon} text-[#606060] transition-colors ${isFocused ? 'text-[#00D9FF]' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}

        {/* Input */}
        <input
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (showHistory && onSelectHistory) {
              setShowHistoryDropdown(e.target.value.length === 0 && searchHistory.length > 0);
            }
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            setIsFocused(true);
            if (showHistory && onSelectHistory) {
              setShowHistoryDropdown(value.length === 0 && searchHistory.length > 0);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowHistoryDropdown(false), 200);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full ${classes.input} bg-[#0A0A0A] border-2 ${
            isFocused ? 'border-[#00D9FF]' : 'border-[#2A2A2A]'
          } rounded-xl text-white placeholder-[#606060] focus:outline-none transition-all ${classes.container}`}
        />

        {/* Clear Button */}
        {value && !loading && (
          <button
            onClick={handleClear}
            className="absolute right-28 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#1A1A1A] rounded-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4 text-[#606060] hover:text-[#909090]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={loading || !value.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 ${classes.button} bg-[#00D9FF] hover:bg-[#00B8FF] active:scale-95 text-black font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${classes.buttonText} shadow-lg shadow-[#00D9FF]/20`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75" />
              </svg>
              <span className="hidden sm:inline">Searching...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Search</span>
              <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </button>

        {/* Focus Ring Effect */}
        {isFocused && (
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00D9FF]/20 to-[#00D9FF]/10 rounded-xl blur-sm -z-10 animate-pulse"></div>
        )}
      </div>

      {/* Search History Dropdown */}
      {showHistoryDropdown && showHistory && searchHistory.length > 0 && onSelectHistory && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl shadow-black/50 z-10 animate-slideDown">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2A2A] bg-[#050505]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-[#909090] font-medium">Recent Searches</span>
            </div>
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="text-xs text-[#606060] hover:text-[#00D9FF] transition-colors font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {searchHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectHistory(item);
                  setShowHistoryDropdown(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#141414] transition-all text-sm flex items-center gap-3 text-[#B8B8B8] border-b border-[#1A1A1A] last:border-0 group"
              >
                <svg className="w-4 h-4 text-[#606060] group-hover:text-[#00D9FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="flex-1 group-hover:text-white transition-colors">{item}</span>
                <svg className="w-4 h-4 text-[#606060] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
