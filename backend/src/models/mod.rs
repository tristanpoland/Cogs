use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthStatus {
    pub status: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub query: String,
    pub page: Option<usize>,
    pub per_page: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub title: String,
    pub url: String,
    pub snippet: String,
    pub score: f32,
    pub last_crawled: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResponse {
    pub results: Vec<SearchResult>,
    pub total: usize,
    pub page: usize,
    pub per_page: usize,
    pub query_time_ms: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebPage {
    pub url: String,
    pub title: String,
    pub content: String,
    pub description: Option<String>,
    pub keywords: Vec<String>,
    pub crawled_at: DateTime<Utc>,
    pub links: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrawlRequest {
    pub seed_urls: Vec<String>,
    pub max_depth: Option<usize>,
    pub max_pages: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrawlStatus {
    pub is_running: bool,
    pub pages_crawled: usize,
    pub pages_indexed: usize,
    pub queue_size: usize,
    pub started_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexStats {
    pub total_documents: usize,
    pub index_size_bytes: u64,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrawlerConfig {
    pub user_agent: String,
    pub respect_robots_txt: bool,
    pub crawl_delay_ms: u64,
    pub max_concurrent_requests: usize,
}

impl Default for CrawlerConfig {
    fn default() -> Self {
        Self {
            user_agent: "CogsSearchBot/1.0".to_string(),
            respect_robots_txt: true,
            crawl_delay_ms: 1000,
            max_concurrent_requests: 10,
        }
    }
}
