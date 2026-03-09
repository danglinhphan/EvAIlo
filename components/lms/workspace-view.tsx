"use client"

import { GripVertical, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface KanbanTask {
  id: string
  title: string
  tag: string
  tagColor: string
  assignee: string
  initials: string
}

interface KanbanColumn {
  id: string
  label: string
  tasks: KanbanTask[]
  headerColor: string
}

const COLUMNS: KanbanColumn[] = [
  {
    id: "todo",
    label: "To Do",
    headerColor: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    tasks: [
      {
        id: "k1",
        title: "Setup Next.js 16 frontend",
        tag: "Frontend",
        tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
        assignee: "Jordan Park",
        initials: "JP",
      },
      {
        id: "k2",
        title: "Prepare DTA stakeholder email",
        tag: "Comms",
        tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
        assignee: "Alex Chen",
        initials: "AC",
      },
      {
        id: "k3",
        title: "Write unit tests for inference API",
        tag: "Backend",
        tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
        assignee: "Priya Nair",
        initials: "PN",
      },
    ],
  },
  {
    id: "in-progress",
    label: "In Progress",
    headerColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    tasks: [
      {
        id: "k4",
        title: "Environment segregation (dev/staging/prod)",
        tag: "DevOps",
        tagColor: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
        assignee: "Jordan Park",
        initials: "JP",
      },
      {
        id: "k5",
        title: "ICU readmission model — EBM training",
        tag: "ML",
        tagColor: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
        assignee: "Alex Chen",
        initials: "AC",
      },
    ],
  },
  {
    id: "review",
    label: "Review",
    headerColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    tasks: [
      {
        id: "k6",
        title: "XAI explainability dashboard — SHAP plots",
        tag: "Frontend",
        tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
        assignee: "Priya Nair",
        initials: "PN",
      },
      {
        id: "k7",
        title: "MIMIC-III preprocessing pipeline",
        tag: "Data",
        tagColor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
        assignee: "Alex Chen",
        initials: "AC",
      },
    ],
  },
]

const TEAM = [
  { initials: "JP", label: "Jordan Park" },
  { initials: "AC", label: "Alex Chen" },
  { initials: "PN", label: "Priya Nair" },
  { initials: "SW", label: "Dr. Sam Willis" },
]

export function WorkspaceView() {
  return (
    <div className="space-y-6">
      {/* Workspace header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            QUT Capstone: DTA Prototype
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Group Workspace · Sprint 3</p>
        </div>
        {/* Overlapping team avatars */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {TEAM.map((member) => (
              <div
                key={member.initials}
                title={member.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-xs font-semibold text-primary ring-1 ring-border"
              >
                {member.initials}
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <section key={col.id} className="flex flex-col gap-3" aria-label={col.label}>
            {/* Column header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", col.headerColor)}>
                  {col.label}
                </span>
                <span className="text-xs font-medium text-muted-foreground">{col.tasks.length}</span>
              </div>
              <button className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label={`Add task to ${col.label}`}>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-2.5">
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex gap-2 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing"
                >
                  {/* Grip handle */}
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40 mt-0.5 group-hover:text-muted-foreground transition-colors" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-card-foreground leading-snug">{task.title}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", task.tagColor)}>
                        {task.tag}
                      </span>
                      <div
                        title={task.assignee}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary"
                      >
                        {task.initials}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
