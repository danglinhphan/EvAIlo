import { apiFetch } from "@/lib/api-client"

export interface AnalyticsBar {
  name: string
  you: number
  avg: number
}

export interface AnalyticsLine {
  week: string
  score: number
}

export interface AnalyticsData {
  bar_data: AnalyticsBar[]
  line_data: AnalyticsLine[]
  assignments: Array<{
    id: string
    name: string
    course_id: string
    score: number | null
    max: number
    status: "graded" | "submitted" | "missing"
    due_date: string | null
  }>
}

export async function fetchAnalytics(courseId = "ifb220"): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>(`/api/analytics?course_id=${courseId}`)
}
