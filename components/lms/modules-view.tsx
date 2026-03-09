"use client"

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Link2,
  Code2,
  ClipboardList,
  Home,
  BookOpen,
  CheckSquare,
  BarChart2,
  Users,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { View } from "@/types/lms"

interface ModulesViewProps {
  courseId: string
  onAssignmentClick: () => void
  onNavigate: (view: View) => void
}

const COURSE_TITLES: Record<string, string> = {
  ifb220: "IFB220: Data Technologies",
  iab230: "IAB230: Enterprise Architecture",
  capstone: "QUT Capstone: DTA Prototype",
}

const COURSE_NAV = [
  { icon: Home, label: "Home" },
  { icon: BookOpen, label: "Modules", active: true },
  { icon: ClipboardList, label: "Assignments" },
  { icon: BarChart2, label: "Grades" },
  { icon: Users, label: "People" },
]

const MODULES = [
  {
    id: "module-1",
    title: "Module 1: Introduction to Explainable AI (XAI)",
    week: "Week 1",
    items: [
      { icon: FileText, label: "Lecture Slides", type: "PDF", badge: "PDF" },
      { icon: Link2, label: "Reading: EBMs and Clinical Data", type: "Link", badge: "Reading" },
    ],
  },
  {
    id: "module-2",
    title: "Module 2: MIMIC-III Dataset & Preprocessing",
    week: "Week 2",
    items: [
      { icon: Code2, label: "Jupyter Notebook Setup", type: "Code", badge: "Notebook" },
      {
        icon: ClipboardList,
        label: "Assignment 1: ICU Readmission Prediction Model",
        type: "Assignment",
        badge: "Assignment",
        isAssignment: true,
      },
    ],
  },
]

export function ModulesView({ courseId, onAssignmentClick, onNavigate }: ModulesViewProps) {
  const [published, setPublished] = useState(true)
  const [activeCourseNav, setActiveCourseNav] = useState("Modules")
  const courseTitle = COURSE_TITLES[courseId] ?? "Course"

  return (
    <div className="flex gap-0 md:gap-8">
      {/* Inner course nav */}
      <aside className="hidden w-52 shrink-0 md:block">
        <nav aria-label="Course navigation">
          <ul className="flex flex-col gap-0.5">
            {COURSE_NAV.map(({ icon: Icon, label }) => (
              <li key={label}>
                <button
                  onClick={() => setActiveCourseNav(label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    activeCourseNav === label
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                  aria-current={activeCourseNav === label ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main modules content */}
      <div className="min-w-0 flex-1">
        {/* Course header */}
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground text-balance">{courseTitle}</h1>
            <p className="text-sm text-muted-foreground">Modules</p>
          </div>
          <Button
            variant={published ? "default" : "outline"}
            size="sm"
            onClick={() => setPublished(!published)}
            className="gap-2 self-start sm:self-auto"
          >
            {published ? (
              <>
                <Eye className="h-4 w-4" /> Published
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" /> Unpublished
              </>
            )}
          </Button>
        </div>

        {/* Accordion modules */}
        <Accordion type="multiple" defaultValue={["module-1", "module-2"]} className="flex flex-col gap-3">
          {MODULES.map((module) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline [&>svg]:shrink-0">
                <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {module.week}
                  </Badge>
                  <span className="font-semibold text-card-foreground truncate">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <ul className="flex flex-col gap-1" role="list">
                  {module.items.map((item) => (
                    <li key={item.label}>
                      {item.isAssignment ? (
                        <button
                          onClick={onAssignmentClick}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left font-medium">{item.label}</span>
                          <Badge className="shrink-0 text-xs">{item.badge}</Badge>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
                          <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 text-card-foreground">{item.label}</span>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {item.badge}
                          </Badge>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
