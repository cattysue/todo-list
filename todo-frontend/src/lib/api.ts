const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body != null
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null as T
  return res.json()
}
