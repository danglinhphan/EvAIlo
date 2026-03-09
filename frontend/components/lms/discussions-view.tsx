"use client"

import { useState, useEffect } from "react"
import { Bold, Italic, Code, Send, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  fetchThreads,
  fetchReplies,
  postReply,
  type Thread,
  type Reply as ReplyType,
} from "@/lib/api/discussions"

export function DiscussionsView() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [replies, setReplies] = useState<ReplyType[]>([])
  const [replyText, setReplyText] = useState("")
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchThreads()
      .then((data) => {
        setThreads(data)
        if (data.length > 0) setActiveThreadId(data[0].id)
      })
      .catch(console.error)
      .finally(() => setLoadingThreads(false))
  }, [])

  useEffect(() => {
    if (!activeThreadId) return
    setLoadingReplies(true)
    fetchReplies(activeThreadId)
      .then(setReplies)
      .catch(console.error)
      .finally(() => setLoadingReplies(false))
  }, [activeThreadId])

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null

  async function handlePostReply() {
    if (!activeThreadId || !replyText.trim()) return
    setPosting(true)
    try {
      const newReply = await postReply(activeThreadId, replyText.trim())
      setReplies((prev) => [...prev, newReply])
      setReplyText("")
      // Update reply count in thread list
      setThreads((prev) =>
        prev.map((t) => t.id === activeThreadId ? { ...t, replies: t.replies + 1 } : t)
      )
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Thread list */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border md:flex">
        <div className="border-b border-border px-4 py-3">
          <h1 className="font-semibold text-card-foreground">Discussions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">IFB220: Data Technologies</p>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-border">
          {loadingThreads
            ? [1, 2, 3].map((i) => (
                <li key={i} className="p-4">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </li>
              ))
            : threads.map((thread) => (
                <li key={thread.id}>
                  <button
                    onClick={() => setActiveThreadId(thread.id)}
                    className={cn(
                      "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                      activeThreadId === thread.id && "bg-accent"
                    )}
                    aria-current={activeThreadId === thread.id ? "true" : undefined}
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
          {activeThread ? (
            <>
              <h2 className="font-semibold text-card-foreground text-balance">{activeThread.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{activeThread.replies} replies · Last activity {activeThread.timestamp}</p>
            </>
          ) : (
            <Skeleton className="h-6 w-72" />
          )}
        </div>

        {/* Replies list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loadingReplies
            ? [1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            : replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {reply.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-card-foreground">{reply.author}</span>
                      {reply.is_op && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          OP
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                    </div>
                    <p className="text-sm text-card-foreground leading-relaxed">{reply.body}</p>
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
                disabled={!replyText.trim() || posting}
                onClick={handlePostReply}
              >
                <Send className="h-3.5 w-3.5" />
                {posting ? "Posting…" : "Post Reply"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

