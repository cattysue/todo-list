'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Todo } from '@/types/todo'
import TodoItem from './todo-item'

type Filter = 'all' | 'completed' | 'incomplete'

const FILTER_LABELS: Record<Filter, string> = {
  all: '전체',
  completed: '완료',
  incomplete: '미완료',
}

export default function TodoList() {
  const [filter, setFilter] = useState<Filter>('all')

  const { data: todos, isPending, isError, error } = useQuery<Todo[]>({
    queryKey: ['todos', filter],
    queryFn: () =>
      apiFetch<Todo[]>(filter === 'all' ? '/todos' : `/todos?status=${filter}`),
  })

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(['all', 'completed', 'incomplete'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {isPending && <p className="text-center text-gray-500">로딩 중...</p>}
      {isError && <p className="text-center text-red-500">오류: {error.message}</p>}
      {!isPending && !isError && todos && todos.length === 0 && (
        <p className="text-center text-gray-400">할일이 없습니다</p>
      )}
      {!isPending && !isError && todos && todos.length > 0 && (
        <ul className="flex flex-col gap-3">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </div>
  )
}
