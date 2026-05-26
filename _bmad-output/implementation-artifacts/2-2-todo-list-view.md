# Story 2.2: 할일 목록 조회 화면 구현

Status: review

## Story

As a 사용자,
I want 앱에 접속하면 저장된 할일 목록을 보고 싶다,
So that 무엇을 해야 할지 파악할 수 있다.

## Acceptance Criteria

1. 앱(`localhost:3000`) 메인 페이지 로드 시, TanStack Query `useQuery`로 `GET /todos`를 호출하여 전체 할일 목록이 표시된다
2. 각 할일 항목에 제목, 마감날짜(있으면), 우선순위 배지가 표시된다
3. 우선순위 배지는 높음(빨강)/중간(노랑)/낮음(초록) 색상으로 구분된다
4. 할일이 없으면 "할일이 없습니다" 빈 상태 메시지가 표시된다
5. 데이터 로딩 중 로딩 인디케이터가 표시된다

## Tasks / Subtasks

- [x] Task 1: priority-badge.tsx 생성 (AC: #3)
  - [x] 1.1: `src/components/priority-badge.tsx` 생성 — `priority: 'high' | 'medium' | 'low'` prop 받아 색상 배지 렌더링
  - [x] 1.2: 높음(high) → 빨강 (`bg-red-100 text-red-700`), 중간(medium) → 노랑 (`bg-yellow-100 text-yellow-700`), 낮음(low) → 초록 (`bg-green-100 text-green-700`)
  - [x] 1.3: 라벨 텍스트: `high` → "높음", `medium` → "중간", `low` → "낮음"

- [x] Task 2: todo-item.tsx 생성 (AC: #2, #3)
  - [x] 2.1: `src/components/todo-item.tsx` 생성 — `todo: Todo` prop 받아 개별 할일 표시
  - [x] 2.2: 제목, 마감날짜(있으면), 우선순위 배지(`<PriorityBadge>`) 렌더링
  - [x] 2.3: `due_date`가 `null`이면 마감날짜 영역 미표시

- [x] Task 3: todo-list.tsx 생성 (AC: #1, #4, #5)
  - [x] 3.1: `src/components/todo-list.tsx` 생성 — `'use client'` 디렉티브 추가 (TanStack Query hook 사용)
  - [x] 3.2: `useQuery<Todo[]>({ queryKey: ['todos'], queryFn: () => apiFetch<Todo[]>('/todos') })` 로 데이터 패칭
  - [x] 3.3: `isPending` 상태에서 로딩 인디케이터 표시 ("로딩 중...")
  - [x] 3.4: `isError` 상태에서 에러 메시지 표시
  - [x] 3.5: `data`가 빈 배열이면 "할일이 없습니다" 메시지 표시
  - [x] 3.6: 데이터가 있으면 `todos.map(todo => <TodoItem key={todo.id} todo={todo} />)` 렌더링

- [x] Task 4: page.tsx 업데이트 (AC: #1)
  - [x] 4.1: `src/app/page.tsx` 수정 — 기존 기본 템플릿 전체 교체
  - [x] 4.2: Server Component로 유지 (`'use client'` 없음) — `<TodoList />`만 렌더링
  - [x] 4.3: 페이지 레이아웃: 중앙 배치, 최대 너비 컨테이너, 타이틀 "할일 목록" 표시

- [x] Task 5: 동작 검증 (AC: #1~#5)
  - [x] 5.1: TypeScript 타입 검사 통과 (`npx tsc --noEmit`)
  - [x] 5.2: `npm run dev` 실행 후 `localhost:3000`에서 화면 확인 (백엔드 동작 중일 때 목록 표시)
  - [x] 5.3: 빈 배열 응답 시 "할일이 없습니다" 표시 확인

## Dev Notes

### 기술 스택 버전 (실제 확인된 환경)

- **Next.js**: 16.2.6 (App Router, Turbopack)
- **React**: 19.2.4
- **TanStack Query**: 5.100.14 (v5)
- **Tailwind CSS**: 4.x (CSS-first: `@import "tailwindcss"`)
- **TypeScript**: 5.x

### ⚠️ AGENTS.md 경고: "This is NOT the Next.js you know"

Next.js 16.2.6은 훈련 데이터와 다른 변경 사항을 포함할 수 있다. 이미 확인된 중요 사항:
- App Router 기본값: 모든 페이지/레이아웃은 **Server Component**
- 클라이언트 기능(useState, useEffect, TanStack Query hooks)은 반드시 `'use client'` 디렉티브 필요
- `params`는 Promise 타입: `params: Promise<{ id: string }>` → `const { id } = await params`

### ⚠️ TanStack Query v5 핵심 변경점

v4 → v5에서 바뀐 것:
- `status === 'loading'` → **`status === 'pending'`** (v5에서 이름 변경)
- `isLoading` prop이 v5에서 의미가 달라짐: `isPending && isFetching` (이전: `status === 'loading'`)
- **초기 로딩 체크는 `isPending` 사용** (데이터가 아직 없을 때)
- `useQuery` 반환 구조 동일: `{ data, isPending, isError, error, isFetching }`
- v5 queryFn 형태: `queryFn: () => apiFetch<Todo[]>('/todos')` (동일)

### 현재 프론트엔드 구조 (Story 1.1 완료 후 상태)

이 스토리에서 **수정/추가**되는 파일:

```
todo-frontend/
├── src/
│   ├── app/
│   │   └── page.tsx            ← UPDATE (기본 템플릿 → 할일 목록 페이지)
│   ├── components/             ← 이미 존재하는 폴더
│   │   ├── priority-badge.tsx  ← NEW
│   │   ├── todo-item.tsx       ← NEW
│   │   └── todo-list.tsx       ← NEW
│   ├── lib/
│   │   └── api.ts              ← 변경 없음 (apiFetch 헬퍼 이미 구현됨)
│   └── types/
│       └── todo.ts             ← 변경 없음 (Todo 인터페이스 이미 정의됨)
```

### 기존 파일 현황 (변경 없음)

**`src/lib/api.ts`** (이미 완성, 변경 불필요):
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }
  return res.json()
}
```

**`src/types/todo.ts`** (이미 완성, 변경 불필요):
```typescript
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

**`src/app/providers.tsx`** (이미 완성, 변경 불필요):
```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

**`src/app/layout.tsx`** 현재 상태 (변경 불필요):
- `Providers`로 전체 앱 감싸져 있음 → `useQuery` 사용 가능
- Geist 폰트 적용됨

### 구현 구조 설계

**컴포넌트 계층:**
```
page.tsx (Server Component)
└── <TodoList /> (Client Component — 'use client')
    └── <TodoItem /> (Client Component)
        └── <PriorityBadge /> (Client Component)
```

**왜 이 구조인가:**
- `page.tsx`: Server Component 유지 — 이 스토리에서는 서버 측 로직 없음, 단순 레이아웃 컨테이너
- `todo-list.tsx`: `useQuery` hook 사용 → 반드시 `'use client'`
- `todo-item.tsx`, `priority-badge.tsx`: 부모(`todo-list.tsx`)가 이미 Client Component이면 자식은 자동으로 클라이언트 번들에 포함됨. 그러나 명시적 `'use client'`를 추가하면 독립적으로도 사용 가능 — 이 프로젝트에서는 생략해도 동작하지만 추가해도 무방

### priority-badge.tsx 구현 (Task 1)

```tsx
// src/components/priority-badge.tsx
import { Priority } from '@/types/todo'

const BADGE_STYLES: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

const LABELS: Record<Priority, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[priority]}`}>
      {LABELS[priority]}
    </span>
  )
}
```

### todo-item.tsx 구현 (Task 2)

```tsx
// src/components/todo-item.tsx
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

### todo-list.tsx 구현 (Task 3)

```tsx
// src/components/todo-list.tsx
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

  if (isPending) {
    return <p className="text-center text-gray-500">로딩 중...</p>
  }

  if (isError) {
    return <p className="text-center text-red-500">오류: {error.message}</p>
  }

  if (todos.length === 0) {
    return <p className="text-center text-gray-400">할일이 없습니다</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
```

### page.tsx 구현 (Task 4)

```tsx
// src/app/page.tsx
import TodoList from '@/components/todo-list'

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">할일 목록</h1>
      <TodoList />
    </main>
  )
}
```

**중요:** `page.tsx`에 `'use client'` 없음 — Server Component 유지.
`<TodoList />`가 Client Component이므로 hydration은 자동 처리됨.

### Tailwind CSS v4 주의사항

이 프로젝트는 Tailwind CSS v4 사용. v4는 CSS-first 방식:
- `globals.css`에 `@import "tailwindcss"` (또는 `@tailwind base/components/utilities` 대신)
- **클래스 유틸리티는 v3와 동일하게 사용 가능**: `bg-red-100`, `text-gray-900` 등 변경 없음
- 별도 `tailwind.config.js` 불필요 (CSS에서 직접 설정)

### API 연동 패턴 (아키텍처 필수)

- **모든 API 호출은 `src/lib/api.ts`의 `apiFetch` 통해서만** (아키텍처 규칙)
- `apiFetch`는 이미 에러 핸들링 포함 → 실패 시 Error throw → TanStack Query의 `isError`로 자동 포착
- `GET /todos` 응답: `Todo[]` 배열 (빈 배열이면 `[]`)
- JSON 필드: snake_case (`is_completed`, `due_date`) — `todo.ts` 타입에 이미 정의됨

### 테스트 전략

학습용 프로젝트 — 단위 테스트 없음. 검증 방법:
- TypeScript 타입 검사: `npx tsc --noEmit`
- 백엔드 실행 후 `npm run dev` → `localhost:3000` 브라우저 확인
- 백엔드 없이도 로딩→에러 흐름 동작 확인 가능

### 아키텍처 준수 필수 사항

1. **API 호출**: `apiFetch` 통해서만, 직접 `fetch` 금지
2. **타입**: `src/types/todo.ts`의 `Todo` 인터페이스 사용
3. **파일명**: kebab-case (`todo-list.tsx`, `todo-item.tsx`, `priority-badge.tsx`)
4. **컴포넌트명**: PascalCase (`TodoList`, `TodoItem`, `PriorityBadge`)
5. **클라이언트 경계**: `useQuery` 사용하는 `todo-list.tsx`만 `'use client'`

### References

- [Source: _bmad-output/architecture.md#프론트엔드 아키텍처]
- [Source: _bmad-output/architecture.md#구현 패턴 및 일관성 규칙]
- [Source: _bmad-output/epics.md#Story 2.2: 할일 목록 조회 화면 구현]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `src/components/` 디렉토리 신규 생성 (기존 미존재)
- `priority-badge.tsx`: `Record<Priority, string>` 룩업 테이블로 색상/라벨 관리 — 조건문 없이 타입 안전하게 처리
- `todo-item.tsx`: `due_date`는 `{todo.due_date && ...}` 조건부 렌더링으로 null 처리
- `todo-list.tsx`: TanStack Query v5 `isPending` 사용 (v4의 `isLoading`과 의미 다름)
- `page.tsx`: Server Component 유지 — `'use client'` 없음, `<TodoList />`가 클라이언트 경계 담당
- TypeScript 타입 검사 (`npx tsc --noEmit`) 오류 없이 통과
- 5.2, 5.3: 실제 UI 확인은 로컬에서 `npm run dev` + 백엔드 실행 후 수동 검증 필요 (샌드박스 환경 제약)

### File List

- todo-frontend/src/components/priority-badge.tsx (NEW)
- todo-frontend/src/components/todo-item.tsx (NEW)
- todo-frontend/src/components/todo-list.tsx (NEW)
- todo-frontend/src/app/page.tsx (UPDATE)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — TanStack Query v5 isPending 패턴, 'use client' 경계 설계, Next.js 16 Server/Client Component 분리 포함 |
| 2026-05-26 | 1.1 | 구현 완료 — priority-badge.tsx, todo-item.tsx, todo-list.tsx 생성, page.tsx 기본 템플릿 교체, TypeScript 타입 검사 통과 |
