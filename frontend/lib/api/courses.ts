import { apiFetch } from "@/lib/api-client"
import type { Course } from "@/types/lms"

export async function fetchCourses(): Promise<Course[]> {
  return apiFetch<Course[]>("/api/courses")
}

export async function fetchCourse(courseId: string): Promise<Course> {
  return apiFetch<Course>(`/api/courses/${courseId}`)
}
