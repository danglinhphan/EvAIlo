"use client"

import { useState, useEffect } from "react"
import { LeftSidebar } from "@/components/lms/left-sidebar"
import { TopHeader } from "@/components/lms/top-header"
import { DashboardView } from "@/components/lms/dashboard-view"
import { ModulesView } from "@/components/lms/modules-view"
import { AssignmentView } from "@/components/lms/assignment-view"
import { AnalyticsView } from "@/components/lms/analytics-view"
import { DiscussionsView } from "@/components/lms/discussions-view"
import { WorkspaceView } from "@/components/lms/workspace-view"
import type { View } from "@/types/lms"

const COURSE_TITLES: Record<string, string> = {
  ifb220: "IFB220: Data Technologies",
  iab230: "IAB230: Enterprise Architecture",
  capstone: "QUT Capstone: DTA Prototype",
}

export default function LMSPage() {
  const [view, setView] = useState<View>("dashboard")
  const [selectedCourse, setSelectedCourse] = useState<string>("ifb220")
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    darkMode ? root.classList.add("dark") : root.classList.remove("dark")
  }, [darkMode])

  function handleCourseClick(courseId: string) {
    setSelectedCourse(courseId)
    setView("modules")
  }

  function handleAssignmentClick() {
    setView("submission")
  }

  function handleNavigate(targetView: View) {
    setView(targetView)
  }

  const courseTitle = COURSE_TITLES[selectedCourse] ?? null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LeftSidebar currentView={view} onNavigate={handleNavigate} />

      <TopHeader
        currentView={view}
        selectedCourse={courseTitle}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onNavigate={handleNavigate}
      />

      <main className="ml-16 pt-14">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {view === "dashboard" && (
            <DashboardView
              onCourseClick={handleCourseClick}
              onAssignmentClick={handleAssignmentClick}
            />
          )}
          {view === "modules" && (
            <ModulesView
              courseId={selectedCourse}
              onAssignmentClick={handleAssignmentClick}
              onNavigate={handleNavigate}
            />
          )}
          {view === "submission" && (
            <AssignmentView
              onCancel={() => setView("modules")}
            />
          )}
          {view === "analytics" && <AnalyticsView />}
          {view === "discussions" && <DiscussionsView />}
          {view === "workspace" && <WorkspaceView />}
        </div>
      </main>
    </div>
  )
}
