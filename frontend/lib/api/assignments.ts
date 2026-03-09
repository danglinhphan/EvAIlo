import { apiFetch } from "@/lib/api-client"

export interface AssignmentRow {
  id: string
  name: string
  course_id: string
  score: number | null
  max: number
  status: "graded" | "submitted" | "missing"
  due_date: string | null
}

export async function fetchAssignments(courseId?: string): Promise<AssignmentRow[]> {
  const query = courseId ? `?course_id=${courseId}` : ""
  return apiFetch<AssignmentRow[]>(`/api/assignments${query}`)
}

export async function submitAssignment(id: string): Promise<AssignmentRow> {
  return apiFetch<AssignmentRow>(`/api/assignments/${id}/submit`, { method: "POST" })
}
