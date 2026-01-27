use rocket::{Route, State, serde::json::Json, http::Status};
use crate::models::{ApiResponse, CrawlRequest, CrawlStatus, IndexStats, SearchResult};
use crate::AppState;

#[post("/crawl", data = "<request>")]
async fn start_crawl(
    request: Json<CrawlRequest>,
    state: &State<AppState>,
) -> Json<ApiResponse<String>> {
    let crawler = state.crawler.read().await;

    // Add all seed URLs to the queue
    for url in &request.seed_urls {
        if let Err(e) = crawler.add_seed_domain(url.clone()).await {
            println!("Failed to add seed domain {}: {}", url, e);
        }
    }

    Json(ApiResponse {
        success: true,
        data: Some("Seed domains added. Crawling runs automatically.".to_string()),
        error: None,
    })
}

#[get("/crawl/status")]
async fn crawl_status(state: &State<AppState>) -> Json<ApiResponse<CrawlStatus>> {
    let crawler = state.crawler.read().await;
    let status = crawler.get_status().await;

    Json(ApiResponse {
        success: true,
        data: Some(status),
        error: None,
    })
}

#[post("/crawl/stop")]
async fn stop_crawl(state: &State<AppState>) -> Json<ApiResponse<String>> {
    let crawler = state.crawler.read().await;
    crawler.stop_crawl().await;

    Json(ApiResponse {
        success: true,
        data: Some("Crawl stopped".to_string()),
        error: None,
    })
}

#[get("/index/stats")]
async fn index_stats(state: &State<AppState>) -> Json<ApiResponse<IndexStats>> {
    let indexer = state.indexer.read().await;

    // Calculate index size
    let index_size = match std::fs::metadata("./data/index") {
        Ok(metadata) => {
            if metadata.is_dir() {
                walkdir::WalkDir::new("./data/index")
                    .into_iter()
                    .filter_map(|e| e.ok())
                    .filter_map(|e| e.metadata().ok())
                    .filter(|m| m.is_file())
                    .map(|m| m.len())
                    .sum()
            } else {
                0
            }
        }
        Err(_) => 0,
    };

    match indexer.count_documents() {
        Ok(count) => Json(ApiResponse {
            success: true,
            data: Some(IndexStats {
                total_documents: count,
                index_size_bytes: index_size,
                last_updated: chrono::Utc::now(),
            }),
            error: None,
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Failed to get index stats: {}", e)),
        }),
    }
}

#[get("/index/recent?<limit>")]
async fn recent_documents(
    limit: Option<usize>,
    state: &State<AppState>,
) -> Json<ApiResponse<Vec<SearchResult>>> {
    let indexer = state.indexer.read().await;
    let limit = limit.unwrap_or(10).min(50);

    match indexer.get_recent_documents(limit) {
        Ok(docs) => Json(ApiResponse {
            success: true,
            data: Some(docs),
            error: None,
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Failed to get recent documents: {}", e)),
        }),
    }
}

#[post("/index/commit")]
async fn commit_index(state: &State<AppState>) -> Json<ApiResponse<String>> {
    let mut indexer = state.indexer.write().await;

    match indexer.commit() {
        Ok(_) => {
            println!("Index committed successfully");
            Json(ApiResponse {
                success: true,
                data: Some("Index committed successfully".to_string()),
                error: None,
            })
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Failed to commit index: {}", e)),
        }),
    }
}

#[delete("/index")]
async fn clear_index(state: &State<AppState>) -> Json<ApiResponse<String>> {
    let mut indexer = state.indexer.write().await;

    match indexer.delete_all() {
        Ok(_) => Json(ApiResponse {
            success: true,
            data: Some("Index cleared successfully".to_string()),
            error: None,
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Failed to clear index: {}", e)),
        }),
    }
}

#[options("/crawl")]
fn crawl_options() -> Status {
    Status::Ok
}

#[options("/crawl/status")]
fn crawl_status_options() -> Status {
    Status::Ok
}

#[options("/crawl/stop")]
fn crawl_stop_options() -> Status {
    Status::Ok
}

#[options("/index/stats")]
fn index_stats_options() -> Status {
    Status::Ok
}

#[options("/index")]
fn index_options() -> Status {
    Status::Ok
}

#[options("/index/commit")]
fn index_commit_options() -> Status {
    Status::Ok
}

#[options("/index/recent")]
fn index_recent_options() -> Status {
    Status::Ok
}

#[get("/queue")]
async fn get_queue(state: &State<AppState>) -> Json<ApiResponse<Vec<crate::crawler::SeedDomain>>> {
    let crawler = state.crawler.read().await;
    let seed_domains = crawler.get_seed_domains().await;

    Json(ApiResponse {
        success: true,
        data: Some(seed_domains),
        error: None,
    })
}

#[post("/queue", data = "<url>")]
async fn add_to_queue(
    url: Json<serde_json::Value>,
    state: &State<AppState>,
) -> Json<ApiResponse<String>> {
    let url_str = url.get("url").and_then(|v| v.as_str()).unwrap_or("");

    if url_str.is_empty() {
        return Json(ApiResponse {
            success: false,
            data: None,
            error: Some("URL is required".to_string()),
        });
    }

    let crawler = state.crawler.write().await;
    match crawler.add_seed_domain(url_str.to_string()).await {
        Ok(_) => {
            println!("Successfully added seed domain: {}", url_str);
            Json(ApiResponse {
                success: true,
                data: Some("Seed domain added and crawling started".to_string()),
                error: None,
            })
        },
        Err(e) => {
            println!("Failed to add seed domain: {}", e);
            Json(ApiResponse {
                success: false,
                data: None,
                error: Some(e),
            })
        },
    }
}

#[delete("/queue", data = "<url>")]
async fn remove_from_queue(
    url: Json<serde_json::Value>,
    state: &State<AppState>,
) -> Json<ApiResponse<String>> {
    let url_str = url.get("url").and_then(|v| v.as_str()).unwrap_or("");

    if url_str.is_empty() {
        return Json(ApiResponse {
            success: false,
            data: None,
            error: Some("URL is required".to_string()),
        });
    }

    let crawler = state.crawler.write().await;
    let removed = crawler.remove_seed_domain(url_str).await;

    if removed {
        Json(ApiResponse {
            success: true,
            data: Some("Seed domain removed from queue".to_string()),
            error: None,
        })
    } else {
        Json(ApiResponse {
            success: false,
            data: None,
            error: Some("Seed domain not found in queue".to_string()),
        })
    }
}

#[options("/queue")]
fn queue_options() -> Status {
    Status::Ok
}

pub fn admin_routes() -> Vec<Route> {
    routes![
        start_crawl, crawl_status, stop_crawl, index_stats, clear_index, commit_index, recent_documents,
        get_queue, add_to_queue, remove_from_queue,
        crawl_options, crawl_status_options, crawl_stop_options, index_stats_options, index_options, index_commit_options, index_recent_options, queue_options
    ]
}
