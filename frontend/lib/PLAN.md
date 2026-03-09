# Frontend — `lib/` Plan

## Purpose
API client utilities and per-domain API functions.

---

## Files

### `api-client.ts` — NO CHANGE ✅
Generic `apiFetch<T>` wrapper. Handles auth headers, JSON, errors.  
Works correctly as-is.

---

### `api/auth.ts` — MINOR UPDATE
**Current**: Complete. Handles login, register, logout, token storage.

**Tasks**:
- [ ] Add `fetchMe()` function to get current user profile:
  ```ts
  export async function fetchMe(): Promise<UserOut> {
    return apiFetch<UserOut>("/api/auth/me")
  }
  ```
  (Requires `GET /api/auth/me` endpoint on backend)

---

### `api/courses.ts` — NO CHANGE ✅
`fetchCourses()` and `fetchCourse(id)` — works correctly.

---

### `api/assignments.ts` — MINOR UPDATE
**Tasks**:
- [ ] Add `submitAssignment(id: string)` function:
  ```ts
  export async function submitAssignment(id: string): Promise<AssignmentRow> {
    return apiFetch<AssignmentRow>(`/api/assignments/${id}/submit`, { method: "POST" })
  }
  ```

---

### `api/analytics.ts` — NO CHANGE ✅
`fetchAnalytics(courseId)` — works correctly once backend returns real data.

---

### `api/discussions.ts` — MINOR UPDATE
**Tasks**:
- [ ] Add `createThread(courseId: string, title: string)` function:
  ```ts
  export async function createThread(courseId: string, title: string): Promise<Thread> {
    return apiFetch<Thread>("/api/discussions", {
      method: "POST",
      body: { course_id: courseId, title },
    })
  }
  ```

---

### `api/modules.ts` — NEW FILE ⚡
**Tasks**:
- [ ] Create file
- [ ] Define `Module` and `ModuleItem` interfaces
- [ ] Implement `fetchModules(courseId: string): Promise<Module[]>`

---

### `utils.ts` — NO CHANGE ✅
Contains `cn()` (clsx + twMerge). No changes needed.

---

## Notes
- All API functions use `apiFetch` which automatically attaches Bearer token
- Error handling is done in `apiFetch` — callers get thrown `Error` with `detail` message
- No caching layer needed in Phase 1 (add React Query / SWR in Phase 3 if needed)
