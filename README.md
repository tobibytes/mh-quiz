# mh-quiz

A daily-quiz platform built for [Morgan Hacks](https://morganhacks.com). One Express backend serves both a **public quiz frontend** that learners use to take the daily quiz, and an **admin frontend** for authoring quizzes, viewing the leaderboard, and inspecting audit logs.

```
quiz-frontend  ─┐
                 ├──▶  backend (Express + SQLite)
admin-frontend ─┘
```

## Repos in this monorepo

| Folder | Purpose |
| --- | --- |
| [`backend/`](./backend) | Express API. Routes split into `/api/quiz/*` (public) and `/api/admin/*` (JWT-gated). Persists to SQLite via `better-sqlite3`. Zod-validated request bodies, helmet, rate limiting, request logging. |
| [`quiz-frontend/`](./quiz-frontend) | Vite + React + TypeScript app for end users. Takes the daily quiz, submits answers, shows the result. shadcn/ui components, Tailwind, Playwright + Vitest tests. |
| [`admin-frontend/`](./admin-frontend) | Vite + React + TypeScript admin console. Quiz/question CRUD, leaderboard, metrics, audit log. Same UI kit. |

## API

**Public — `/api/quiz`** (rate-limited)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/today` | Fetch today's quiz |
| `GET` | `/attempt/:quizId` | Resume an in-flight attempt |
| `POST` | `/submit` | Submit answers, get a score |

**Admin — `/api/admin`** (JWT-gated, `loginRateLimit` on `/login`)

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/login` | Issue a JWT |
| `GET` | `/quizzes` · `/quizzes/:id` | List / inspect |
| `POST` · `DELETE` | `/quizzes` · `/quizzes/:id` | Create / remove |
| `POST` · `DELETE` | `/questions` · `/questions/:id` | Question CRUD |
| `GET` | `/metrics` · `/audit-logs` · `/leaderboard` | Admin telemetry |

Health checks at `/health` and `/health/ready`.

## Run it

Each folder has its own `package.json` and `README.md`:

```sh
# Backend (port 4000 by default)
cd backend
cp .env.example .env
npm install && npm run migrate && npm run dev

# Quiz frontend
cd quiz-frontend
npm install && npm run dev

# Admin frontend
cd admin-frontend
npm install && npm run dev
```

See [`CHANGES.md`](./CHANGES.md) for the security-review log (bug fixes, Zod-validation hardening, contract corrections between admin frontend and backend).

## Stack

**Backend** — Express 5 · TypeScript · `better-sqlite3` · `zod` · `jsonwebtoken` · `helmet` · `express-rate-limit` · `morgan`

**Frontends** — Vite · React · TypeScript · Tailwind · shadcn/ui · Radix · React Hook Form · TanStack Query · Vitest · Playwright

**Deploy** — Vite frontends shipped via Vercel (`vercel.json` in each)
