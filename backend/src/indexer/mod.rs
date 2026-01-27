use tantivy::{
    collector::TopDocs,
    query::QueryParser,
    schema::*,
    Index, IndexWriter, TantivyError,
    doc, TantivyDocument, DocAddress,
};
use std::path::Path;
use chrono::Utc;
use crate::models::{WebPage, SearchResult};

pub struct SearchIndexer {
    index: Index,
    writer: IndexWriter,
    schema: Schema,
    url_field: Field,
    title_field: Field,
    content_field: Field,
    description_field: Field,
    keywords_field: Field,
    crawled_at_field: Field,
}

impl SearchIndexer {
    pub fn new<P: AsRef<Path>>(index_path: P) -> Result<Self, TantivyError> {
        let mut schema_builder = Schema::builder();

        schema_builder.add_text_field("url", STRING | STORED);
        schema_builder.add_text_field("title", TEXT | STORED);
        schema_builder.add_text_field("content", TEXT);
        schema_builder.add_text_field("description", TEXT | STORED);
        schema_builder.add_text_field("keywords", TEXT | STORED);
        schema_builder.add_date_field("crawled_at", STORED);

        let schema = schema_builder.build();

        std::fs::create_dir_all(&index_path)?;

        // Try to open existing index, or create new one if it doesn't exist
        let index = match Index::open_in_dir(&index_path) {
            Ok(idx) => idx,
            Err(_) => Index::create_in_dir(&index_path, schema.clone())?,
        };

        // Get schema from the index (in case we opened an existing one)
        let index_schema = index.schema();

        // Get field handles from the schema
        let url_field = index_schema.get_field("url").expect("url field not found");
        let title_field = index_schema.get_field("title").expect("title field not found");
        let content_field = index_schema.get_field("content").expect("content field not found");
        let description_field = index_schema.get_field("description").expect("description field not found");
        let keywords_field = index_schema.get_field("keywords").expect("keywords field not found");
        let crawled_at_field = index_schema.get_field("crawled_at").expect("crawled_at field not found");

        let writer = index.writer(50_000_000)?;

        Ok(Self {
            index,
            writer,
            schema: index_schema,
            url_field,
            title_field,
            content_field,
            description_field,
            keywords_field,
            crawled_at_field,
        })
    }

    pub fn add_document(&mut self, page: &WebPage) -> Result<(), TantivyError> {
        let keywords_text = page.keywords.join(" ");

        let document = doc!(
            self.url_field => page.url.as_str(),
            self.title_field => page.title.as_str(),
            self.content_field => page.content.as_str(),
            self.description_field => page.description.as_deref().unwrap_or(""),
            self.keywords_field => keywords_text.as_str(),
            self.crawled_at_field => tantivy::DateTime::from_timestamp_secs(page.crawled_at.timestamp())
        );

        self.writer.add_document(document)?;
        log::debug!("Added document to index: {} - {}", page.url, page.title);
        Ok(())
    }

    pub fn commit(&mut self) -> Result<(), TantivyError> {
        println!("Committing index to disk...");
        self.writer.commit()?;
        println!("Index committed successfully");
        Ok(())
    }

    pub fn search(&self, query_str: &str, limit: usize, offset: usize) -> Result<Vec<SearchResult>, TantivyError> {
        let reader = self
            .index
            .reader()?;

        let searcher = reader.searcher();

        let query_parser = QueryParser::for_index(
            &self.index,
            vec![self.title_field, self.content_field, self.description_field, self.keywords_field],
        );

        let query = query_parser.parse_query(query_str)?;

        let top_docs = searcher.search(&query, &TopDocs::with_limit(limit + offset))?;

        let results: Vec<SearchResult> = top_docs
            .into_iter()
            .skip(offset)
            .filter_map(|(score, doc_address)| {
                let retrieved_doc: TantivyDocument = searcher.doc(doc_address).ok()?;

                let url = retrieved_doc
                    .get_first(self.url_field)?
                    .as_str()?
                    .to_string();

                let title = retrieved_doc
                    .get_first(self.title_field)?
                    .as_str()?
                    .to_string();

                let description = retrieved_doc
                    .get_first(self.description_field)
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();

                let crawled_at = retrieved_doc
                    .get_first(self.crawled_at_field)
                    .and_then(|v| v.as_datetime())
                    .map(|d| chrono::DateTime::from_timestamp(d.into_timestamp_secs(), 0))
                    .flatten()
                    .unwrap_or_else(|| Utc::now());

                Some(SearchResult {
                    title,
                    url,
                    snippet: description,
                    score,
                    last_crawled: crawled_at,
                })
            })
            .collect();

        Ok(results)
    }

    pub fn count_documents(&self) -> Result<usize, TantivyError> {
        let reader = self
            .index
            .reader()?;

        let searcher = reader.searcher();
        Ok(searcher.num_docs() as usize)
    }

    pub fn get_recent_documents(&self, limit: usize) -> Result<Vec<crate::models::SearchResult>, TantivyError> {
        let reader = self.index.reader()?;
        let searcher = reader.searcher();

        let mut results = Vec::new();
        let mut doc_count = 0;

        for (segment_ord, segment_reader) in searcher.segment_readers().iter().enumerate() {
            let max_doc = segment_reader.max_doc();

            for doc_id in 0..max_doc {
                if doc_count >= limit {
                    break;
                }

                let doc_address = DocAddress::new(segment_ord as u32, doc_id);

                if let Ok(doc) = searcher.doc::<TantivyDocument>(doc_address) {
                    let url = doc
                        .get_first(self.url_field)
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();

                    let title = doc
                        .get_first(self.title_field)
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();

                    let description = doc
                        .get_first(self.description_field)
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();

                    let crawled_at = doc
                        .get_first(self.crawled_at_field)
                        .and_then(|v| v.as_datetime())
                        .map(|d| chrono::DateTime::from_timestamp(d.into_timestamp_secs(), 0))
                        .flatten()
                        .unwrap_or_else(|| chrono::Utc::now());

                    results.push(crate::models::SearchResult {
                        title,
                        url,
                        snippet: description,
                        score: 0.0,
                        last_crawled: crawled_at,
                    });

                    doc_count += 1;
                }
            }

            if doc_count >= limit {
                break;
            }
        }

        Ok(results)
    }

    pub fn delete_all(&mut self) -> Result<(), TantivyError> {
        self.writer.delete_all_documents()?;
        self.writer.commit()?;
        Ok(())
    }
}
