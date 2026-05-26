'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Todo, Priority } from '@/types/todo'

export default function TodoForm() {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [error, setError] = useState('')

  const queryClient = useQueryClient()

  const { mutate: createTodo, isPending } = useMutation({
    mutationFn: (data: { title: string; due_date: string | null; priority: Priority }) =>
      apiFetch<Todo>('/todos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setTitle('')
      setDueDate('')
      setPriority('medium')
      setError('')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('제목을 입력해주세요')
      return
    }
    setError('')
    createTodo({
      title: title.trim(),
      due_date: dueDate || null,
      priority,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할일 제목을 입력하세요"
          disabled={isPending}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex gap-2">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isPending}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          disabled={isPending}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="high">높음</option>
          <option value="medium">중간</option>
          <option value="low">낮음</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
