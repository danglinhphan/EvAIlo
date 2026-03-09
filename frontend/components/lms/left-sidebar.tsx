"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart2,
  Layers,
} from "lucide-react"
import type { View } from "@/types/lms"

interface LeftSidebarProps {
  currentView: View
  onNavigate: (view: View) => void
}

interface NavItem {
  icon: React.ElementType
  label: string
  view: View
  /** Additional views that should highlight this nav item */
  relatedViews?: View[]
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: BookOpen, label: "Courses", view: "modules", relatedViews: ["submission"] },
  { icon: Calendar, label: "Calendar", view: "dashboard" },
  { icon: MessageSquare, label: "Discussions", view: "discussions" },
  { icon: BarChart2, label: "Analytics", view: "analytics" },
  { icon: Layers, label: "Workspace", view: "workspace" },
]

export function LeftSidebar({ currentView, onNavigate }: LeftSidebarProps) {
  function isActive(item: NavItem) {
    return item.view === currentView || (item.relatedViews?.includes(currentView) ?? false)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <nav
        className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-4"
        aria-label="Main navigation"
      >
        {/* Logo mark */}
        <button
          onClick={() => onNavigate("dashboard")}
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-bold shrink-0 hover:opacity-90 transition-opacity"
          aria-label="EduCanvas home"
        >
          EC
        </button>

        {/* Nav items */}
        <div className="flex flex-1 flex-col items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNavigate(item.view)}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Profile avatar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground ring-2 ring-sidebar-border transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              aria-label="My Profile"
            >
              JD
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            My Profile
          </TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  )
}
