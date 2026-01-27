#[macro_use]
extern crate rocket;

mod models;
mod crawler;
mod indexer;
mod search;
mod api;
mod admin;

use rocket::{Build, Rocket};
use rocket::serde::json::Json;
use rocket_cors::{AllowedOrigins, CorsOptions};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::indexer::SearchIndexer;
use crate::crawler::WebCrawler;
use crate::models::*;

pub struct AppState {
    pub indexer: Arc<RwLock<SearchIndexer>>,
    pub crawler: Arc<RwLock<WebCrawler>>,
}

#[get("/")]
fn index() -> Json<ApiResponse<String>> {
    Json(ApiResponse {
        success: true,
        data: Some("Search Engine API v1.0".to_string()),
        error: None,
    })
}

#[get("/health")]
fn health() -> Json<ApiResponse<HealthStatus>> {
    Json(ApiResponse {
        success: true,
        data: Some(HealthStatus {
            status: "healthy".to_string(),
            timestamp: chrono::Utc::now(),
        }),
        error: None,
    })
}

fn configure_cors() -> rocket_cors::Cors {
    use rocket_cors::AllowedHeaders;

    CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![
                rocket::http::Method::Get,
                rocket::http::Method::Post,
                rocket::http::Method::Put,
                rocket::http::Method::Delete,
                rocket::http::Method::Options,
            ]
            .into_iter()
            .map(From::from)
            .collect(),
        )
        .allowed_headers(AllowedHeaders::all())
        .allow_credentials(true)
        .to_cors()
        .expect("CORS configuration failed")
}

#[launch]
async fn rocket() -> Rocket<Build> {
    env_logger::init();

    let indexer = Arc::new(RwLock::new(
        SearchIndexer::new("./data/index").expect("Failed to create indexer")
    ));

    let crawler = Arc::new(RwLock::new(
        WebCrawler::new(indexer.clone())
    ));

    // Load previous crawl state if it exists
    {
        let crawler_lock = crawler.read().await;
        if let Err(e) = crawler_lock.load_state().await {
            println!("Failed to load crawl state: {}", e);
        } else {
            println!("Loaded previous crawl state");
        }
    }

    //// Start the background crawler
    //println!("Starting background crawler");
    //WebCrawler::start_background_crawler(crawler.clone());

    let state = AppState {
        indexer: indexer.clone(),
        crawler: crawler.clone(),
    };

    rocket::build()
        .mount("/", routes![index, health])
        .mount("/api/search", api::search_routes())
        .mount("/api/admin", admin::admin_routes())
        .manage(state)
        .attach(configure_cors())
}
