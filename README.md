# TaskFlow — Full-Stack Task Manager

> A production-grade task management platform with React, Express, PostgreSQL, Docker, Jenkins CI/CD, Kubernetes, and monitoring.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express.js-404D59?style=flat)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=flat&logo=jenkins&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white)

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  React/Vite  │     │  Express.js  │     │    15        │
│  Port 5173   │     │  Port 3001   │     │  Port 5432   │
└─────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │              ┌─────┴─────┐
       │              │ Socket.io │
       └──────────────┤ WebSocket │
                      └───────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Query, Framer Motion |
| Backend | Express.js, TypeScript, Sequelize ORM, Socket.io, Winston |
| Database | PostgreSQL 15 |
| Auth | JWT RS256, httpOnly cookies, refresh token rotation |
| Testing | Jest, Supertest, Playwright, k6 |
| DevOps | Docker, Docker Compose, Jenkins, SonarQube, Trivy, OWASP ZAP |
| Monitoring | Prometheus, Grafana, Sentry |
| Deployment | Kubernetes, Kustomize |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15 (or Docker)
- npm

### 1. Clone & Install
```bash
git clone <repo-url>
cd task-manager

# Backend
cd backend
npm install
npm run generate-keys  # Generate RSA keys for JWT

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database
```bash
# Option A: Local PostgreSQL
createdb taskmanager_db

# Option B: Docker
docker compose up postgres -d
```

### 3. Configure Environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL
```

### 4. Start Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173`

### Docker Development
```bash
docker compose up -d
```

### Docker Production
```bash
docker compose -f docker-compose.prod.yml up -d
```

## API Documentation

### Auth Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Task Endpoints (Authenticated)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/stats` | Get task statistics |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### WebSocket Events
- `task_created` — New task added
- `task_updated` — Task modified
- `task_deleted` — Task removed

## Testing

```bash
# Backend unit tests
cd backend && npm run test:unit

# Backend integration tests
cd backend && npm run test:integration

# All tests with coverage
cd backend && npm test
```

## Deployment

### Kubernetes
```bash
# Apply all manifests
kubectl apply -k kubernetes/

# Check status
kubectl get all -n task-manager
```

### Jenkins Pipeline
The `Jenkinsfile` defines a 14-stage pipeline:
1. Checkout → 2. Install → 3. Lint → 4. SonarQube → 5. Test → 6. Build Images → 7. Trivy Scan → 8. Push → 9. Deploy Staging → 10. Integration Tests → 11. OWASP ZAP → 12. k6 Load Test → 13. Rollback (on failure) → 14. Notify

## Monitoring

- **Prometheus**: `http://localhost:9090` — Metrics scraping
- **Grafana**: `http://localhost:3000` — Dashboards (admin/admin)
- **Backend Metrics**: `http://localhost:3001/metrics`

## Project Structure

```
project-root/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Express + TypeScript + Sequelize
├── docker/            # Dockerfiles + Nginx config
├── kubernetes/        # K8s manifests
├── monitoring/        # Prometheus + Grafana configs
├── jenkins/           # Jenkins config
├── docs/              # Documentation
├── docker-compose.yml # Dev environment
├── docker-compose.prod.yml # Production
└── Jenkinsfile        # CI/CD pipeline
```

## License

MIT
