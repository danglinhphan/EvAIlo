"use client"

import { useState, useEffect } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Link2,
  Code2,
  ClipboardList,
  Home,
  BookOpen,
  BarChart2,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchModules, type Module } from "@/lib/api/modules"
import { fetchAssignments, type AssignmentRow } from "@/lib/api/assignments"
import { fetchAnalytics, type AnalyticsData } from "@/lib/api/analytics"
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

const COURSE_DESCRIPTIONS: Record<string, string> = {
  ifb220: "Covers relational databases, SQL, data pipelines, explainable AI, and clinical data analysis using the MIMIC-III dataset.",
  iab230: "Introduces enterprise architecture frameworks including TOGAF, Zachman, and ArchiMate for designing scalable organizational systems.",
  capstone: "A supervised research project building a DTA prototype with explainable AI predictions for clinical decision support.",
}

const COURSE_INSTRUCTORS: Record<string, { name: string; email: string; initials: string; role: string }[]> = {
  ifb220: [{ name: "Dr. Sam Willis", email: "dr.willis@evai.lo", initials: "SW", role: "Lead Instructor" }],
  iab230: [{ name: "Prof. Linda Ho", email: "l.ho@university.edu.au", initials: "LH", role: "Lead Instructor" }],
  capstone: [
    { name: "Dr. Sam Willis", email: "dr.willis@evai.lo", initials: "SW", role: "Supervisor" },
    { name: "Prof. Linda Ho", email: "l.ho@university.edu.au", initials: "LH", role: "Co-Supervisor" },
  ],
}

const ENROLLED_COUNT: Record<string, number> = { ifb220: 47, iab230: 38, capstone: 12 }

const COURSE_NAV = [
  { icon: Home, label: "Home" },
  { icon: BookOpen, label: "Modules" },
  { icon: ClipboardList, label: "Assignments" },
  { icon: BarChart2, label: "Grades" },
  { icon: Users, label: "People" },
]

const TYPE_ICONS: Record<string, React.ElementType> = {
  PDF: FileText,
  Link: Link2,
  Code: Code2,
  Assignment: ClipboardList,
}

const STATUS_STYLES: Record<string, string> = {
  graded: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  missing: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
}

export function ModulesView({ courseId, onAssignmentClick, onNavigate }: ModulesViewProps) {
  const [activeCourseNav, setActiveCourseNav] = useState("Home")
  const [published, setPublished] = useState(true)
  const [modules, setModules] = useState<Module[]>([])
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loadingModules, setLoadingModules] = useState(false)
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const courseTitle = COURSE_TITLES[courseId] ?? "Course"

  useEffect(() => {
    if (activeCourseNav === "Modules") {
      setLoadingModules(true)
      fetchModules(courseId).then(setModules).catch(console.error).finally(() => setLoadingModules(false))
    } else if (activeCourseNav === "Home" || activeCourseNav === "Assignments") {
      setLoadingAssignments(true)
      fetchAssignments(courseId).then(setAssignments).catch(console.error).finally(() => setLoadingAssignments(false))
    } else if (activeCourseNav === "Grades") {
      setLoadingGrades(true)
      fetchAnalytics(courseId).then(setAnalytics).catch(console.error).finally(() => setLoadingGrades(false))
    }
  }, [activeCourseNav, courseId])

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

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground text-balance">{courseTitle}</h1>
            <p className="text-sm text-muted-foreground">{activeCourseNav}</p>
          </div>
          {activeCourseNav === "Modules" && (
            <Button
              variant={published ? "default" : "outline"}
              size="sm"
              onClick={() => setPublished(!published)}
              className="gap-2 self-start sm:self-auto"
            >
              {published ? <><Eye className="h-4 w-4" /> Published</> : <><EyeOff className="h-4 w-4" /> Unpublished</>}
            </Button>
          )}
        </div>

        {activeCourseNav === "Home" && (
          <HomeSection courseId={courseId} assignments={assignments} loading={loadingAssignments} />
        )}
        {activeCourseNav === "Modules" && (
          <ModulesSection modules={modules} loading={loadingModules} onAssignmentClick={onAssignmentClick} />
        )}
        {activeCourseNav === "Assignments" && (
          <AssignmentsSection assignments={assignments} loading={loadingAssignments} onAssignmentClick={onAssignmentClick} />
        )}
        {activeCourseNav === "Grades" && (
          <GradesSection analytics={analytics} loading={loadingGrades} />
        )}
        {activeCourseNav === "People" && (
          <PeopleSection courseId={courseId} />
        )}
      </div>
    </div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeSection({ courseId, assignments, loading }: { courseId: string; assignments: AssignmentRow[]; loading: boolean }) {
  const description = COURSE_DESCRIPTIONS[courseId] ?? ""
  const instructors = COURSE_INSTRUCTORS[courseId] ?? []
  const missing = assignments.filter((a) => a.status === "missing")
  const graded = assignments.filter((a) => a.status === "graded")
  const avg = graded.length ? Math.round(graded.reduce((s, a) => s + (a.score ?? 0), 0) / graded.length) : null

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About this Course</p>
        <p className="text-sm text-card-foreground leading-relaxed">{description}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-foreground">{assignments.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Assignments</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-primary">{avg !== null ? avg + "%" : "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">Current Avg</p>
        </div>
        <div className={cn("rounded-xl border bg-card p-4 shadow-sm text-center", missing.length > 0 ? "border-red-300 dark:border-red-800" : "border-border")}>
          <p className={cn("text-2xl font-bold", missing.length > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
            {missing.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Missing</p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-20 rounded-xl" />
      ) : missing.length > 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-card-foreground">Missing Assignments</h2>
          </div>
          <ul className="divide-y divide-border">
            {missing.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-card-foreground">{a.name}</span>
                <div className="flex items-center gap-3">
                  {a.due_date && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(a.due_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <Badge variant="destructive" className="text-xs">Missing</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">All caught up! No missing assignments.</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-card-foreground">Instructors</h2>
        </div>
        <ul className="divide-y divide-border">
          {instructors.map((ins) => (
            <li key={ins.email} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {ins.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground">{ins.name}</p>
                <p className="text-xs text-muted-foreground">{ins.role}</p>
              </div>
              <a href={"mailto:" + ins.email} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5" />
                {ins.email}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Modules ──────────────────────────────────────────────────────────────────
function ModulesSection({ modules, loading, onAssignmentClick }: { modules: Module[]; loading: boolean; onAssignmentClick: () => void }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    )
  }
  return (
    <Accordion type="multiple" defaultValue={modules.map((m) => m.id)} className="flex flex-col gap-3">
      {modules.map((module) => (
        <AccordionItem key={module.id} value={module.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <AccordionTrigger className="px-5 py-4 hover:no-underline [&>svg]:shrink-0">
            <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <Badge variant="secondary" className="shrink-0 text-xs">{module.week}</Badge>
              <span className="font-semibold text-card-foreground truncate">{module.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4">
            <ul className="flex flex-col gap-1" role="list">
              {module.items.map((item) => {
                const Icon = TYPE_ICONS[item.type] ?? FileText
                return (
                  <li key={item.label}>
                    {item.is_assignment ? (
                      <button
                        onClick={onAssignmentClick}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        <Badge className="shrink-0 text-xs">{item.badge}</Badge>
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-card-foreground">{item.label}</span>
                        <Badge variant="outline" className="shrink-0 text-xs">{item.badge}</Badge>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// ─── Assignments ──────────────────────────────────────────────────────────────
function AssignmentsSection({ assignments, loading, onAssignmentClick }: { assignments: AssignmentRow[]; loading: boolean; onAssignmentClick: () => void }) {
  const [filter, setFilter] = useState<"all" | "graded" | "submitted" | "missing">("all")
  const filtered = filter === "all" ? assignments : assignments.filter((a) => a.status === filter)

  if (loading) return <Skeleton className="h-48 rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["all", "graded", "submitted", "missing"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f}{f !== "all" && " (" + assignments.filter((a) => a.status === f).length + ")"}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignment</th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">No assignments found.</td></tr>
            ) : filtered.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={onAssignmentClick}>
                <td className="px-5 py-3 font-medium text-card-foreground">{a.name}</td>
                <td className="px-5 py-3 text-center text-xs text-muted-foreground">
                  {a.due_date ? new Date(a.due_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "—"}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {a.status === "graded"
                    ? <span className="font-semibold text-card-foreground">{a.score}<span className="font-normal text-muted-foreground">/{a.max}</span></span>
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_STYLES[a.status])}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Grades ───────────────────────────────────────────────────────────────────
function GradesSection({ analytics, loading }: { analytics: AnalyticsData | null; loading: boolean }) {
  if (loading || !analytics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }
  const { assignments } = analytics
  const graded = assignments.filter((a) => a.status === "graded")
  const avg = graded.length ? Math.round(graded.reduce((s, a) => s + (a.score ?? 0), 0) / graded.length) : 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-primary">{avg}%</p>
          <p className="text-xs text-muted-foreground mt-1">Average</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-foreground">{graded.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Graded</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-foreground">{assignments.filter((a) => a.status === "missing").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Missing</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-card-foreground">Grade Breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignment</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assignments.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 font-medium text-card-foreground">{a.name}</td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {a.status === "graded"
                    ? <span><span className="font-semibold text-card-foreground">{a.score}</span><span className="text-muted-foreground">/{a.max}</span></span>
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_STYLES[a.status])}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── People ───────────────────────────────────────────────────────────────────
function PeopleSection({ courseId }: { courseId: string }) {
  const instructors = COURSE_INSTRUCTORS[courseId] ?? []
  const enrolled = ENROLLED_COUNT[courseId] ?? 0

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-card-foreground">Instructors</h2>
        </div>
        <ul className="divide-y divide-border">
          {instructors.map((ins) => (
            <li key={ins.email} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {ins.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground">{ins.name}</p>
                <p className="text-xs text-muted-foreground">{ins.role}</p>
              </div>
              <a href={"mailto:" + ins.email} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5" />
                {ins.email}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-card-foreground">Enrolled Students</h2>
        </div>
        <p className="text-3xl font-bold text-foreground">{enrolled}</p>
        <p className="text-sm text-muted-foreground mt-1">students enrolled this semester</p>
      </div>
    </div>
  )
}
