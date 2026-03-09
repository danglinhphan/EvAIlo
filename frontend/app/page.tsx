"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LeftSidebar } from "@/components/lms/left-sidebar"
import { TopHeader } from "@/components/lms/top-header"
import { DashboardView } from "@/components/lms/dashboard-view"
import { ModulesView } from "@/components/lms/modules-view"
import { AssignmentView } from "@/components/lms/assignment-view"
import { AnalyticsView } from "@/components/lms/analytics-view"
import { DiscussionsView } from "@/components/lms/discussions-view"
import { WorkspaceView } from "@/components/lms/workspace-view"
import { getStoredToken, apiLogout, fetchMe } from "@/lib/api/auth"
import type { UserOut } from "@/lib/api/auth"
import type { View } from "@/types/lms"

const COURSE_TITLES: Record<string, string> = {
  ifb220: "IFB220: Data Technologies",
  iab230: "IAB230: Enterprise Architecture",
  capstone: "QUT Capstone: DTA Prototype",
}

export default function LMSPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<UserOut | null>(null)
  const [view, setView] = useState<View>("dashboard")
  const [selectedCourse, setSelectedCourse] = useState<string>("ifb220")
  const [darkMode, setDarkMode] = useState(false)

  // Auth guard: redirect to /login if no token, then fetch full user profile
  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      router.replace("/login")
      return
    }
    fetchMe()
      .then((me) => {
        setUser(me)
        setAuthChecked(true)
      })
      .catch(() => {
        router.replace("/login")
      })
  }, [router])

  useEffect(() => {
    const root = document.documentElement
    darkMode ? root.classList.add("dark") : root.classList.remove("dark")
  }, [darkMode])

  async function handleLogout() {
    await apiLogout()
    router.push("/login")
  }

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

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LeftSidebar currentView={view} onNavigate={handleNavigate} />

      <TopHeader
        currentView={view}
        selectedCourse={courseTitle}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
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
          {view === "analytics" && <AnalyticsView courseId={selectedCourse} />}
          {view === "discussions" && <DiscussionsView />}
          {view === "workspace" && <WorkspaceView />}
        </div>
      </main>
    </div>
  )
}
