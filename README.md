# Athiran Motors — Enterprise CRM

A production-grade Role-Based Dealer CRM and Tractor Sales & Service Management System.

## Tech Stack
- **Frontend:** React 19, Vite 8, Tailwind CSS, React Router 6, TanStack Query, React Hook Form, Zod, Lucide React, Recharts
- **Backend:** Node.js, Express 4, MongoDB, Mongoose 8, JWT + Argon2id, Socket.IO, Winston
- **Dev tools:** Concurrently, ESLint, Jest, Supertest

## Quick Start

```bash
# 1. Clone and install
npm run install:all

# 2. Configure environment
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit both .env files with your values

# 3. Seed the database
npm run seed

# 4. Start development servers
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

## Project Structure
```
athiran-motors-crm/
├── frontend/     React + Vite + Tailwind CRM UI
├── backend/      Node.js + Express + MongoDB API
├── docs/         Architecture, schema, API, security docs
└── scripts/      Dev and backup utilities
```

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [RBAC Permission Matrix](docs/RBAC_PERMISSION_MATRIX.md)
- [Security](docs/SECURITY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Project Status](docs/PROJECT_STATUS.md)

