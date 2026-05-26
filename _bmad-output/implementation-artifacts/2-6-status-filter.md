# Story 2.6: 상태 필터 구현

Status: review

## Story

As a 사용자,
I want 완료/미완료 상태로 할일을 필터링하고 싶다,
So that 남은 할일만 집중해서 볼 수 있다.

## Acceptance Criteria

1. 메인 페이지에 "전체 / 완료 / 미완료" 필터 탭이 표시된다
2. 기본 선택 탭은 "전체"다
3. "완료" 탭 선택 시 `GET /todos?status=completed` API가 호출되고 완료된 항목만 표시된다
4. "미완료" 탭 선택 시 `GET /todos?status=incomplete` API가 호출되고 미완료 항목만 표시된다
5. "전체" 탭 선택 시 `GET /todos` API가 호출되어 전체 목록이 표시된다
6. 선택된 탭이 시각적으로 강조(활성) 표시된다

## Tasks / Subtasks

- [x] Task 1: todo-list.tsx 업데이트 (AC: #1~#6)
  - [x] 1.1: `useState` import 추가, `Filter` 타입 정의 (`'all' | 'completed' | 'incomplete'`), `filter` state 추가 (기본값 `'all'`)
  - [x] 1.2: `queryKey`를 `['todos', filter]`로 변경 — 필터 값별로 별도 캐시 엔트리 생성
  - [x] 1.3: `queryFn`을 필터에 따라 URL 분기 — `filter === 'all'`이면 `/todos`, 그 외 `/todos?status=${filter}`
  - [x] 1.4: 얼리 리턴 방식 → 단일 JSX 반환 방식으로 리팩토링 (필터 탭이 항상 렌더링되도록)
  - [x] 1.5: 필터 탭 UI 추가 — 3개 버튼, 선택된 탭은 파란색(`bg-blue-600 text-white`), 비선택은 회색(`bg-gray-100 text-gray-600`)
  - [x] 1.6: 로딩/오류/빈 목록/목록 상태를 조건부 렌더링으로 표현

- [x] Task 2: 동작 검증 (AC: #1~#6)
  - [x] 2.1: TypeScript 타입 검사 통과 (`npx tsc --noEmit`)
  - [ ] 2.2: 필터 탭 3개 표시, 기본 "전체" 선택 확인 (로컬 수동 테스트)
  - [ ] 2.3: "완료" 탭 → `?status=completed` 호출, 완료 항목만 표시 확인
  - [ ] 2.4: "미완료" 탭 → `?status=incomplete` 호출, 미완료 항목만 표시 확인
  - [ ] 2.5: 선택된 탭 파란색 강조 확인

## Dev Notes

### 기술 스택 버전 (실제 확인된 환경)

- **Next.js**: 16.2.6 (App Router)
- **React**: 19.2.4
- **TanStack Query**: 5.100.14 (v5)
- **Tailwind CSS**: 4.x
- **TypeScript**: 5.x

### Story 2.5 학습 사항 (이전 스토리 패턴 계승)

- **TanStack Query v5**: `isPending` 사용, `invalidateQueries({ queryKey: [...] })` 객체 형태
- **`apiFetch`**: 모든 API 호출은 반드시 이 함수를 통해서만
- **`'use client'`**: `todo-list.tsx`에 이미 있음 — 재추가 불필요

### 현재 프론트엔드 구조 (Story 2.5 완료 후 상태)

이 스토리에서 **수정**되는 파일:

```
todo-frontend/
├── src/
│   ├── app/
│   │   └── page.tsx              ← 변경 없음
│   ├── components/
│   │   ├── todo-form.tsx         ← 변경 없음
│   │   ├── priority-badge.tsx    ← 변경 없음
│   │   ├── todo-item.tsx         ← 변경 없음
│   │   └── todo-list.tsx         ← UPDATE (filter state + 탭 UI)
│   ├── lib/
│   │   └── api.ts                ← 변경 없음
│   └── types/
│       └── todo.ts               ← 변경 없음
```

### `todo-list.tsx` 현재 상태 (이 스토리에서 UPDATE)

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

**현재 문제점**: 얼리 리턴 패턴이라 필터 탭을 로딩/오류/빈 상태 위에 항상 표시하기 어렵다. Task 1.4에서 단일 JSX 반환 방식으로 리팩토링 필요.

### 핵심 TanStack Query 패턴 — queryKey + 필터

```tsx
// filter 값이 바뀌면 TanStack Query가 자동으로 새 쿼리를 실행
const { data: todos, isPending, isError, error } = useQuery<Todo[]>({
  queryKey: ['todos', filter],   // ['todos', 'all'] | ['todos', 'completed'] | ['todos', 'incomplete']
  queryFn: () =>
    apiFetch<Todo[]>(filter === 'all' ? '/todos' : `/todos?status=${filter}`),
})
```

**왜 `['todos', filter]`인가?**
- 필터별 캐시 분리: `['todos', 'all']`, `['todos', 'completed']`, `['todos', 'incomplete']` 각각 독립적으로 캐시됨
- 필터 탭 전환 시 즉시 캐시 데이터 표시 (이전에 조회한 경우)
- `TodoForm`, `TodoItem`의 기존 `invalidateQueries({ queryKey: ['todos'] })`는 **여전히 정상 작동**: TanStack Query v5는 prefix 매칭으로 `['todos']`로 시작하는 모든 쿼리(`['todos', 'all']` 등)를 무효화함 → 기존 코드 수정 불필요

### todo-list.tsx 구현 (Task 1)

```tsx
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
```

### 백엔드 API 스펙 (Story 2.1 완료 상태)

```
GET /todos                       → 전체 목록 반환
GET /todos?status=completed      → is_completed=true인 항목만 반환
GET /todos?status=incomplete     → is_completed=false인 항목만 반환
Response 200: Todo[] (생성 순 정렬)
```

백엔드 `todo_router.py`의 현재 구현:
```python
@router.get("", response_model=list[TodoResponse])
def get_todos(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Todo)
    if status == "completed":
        query = query.filter(Todo.is_completed == True)
    elif status == "incomplete":
        query = query.filter(Todo.is_completed == False)
    return query.order_by(Todo.id).all()
```
→ 백엔드는 이미 `status` 쿼리 파라미터를 지원함 ✓

### 아키텍처 준수 필수 사항

1. **API 호출**: `apiFetch` 통해서만, 직접 `fetch` 금지
2. **`'use client'`**: 이미 있음 — 재추가 금지
3. **`useState` import 추가**: `'use client'` 파일에서 `useState` 추가 필요
4. **기존 `invalidateQueries` 수정 불필요**: `TodoForm`/`TodoItem`의 `['todos']` prefix 매칭이 `['todos', filter]`를 자동 무효화
5. **`page.tsx`**: 변경 없음 — `<TodoList />`가 필터 상태를 자체 관리

### 테스트 전략

학습용 프로젝트 — 단위 테스트 없음. 검증 방법:
- TypeScript 타입 검사: `npx tsc --noEmit`
- 필터 탭 3개 표시 + 기본 "전체" 파란색 강조 확인
- "완료" 탭 클릭 → 완료된 항목만 표시 확인
- "미완료" 탭 클릭 → 미완료 항목만 표시 확인
- 새 할일 추가/토글 후 현재 필터 결과가 갱신되는지 확인

### References

- [Source: _bmad-output/epics.md#Story 2.6: 상태 필터 구현]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `todo-list.tsx`: `useState` import 추가, `Filter` 타입(`'all' | 'completed' | 'incomplete'`) 정의
- `filter` state: 기본값 `'all'` → AC#2 만족
- `FILTER_LABELS` 상수 맵으로 탭 레이블 관리
- `queryKey: ['todos', filter]` — 필터 값별 별도 캐시, filter 변경 시 자동 재쿼리 → AC#3, AC#4, AC#5 만족
- `queryFn`: `filter === 'all'` → `/todos`, 그 외 `/todos?status=${filter}` → AC#3, AC#4, AC#5 만족
- 얼리 리턴 방식 → 단일 JSX 반환 방식으로 리팩토링: 필터 탭이 로딩/오류/빈 상태와 무관하게 항상 표시 → AC#1 만족
- 필터 탭: `filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'` 조건부 스타일 → AC#6 만족
- 기존 `TodoForm`/`TodoItem`의 `invalidateQueries({ queryKey: ['todos'] })`: TanStack Query prefix 매칭으로 `['todos', filter]` 자동 무효화 → 기존 코드 수정 불필요
- TypeScript 타입 검사 (`npx tsc --noEmit`) 오류 없이 통과
- 2.2~2.5: 실제 UI 동작은 로컬에서 `npm run dev` + 백엔드 실행 후 수동 확인 필요

### File List

- todo-frontend/src/components/todo-list.tsx (UPDATE)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — filter state, queryKey 분리, 필터 탭 UI, prefix 매칭 설명 포함 |
| 2026-05-26 | 1.1 | 구현 완료 — Filter 타입, filter state, queryKey 분리, 필터 탭 UI, 단일 JSX 반환, TypeScript 타입 검사 통과 |
