"use client"

import { CourseCard } from "@/components/lms/course-card"
import { RightSidebar } from "@/components/lms/right-sidebar"
import type { Course } from "@/types/lms"

const COURSES: Course[] = [
  {
    id: "ifb220",
    title: "IFB220: Data Technologies",
    subtitle: "Semester 1, 2026",
    instructor: "Dr. Sam Willis",
    colorFrom: "#2563EB",
    colorTo: "#4F46E5",
  },
  {
    id: "iab230",
    title: "IAB230: Enterprise Architecture",
    subtitle: "Semester 1, 2026",
    instructor: "Prof. Linda Ho",
    colorFrom: "#0891B2",
    colorTo: "#0369A1",
  },
  {
    id: "capstone",
    title: "Research: XAI & MIMIC-III",
    subtitle: "Project Unit",
    instructor: "Dr. Sam Willis",
    colorFrom: "#059669",
    colorTo: "#0D9488",
  },
]

const TODO_ITEMS = [
  { id: "t1", title: "Submit K-GRS Algorithm Draft", due: "Due in 2 days", courseId: "ifb220" },
  { id: "t2", title: "DTA Frontend Setup", due: "Due tomorrow", courseId: "capstone" },
]

const FEEDBACK_ITEMS = [
  { id: "f1", title: "Literature Review", grade: "92", max: "100" },
  { id: "f2", title: "Data Pipeline Lab", grade: "78", max: "100" },
]

interface DashboardViewProps {
  onCourseClick: (courseId: string) => void
  onAssignmentClick: () => void
}

export function DashboardView({ onCourseClick, onAssignmentClick }: DashboardViewProps) {
  return (
    <div className="flex gap-8">
      {/* Main content: course grid */}
      <div className="min-w-0 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground text-balance">My Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Semester 1, 2026</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => onCourseClick(course.id)}
            />
          ))}
        </div>
      </div>

      {/* Right sticky sidebar */}
      <div className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-20">
          <RightSidebar
            todoItems={TODO_ITEMS}
            feedbackItems={FEEDBACK_ITEMS}
            onTodoClick={onAssignmentClick}
          />
        </div>
      </div>
    </div>
  )
}
