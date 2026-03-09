import { apiFetch } from "@/lib/api-client"

export interface UserOut {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserOut
}

export async function apiRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  })
  persistToken(data.access_token)
  return data
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  })
  persistToken(data.access_token)
  return data
}

export async function apiLogout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {})
  clearToken()
}

function persistToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("access_token", token)
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("access_token")
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export async function fetchMe(): Promise<UserOut> {
  return apiFetch<UserOut>("/api/auth/me")
}
