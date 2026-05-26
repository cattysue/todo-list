export interface Todo {
  id: number
  title: string
  due_date: string | null
  priority: 'high' | 'medium' | 'low'
  is_completed: boolean
  created_at: string
}

export type Priority = Todo['priority']
