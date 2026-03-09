"use client"

import { useEffect, useState } from "react"
import { CourseCard } from "@/components/lms/course-card"
import { RightSidebar } from "@/components/lms/right-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCourses } from "@/lib/api/courses"
import { fetchAssignments } from "@/lib/api/assignments"
import type { Course } from "@/types/lms"

interface DashboardViewProps {
  onCourseClick: (courseId: string) => void
  onAssignmentClick: () => void
}

export function DashboardView({ onCourseClick, onAssignmentClick }: DashboardViewProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [todoItems, setTodoItems] = useState<{ id: string; title: string; due: string; courseId: string }[]>([])
  const [feedbackItems, setFeedbackItems] = useState<{ id: string; title: string; grade: string; max: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [coursesData, assignmentsData] = await Promise.all([
          fetchCourses(),
          fetchAssignments(),
        ])
        setCourses(coursesData)

        const todos = assignmentsData
          .filter((a) => a.status === "missing")
          .map((a) => ({
            id: a.id,
            title: a.name,
            due: a.due_date ? `Due ${new Date(a.due_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}` : "No due date",
            courseId: a.course_id,
          }))

        const feedback = assignmentsData
          .filter((a) => a.status === "graded" && a.score !== null)
          .slice(-3)
          .map((a) => ({
            id: a.id,
            title: a.name,
            grade: String(a.score),
            max: String(a.max),
          }))

        setTodoItems(todos)
        setFeedbackItems(feedback)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex gap-8">
      {/* Main content: course grid */}
      <div className="min-w-0 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground text-balance">My Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Semester 1, 2026</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => onCourseClick(course.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right sticky sidebar */}
      <div className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-20">
          <RightSidebar
            todoItems={todoItems}
            feedbackItems={feedbackItems}
            onTodoClick={onAssignmentClick}
          />
        </div>
      </div>
    </div>
  )
}
