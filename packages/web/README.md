# Web Dashboard

React + TypeScript web dashboard for building managers and administrators.

## Tech Stack
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI Library:** Material‑UI (MUI)
- **State Management:** Redux Toolkit
- **Routing:** React Router
- **HTTP Client:** React Query (TanStack Query)

## Getting Started

### Prerequisites
- Node.js 18+

### Installation
```bash
cd packages/web
npm install
cp .env.example .env
```

### Development
```bash
npm run dev
# App runs on http://localhost:3000
```

### Build for Production
```bash
npm run build
npm run preview
```

## Project Structure
```
web/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── store/         # Redux store & slices
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API service calls
│   ├── utils/         # Helper functions
│   ├── types/         # TypeScript interfaces
│   └── assets/        # Images, fonts, etc.
├── public/            # Static assets
└── tests/             # Component tests
```