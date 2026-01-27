const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SearchQuery {
  query: string;
  page?: number;
  per_page?: number;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  last_crawled: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  per_page: number;
  query_time_ms: number;
}

export interface CrawlRequest {
  seed_urls: string[];
  max_depth?: number;
  max_pages?: number;
}

export interface CrawlStatus {
  is_running: boolean;
  pages_crawled: number;
  pages_indexed: number;
  queue_size: number;
  started_at: string | null;
}

export interface IndexStats {
  total_documents: number;
  index_size_bytes: number;
  last_updated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export async function search(query: SearchQuery): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  });

  const data: ApiResponse<SearchResponse> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Search failed');
  }

  return data.data;
}

export async function getSearchStats(): Promise<IndexStats> {
  const response = await fetch(`${API_BASE_URL}/api/search/stats`);
  const data: ApiResponse<IndexStats> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to get stats');
  }

  return data.data;
}

export async function startCrawl(request: CrawlRequest): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/admin/crawl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data: ApiResponse<string> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to start crawl');
  }

  return data.data;
}

export async function getCrawlStatus(): Promise<CrawlStatus> {
  const response = await fetch(`${API_BASE_URL}/api/admin/crawl/status`);
  const data: ApiResponse<CrawlStatus> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to get crawl status');
  }

  return data.data;
}

export async function stopCrawl(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/admin/crawl/stop`, {
    method: 'POST',
  });

  const data: ApiResponse<string> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to stop crawl');
  }

  return data.data;
}

export async function getIndexStats(): Promise<IndexStats> {
  const response = await fetch(`${API_BASE_URL}/api/admin/index/stats`);
  const data: ApiResponse<IndexStats> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to get index stats');
  }

  return data.data;
}

export async function clearIndex(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/admin/index`, {
    method: 'DELETE',
  });

  const data: ApiResponse<string> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to clear index');
  }

  return data.data;
}

export async function getRecentDocuments(limit: number = 10): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/index/recent?limit=${limit}`);
  const data: ApiResponse<SearchResult[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to get recent documents');
  }

  return data.data;
}

export interface SeedDomain {
  url: string;
  domain: string;
  pages_crawled: number;
  pages_pending: number;
}

export async function getQueue(): Promise<SeedDomain[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/queue`);
  const data: ApiResponse<SeedDomain[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to get queue');
  }

  return data.data;
}

export async function addToQueue(url: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/admin/queue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data: ApiResponse<string> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to add URL to queue');
  }

  return data.data;
}

export async function removeFromQueue(url: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/admin/queue`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data: ApiResponse<string> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to remove URL from queue');
  }

  return data.data;
}
