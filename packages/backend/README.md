# Backend API

Node.js + Express + TypeScript backend for the Building Maintenance App.

## Tech Stack
- **Runtime:** Node.js 18+
- **Framework:** Express
- **Language:** TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** JWT + bcrypt
- **Validation:** Zod

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation
```bash
cd packages/backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

### Development
```bash
npm run dev
# Server runs on http://localhost:3001
```

### API Documentation
See `docs/api.md` for endpoint documentation.

## Project Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Database operations
│   ├── models/          # Data models
│   ├── middleware/      # Auth, validation, etc.
│   ├── utils/          # Helper functions
│   └── types/          # TypeScript interfaces
├── prisma/             # Database schema & migrations
├── tests/              # Unit & integration tests
└── docs/               # API documentation
```