import { apiFetch } from "@/lib/api-client"

export interface ModuleItem {
  label: string
  type: string
  badge: string
  is_assignment: boolean
}

export interface Module {
  id: string
  title: string
  week: string
  items: ModuleItem[]
}

export async function fetchModules(courseId: string): Promise<Module[]> {
  return apiFetch<Module[]>(`/api/modules?courseId=${courseId}`)
}
