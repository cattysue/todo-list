'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Todo, Priority } from '@/types/todo'
import PriorityBadge from './priority-badge'

export default function TodoItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editPriority, setEditPriority] = useState<Priority>('medium')
  const [editError, setEditError] = useState('')

  const { mutate: toggleTodo, isPending: isTogglePending } = useMutation({
    mutationFn: () =>
      apiFetch<Todo>(`/todos/${todo.id}/toggle`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const { mutate: deleteTodo, isPending: isDeletePending } = useMutation({
    mutationFn: () =>
      apiFetch<null>(`/todos/${todo.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const { mutate: updateTodo, isPending: isUpdatePending } = useMutation({
    mutationFn: (data: { title: string; due_date: string | null; priority: Priority }) =>
      apiFetch<Todo>(`/todos/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setIsEditing(false)
    },
    onError: (err: Error) => {
      setEditError(err.message)
    },
  })

  const handleEditStart = () => {
    setEditTitle(todo.title)
    setEditDueDate(todo.due_date ?? '')
    setEditPriority(todo.priority)
    setEditError('')
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditError('')
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim()) {
      setEditError('제목을 입력해주세요')
      return
    }
    setEditError('')
    updateTodo({
      title: editTitle.trim(),
      due_date: editDueDate || null,
      priority: editPriority,
    })
  }

  if (isEditing) {
    return (
      <li className="rounded-lg border border-blue-300 bg-white p-4 shadow-sm">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isUpdatePending}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            {editError && <p className="text-xs text-red-500">{editError}</p>}
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              disabled={isUpdatePending}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              disabled={isUpdatePending}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="high">높음</option>
              <option value="medium">중간</option>
              <option value="low">낮음</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isUpdatePending}
              className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatePending ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleEditCancel}
              disabled={isUpdatePending}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <input
        type="checkbox"
        checked={todo.is_completed}
        onChange={() => toggleTodo()}
        disabled={isTogglePending || isDeletePending}
        className="h-4 w-4 cursor-pointer accent-blue-600 disabled:opacity-50"
      />
      <div className="flex flex-1 flex-col gap-1">
        <span
          className={`text-sm font-medium ${
            todo.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}
        >
          {todo.title}
        </span>
        {todo.due_date && (
          <span className="text-xs text-gray-500">마감: {todo.due_date}</span>
        )}
      </div>
      <PriorityBadge priority={todo.priority} />
      <button
        onClick={handleEditStart}
        disabled={isTogglePending || isDeletePending}
        className="rounded-md px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
      >
        수정
      </button>
      <button
        onClick={() => deleteTodo()}
        disabled={isTogglePending || isDeletePending}
        className="rounded-md px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        삭제
      </button>
    </li>
  )
}
