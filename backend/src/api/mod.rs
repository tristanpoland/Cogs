use rocket::{Route, State, serde::json::Json, http::Status};
use crate::models::{ApiResponse, SearchQuery, SearchResponse, IndexStats};
use crate::search::SearchEngine;
use crate::AppState;

#[post("/", data = "<query>")]
async fn search(
    query: Json<SearchQuery>,
    state: &State<AppState>,
) -> Json<ApiResponse<SearchResponse>> {
    let indexer = state.indexer.read().await;

    match SearchEngine::search(&*indexer, &query) {
        Ok(response) => Json(ApiResponse {
            success: true,
            data: Some(response),
            error: None,
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            error: Some(e),
        }),
    }
}

#[get("/stats")]
async fn stats(state: &State<AppState>) -> Json<ApiResponse<IndexStats>> {
    let indexer = state.indexer.read().await;

    match indexer.count_documents() {
        Ok(count) => Json(ApiResponse {
            success: true,
            data: Some(IndexStats {
                total_documents: count,
                index_size_bytes: 0,
                last_updated: chrono::Utc::now(),
            }),
            error: None,
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Failed to get stats: {}", e)),
        }),
    }
}

#[options("/")]
fn search_options() -> Status {
    Status::Ok
}

#[options("/stats")]
fn stats_options() -> Status {
    Status::Ok
}

pub fn search_routes() -> Vec<Route> {
    routes![search, stats, search_options, stats_options]
}
