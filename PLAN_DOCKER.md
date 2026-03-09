# Docker Preparation Plan

## Target: Phase 4 (after real data integration complete)

## Overview
`docker-compose.yml` at the project root will orchestrate 3 services:
1. **`db`** — MariaDB 11
2. **`backend`** — FastAPI via uvicorn
3. **`frontend`** — Next.js (dynamic mode)

---

## File Structure for Docker Phase
```
/
├── docker-compose.yml          ← Service orchestration
├── docker-compose.override.yml ← Dev overrides (hot reload)
├── .env                        ← Shared secrets (gitignored)
├── frontend/
│   ├── Dockerfile              ← Multi-stage Next.js build
│   └── .env.production         ← NEXT_PUBLIC_API_URL for prod
└── backend/
    ├── Dockerfile              ← Python FastAPI image
    └── .env                    ← DB + JWT config
```

---

## `docker-compose.yml` (Draft)
```yaml
version: "3.9"
services:
  db:
    image: mariadb:11
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    environment:
      DB_HOST: db
    command: uvicorn main:app --host 0.0.0.0 --port 8000

  frontend:
    build: ./frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000

volumes:
  mariadb_data:
```

---

## Static vs Dynamic Consideration

### Dynamic (Default — Recommended)
- Full Next.js App Router with SSR, ISR support
- Auth flow (redirects) works server-side
- Suitable for: personal LMS, internal tools
- Deploy: Docker container, Coolify, Railway, Fly.io

### Static Export (`next export`)
- All pages pre-rendered to HTML at build time
- No SSR — all data fetched client-side
- Limitations: no `headers()`, no `cookies()`, no server actions
- Suitable for: read-mostly, CDN deployment (Cloudflare Pages, Netlify)
- Set in `next.config.mjs`: `output: 'export'`

**Decision for now**: Stay with **dynamic** (no config change needed). Revisit static option when evaluating CDN deployment.

---

## Backend Dockerfile (Draft)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Frontend Dockerfile (Draft — Multi-stage)
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Checklist (Phase 4)
- [ ] Create `backend/Dockerfile`
- [ ] Create `frontend/Dockerfile` (multi-stage)
- [ ] Create `docker-compose.yml` at root
- [ ] Create `.env` template (`.env.example`) at root
- [ ] Update `backend/.env` to use `DB_HOST=db` when running in Docker
- [ ] Update `next.config.mjs` for standalone output: `output: 'standalone'`
- [ ] Test full stack: `docker compose up --build`
- [ ] Add `alembic upgrade head` to backend startup command
- [ ] Seed script on first boot (check if DB is empty)
