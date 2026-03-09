"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { fetchAnalytics, type AnalyticsData } from "@/lib/api/analytics"

const STATUS_STYLES: Record<string, string> = {
  graded: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  missing: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
}

const COURSE_TITLES: Record<string, string> = {
  ifb220: "IFB220: Data Technologies",
  iab230: "IAB230: Enterprise Architecture",
  capstone: "QUT Capstone: DTA Prototype",
}

interface AnalyticsViewProps {
  courseId?: string
}

export function AnalyticsView({ courseId = "ifb220" }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchAnalytics(courseId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [courseId])

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const { bar_data, line_data, assignments } = data
  const graded = assignments.filter((a) => a.status === "graded")
  const average = graded.length
    ? Math.round(graded.reduce((s, a) => s + (a.score ?? 0), 0) / graded.length)
    : 0

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">Grades &amp; Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">{COURSE_TITLES[courseId] ?? courseId} — Semester 1, 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          label="Current Average"
          value={`${average}%`}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          highlight
        />
        <SummaryCard label="Completed" value={`${graded.length}`} />
        <SummaryCard label="Submitted" value={`${assignments.filter((a) => a.status === "submitted").length}`} />
        <SummaryCard
          label="Missing"
          value={`${assignments.filter((a) => a.status === "missing").length}`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-card-foreground">Score vs Class Average</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bar_data} margin={{ top: 0, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="you" name="Your Score" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg" name="Class Avg" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-card-foreground">Performance Over Semester</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={line_data} margin={{ top: 0, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Score"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--primary)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-card-foreground">Assignment Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
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
                  <td className="px-5 py-3 text-card-foreground font-medium">{a.name}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {a.status === "graded" ? (
                      <span className="font-semibold text-card-foreground">
                        {a.score}<span className="font-normal text-muted-foreground">/{a.max}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", highlight && "border-primary/30 bg-primary/5")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className={cn("mt-2 text-3xl font-bold tabular-nums", highlight ? "text-primary" : "text-card-foreground")}>
        {value}
      </p>
    </div>
  )
}
