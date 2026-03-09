# Frontend — Plan

## Stack
- **Framework**: Next.js 16 (App Router)
- **React**: 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Charts**: Recharts
- **State**: Local React state (useState/useEffect) — no global state library needed yet
- **API**: Custom `apiFetch` wrapper in `lib/api-client.ts`

---

## Current State
Several LMS view components contain **hardcoded mock data** directly in the component files.  
Goal: Replace all hardcoded data with real API calls to the FastAPI backend.

---

## Target Structure (Post-Migration)
```
frontend/
├── app/
│   ├── layout.tsx          ← Root layout (no changes needed)
│   ├── globals.css         ← Global styles (no changes needed)
│   ├── page.tsx            ← Main LMS page (auth guard + view router)
│   └── login/
│       └── page.tsx        ← Login/register page (already uses real API)
├── components/
│   ├── theme-provider.tsx  ← (no changes needed)
│   └── lms/
│       ├── dashboard-view.tsx   ← MODIFY: fetch courses/todos/feedback from API
│       ├── modules-view.tsx     ← MODIFY: fetch modules from API (mock OK)
│       ├── assignment-view.tsx  ← REVIEW: submission form
│       ├── analytics-view.tsx   ← MODIFY: fetch real analytics data from API
│       ├── discussions-view.tsx ← MODIFY: fetch threads/replies from API
│       ├── workspace-view.tsx   ← REVIEW: Kanban (keep mock or move to API)
│       ├── course-card.tsx      ← (no changes needed)
│       ├── left-sidebar.tsx     ← (no changes needed)
│       ├── right-sidebar.tsx    ← MODIFY: accept props from DashboardView
│       └── top-header.tsx       ← MINOR: show real user name from auth
├── hooks/
│   └── use-mobile.ts       ← (no changes needed)
├── lib/
│   ├── api-client.ts       ← (no changes needed)
│   └── api/
│       ├── auth.ts         ← DONE: real API
│       ├── courses.ts      ← DONE: real API
│       ├── assignments.ts  ← DONE: real API
│       ├── analytics.ts    ← DONE: real API
│       └── discussions.ts  ← DONE: real API
├── types/
│   └── lms.ts             ← MINOR: add missing types
└── styles/
    └── globals.css        ← (no changes needed)
```

---

## File-by-File Tasks

### `app/page.tsx`
**Current**: Auth guard + view routing. Hardcoded `COURSE_TITLES` map.  
**Tasks**:
- [ ] After auth, fetch real `UserOut` profile from `GET /api/auth/me` (add endpoint to backend)
- [ ] Pass real `user` object (name, email, role, avatar) to `TopHeader`
- [ ] Remove hardcoded `COURSE_TITLES` map (title comes from course data)
- [ ] Pass `selectedCourse` object (not just ID) to views that need course title

### `app/login/page.tsx`
**Current**: Already uses real `apiLogin` / `apiRegister`. ✅  
**Tasks**:
- [ ] Add loading state to button (already has `loading` state but no visual indicator on button)
- [ ] Clear error on mode switch

### `components/lms/dashboard-view.tsx`
**Current**: Hardcoded `COURSES`, `TODO_ITEMS`, `FEEDBACK_ITEMS` arrays.  
**Tasks**:
- [ ] Replace `COURSES` with `fetchCourses()` call (from `lib/api/courses.ts`)
- [ ] Replace `TODO_ITEMS` with `fetchAssignments()` filtered to `status === 'missing'`
- [ ] Replace `FEEDBACK_ITEMS` with `fetchAssignments()` filtered to `status === 'graded'`
- [ ] Add loading skeleton while fetching
- [ ] Add error state

### `components/lms/modules-view.tsx`
**Current**: Hardcoded `MODULES` array (content data).  
**Decision**: Modules content stays mock data — fetch from backend API which returns mock.  
**Tasks**:
- [ ] Fetch modules from `GET /api/modules?courseId={id}` (already works, returns mock)
- [ ] Remove local `MODULES` constant
- [ ] Add loading state

### `components/lms/analytics-view.tsx`
**Current**: Hardcoded `barData`, `lineData`, `assignments` arrays.  
**Tasks**:
- [ ] Fetch from `fetchAnalytics(selectedCourse)` (from `lib/api/analytics.ts`)
- [ ] Accept `courseId` as prop from `app/page.tsx`
- [ ] Compute `average` from API response (not local array)
- [ ] Add loading skeleton for charts

### `components/lms/discussions-view.tsx`
**Current**: Hardcoded `THREADS`, `ACTIVE_REPLIES` arrays.  
**Tasks**:
- [ ] Fetch threads from `fetchThreads()` on mount
- [ ] Fetch replies from `fetchReplies(threadId)` when thread is selected
- [ ] Submit new reply via `postReply(threadId, body)`
- [ ] Optimistically update reply list on post
- [ ] Show relative timestamps

### `components/lms/assignment-view.tsx`
**Current**: Submission form UI.  
**Tasks**:
- [ ] Review current implementation
- [ ] Wire submit button to `POST /api/assignments/{id}/submit`
- [ ] Show confirmation after submission

### `components/lms/workspace-view.tsx`
**Current**: Hardcoded Kanban board with tasks.  
**Decision**: Workspace/Kanban can stay mock for now (project management feature, lower priority).  
**Tasks**:
- [ ] Keep hardcoded data for now
- [ ] Mark as future: `POST /api/workspace/tasks` endpoint

### `components/lms/right-sidebar.tsx`
**Current**: Receives `todoItems` + `feedbackItems` as props.  
**Tasks**:
- [ ] No interface change needed
- [ ] Props are already typed — parent (`DashboardView`) will provide real data

### `components/lms/top-header.tsx`
**Current**: Accepts `user` prop (already typed as `UserOut | null`).  
**Tasks**:
- [ ] Ensure user avatar shows initials fallback when `avatar === null` ✅
- [ ] No major changes needed

---

## New API Endpoints Needed in Backend
| Endpoint | Purpose |
|----------|---------|
| `GET /api/auth/me` | Return full `UserOut` for logged-in user |
| `POST /api/assignments/{id}/submit` | Mark assignment as submitted |
| `POST /api/discussions` | Create new discussion thread |

---

## Loading States (UX)
All data-fetching components should show a skeleton loader:
- Course cards → skeleton cards (same grid layout)
- Analytics charts → pulsing placeholder boxes
- Assignment table → skeleton rows
- Discussions list → skeleton list items

Use `Skeleton` component from `components/ui/skeleton.tsx` (already exists).

---

## Error Handling Pattern
```tsx
const [data, setData] = useState<T | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  fetchSomething()
    .then(setData)
    .catch(e => setError(e.message))
    .finally(() => setLoading(false))
}, [])
```

---

## Sub-Plans
- [`components/lms/PLAN.md`](components/lms/PLAN.md)
- [`lib/PLAN.md`](lib/PLAN.md)
- [`types/PLAN.md`](types/PLAN.md)
