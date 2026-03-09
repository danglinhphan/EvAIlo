"use client"

import { useState } from "react"
import { Bold, Italic, Code, Send, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Thread {
  id: string
  title: string
  author: string
  initials: string
  timestamp: string
  preview: string
  replies: number
  unread?: boolean
}

const THREADS: Thread[] = [
  {
    id: "t1",
    title: "Handling missing values in MIMIC-III",
    author: "Alex Chen",
    initials: "AC",
    timestamp: "2h ago",
    preview: "What imputation strategy works best for clinical time-series?",
    replies: 7,
    unread: true,
  },
  {
    id: "t2",
    title: "TCH-SSM implementation details",
    author: "Priya Nair",
    initials: "PN",
    timestamp: "5h ago",
    preview: "Has anyone successfully integrated the SSM layer with PyTorch Lightning?",
    replies: 4,
  },
  {
    id: "t3",
    title: "EBM vs SHAP for clinical interpretability",
    author: "Dr. Sam Willis",
    initials: "SW",
    timestamp: "1d ago",
    preview: "From a clinical governance standpoint, which produces more actionable explanations?",
    replies: 12,
  },
  {
    id: "t4",
    title: "Vercel deployment — env vars for Next.js API routes",
    author: "Jordan Park",
    initials: "JP",
    timestamp: "2d ago",
    preview: "Best practice for securing API keys in the Capstone deployment?",
    replies: 3,
  },
]

const ACTIVE_REPLIES = [
  {
    id: "r1",
    author: "Alex Chen",
    initials: "AC",
    timestamp: "2h ago",
    body: "I've been using median imputation for numeric vitals and mode for categorical features. MICE worked better but was too slow on the full MIMIC dataset.",
    isOP: true,
  },
  {
    id: "r2",
    author: "Dr. Sam Willis",
    initials: "SW",
    timestamp: "1h ago",
    body: "Forward-fill (last observation carried forward) is the clinical standard for time-series gaps. Worth checking the MIMIC-Extract pipeline — it handles this automatically.",
    isOP: false,
  },
]

export function DiscussionsView() {
  const [activeThread, setActiveThread] = useState<string>("t1")
  const [replyText, setReplyText] = useState("")
  const active = THREADS.find((t) => t.id === activeThread) ?? THREADS[0]

  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Thread list */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border md:flex">
        <div className="border-b border-border px-4 py-3">
          <h1 className="font-semibold text-card-foreground">Discussions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">IFB220: Data Technologies</p>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-border">
          {THREADS.map((thread) => (
            <li key={thread.id}>
              <button
                onClick={() => setActiveThread(thread.id)}
                className={cn(
                  "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                  activeThread === thread.id && "bg-accent"
                )}
                aria-current={activeThread === thread.id ? "true" : undefined}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm leading-snug text-card-foreground", thread.unread && "font-semibold")}>
                    {thread.title}
                  </p>
                  {thread.unread && (
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                  )}
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">{thread.preview}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{thread.author}</span>
                  <span>·</span>
                  <span>{thread.replies} replies</span>
                  <span>·</span>
                  <span>{thread.timestamp}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Active thread */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Thread header */}
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-card-foreground text-balance">{active.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{active.replies} replies · Last activity {active.timestamp}</p>
        </div>

        {/* Replies list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {ACTIVE_REPLIES.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {reply.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-card-foreground">{reply.author}</span>
                  {reply.isOP && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      OP
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                </div>
                <p className="text-sm text-card-foreground leading-relaxed">{reply.body}</p>

                {/* OP post gets rich content blocks */}
                {reply.isOP && (
                  <div className="mt-3 space-y-3">
                    {/* Code snippet */}
                    <div className="rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900 overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
                        <Code className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-xs text-zinc-400 font-mono">python</span>
                      </div>
                      <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-zinc-200 font-mono">
{`from sklearn.impute import SimpleImputer
import numpy as np

imputer = SimpleImputer(strategy='median')
X_imputed = imputer.fit_transform(X_train)

# Forward-fill for time-series columns
df_ts = df_ts.ffill().bfill()`}
                      </pre>
                    </div>
                    {/* LaTeX block */}
                    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">LaTeX — Imputation Error Bound</p>
                      <p className="font-mono text-xs text-foreground">
                        {"$$\\text{RMSE} = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(\\hat{x}_i - x_i)^2}$$"}
                      </p>
                    </div>
                  </div>
                )}

                <button className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Reply input */}
        <div className="border-t border-border p-4">
          <div className="rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
            {/* Formatting toolbar */}
            <div className="flex items-center gap-1 border-b border-border px-3 py-2">
              {[Bold, Italic, Code].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label={Icon.name}
                  type="button"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Write a reply... (Markdown supported)"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex justify-end px-3 pb-3">
              <Button
                size="sm"
                className="gap-2"
                disabled={!replyText.trim()}
                onClick={() => setReplyText("")}
              >
                <Send className="h-3.5 w-3.5" />
                Post Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
