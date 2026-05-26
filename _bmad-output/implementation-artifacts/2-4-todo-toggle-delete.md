# Story 2.4: 완료 토글 및 삭제 구현

Status: review

## Story

As a 사용자,
I want 할일을 완료 표시하거나 삭제하고 싶다,
So that 목록을 최신 상태로 관리할 수 있다.

## Acceptance Criteria

1. 할일의 체크박스를 클릭 시 `PATCH /todos/{id}/toggle` API가 호출되고 완료 상태가 즉시 반전된다
2. 완료된 할일은 제목에 취소선이 적용되어 시각적으로 구분된다
3. 삭제 버튼 클릭 시 `DELETE /todos/{id}` API가 호출되고 목록에서 해당 항목이 즉시 제거된다
4. 토글/삭제 처리 중 해당 항목의 버튼이 비활성화된다

## Tasks / Subtasks

- [x] Task 1: api.ts 수정 (AC: #3)
  - [x] 1.1: `src/lib/api.ts`에서 `apiFetch`가 204 No Content 응답을 처리하도록 수정 — `res.status === 204`이면 `return null as T` (DELETE 응답 처리)

- [x] Task 2: todo-item.tsx 업데이트 (AC: #1~#4)
  - [x] 2.1: 파일 최상단에 `'use client'` 디렉티브 추가 (useMutation 사용 필요)
  - [x] 2.2: `useMutation` + `useQueryClient` import 추가
  - [x] 2.3: toggle mutation 구현 — `PATCH /todos/{todo.id}/toggle`, `onSuccess`에서 `['todos']` 쿼리 무효화
  - [x] 2.4: delete mutation 구현 — `DELETE /todos/{todo.id}`, `onSuccess`에서 `['todos']` 쿼리 무효화
  - [x] 2.5: 체크박스 `<input type="checkbox">` 추가 — `checked={todo.is_completed}`, `onChange={() => toggleTodo()}`, `disabled={isTogglePending || isDeletePending}`
  - [x] 2.6: 제목 span에 완료 스타일 적용 — `is_completed`가 true이면 `line-through text-gray-400`, false이면 `text-gray-900`
  - [x] 2.7: 삭제 버튼 `<button>` 추가 — `onClick={() => deleteTodo()}`, `disabled={isTogglePending || isDeletePending}`

- [x] Task 3: 동작 검증 (AC: #1~#4)
  - [x] 3.1: TypeScript 타입 검사 통과 (`npx tsc --noEmit`)
  - [ ] 3.2: 체크박스 클릭 → PATCH 호출, 체크 상태 반전, 취소선 적용 확인 (로컬 수동 테스트)
  - [ ] 3.3: 삭제 버튼 클릭 → DELETE 호출, 목록에서 제거 확인 (로컬 수동 테스트)
  - [ ] 3.4: API 호출 중 버튼 비활성화 확인

## Dev Notes

### 기술 스택 버전 (실제 확인된 환경)

- **Next.js**: 16.2.6 (App Router)
- **React**: 19.2.4
- **TanStack Query**: 5.100.14 (v5)
- **Tailwind CSS**: 4.x
- **TypeScript**: 5.x

### Story 2.3 학습 사항 (이전 스토리 패턴 계승)

- **`'use client'`**: hooks(useMutation) 사용하는 컴포넌트는 반드시 파일 최상단에 추가
- **TanStack Query v5**: `isPending` 사용 (v4의 `isLoading` X)
- **`invalidateQueries`**: 반드시 `{ queryKey: ['todos'] }` 객체 형태 (배열 단독 불가)
- **`apiFetch`**: 모든 API 호출은 반드시 이 함수를 통해서만

### 중요: apiFetch 204 처리 (Task 1 필수)

현재 `apiFetch`는 항상 `res.json()`을 호출한다. `DELETE /todos/{id}`는 204 No Content를 반환하므로 body가 없어 `res.json()` 호출 시 파싱 오류가 발생한다.

**현재 api.ts 상태 (수정 필요):**

```ts
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
  return res.json()  // ← 204 응답에서 실패
}
```

**수정 후 api.ts:**

```ts
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
```

### 현재 프론트엔드 구조 (Story 2.3 완료 후 상태)

이 스토리에서 **수정**되는 파일:

```
todo-frontend/
├── src/
│   ├── app/
│   │   └── page.tsx              ← 변경 없음
│   ├── components/
│   │   ├── todo-form.tsx         ← 변경 없음
│   │   ├── priority-badge.tsx    ← 변경 없음
│   │   ├── todo-item.tsx         ← UPDATE (toggle + delete 추가)
│   │   └── todo-list.tsx         ← 변경 없음
│   ├── lib/
│   │   └── api.ts                ← UPDATE (204 처리 추가)
│   └── types/
│       └── todo.ts               ← 변경 없음
```

### 기존 파일 현황 (변경 없음, 반드시 현재 상태 유지)

**`src/components/todo-list.tsx`** (변경 없음):
```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Todo } from '@/types/todo'
import TodoItem from './todo-item'

export default function TodoList() {
  const { data: todos, isPending, isError, error } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: () => apiFetch<Todo[]>('/todos'),
  })

  if (isPending) return <p className="text-center text-gray-500">로딩 중...</p>
  if (isError) return <p className="text-center text-red-500">오류: {error.message}</p>
  if (todos.length === 0) return <p className="text-center text-gray-400">할일이 없습니다</p>

  return (
    <ul className="flex flex-col gap-3">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
```
→ `TodoItem`에 props 추가 없이 `todo`만 전달 — TodoItem 내부에서 mutation 처리

**`src/components/todo-item.tsx`** (현재 상태 — 이 스토리에서 UPDATE):
```tsx
import { Todo } from '@/types/todo'
import PriorityBadge from './priority-badge'

export default function TodoItem({ todo }: { todo: Todo }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-900">{todo.title}</span>
        {todo.due_date && (
          <span className="text-xs text-gray-500">마감: {todo.due_date}</span>
        )}
      </div>
      <PriorityBadge priority={todo.priority} />
    </li>
  )
}
```
→ 이 스토리에서 `'use client'` + toggle + delete + strikethrough 추가

**`src/types/todo.ts`** (변경 없음):
```ts
export interface Todo {
  id: number
  title: string
  due_date: string | null
  priority: 'high' | 'medium' | 'low'
  is_completed: boolean
  created_at: string
}
export type Priority = Todo['priority']
```

### 백엔드 API 스펙 (Story 2.1 완료 상태)

```
PATCH /todos/{id}/toggle
Request Body: 없음
Response 200: { "id": 1, "title": "...", "is_completed": true, ... }
Response 404: { "detail": "Todo not found" }

DELETE /todos/{id}
Request Body: 없음
Response 204: (body 없음)
Response 404: { "detail": "Todo not found" }
```

### todo-item.tsx 구현 (Task 2)

```tsx
// src/components/todo-item.tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Todo } from '@/types/todo'
import PriorityBadge from './priority-badge'

export default function TodoItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient()

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
        onClick={() => deleteTodo()}
        disabled={isTogglePending || isDeletePending}
        className="rounded-md px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        삭제
      </button>
    </li>
  )
}
```

### 아키텍처 준수 필수 사항

1. **API 호출**: `apiFetch` 통해서만, 직접 `fetch` 금지
2. **`'use client'`**: `useMutation` 사용 → 반드시 추가
3. **파일명**: kebab-case 유지 (`todo-item.tsx`)
4. **todo-list.tsx**: 변경 없음 — `TodoItem`에 callback prop 전달 불필요 (TodoItem 내부에서 mutation 자체 처리)
5. **per-item mutation**: 각 TodoItem이 독립적으로 mutation 상태 관리 — 한 항목의 loading이 다른 항목에 영향 없음

### 테스트 전략

학습용 프로젝트 — 단위 테스트 없음. 검증 방법:
- TypeScript 타입 검사: `npx tsc --noEmit`
- 체크박스 클릭 → PATCH 호출, 체크 상태 반전, 제목 취소선 확인
- 삭제 버튼 클릭 → DELETE 호출, 목록 제거 확인
- API 호출 중 양쪽 버튼 비활성화 확인

### References

- [Source: _bmad-output/architecture.md#프론트엔드 아키텍처]
- [Source: _bmad-output/epics.md#Story 2.4: 완료 토글 및 삭제 구현]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `api.ts`: `res.status === 204` 체크 추가 → DELETE 204 No Content 응답 파싱 오류 방지 → AC#3 만족
- `todo-item.tsx`: `'use client'` 추가, toggle/delete 두 개의 독립적 `useMutation` 구현
- toggle: `PATCH /todos/{id}/toggle`, `isPending` → `isTogglePending`, `onSuccess`에서 `invalidateQueries({ queryKey: ['todos'] })` → AC#1 만족
- delete: `DELETE /todos/{id}`, `apiFetch<null>` 타입 사용, `onSuccess`에서 `invalidateQueries` → AC#3 만족
- 체크박스: `checked={todo.is_completed}`, `disabled={isTogglePending || isDeletePending}` → AC#4 만족
- 제목 span: `todo.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'` → AC#2 만족
- 삭제 버튼: `disabled={isTogglePending || isDeletePending}` → AC#4 만족
- `todo-list.tsx`: 변경 없음 — `TodoItem`이 mutation을 자체 관리하는 per-item 패턴
- TypeScript 타입 검사 (`npx tsc --noEmit`) 오류 없이 통과
- 3.2~3.4: 실제 UI 동작은 로컬에서 `npm run dev` + 백엔드 실행 후 수동 확인 필요

### File List

- todo-frontend/src/lib/api.ts (UPDATE)
- todo-frontend/src/components/todo-item.tsx (UPDATE)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — per-item useMutation(toggle/delete), 204 처리, strikethrough 포함 |
| 2026-05-26 | 1.1 | 구현 완료 — api.ts 204 처리, todo-item.tsx toggle/delete/strikethrough, TypeScript 타입 검사 통과 |
