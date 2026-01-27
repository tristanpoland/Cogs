# Cogs Search Engine

A modern, full-stack search engine built with Rust and Next.js, featuring web crawling, full-text indexing, and a beautiful AMOLED dark interface.

## Features

### Backend (Rust + Rocket)
- **Web Crawler**: Distributed web crawler with politeness policies (respects robots.txt, crawl delays)
- **Full-Text Search**: Powered by Tantivy (Rust's equivalent to Apache Lucene)
- **Inverted Index**: Efficient document indexing and retrieval
- **REST API**: Complete API for search and administration
- **Scalable Architecture**: Built with async Rust using Tokio

### Frontend (Next.js + TypeScript + Tailwind)
- **AMOLED Dark Theme**: True black background with vibrant accent colors
- **Modern UI**: Sleek, responsive interface with smooth animations
- **Search Interface**: Google-like search experience with pagination
- **Admin Console**: Real-time crawler monitoring and index management
- **TypeScript**: Fully typed for better developer experience

## Tech Stack

### Backend
- **Rocket** - Web framework
- **Tantivy** - Full-text search engine
- **Tokio** - Async runtime
- **Reqwest** - HTTP client for crawling
- **Scraper** - HTML parsing
- **SQLx** - Database access
- **RobotsTxt** - robots.txt parsing

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **React Hooks** - State management

## Project Structure

```
Cogs/
├── backend/              # Rust backend
│   ├── src/
│   │   ├── main.rs      # Application entry point
│   │   ├── api/         # Search API routes
│   │   ├── admin/       # Admin API routes
│   │   ├── crawler/     # Web crawler implementation
│   │   ├── indexer/     # Tantivy search indexer
│   │   ├── search/      # Search query handler
│   │   └── models/      # Data structures
│   ├── Cargo.toml       # Rust dependencies
│   └── Rocket.toml      # Rocket configuration
│
└── frontend/            # Next.js frontend
    ├── app/
    │   ├── page.tsx     # Main search interface
    │   ├── admin/       # Admin console
    │   └── globals.css  # AMOLED theme
    ├── lib/
    │   └── api.ts       # API client
    └── package.json     # Node dependencies
```

## Getting Started

### Prerequisites
- Rust 1.70+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build and run the Rust backend:
```bash
cargo run
```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

### Search Interface
1. Open `http://localhost:3000` in your browser
2. Enter a search query and press Enter or click Search
3. Browse results with pagination

### Admin Console
1. Navigate to `http://localhost:3000/admin`
2. Monitor crawler status and index statistics
3. Start a new crawl by entering seed URLs
4. Manage the search index

## API Endpoints

### Search API
- `POST /api/search` - Perform a search query
- `GET /api/search/stats` - Get index statistics

### Admin API
- `POST /api/admin/crawl` - Start a new crawl
- `GET /api/admin/crawl/status` - Get crawler status
- `POST /api/admin/crawl/stop` - Stop the crawler
- `GET /api/admin/index/stats` - Get index statistics
- `DELETE /api/admin/index` - Clear the index

## Configuration

### Backend (Rocket.toml)
- `address` - Server address
- `port` - Server port (default: 8000)
- `workers` - Number of worker threads

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## AMOLED Theme

The interface features a true AMOLED dark theme optimized for OLED displays:
- **Background**: Pure black (#000000)
- **Primary**: Cyan (#00D9FF)
- **Secondary**: Magenta (#FF00D6)
- **Accent**: Purple (#7B61FF)
- **Surfaces**: Dark grays (#0A0A0A, #141414)

## Development

### Backend Development
```bash
cd backend
cargo watch -x run  # Auto-reload on changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### Building for Production

Backend:
```bash
cd backend
cargo build --release
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with ❤️ using Rust and Next.js
- Search powered by Tantivy
- UI inspired by modern search engines
