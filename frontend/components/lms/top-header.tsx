"use client"

import { useState } from "react"
import { Bell, Sun, Moon, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { View } from "@/types/lms"
import type { UserOut } from "@/lib/api/auth"

interface TopHeaderProps {
  currentView: View
  selectedCourse: string | null
  darkMode: boolean
  onToggleDarkMode: () => void
  onNavigate: (view: View) => void
  user?: UserOut | null
  onLogout?: () => void
}

const VIEW_LABELS: Record<View, string> = {
  dashboard: "Dashboard",
  modules: "Modules",
  submission: "Assignment 1",
  analytics: "Grades & Analytics",
  discussions: "Discussions",
  workspace: "Group Workspace",
}

function getBreadcrumbs(
  currentView: View,
  selectedCourse: string | null
): { label: string; view: View }[] {
  const root = { label: "Dashboard", view: "dashboard" as View }
  switch (currentView) {
    case "dashboard":
      return [root]
    case "modules":
      return [root, { label: selectedCourse ?? "Course", view: "modules" }, { label: "Modules", view: "modules" }]
    case "submission":
      return [
        root,
        { label: selectedCourse ?? "Course", view: "modules" },
        { label: "Modules", view: "modules" },
        { label: "Assignment 1", view: "submission" },
      ]
    case "analytics":
      return [root, { label: "Grades & Analytics", view: "analytics" }]
    case "discussions":
      return [root, { label: "Discussions", view: "discussions" }]
    case "workspace":
      return [root, { label: "Group Workspace", view: "workspace" }]
    default:
      return [root]
  }
}

export function TopHeader({
  currentView,
  selectedCourse,
  darkMode,
  onToggleDarkMode,
  onNavigate,
  user,
  onLogout,
}: TopHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const crumbs = getBreadcrumbs(currentView, selectedCourse)

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("")
    : "?"

  return (
    <header className="fixed left-16 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-sm">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-sm">
          {crumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              )}
              {i < crumbs.length - 1 ? (
                <button
                  onClick={() => onNavigate(crumb.view)}
                  className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="font-semibold text-foreground">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]">
            3
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onToggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User avatar + logout menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            aria-label="User menu"
          >
            {initials}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 z-50 min-w-[160px] rounded-xl border border-border bg-card shadow-lg py-1">
              {user && (
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-medium text-foreground truncate">{user.name || user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
              <button
                onClick={() => { setShowMenu(false); onLogout?.() }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
