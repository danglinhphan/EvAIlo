import { apiFetch } from "@/lib/api-client"

export interface Thread {
  id: string
  title: string
  author: string
  initials: string
  timestamp: string
  preview: string
  replies: number
  unread: boolean
}

export interface Reply {
  id: string
  author: string
  initials: string
  timestamp: string
  body: string
  is_op: boolean
}

export async function fetchThreads(): Promise<Thread[]> {
  return apiFetch<Thread[]>("/api/discussions")
}

export async function fetchReplies(threadId: string): Promise<Reply[]> {
  return apiFetch<Reply[]>(`/api/discussions/${threadId}/replies`)
}

export async function postReply(threadId: string, body: string): Promise<Reply> {
  return apiFetch<Reply>(`/api/discussions/${threadId}/replies`, {
    method: "POST",
    body: { body },
  })
}

export async function createThread(courseId: string, title: string): Promise<Thread> {
  return apiFetch<Thread>("/api/discussions", {
    method: "POST",
    body: { course_id: courseId, title },
  })
}
