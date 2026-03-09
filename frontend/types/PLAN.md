# Frontend — `types/` Plan

## Purpose
Shared TypeScript type definitions used across the app.

---

## Files

### `lms.ts` — UPDATE

**Current types**: `View`, `Course`, `TodoItem`, `FeedbackItem`, `AssignmentRow`, `KanbanTask`

**Tasks**:
- [ ] `AssignmentRow`: sync with backend — add `id`, `course_id`, `due_date` fields (currently missing from the type, but present in `lib/api/assignments.ts` interface — consolidate)
- [ ] `TodoItem`: change `courseId` → `course_id` OR keep both (align with backend snake_case response)
- [ ] Add `Module` and `ModuleItem` types (currently only in `lib/api/modules.ts` — centralize here)
- [ ] Add `AnalyticsBar`, `AnalyticsLine`, `AnalyticsData` types (currently only in `lib/api/analytics.ts`)
- [ ] Add `Thread` and `Reply` types (currently only in `lib/api/discussions.ts`)
- [ ] Add `UserOut` re-export or move to `types/auth.ts`

**Recommended final `lms.ts`**:
```ts
export type View = "dashboard" | "modules" | "submission" | "analytics" | "discussions" | "workspace"

export interface Course { id: string; title: string; subtitle: string; colorFrom: string; colorTo: string; instructor: string }
export interface ModuleItem { label: string; type: string; badge: string; is_assignment: boolean }
export interface Module { id: string; title: string; week: string; items: ModuleItem[] }
export interface AssignmentRow { id: string; name: string; course_id: string; score: number | null; max: number; status: "graded" | "submitted" | "missing"; due_date: string | null }
export interface TodoItem { id: string; title: string; due: string; course_id: string }
export interface FeedbackItem { id: string; title: string; grade: string; max: string }
export interface KanbanTask { id: string; title: string; tag: string; assignee: string }
export interface AnalyticsBar { name: string; you: number; avg: number }
export interface AnalyticsLine { week: string; score: number }
export interface AnalyticsData { bar_data: AnalyticsBar[]; line_data: AnalyticsLine[]; assignments: AssignmentRow[] }
export interface Thread { id: string; title: string; author: string; initials: string; timestamp: string; preview: string; replies: number; unread: boolean }
export interface Reply { id: string; author: string; initials: string; timestamp: string; body: string; is_op: boolean }
```

**Checklist**:
- [ ] Consolidate duplicate type definitions (currently split between `types/lms.ts` and `lib/api/*.ts`)
- [ ] Update imports in components to use centralized types
- [ ] Use `snake_case` for API-mapped fields, `camelCase` for UI-only fields
