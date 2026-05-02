# 🤖 PunPun AI Chatbot

A knowledge-based AI assistant built with **Next.js**, powered by vector search (Pinecone) and PostgreSQL. Designed to help trainees access and query curated knowledge bases intelligently.

---

## 🛠️ Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Framework   | Next.js (App Router)    |
| Language    | TypeScript              |
| Backend     | Next.js API Routes      |
| Database    | PostgreSQL + Prisma ORM |
| Vector DB   | Pinecone                |
| AI Model    | Gemini 2.5 Flash        |
| Styling     | Tailwind CSS            |
| Container   | Docker / Docker Compose |

---

## ✨ Features

- 💬 AI-powered queries using LLM (via `/api/aimodel`)
- 🗂️ Vector search with Pinecone for knowledge retrieval
- 🗃️ PostgreSQL database via Prisma ORM
- 🐳 Docker support for easy deployment
- 📋 Dashboard for managing queries and knowledge

---

## ✨ Features Done

- [x] Login + Protected Routes
- [x] Upload File (PDF, TXT)
- [x] Chat with AI (basic)
- [x] Chat with Uploaded File Context
- [x] Token Usage Counter

## 📁 Project Structure

```text

TRAINEE-KNOWLEDGE-ASSISTANT/
└── punpun/
    ├── app/
    │   ├── signup/             # Signup page
    │   ├── globals.css         # Global styles
    │   ├── layout.tsx          # Root layout
    │   └── page.tsx            # Home page
    ├── lib/                    # Utility functions / shared logic
    ├── node_modules/           # Dependencies (do not commit)
    ├── prisma/                 # Prisma schema & migrations
    ├── public/                 # Static assets
    ├── .env                    # Environment variables (do not commit)
    ├── .env.local              # Local environment overrides
    ├── .gitignore
    ├── docker-compose.yml      # Docker Compose config
    ├── dockerfile              # Dockerfile
    ├── eslint.config.mjs       # ESLint configuration
    ├── next-env.d.ts           # Next.js TypeScript declarations
    ├── next.config.ts          # Next.js configuration
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs      # PostCSS configuration
    ├── prisma.config.ts        # Prisma configuration
    ├── setup-db.ts             # Database setup script
    ├── test-prisma.ts          # Prisma connection test
    ├── tsconfig.json           # TypeScript configuration
    ├── AI_JOURNAL.md           # AI development journal
    ├── CLAUDE.md               # Claude-specific notes
    ├── DECISION.md             # Architecture decision records
    └── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Pinecone account
- Docker (optional)

### 1. Clone the repository

```bash
git clone https://github.com/Sugritta/trainee-knowledge-assistant.git
cd trainee-knowledge-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.local` and fill in your values:

```bash
cp .env.local .env
```

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:65484/punpun-db"

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name

# Auth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# AI Model
GOOGLE_API_KEY=your_gemini_api_key  
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma migrate dev
```

Or use the setup script:

```bash
npx ts-node setup-db.ts
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Running with Docker

```bash
docker-compose up --build
```

This will start both the Next.js app and the PostgreSQL database.

---

## 📡 API Endpoints

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | `/api/auth/...`      | Authentication (NextAuth)    |
| POST   | `/api/aimodel`       | Send query to AI             |
| POST   | `/api/pinecone`      | Query vector knowledge base  |
| GET    | `/api/user`          | Get user information         |

---

## 🧪 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npx ts-node setup-db.ts      # Initialize database
npx ts-node test-prisma.ts   # Test Prisma connection
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

PunPun AI Assistant - Sugritta Singharatho
