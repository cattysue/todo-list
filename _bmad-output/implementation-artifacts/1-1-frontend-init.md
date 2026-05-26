# Story 1.1: Frontend 프로젝트 초기화

Status: review

## Story

As a 개발자,
I want Next.js 프론트엔드 프로젝트를 초기화하고 TanStack Query와 API 레이어를 설정하고 싶다,
So that UI 개발을 시작할 수 있다.

## Acceptance Criteria

1. `npx create-next-app@latest todo-frontend --typescript --tailwind --eslint --app --src-dir --use-npm` 실행 후 `@tanstack/react-query` 설치 시, `src/app/`, `src/components/`, `src/lib/api.ts`, `src/types/todo.ts` 디렉토리/파일 구조가 존재한다.
2. `QueryClientProvider`가 `src/app/layout.tsx` 루트 레이아웃에 등록된다 (별도 Providers 클라이언트 컴포넌트를 통해).
3. `src/lib/api.ts`에 `NEXT_PUBLIC_API_URL` 환경 변수를 읽는 기본 fetch 헬퍼 함수가 구현된다.
4. `.env.local`과 `.env.example`이 `NEXT_PUBLIC_API_URL` 키와 함께 생성된다.
5. `npm run dev` 실행 시 `localhost:3000`에서 앱이 정상 기동된다.

## Tasks / Subtasks

- [x] Task 1: Next.js 프로젝트 초기화 및 의존성 설치 (AC: #1)
  - [x] 1.1: `todo-list/` 루트에서 create-next-app 명령어 실행 (`npx create-next-app@latest todo-frontend --typescript --tailwind --eslint --app --src-dir --use-npm`)
  - [x] 1.2: `todo-frontend/` 디렉토리 내에서 `npm install @tanstack/react-query` 설치
  - [x] 1.3: `src/types/` 디렉토리 생성 및 `src/types/todo.ts` 파일 생성 (Todo 타입 정의)
  - [x] 1.4: `src/lib/` 디렉토리 생성 확인 (없으면 생성)
- [x] Task 2: QueryClientProvider 설정 (AC: #2)
  - [x] 2.1: `src/app/providers.tsx` 클라이언트 컴포넌트 생성 (QueryClient + QueryClientProvider)
  - [x] 2.2: `src/app/layout.tsx`에 Providers import 및 children 감싸기
- [x] Task 3: API 레이어 구현 (AC: #3)
  - [x] 3.1: `src/lib/api.ts` 생성 — `NEXT_PUBLIC_API_URL` 기반 범용 fetch 헬퍼 함수 구현
- [x] Task 4: 환경 변수 파일 생성 (AC: #4)
  - [x] 4.1: `todo-frontend/.env.local` 생성 (`NEXT_PUBLIC_API_URL=http://localhost:8000`)
  - [x] 4.2: `todo-frontend/.env.example` 생성 (`NEXT_PUBLIC_API_URL=<your-api-url>`)
- [x] Task 5: 기동 검증 (AC: #5)
  - [x] 5.1: `npm run dev` 실행 후 `localhost:3000` 정상 기동 및 컴파일 에러 없음 확인

## Dev Notes

### 기술 스택 버전

- **Next.js**: 15.x (App Router, TypeScript, src/ 디렉토리)
- **TanStack Query**: v5.x (`@tanstack/react-query`) — v4와 주요 API 변경 있음 (아래 참고)
- **Tailwind CSS**: v4 (--tailwind 플래그로 자동 설정됨, CSS-first 방식)
- **패키지 매니저**: npm (`--use-npm` 플래그)

### 중요: TanStack Query v5 설정 — Next.js App Router 주의사항

Next.js App Router에서 `layout.tsx`는 Server Component다. `QueryClientProvider`는 클라이언트 훅이므로 **직접 `layout.tsx`에 넣으면 오류 발생**.
반드시 별도의 Client Component(`providers.tsx`)를 생성해 거기서 QueryClientProvider를 렌더링한 뒤, `layout.tsx`에서 import해야 한다.

```tsx
// src/app/providers.tsx  ← NEW 파일
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**`useState`로 QueryClient 생성하는 이유**: Next.js App Router SSR 환경에서 모듈 범위 변수는 요청 간 공유됨. `useState`를 쓰면 각 컴포넌트 인스턴스가 독립된 QueryClient를 가진다.

```tsx
// src/app/layout.tsx  ← 기존 파일 수정 (메타데이터·html 구조는 유지)
import { Providers } from './providers'
// ... 기존 import 유지

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={/* 기존 font 클래스 유지 */}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### API 레이어 구현 (`src/lib/api.ts`)

**아키텍처 규칙**: 모든 FastAPI 호출은 이 파일을 통해서만. 컴포넌트에서 직접 `fetch()` 호출 금지.

Story 1.1에서는 기반 헬퍼만 구현. Todo CRUD 함수들은 Story 2.x에서 이 파일에 추가됨.

```typescript
// src/lib/api.ts  ← NEW 파일
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }
  return res.json()
}
```

### Todo 타입 정의 (`src/types/todo.ts`)

DB 스키마(`todos` 테이블)와 완전히 일치해야 함. **snake_case 필드명 필수** (아키텍처 규칙).

```typescript
// src/types/todo.ts  ← NEW 파일
export interface Todo {
  id: number
  title: string
  due_date: string | null   // ISO 8601: "2026-05-26", null이면 미설정
  priority: 'high' | 'medium' | 'low'
  is_completed: boolean
  created_at: string        // ISO 8601 datetime
}

export type Priority = Todo['priority']
```

**절대 금지**: `dueDate`, `isCompleted`, `createdAt` 같은 camelCase 필드명 사용 — API 응답이 snake_case이므로 타입도 맞춰야 함.

### 프로젝트 디렉토리 구조

이 스토리는 `todo-list/` 루트(프로젝트 루트)에서 `todo-frontend/` 서브디렉토리를 생성한다.

```
todo-list/                          ← 프로젝트 루트 (현재 작업 디렉토리)
├── _bmad-output/                   ← BMAD 산출물 (건드리지 말 것)
├── todo-frontend/                  ← 이 스토리에서 생성
│   ├── .env.local                  ← NEW (NEXT_PUBLIC_API_URL=http://localhost:8000)
│   ├── .env.example                ← NEW (NEXT_PUBLIC_API_URL=<your-api-url>)
│   ├── .gitignore                  ← create-next-app 자동 생성 (.env.local 포함 확인)
│   ├── next.config.ts              ← create-next-app 자동 생성
│   ├── package.json                ← create-next-app 자동 생성
│   ├── tsconfig.json               ← create-next-app 자동 생성
│   └── src/
│       ├── app/
│       │   ├── layout.tsx          ← UPDATE: Providers 래퍼 추가
│       │   ├── page.tsx            ← 그대로 유지 (기본 Next.js 페이지)
│       │   ├── globals.css         ← create-next-app 자동 생성
│       │   └── providers.tsx       ← NEW: QueryClientProvider 클라이언트 컴포넌트
│       ├── components/             ← create-next-app이 생성 (비어있어도 됨)
│       ├── lib/
│       │   └── api.ts              ← NEW: 중앙 API 레이어
│       └── types/
│           └── todo.ts             ← NEW: Todo 타입 정의
└── todo-backend/                   ← Story 1.2에서 생성 (아직 없음)
```

### Tailwind CSS v4 주의사항

`create-next-app --tailwind` 플래그가 v4를 자동 설정함. v4의 특징:
- `globals.css`에 `@import "tailwindcss"` 방식 사용 (기존 `@tailwind base/components/utilities` 지시어 없음)
- `tailwind.config.ts`는 선택사항 (없어도 동작)
- create-next-app이 생성한 설정 파일을 임의로 수정하지 말 것

### .gitignore 확인 사항

create-next-app이 `.gitignore`를 자동 생성함. `.env.local`이 ignore 목록에 포함되어 있는지 확인. `.env.example`은 반드시 git 추적 대상에 포함되어야 함.

### 테스트 전략

이 스토리는 프로젝트 설정 스토리이므로 단위 테스트 없음. 검증 방법:
- `npm run dev` 실행 후 에러 없이 기동 확인 → AC #5 충족
- `localhost:3000` 접속 시 Next.js 기본 페이지 표시 확인
- TypeScript 컴파일 에러 없음 (`npx tsc --noEmit` 또는 빌드 시 확인)

### 아키텍처 준수 필수 사항 (모든 AI 에이전트 공통)

1. **API 호출**: 반드시 `src/lib/api.ts` 통해서만, 컴포넌트에서 직접 `fetch()` 금지
2. **JSON 필드명**: snake_case (`is_completed`, `due_date`) — camelCase 절대 금지
3. **파일명**: kebab-case (`todo-form.tsx`, `filter-tabs.tsx`)
4. **컴포넌트명**: PascalCase (`TodoForm`, `FilterTabs`)
5. **환경 변수**: `.env.local` 파일에서만 관리, 코드 내 하드코딩 금지

### References

- [Source: _bmad-output/architecture.md#프론트엔드 아키텍처]
- [Source: _bmad-output/architecture.md#구현 패턴 및 일관성 규칙]
- [Source: _bmad-output/architecture.md#전체 디렉토리 구조]
- [Source: _bmad-output/epics.md#Story 1.1: Frontend 프로젝트 초기화]
- [Source: _bmad-output/prds/prd-todo-list-2026-05-26/prd.md#6. MVP 범위]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Next.js 16.2.6 (Turbopack 기본 번들러) + React 19.2.4 설치됨
- TanStack Query v5.100.14 설치, useState 패턴으로 QueryClient 생성
- providers.tsx를 별도 'use client' 컴포넌트로 분리해 layout.tsx(Server Component)와 호환
- .gitignore의 `.env*` 패턴이 `.env.example`도 무시하므로 `!.env.example` 예외 추가
- TypeScript 타입 체크(tsc --noEmit) 통과, 개발 서버 445ms 내 기동 확인

### File List

- todo-frontend/.env.example (NEW)
- todo-frontend/.env.local (NEW)
- todo-frontend/.gitignore (UPDATE: !.env.example 예외 추가)
- todo-frontend/src/app/layout.tsx (UPDATE: Providers 래퍼 추가)
- todo-frontend/src/app/providers.tsx (NEW)
- todo-frontend/src/lib/api.ts (NEW)
- todo-frontend/src/types/todo.ts (NEW)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — Ultimate context engine 분석 완료 |
| 2026-05-26 | 1.1 | 구현 완료 — Next.js 16.2.6 초기화, TanStack Query v5, API 레이어, 환경변수 설정 |
