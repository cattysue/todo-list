# Story 2.5: 할일 수정 기능 구현

Status: review

## Story

As a 사용자,
I want 기존 할일을 수정하고 싶다,
So that 잘못 입력한 내용을 고칠 수 있다.

## Acceptance Criteria

1. 할일 항목의 수정 버튼 클릭 시 현재 값(제목, 마감날짜, 우선순위)이 채워진 수정 폼이 표시된다
2. 값을 수정하고 저장 버튼 클릭 시 `PUT /todos/{id}` API가 호출되고 목록에 수정된 값이 즉시 반영된다
3. 제목을 비워두고 저장하면 오류 메시지가 표시되고 API가 호출되지 않는다
4. 취소 버튼 클릭 시 수정 폼이 닫히고 원래 값이 유지된다

## Tasks / Subtasks

- [x] Task 1: todo-item.tsx 업데이트 (AC: #1~#4)
  - [x] 1.1: `isEditing`, `editTitle`, `editDueDate`, `editPriority`, `editError` state 추가
  - [x] 1.2: update mutation 구현 — `PUT /todos/{todo.id}` + body `{ title, due_date, priority }`, `onSuccess`에서 `['todos']` 쿼리 무효화 + `setIsEditing(false)`
  - [x] 1.3: `handleEditStart` 함수 — edit state를 현재 todo 값으로 초기화 후 `setIsEditing(true)`
  - [x] 1.4: `handleEditCancel` 함수 — `setIsEditing(false)`, `setEditError('')`
  - [x] 1.5: `handleEditSubmit` 함수 — 클라이언트 검증(`editTitle.trim()` 빈 문자열이면 `setEditError` 후 return), 유효하면 `updateTodo` 호출
  - [x] 1.6: `isEditing === false` 시 기존 뷰 렌더링 (체크박스 + 제목 + 마감날짜 + PriorityBadge + 수정 버튼 + 삭제 버튼)
  - [x] 1.7: `isEditing === true` 시 인라인 수정 폼 렌더링 (title input + date input + priority select + 저장/취소 버튼 + 에러 메시지)
  - [x] 1.8: 수정 폼의 모든 입력 필드와 버튼에 `disabled={isUpdatePending}` 적용

- [x] Task 2: 동작 검증 (AC: #1~#4)
  - [x] 2.1: TypeScript 타입 검사 통과 (`npx tsc --noEmit`)
  - [ ] 2.2: 수정 버튼 클릭 → 현재 값 채워진 폼 표시 확인 (로컬 수동 테스트)
  - [ ] 2.3: 값 수정 후 저장 → PUT 호출, 목록 갱신 확인
  - [ ] 2.4: 제목 비우고 저장 → 에러 메시지 표시, API 미호출 확인
  - [ ] 2.5: 취소 버튼 클릭 → 폼 닫힘, 원래 값 유지 확인

## Dev Notes

### 기술 스택 버전 (실제 확인된 환경)

- **Next.js**: 16.2.6 (App Router)
- **React**: 19.2.4
- **TanStack Query**: 5.100.14 (v5)
- **Tailwind CSS**: 4.x
- **TypeScript**: 5.x

### Story 2.4 학습 사항 (이전 스토리 패턴 계승)

- **`'use client'`**: 이미 `todo-item.tsx`에 있음 — 추가 불필요
- **TanStack Query v5**: `isPending` 사용 (v4의 `isLoading` X)
- **`invalidateQueries`**: 반드시 `{ queryKey: ['todos'] }` 객체 형태
- **`apiFetch`**: 모든 API 호출은 반드시 이 함수를 통해서만
- **per-item mutation 패턴**: `todo-item.tsx`가 자체 mutation 관리 — 이 스토리도 동일 패턴 유지

### 현재 프론트엔드 구조 (Story 2.4 완료 후 상태)

이 스토리에서 **수정**되는 파일:

```
todo-frontend/
├── src/
│   ├── app/
│   │   └── page.tsx              ← 변경 없음
│   ├── components/
│   │   ├── todo-form.tsx         ← 변경 없음
│   │   ├── priority-badge.tsx    ← 변경 없음
│   │   ├── todo-item.tsx         ← UPDATE (edit mode 추가)
│   │   └── todo-list.tsx         ← 변경 없음
│   ├── lib/
│   │   └── api.ts                ← 변경 없음 (204 처리 이미 완료)
│   └── types/
│       └── todo.ts               ← 변경 없음
```

### `todo-item.tsx` 현재 상태 (이 스토리에서 UPDATE)

```tsx
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
        <span className={`text-sm font-medium ${todo.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
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

→ 이 스토리에서 `isEditing` 상태 + 인라인 수정 폼 + update mutation 추가

### PUT /todos/{id} API 스펙

```
PUT /todos/{id}
Request Body: { "title": "...", "due_date": "2026-05-30" | null, "priority": "low"|"medium"|"high" }
Response 200: { "id": 1, "title": "...", "due_date": ..., "priority": "...", "is_completed": ..., "created_at": "..." }
Response 404: { "detail": "Todo not found" }
Response 422: { "detail": [...] }  ← title이 빈 문자열이거나 priority가 유효하지 않을 때
```

**중요**: `PUT`은 전체 필드를 전송해야 함 (title, due_date, priority 모두 포함)

### 날짜 초기화 시 주의사항

`todo.due_date`는 `string | null` 타입. HTML `<input type="date">`는 빈 문자열을 허용한다.

```ts
// edit state 초기화 시
setEditDueDate(todo.due_date ?? '')  // null → '' 변환

// PUT body 전송 시
due_date: editDueDate || null  // '' → null 변환
```

### todo-item.tsx 구현 (Task 1)

```tsx
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
```

### 아키텍처 준수 필수 사항

1. **API 호출**: `apiFetch` 통해서만, 직접 `fetch` 금지
2. **`'use client'`**: 이미 있음 — 재추가 금지 (중복 오류)
3. **`useState` 추가 import**: `'use client'` 파일에서 `useState` import 추가 필요
4. **파일명**: kebab-case 유지 (`todo-item.tsx`)
5. **`todo-list.tsx`**: 변경 없음 — `TodoItem`이 편집 상태를 자체 관리
6. **PUT body**: `title`, `due_date`, `priority` 세 필드 모두 전송 필수 (백엔드 `TodoUpdate` 스키마)

### 테스트 전략

학습용 프로젝트 — 단위 테스트 없음. 검증 방법:
- TypeScript 타입 검사: `npx tsc --noEmit`
- 수정 버튼 클릭 → 인라인 폼 + 현재 값 확인
- 값 수정 후 저장 → PUT 호출, 목록 갱신 확인
- 제목 비우고 저장 → 오류 메시지, API 미호출 확인
- 취소 버튼 → 폼 닫힘, 원래 값 유지 확인

### References

- [Source: _bmad-output/epics.md#Story 2.5: 할일 수정 기능 구현]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `todo-item.tsx`: `useState` import 추가, 5개 edit state(`isEditing`, `editTitle`, `editDueDate`, `editPriority`, `editError`) 추가
- `updateTodo` mutation: `PUT /todos/{id}` + `{ title, due_date, priority }` body, `onSuccess`에서 `invalidateQueries` + `setIsEditing(false)` → AC#2 만족
- `onError`: `setEditError(err.message)` → API 오류 표시
- `handleEditStart`: edit state를 현재 `todo` 값으로 초기화 (`todo.due_date ?? ''`) → AC#1 만족
- `handleEditCancel`: `setIsEditing(false)` + `setEditError('')` → AC#4 만족
- `handleEditSubmit`: `editTitle.trim()` 검증 → 빈 문자열이면 `setEditError` 후 return → AC#3 만족
- 조건부 렌더링: `isEditing` true → 파란 테두리 인라인 폼, false → 기존 뷰 + 수정 버튼 추가
- 수정 폼: title input + date input + priority select + 저장/취소 버튼 + 에러 메시지, 모두 `disabled={isUpdatePending}`
- `editDueDate || null`: 빈 문자열 → null 변환하여 PUT body 전송
- TypeScript 타입 검사 (`npx tsc --noEmit`) 오류 없이 통과
- 2.2~2.5: 실제 UI 동작은 로컬에서 `npm run dev` + 백엔드 실행 후 수동 확인 필요

### File List

- todo-frontend/src/components/todo-item.tsx (UPDATE)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — 인라인 edit mode, PUT mutation, 날짜 null 변환, 클라이언트 검증 포함 |
| 2026-05-26 | 1.1 | 구현 완료 — isEditing 상태 + 인라인 수정 폼 + updateTodo mutation + TypeScript 타입 검사 통과 |
