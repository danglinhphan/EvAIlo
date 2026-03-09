# Frontend — `components/lms/` Plan

## Overview
LMS view components. Several contain hardcoded mock data that must be replaced with real API calls.

---

## Component Files

### `course-card.tsx` — NO CHANGE
Presentational component. Accepts `course: Course` prop and renders gradient card.  
No data fetching.

---

### `left-sidebar.tsx` — NO CHANGE
Navigation sidebar with icon links. Accepts `currentView` + `onNavigate` props.  
No data fetching.

---

### `top-header.tsx` — MINOR
**Current**: Accepts `user: UserOut | null` prop.  
**Tasks**:
- [ ] Verify user name/email displays correctly from real API user
- [ ] Avatar: show initials when `user.avatar === null`

---

### `right-sidebar.tsx` — NO CHANGE
Presentational. Accepts `todoItems`, `feedbackItems`, `onTodoClick` props.  
Data will be provided by `dashboard-view.tsx`.

---

### `dashboard-view.tsx` — MODIFY ⚡
**Current issues**: All data is hardcoded local constants.

**Migration checklist**:
- [ ] Import `fetchCourses` from `lib/api/courses.ts`
- [ ] Import `fetchAssignments` from `lib/api/assignments.ts`
- [ ] Add `useState` + `useEffect` to fetch courses on mount
- [ ] Add `useState` + `useEffect` to fetch assignments on mount
- [ ] Derive `todoItems` from assignments with `status === 'missing'`
  ```ts
  const todoItems = assignments
    .filter(a => a.status === 'missing')
    .map(a => ({ id: a.id, title: a.name, due: a.due_date ?? 'No due date', courseId: a.course_id }))
  ```
- [ ] Derive `feedbackItems` from assignments with `status === 'graded'`
  ```ts
  const feedbackItems = assignments
    .filter(a => a.status === 'graded' && a.score !== null)
    .slice(-3)  // last 3 graded
    .map(a => ({ id: a.id, title: a.name, grade: String(a.score), max: String(a.max) }))
  ```
- [ ] Show skeleton loading state for course grid
- [ ] Show skeleton loading state for sidebar items

---

### `modules-view.tsx` — MODIFY ⚡
**Current issues**: Hardcoded `MODULES` array (for `ifb220` only, doesn't respond to course selection).

**Migration checklist**:
- [ ] Import fetch utility for modules (need `lib/api/modules.ts` — add this file)
- [ ] Fetch from `GET /api/modules?courseId={courseId}` on mount + when `courseId` changes
- [ ] Remove local `MODULES` hardcoded constant
- [ ] Map API response to local UI shape (icon mapping by `type` field)
- [ ] Show loading skeleton (accordion skeleton rows)

**New file needed**: `frontend/lib/api/modules.ts`
```ts
import { apiFetch } from "@/lib/api-client"
export interface ModuleItem { label: string; type: string; badge: string; is_assignment: boolean }
export interface Module { id: string; title: string; week: string; items: ModuleItem[] }
export async function fetchModules(courseId: string): Promise<Module[]> {
  return apiFetch<Module[]>(`/api/modules?courseId=${courseId}`)
}
```

---

### `analytics-view.tsx` — MODIFY ⚡
**Current issues**: All data hardcoded locally. Doesn't respond to course selection.

**Migration checklist**:
- [ ] Accept `courseId: string` as prop (passed from `app/page.tsx`)
- [ ] Import `fetchAnalytics` from `lib/api/analytics.ts`
- [ ] Replace local `barData`, `lineData`, `assignments` with API response state
- [ ] Refetch when `courseId` changes
- [ ] Show loading placeholders for charts (pulsing div same size as chart)
- [ ] Compute `average` from API `assignments` array dynamically

---

### `discussions-view.tsx` — MODIFY ⚡
**Current issues**: Hardcoded threads and replies. New replies only exist in memory.

**Migration checklist**:
- [ ] Import `fetchThreads`, `fetchReplies`, `postReply` from `lib/api/discussions.ts`
- [ ] Replace `THREADS` constant with state fetched on mount
- [ ] On thread click: fetch replies from `fetchReplies(threadId)`
- [ ] On reply submit: call `postReply(threadId, body)`, append result to local replies
- [ ] Show loading states for thread list + reply list
- [ ] Clear reply input after submit

---

### `assignment-view.tsx` — REVIEW
**Tasks**:
- [ ] Read current file to understand what it renders
- [ ] Wire submit action to `POST /api/assignments/{id}/submit` when implementing submission
- [ ] Show success toast (use `sonner` already in deps) after submit

---

### `workspace-view.tsx` — KEEP MOCK (for now)
Kanban board for project tasks. Not tied to DB in Phase 1.

**Future tasks** (Phase 3+):
- [ ] Create `workspace_tasks` DB table
- [ ] Add `POST /api/workspace/tasks` endpoint
- [ ] Implement drag-and-drop status changes
