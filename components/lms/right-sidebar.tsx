"use client"

import { CheckCircle2, Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TodoItem, FeedbackItem } from "@/types/lms"

interface RightSidebarProps {
  todoItems: TodoItem[]
  feedbackItems: FeedbackItem[]
  onTodoClick: () => void
}

export function RightSidebar({ todoItems, feedbackItems, onTodoClick }: RightSidebarProps) {
  return (
    <aside className="flex flex-col gap-6" aria-label="Upcoming work and feedback">
      {/* To Do */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          To Do
        </h2>
        <ul className="flex flex-col gap-2">
          {todoItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={onTodoClick}
                className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <p className="text-sm font-medium text-card-foreground leading-snug">{item.title}</p>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{item.due}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent Feedback */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Star className="h-4 w-4" />
          Recent Feedback
        </h2>
        <ul className="flex flex-col gap-2">
          {feedbackItems.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border bg-card p-3"
            >
              <p className="text-sm font-medium text-card-foreground leading-snug">{item.title}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <span
                  className={cn(
                    "text-sm font-bold",
                    parseInt(item.grade) >= 85 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {item.grade}
                </span>
                <span className="text-xs text-muted-foreground">/ {item.max}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
