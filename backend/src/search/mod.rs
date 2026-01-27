use crate::models::{SearchQuery, SearchResponse};
use crate::indexer::SearchIndexer;
use std::time::Instant;

pub struct SearchEngine;

impl SearchEngine {
    pub fn search(
        indexer: &SearchIndexer,
        query: &SearchQuery,
    ) -> Result<SearchResponse, String> {
        let start = Instant::now();

        let page = query.page.unwrap_or(1);
        let per_page = query.per_page.unwrap_or(10).min(100);
        let offset = (page - 1) * per_page;

        let results = indexer
            .search(&query.query, per_page, offset)
            .map_err(|e| format!("Search failed: {}", e))?;

        let total = indexer
            .count_documents()
            .map_err(|e| format!("Failed to count documents: {}", e))?;

        let query_time_ms = start.elapsed().as_millis();

        Ok(SearchResponse {
            results,
            total,
            page,
            per_page,
            query_time_ms,
        })
    }
}
