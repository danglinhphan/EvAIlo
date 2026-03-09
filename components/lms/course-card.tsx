"use client"

import { Megaphone, ClipboardList, MessageSquare, FolderOpen, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Course } from "@/types/lms"

const ACTION_ICONS = [
  { icon: Megaphone, label: "Announcements" },
  { icon: ClipboardList, label: "Assignments" },
  { icon: MessageSquare, label: "Discussions" },
  { icon: FolderOpen, label: "Files" },
]

interface CourseCardProps {
  course: Course
  onClick: () => void
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <article
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Open ${course.title}`}
    >
      {/* Card top: gradient banner */}
      <div
        className="relative flex h-28 items-start justify-end p-3"
        style={{
          background: `linear-gradient(135deg, ${course.colorFrom}, ${course.colorTo})`,
        }}
      >
        {/* Subtle dot-grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden="true"
        />
        <Button
          variant="ghost"
          size="icon"
          className="relative z-10 h-7 w-7 text-white/80 opacity-0 transition-opacity hover:bg-white/20 hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
          onClick={(e) => e.stopPropagation()}
          aria-label="Course settings"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Card bottom: info + actions */}
      <div className="p-4">
        <h3 className="truncate text-balance font-semibold leading-tight text-card-foreground">
          {course.title}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{course.subtitle}</p>

        <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
          {ACTION_ICONS.map(({ icon: Icon, label }) => (
            <Button
              key={label}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
              aria-label={label}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    </article>
  )
}
