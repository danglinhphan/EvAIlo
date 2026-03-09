export type View = "dashboard" | "modules" | "submission" | "analytics" | "discussions" | "workspace"

export interface Course {
  id: string
  title: string
  subtitle: string
  colorFrom: string
  colorTo: string
  instructor: string
}

export interface TodoItem {
  id: string
  title: string
  due: string
  courseId: string
}

export interface FeedbackItem {
  id: string
  title: string
  grade: string
  max: string
}

export interface AssignmentRow {
  name: string
  score: number
  max: number
  status: "graded" | "submitted" | "missing"
}

export interface KanbanTask {
  id: string
  title: string
  tag: string
  assignee: string
}
