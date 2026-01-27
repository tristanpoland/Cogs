use std::collections::VecDeque;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use reqwest::Client;
use scraper::{Html, Selector};
use url::Url;
use chrono::Utc;
use dashmap::DashMap;
use serde::{Serialize, Deserialize};
use std::path::Path;

use crate::models::{WebPage, CrawlStatus, CrawlerConfig};
use crate::indexer::SearchIndexer;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeedDomain {
    pub url: String,
    pub domain: String,
    pub pages_crawled: usize,
    pub pages_pending: usize,
}

pub struct WebCrawler {
    client: Client,
    visited: Arc<DashMap<String, bool>>,
    queue: Arc<RwLock<VecDeque<CrawlTask>>>,
    seed_domains: Arc<DashMap<String, String>>, // domain -> original seed URL
    config: CrawlerConfig,
    status: Arc<RwLock<CrawlStatus>>,
    indexer: Arc<RwLock<SearchIndexer>>,
    robots_cache: Arc<DashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CrawlTask {
    url: String,
    depth: usize,
    domain: String,
}

#[derive(Serialize, Deserialize)]
struct CrawlState {
    queue: Vec<CrawlTask>,
    visited: Vec<String>,
    seed_domains: Vec<(String, String)>,
}

impl WebCrawler {
    pub fn new(indexer: Arc<RwLock<SearchIndexer>>) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .user_agent("CogsSearchBot/1.0 (+https://cogs-search.com/bot)")
            .build()
            .expect("Failed to build HTTP client");

        Self {
            client,
            visited: Arc::new(DashMap::new()),
            queue: Arc::new(RwLock::new(VecDeque::new())),
            seed_domains: Arc::new(DashMap::new()),
            config: CrawlerConfig::default(),
            status: Arc::new(RwLock::new(CrawlStatus {
                is_running: false,
                pages_crawled: 0,
                pages_indexed: 0,
                queue_size: 0,
                started_at: None,
            })),
            indexer,
            robots_cache: Arc::new(DashMap::new()),
        }
    }

    pub fn start_background_crawler(crawler: Arc<RwLock<Self>>) {
        // Spawn multiple concurrent workers for parallel crawling
        let num_workers = 5; // Number of concurrent crawlers

        for worker_id in 0..num_workers {
            let crawler_clone = crawler.clone();
            tokio::spawn(async move {
                println!("Background crawler worker {} started", worker_id);
                loop {
                    {
                        let c = crawler_clone.read().await;
                        c.run_crawler_iteration().await;
                    }
                    // Small delay between iterations
                    tokio::time::sleep(Duration::from_millis(200)).await;
                }
            });
        }

        println!("Started {} concurrent crawler workers", num_workers);
    }

    async fn save_state(&self) {
        let queue = self.queue.read().await;
        let visited: Vec<String> = self.visited.iter().map(|e| e.key().clone()).collect();
        let seed_domains: Vec<(String, String)> = self.seed_domains.iter()
            .map(|e| (e.key().clone(), e.value().clone()))
            .collect();

        let state = CrawlState {
            queue: queue.iter().cloned().collect(),
            visited,
            seed_domains,
        };

        println!("Saving crawl state: {} queued, {} visited, {} seed domains",
            state.queue.len(), state.visited.len(), state.seed_domains.len());

        match serde_json::to_string_pretty(&state) {
            Ok(json) => {
                match std::fs::write("./data/crawl_state.json", &json) {
                    Ok(_) => println!("Successfully wrote crawl state to disk"),
                    Err(e) => println!("Failed to write crawl state file: {}", e),
                }
            },
            Err(e) => println!("Failed to serialize crawl state: {}", e),
        }
    }

    pub async fn load_state(&self) -> Result<(), Box<dyn std::error::Error>> {
        if !Path::new("./data/crawl_state.json").exists() {
            return Ok(());
        }

        let json = std::fs::read_to_string("./data/crawl_state.json")?;
        let state: CrawlState = serde_json::from_str(&json)?;

        // First, restore visited URLs
        self.visited.clear();
        for url in state.visited {
            self.visited.insert(url, true);
        }

        // Then, restore queue but filter out already-visited URLs
        let mut queue = self.queue.write().await;
        queue.clear();
        let original_queue_size = state.queue.len();
        let filtered_queue: Vec<CrawlTask> = state.queue
            .into_iter()
            .filter(|task| !self.visited.contains_key(&task.url))
            .collect();

        queue.extend(filtered_queue.iter().cloned());
        let filtered_count = original_queue_size - queue.len();

        // Restore seed domains
        self.seed_domains.clear();
        for (domain, seed_url) in state.seed_domains {
            self.seed_domains.insert(domain, seed_url);
        }

        println!("Loaded crawl state: {} queued ({} filtered out as already visited), {} visited, {} seed domains",
            queue.len(), filtered_count, self.visited.len(), self.seed_domains.len());
        Ok(())
    }

    pub async fn get_seed_domains(&self) -> Vec<SeedDomain> {
        let queue = self.queue.read().await;

        self.seed_domains.iter().map(|entry| {
            let domain = entry.key().clone();
            let seed_url = entry.value().clone();

            let pages_pending = queue.iter().filter(|task| task.domain == domain).count();
            let pages_crawled = self.visited.iter()
                .filter(|v| {
                    if let Ok(url) = Url::parse(v.key()) {
                        if let Some(host) = url.host_str() {
                            Self::normalize_domain(host) == domain
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                })
                .count();

            SeedDomain {
                url: seed_url,
                domain,
                pages_crawled,
                pages_pending,
            }
        }).collect()
    }

    fn normalize_domain(domain: &str) -> String {
        // Remove www. prefix for consistency
        domain.strip_prefix("www.").unwrap_or(domain).to_string()
    }

    pub async fn add_seed_domain(&self, url: String) -> Result<(), String> {
        let parsed_url = Url::parse(&url).map_err(|e| format!("Invalid URL: {}", e))?;
        let raw_domain = parsed_url.host_str().ok_or("No host in URL")?;
        let domain = Self::normalize_domain(raw_domain);

        if self.seed_domains.contains_key(&domain) {
            return Err("Domain already in queue".to_string());
        }

        self.seed_domains.insert(domain.clone(), url.clone());
        println!("Inserted into seed_domains map: {} -> {}", domain, url);
        println!("Current seed_domains count: {}", self.seed_domains.len());

        let mut queue = self.queue.write().await;
        queue.push_back(CrawlTask {
            url: url.clone(),
            depth: 0,
            domain: domain.clone(),
        });
        println!("Added task to queue. Queue size: {}", queue.len());
        drop(queue);

        println!("About to save state for domain: {}", domain);
        self.save_state().await;
        println!("State saved for domain: {}", domain);
        Ok(())
    }

    pub async fn remove_seed_domain(&self, url: &str) -> bool {
        let domain = if let Ok(parsed) = Url::parse(url) {
            let raw_domain = parsed.host_str().unwrap_or("");
            Self::normalize_domain(raw_domain)
        } else {
            Self::normalize_domain(url)
        };

        let removed = self.seed_domains.remove(&domain).is_some();

        if removed {
            let mut queue = self.queue.write().await;
            queue.retain(|task| task.domain != domain);
            println!("Removed seed domain and all its URLs: {}", domain);
            self.save_state().await;
        }

        removed
    }

    async fn run_crawler_iteration(&self) {
        let max_depth = 3;

        let task = {
            let mut queue = self.queue.write().await;
            queue.pop_front()
        };

        match task {
            Some(task) if task.depth <= max_depth => {
                // Double-check not visited (in case of race condition between workers)
                if self.visited.contains_key(&task.url) {
                    println!("Skipping already visited: {}", task.url);
                    return;
                }

                // Mark as visited immediately to prevent other workers from picking it up
                self.visited.insert(task.url.clone(), true);

                {
                    let mut status = self.status.write().await;
                    status.is_running = true;
                    if status.started_at.is_none() {
                        status.started_at = Some(Utc::now());
                    }
                }

                println!("Crawling: {}", task.url);

                if let Ok(page) = self.crawl_page(&task.url).await {
                    if let Ok(url_parsed) = Url::parse(&task.url) {
                        if self.is_allowed_by_robots(&url_parsed).await {
                            let mut indexer = self.indexer.write().await;
                            if let Ok(_) = indexer.add_document(&page) {
                                let mut status = self.status.write().await;
                                status.pages_crawled += 1;
                                status.pages_indexed += 1;

                                if status.pages_crawled % 10 == 0 {
                                    drop(status);
                                    if let Err(e) = indexer.commit() {
                                        println!("Failed to commit index: {}", e);
                                    } else {
                                        println!("Committed index");
                                    }
                                }
                            }
                        }
                    }

                    if task.depth < max_depth {
                        let mut new_tasks = Vec::new();

                        // Collect new tasks from discovered links
                        for link in page.links {
                            if let Ok(link_url) = Url::parse(&link) {
                                if !self.visited.contains_key(&link) {
                                    let raw_domain = link_url.host_str().unwrap_or("");
                                    let link_domain = Self::normalize_domain(raw_domain);
                                    if self.seed_domains.contains_key(&link_domain) {
                                        new_tasks.push(CrawlTask {
                                            url: link,
                                            depth: task.depth + 1,
                                            domain: link_domain,
                                        });
                                    }
                                }
                            }
                        }

                        // Add new tasks to queue
                        // Limit to 20 URLs per page to prevent queue flooding
                        if !new_tasks.is_empty() {
                            let links_to_add: Vec<_> = new_tasks.into_iter().take(20).collect();
                            let added_count = links_to_add.len();

                            let mut queue = self.queue.write().await;
                            // Add to back of queue for breadth-first crawling
                            for new_task in links_to_add {
                                queue.push_back(new_task);
                            }

                            println!("Added {} new URLs from {} to queue (queue size: {})",
                                added_count, task.domain, queue.len());
                        }
                    }

                    tokio::time::sleep(Duration::from_millis(self.config.crawl_delay_ms)).await;
                }

                let queue_size = self.queue.read().await.len();
                let mut status = self.status.write().await;
                status.queue_size = queue_size;
            }
            None => {
                let mut status = self.status.write().await;
                if status.is_running {
                    status.is_running = false;
                }
            }
            _ => {}
        }
    }

    async fn crawl_page(&self, url: &str) -> Result<WebPage, Box<dyn std::error::Error + Send + Sync>> {
        let response = self.client.get(url).send().await?;
        let html = response.text().await?;
        let document = Html::parse_document(&html);

        // Intelligent title extraction (prioritize: og:title > twitter:title > h1 > title tag)
        let title = self.extract_title(&document);

        // Intelligent description extraction (prioritize: og:description > twitter:description > meta description > first p tag)
        let description = self.extract_description(&document);

        // Extract keywords from multiple sources
        let keywords = self.extract_keywords(&document);

        // Clean content extraction (remove scripts, styles, nav, footer, etc.)
        let content = self.extract_clean_content(&document);

        let links = self.extract_links(&document, url);

        println!("Indexed: {} - \"{}\" ({} chars, {} links)",
            url, title, content.len(), links.len());

        Ok(WebPage {
            url: url.to_string(),
            title,
            content,
            description,
            keywords,
            crawled_at: Utc::now(),
            links,
        })
    }

    fn is_generic_title(&self, title: &str) -> bool {
        let generic_patterns = [
            "reddit - the heart of the internet",
            "loading...",
            "please wait",
            "redirecting",
            "home",
            "welcome",
        ];

        let lower = title.to_lowercase();
        generic_patterns.iter().any(|pattern| lower.contains(pattern)) || title.len() < 3
    }

    fn extract_title(&self, document: &Html) -> String {
        // 1. Try Open Graph title
        if let Some(og_title) = document
            .select(&Selector::parse("meta[property='og:title']").unwrap())
            .next()
            .and_then(|el| el.value().attr("content"))
        {
            if !og_title.trim().is_empty() && !self.is_generic_title(og_title) {
                return og_title.trim().to_string();
            }
        }

        // 2. Try Twitter title
        if let Some(twitter_title) = document
            .select(&Selector::parse("meta[name='twitter:title']").unwrap())
            .next()
            .and_then(|el| el.value().attr("content"))
        {
            if !twitter_title.trim().is_empty() && !self.is_generic_title(twitter_title) {
                return twitter_title.trim().to_string();
            }
        }

        // 3. Try first h1
        if let Some(h1) = document
            .select(&Selector::parse("h1").unwrap())
            .next()
        {
            let h1_text = h1.text().collect::<String>().trim().to_string();
            if !h1_text.is_empty() && h1_text.len() < 200 && !self.is_generic_title(&h1_text) {
                return h1_text;
            }
        }

        // 4. Try title tag (but skip if generic)
        if let Some(title_tag) = document
            .select(&Selector::parse("title").unwrap())
            .next()
        {
            let title_text = title_tag.inner_html().trim().to_string();
            if !title_text.is_empty() && !self.is_generic_title(&title_text) {
                return title_text;
            }
        }

        // 5. Try first h2 if all else fails
        if let Some(h2) = document
            .select(&Selector::parse("h2").unwrap())
            .next()
        {
            let h2_text = h2.text().collect::<String>().trim().to_string();
            if !h2_text.is_empty() && h2_text.len() < 200 {
                return h2_text;
            }
        }

        // 6. Last resort: extract from URL path
        "Content Page".to_string()
    }

    fn extract_description(&self, document: &Html) -> Option<String> {
        // 1. Try Open Graph description
        if let Some(og_desc) = document
            .select(&Selector::parse("meta[property='og:description']").unwrap())
            .next()
            .and_then(|el| el.value().attr("content"))
        {
            if !og_desc.trim().is_empty() {
                return Some(og_desc.trim().to_string());
            }
        }

        // 2. Try Twitter description
        if let Some(twitter_desc) = document
            .select(&Selector::parse("meta[name='twitter:description']").unwrap())
            .next()
            .and_then(|el| el.value().attr("content"))
        {
            if !twitter_desc.trim().is_empty() {
                return Some(twitter_desc.trim().to_string());
            }
        }

        // 3. Try meta description
        if let Some(meta_desc) = document
            .select(&Selector::parse("meta[name='description']").unwrap())
            .next()
            .and_then(|el| el.value().attr("content"))
        {
            if !meta_desc.trim().is_empty() {
                return Some(meta_desc.trim().to_string());
            }
        }

        // 4. Try first paragraph in main content area
        for selector_str in &["article p", "main p", ".content p", "p"] {
            if let Ok(selector) = Selector::parse(selector_str) {
                if let Some(p) = document.select(&selector).next() {
                    let p_text = p.text().collect::<String>().trim().to_string();
                    if p_text.len() > 50 && p_text.len() < 500 {
                        return Some(p_text);
                    }
                }
            }
        }

        None
    }

    fn extract_keywords(&self, document: &Html) -> Vec<String> {
        let mut keywords = Vec::new();

        // 1. Meta keywords
        if let Some(meta_keywords) = document
            .select(&Selector::parse("meta[name='keywords']").unwrap())
            .next()
            .and_then(|el| el.value().attr("content"))
        {
            keywords.extend(
                meta_keywords
                    .split(',')
                    .map(|k| k.trim().to_string())
                    .filter(|k| !k.is_empty())
            );
        }

        // 2. Extract from headings (h1-h3)
        for tag in &["h1", "h2", "h3"] {
            if let Ok(selector) = Selector::parse(tag) {
                for heading in document.select(&selector).take(5) {
                    let text = heading.text().collect::<String>().trim().to_string();
                    if !text.is_empty() && text.len() < 100 {
                        keywords.push(text);
                    }
                }
            }
        }

        // Deduplicate and limit
        keywords.sort();
        keywords.dedup();
        keywords.truncate(20);

        keywords
    }

    fn extract_clean_content(&self, document: &Html) -> String {
        // Remove script, style, nav, footer, header, aside elements
        let mut text_parts = Vec::new();

        // Try to find main content area first
        let content_selectors = vec![
            "article",
            "main",
            "[role='main']",
            ".content",
            ".main-content",
            "#content",
            "#main",
        ];

        let mut found_main = false;
        for selector_str in content_selectors {
            if let Ok(selector) = Selector::parse(selector_str) {
                if let Some(main_elem) = document.select(&selector).next() {
                    text_parts.push(self.extract_text_from_element(main_elem));
                    found_main = true;
                    break;
                }
            }
        }

        // If no main content area found, extract from body but skip unwanted elements
        if !found_main {
            if let Ok(body_selector) = Selector::parse("body") {
                if let Some(body) = document.select(&body_selector).next() {
                    text_parts.push(self.extract_text_from_element(body));
                }
            }
        }

        // Join and clean up
        let content = text_parts.join(" ");

        // Clean up whitespace
        content
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
            .chars()
            .take(50000) // Limit to 50k chars
            .collect()
    }

    fn extract_text_from_element(&self, element: scraper::ElementRef) -> String {
        // Skip unwanted elements
        let skip_tags = ["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"];

        let mut text = String::new();

        for node in element.descendants() {
            if let Some(elem) = scraper::ElementRef::wrap(node) {
                let tag_name = elem.value().name();
                if skip_tags.contains(&tag_name) {
                    continue;
                }
            }

            if let Some(text_node) = node.value().as_text() {
                text.push_str(text_node);
                text.push(' ');
            }
        }

        text
    }

    fn extract_links(&self, document: &Html, base_url: &str) -> Vec<String> {
        let selector = Selector::parse("a[href]").unwrap();
        let base = Url::parse(base_url).ok();

        document
            .select(&selector)
            .filter_map(|el| el.value().attr("href"))
            .filter_map(|href| {
                if let Some(ref base) = base {
                    base.join(href).ok()
                } else {
                    Url::parse(href).ok()
                }
            })
            .filter(|url| url.scheme() == "http" || url.scheme() == "https")
            .map(|url| url.to_string())
            .collect()
    }

    async fn is_allowed_by_robots(&self, url: &Url) -> bool {
        if !self.config.respect_robots_txt {
            return true;
        }

        let domain = match url.host_str() {
            Some(host) => host,
            None => return false,
        };

        if self.robots_cache.contains_key(domain) {
            return true;
        }

        let robots_url = format!("{}://{}/robots.txt", url.scheme(), domain);

        if let Ok(response) = self.client.get(&robots_url).send().await {
            if let Ok(robots_txt) = response.text().await {
                self.robots_cache.insert(domain.to_string(), robots_txt);
                return true;
            }
        }

        true
    }

    pub async fn get_status(&self) -> CrawlStatus {
        self.status.read().await.clone()
    }

    pub async fn stop_crawl(&self) {
        let mut status = self.status.write().await;
        status.is_running = false;
    }
}

impl Clone for WebCrawler {
    fn clone(&self) -> Self {
        Self {
            client: self.client.clone(),
            visited: self.visited.clone(),
            queue: self.queue.clone(),
            seed_domains: self.seed_domains.clone(),
            config: self.config.clone(),
            status: self.status.clone(),
            indexer: self.indexer.clone(),
            robots_cache: self.robots_cache.clone(),
        }
    }
}
