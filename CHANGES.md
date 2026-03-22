# MH Quiz – Code Review: Changes Made

This document summarises every bug fix and security improvement applied during the review of the backend, admin frontend, and quiz frontend.

---

## 1. Critical Bug Fixes

### 1.1 Admin Frontend – Wrong API Endpoint Paths (`admin-frontend/src/lib/admin-api.ts`)

**Problem:** The admin frontend was calling incorrect URL paths for several operations, causing all of those requests to return 404 Not Found.

| Function | Old path (wrong) | Correct path |
|---|---|---|
| `getQuiz` | `/quiz/:id` | `/quizzes/:id` |
| `createQuiz` | `/quiz` | `/quizzes` |
| `createQuestion` | `/question` | `/questions` |
| `updateQuestion` | `/question/:id` | `/questions/:id` |
| `deleteQuestion` | `/question/:id` | `/questions/:id` |

**Fix:** Updated all five paths to match the backend router definitions in `admin.routes.ts`.

---

### 1.2 Admin Frontend – Wrong `responseType` Enum Value (`admin-frontend/src/lib/admin-api.ts`, `QuestionForm.tsx`)

**Problem:** The admin panel used the string `"typed"` for short-answer questions, but the backend validates against `"short_answer"` (defined in `constants.ts`). This caused a Zod validation error whenever a short-answer question was created or updated.

**Fix:**
- Updated `QuestionFormData.responseType` from `"multiple_choice" | "typed"` to `"multiple_choice" | "short_answer"`.
- Updated `Question.responseType` interface to use `"short_answer"`.
- Changed the `<SelectItem value="typed">` to `<SelectItem value="short_answer">` (display text unchanged: "Typed Answer").
- Updated `toResponseType` helper and the `useEffect` reset guard accordingly.

---

### 1.3 Admin Frontend – `Question.options` Type Mismatch (`admin-frontend/src/lib/admin-api.ts`, `QuestionForm.tsx`)

**Problem:** The `Question` interface declared `options: string[]`, but the backend returns `options: Array<{ id: string; label: string; position: number }>`. This caused:
- The edit form to display `[object Object]` in option fields instead of the label text.
- API requests to send `["Option A", "Option B"]` instead of `[{ label: "Option A" }, { label: "Option B" }]`, which failed Zod validation.

**Fix:**
- Added `QuizOption` interface (`{ id: string; label: string }`) and changed `Question.options` to `QuizOption[]`.
- `createQuestion` and `updateQuestion` API calls now convert `string[]` → `Array<{ label }>` before sending.
- `QuestionForm` initialization now maps `initial.options.map(o => o.label)` to populate the string-based form state.

---

### 1.4 Quiz Frontend – API Response Format Mismatch (`quiz-frontend/src/lib/api.ts`)

**Problem:** The backend `GET /api/quiz/today` returns `{ quiz: { id, date, type, title } | null, questions: [...], hasAttempted: bool }`, but the frontend expected `{ quizId: string | null, questions?: Question[], hasAttempted?: boolean }`. This meant `data.quizId` was always `undefined`, so the quiz appeared unavailable even when one was scheduled.

**Fix:** `fetchTodayQuiz` now transforms the backend response:
```ts
return {
  quizId: data.quiz?.id ?? null,
  questions: data.questions ?? [],
  hasAttempted: Boolean(data.hasAttempted),
};
```

---

### 1.5 Quiz Frontend – Answer Submission Format Mismatch (`quiz-frontend/src/lib/api.ts`)

**Problem:** `submitQuiz` sent answers as `{ quizId, answers: Record<string, string> }`, but the backend `submitQuizSchema` requires `answers: Array<{ questionId: string; userAnswer?: string }>`. This caused a Zod validation error on every quiz submission.

**Fix:** `submitQuiz` now converts the answers map to an array before sending, and transforms the backend response (`answers[].isCorrect` → `results[].correct`) to match the frontend's `SubmitResponse` interface.

---

### 1.6 Quiz Frontend – Wrong `Question` Field Names (`quiz-frontend/src/lib/api.ts`, `QuestionCard.tsx`, `ResultsScreen.tsx`, `pages/Index.tsx`)

**Problem:** The frontend `Question` type used `type: "mcq" | "short_answer"` and `question: string`, but the backend returns `responseType: "multiple_choice" | "short_answer"` and `prompt: string`. Components referencing `question.type === "mcq"` and `question.question` therefore never matched/rendered correctly.

**Fix:**
- Updated `Question` interface: `question → prompt`, `type → responseType`, `options?: string[] → options: QuizOption[]`.
- `QuestionCard.tsx`: renders `question.prompt`, checks `question.responseType === "multiple_choice"`, passes `question.options.map(o => o.label)` to `MCQOptions`.
- `ResultsScreen.tsx`: renders `q?.prompt`.
- Mock data in `Index.tsx` updated to use the new field names and option shape.

---

## 2. Security Improvements

### 2.1 JWT Secret – Minimum Length Enforced (`backend/src/config/env.ts`)

**Problem:** `JWT_SECRET` only required `min(1)`, making one-character secrets valid. The default fallback was `"dev-only-secret"` (16 characters), which is weak and could trivially be brute-forced.

**Fix:** Changed validation to `min(32)` with a descriptive error message. Updated the default fallback to a 40-character string (still clearly labelled for development only). In production, `JWT_SECRET` must be set to a strong random value (≥ 32 characters).

---

### 2.2 Rate Limiting Added to Quiz GET Endpoints (`backend/src/modules/quiz/quiz.routes.ts`)

**Problem:** The `GET /api/quiz/today` and `GET /api/quiz/attempt/:quizId` endpoints had no per-route rate limiting (only the global 120 req/min limit applied). The submit endpoint already had a dedicated `submitRateLimit`. Without targeted limits, these read endpoints were more susceptible to enumeration and scraping.

**Fix:** Both GET endpoints now explicitly use `generalRateLimit` (120 requests per minute per IP). This makes the rate-limiting intent explicit and ensures future changes to global middleware don't accidentally remove the protection.

---

### 2.3 API Base URL – `process.env` → `import.meta.env` (`quiz-frontend/src/lib/api.ts`, `admin-frontend/src/lib/admin-api.ts`)

**Problem:** Both frontends read `process.env.API_BASE`. In a browser bundle built by Vite, `process.env` is not available (it is a Node.js concept). The variable was always `undefined`, causing every API call to hit `undefined/quiz/today` etc., which silently fell back to the demo mock data on error.

**Fix:** Changed to `import.meta.env.VITE_API_BASE` with a sensible default (`"/api/quiz"` and `"/api/admin"` respectively). The `VITE_` prefix is required by Vite to expose environment variables to the client bundle.

---

### 2.4 Question Count Added to Quiz List (`backend/src/modules/admin/admin.repo.ts`)

**Problem:** `listQuizzes()` returned quiz metadata without a question count, so the admin list page always showed "0 questions" for every quiz.

**Fix:** Added a `LEFT JOIN` with a `COUNT` aggregate so each quiz row now includes `questionCount`. The admin list page already displayed this field conditionally (`q.questionCount ?? 0`), so no frontend change was needed.

---

## 3. Remaining Known Issues (Not Fixed – Out of Scope)

| Issue | Notes |
|---|---|
| **Plaintext password comparison** | The `ADMIN_PASSWORD` env var is compared as a plain string. Migrating to bcrypt requires a one-time hash generation step and a schema/config change. Recommended for production. |
| **JWT stored in `localStorage`** | Susceptible to XSS theft. Migrating to `httpOnly` cookies requires CSRF protection and backend session changes. |
| **User ID spoofable via `x-user-id` header** | Any client can set an arbitrary ID. A proper auth system or signed tokens would address this. |
| **CSRF protection absent** | No CSRF tokens on state-changing admin endpoints. Partially mitigated by `Authorization: Bearer` header requirement. |
| **No pagination on quiz/question lists** | Performance will degrade at scale. |

---

## Summary of Files Changed

| File | Change |
|---|---|
| `backend/src/config/env.ts` | JWT_SECRET minimum length 1 → 32 |
| `backend/src/modules/admin/admin.repo.ts` | `listQuizzes` returns `questionCount` via LEFT JOIN |
| `backend/src/modules/quiz/quiz.routes.ts` | Rate limiting added to GET `/today` and GET `/attempt/:quizId` |
| `admin-frontend/src/lib/admin-api.ts` | Fixed endpoint paths, `responseType` enum, `options` type, API_BASE env var |
| `admin-frontend/src/components/admin/QuestionForm.tsx` | Fixed `responseType` enum values and options initialization from Question |
| `quiz-frontend/src/lib/api.ts` | Fixed `Question` interface, response transformation, submission format, API_BASE env var |
| `quiz-frontend/src/components/QuestionCard.tsx` | Uses `question.prompt` and `question.responseType` |
| `quiz-frontend/src/components/ResultsScreen.tsx` | Uses `q?.prompt` |
| `quiz-frontend/src/pages/Index.tsx` | Updated mock data shape and API response access |
