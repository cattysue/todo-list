---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: complete
completedAt: '2026-05-26'
inputDocuments:
  - _bmad-output/prds/prd-todo-list-2026-05-26/prd.md
workflowType: architecture
project_name: todo-list
user_name: Catty
date: 2026-05-26
---

# Architecture Decision Document

_이 문서는 단계별 협업적 발견을 통해 구성됩니다. 각 아키텍처 결정이 이루어질 때마다 섹션이 추가됩니다._

## 프로젝트 컨텍스트 분석

### 요구사항 개요

**기능 요구사항:**
FR-1~FR-8, 모두 단일 엔티티(Todo)에 대한 CRUD 작업.
추가(FR-1,2) / 완료 토글(FR-3) / 삭제(FR-4) / 수정(FR-5) / 목록 조회+필터(FR-6,7) / 우선순위 표시(FR-8)

**비기능 요구사항:**
- 인증 불필요 (단일 사용자)
- 기본 웹 성능 수준으로 충분
- Railway 배포 가능한 구조

**규모 및 복잡도:**
- 복잡도: 낮음 (학습용 프로젝트)
- 주요 도메인: 풀스택 웹
- 핵심 아키텍처 컴포넌트: 3개 (Frontend / API / DB)

### 기술 제약 및 의존성

- 스택 확정: Next.js + FastAPI + Supabase + Railway
- Next.js(프론트) ↔ FastAPI(백엔드) 간 CORS 설정 필요
- Supabase = PostgreSQL 기반, FastAPI ORM 연동 필요

### 교차 관심사

- **에러 처리:** API 응답 에러 → UI 메시지 표시 (FR-1, FR-5)
- **입력 유효성:** 제목 필수 검사 (프론트 + 백엔드 양측)
- **환경 변수 관리:** Supabase URL/Key, API URL 등
- **배포 구성:** Railway에서 프론트/백엔드 각각 서비스로 배포

## 스타터 템플릿 평가

### 기술 도메인

풀스택 웹 (프론트엔드 + 백엔드 + DB 분리 구조)

### Frontend: Next.js

**초기화 명령어:**

```bash
npx create-next-app@latest todo-frontend \
  --typescript --tailwind --eslint --app --src-dir --use-npm
```

**스타터가 결정하는 사항:**

- **언어:** TypeScript
- **스타일링:** Tailwind CSS v4
- **라우팅:** App Router
- **코드 구성:** `src/` 디렉토리
- **린팅:** ESLint (Next.js 규칙)

### Backend: FastAPI

공식 CLI 스타터 없음 — 레이어 기반 구조로 수동 설정.

**초기화 명령어:**

```bash
mkdir todo-backend && cd todo-backend
python -m venv venv
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
```

**프로젝트 구조 (레이어 기반):**

```
todo-backend/
├── main.py
├── routers/    ← HTTP 엔드포인트
├── schemas/    ← 요청/응답 검증 (Pydantic)
├── models/     ← DB 모델 (SQLAlchemy)
└── core/       ← 설정, DB 연결
```

**참고:** 프로젝트 초기화는 첫 번째 구현 스토리가 되어야 한다.

## 핵심 아키텍처 결정

### 결정 우선순위 분석

**구현 차단 결정 (Critical):**
- Supabase 연결 방식 → SQLAlchemy + psycopg2
- 프론트엔드 데이터 패칭 → TanStack Query
- CORS 설정 → FastAPI에서 Next.js 도메인 허용

**아키텍처 형성 결정 (Important):**
- REST API 엔드포인트 패턴 확정
- Railway 서비스 분리 구조
- 환경 변수 관리 방식

**지연 결정 (Post-MVP):**
- 성능 최적화, 모니터링, 로깅

### 데이터 아키텍처

- **DB 연결:** SQLAlchemy + psycopg2 (FastAPI → Supabase PostgreSQL 직접 연결)
- **데이터 검증:** Pydantic (FastAPI 기본, 요청/응답 스키마 분리)
- **마이그레이션:** Alembic (DB 스키마 버전 관리)
- **핵심 테이블:** `todos` (id, title, due_date, priority, is_completed, created_at)

### 인증 및 보안

- **인증:** 없음 (단일 사용자 앱)
- **CORS:** FastAPI CORSMiddleware로 Next.js 도메인만 허용
- **API 보안:** 학습용 프로젝트로 추가 보안 레이어 미적용

### API 및 통신 패턴

**REST 엔드포인트:**

| 메서드 | 경로 | 기능 |
|--------|------|------|
| GET | /todos | 전체 목록 조회 (필터 파라미터 포함) |
| POST | /todos | 할일 생성 |
| PUT | /todos/{id} | 할일 수정 |
| PATCH | /todos/{id}/toggle | 완료 상태 토글 |
| DELETE | /todos/{id} | 할일 삭제 |

- **에러 처리:** FastAPI HTTPException 표준 활용
- **API 문서:** FastAPI 자동 생성 `/docs` (Swagger UI)

### 프론트엔드 아키텍처

- **서버 상태 관리:** TanStack Query (로딩/에러/캐싱 자동 처리)
- **컴포넌트 구조:** App Router 기반, `src/app` 디렉토리
- **API 호출 레이어:** `src/lib/api.ts` 에서 중앙 관리
- **UI 스타일링:** Tailwind CSS v4

### 인프라 및 배포

- **Railway 구조:** Frontend 서비스 + Backend 서비스 (분리 배포)
- **환경 변수:**
  - 로컬: `.env.local` (Next.js), `.env` (FastAPI)
  - 프로덕션: Railway 대시보드 환경 변수

### 결정 영향 분석

**구현 순서:**
1. DB 스키마 설계 (Supabase 테이블 생성)
2. FastAPI 백엔드 (모델 → 스키마 → 라우터)
3. Next.js 프론트엔드 (TanStack Query 설정 → 컴포넌트)
4. Railway 배포 설정

**컴포넌트 간 의존성:**
- Frontend → Backend API (CORS 설정 필요)
- Backend → Supabase (환경 변수로 DB URL 관리)
- 양측 → Railway (환경 변수 동기화 필요)

## 구현 패턴 및 일관성 규칙

### 네이밍 패턴

**DB 네이밍 (PostgreSQL/Supabase):**
- 테이블명: 복수형 snake_case → `todos`
- 컬럼명: snake_case → `is_completed`, `due_date`, `created_at`
- PK: `id` (UUID 또는 serial)

**API 네이밍:**
- 엔드포인트: 복수형 → `/todos`, `/todos/{id}`
- JSON 필드: snake_case (FastAPI 기본) → `is_completed`, `due_date`
- 쿼리 파라미터: snake_case → `?status=completed`

**코드 네이밍:**
- Python (FastAPI): snake_case 함수·변수, PascalCase 클래스
- TypeScript (Next.js): camelCase 변수·함수, PascalCase 컴포넌트
- 파일명: kebab-case → `todo-list.tsx`, `todo_router.py`

### 구조 패턴

**Frontend 컴포넌트 구조:**

```
src/
├── app/          ← Next.js App Router 페이지
├── components/   ← 재사용 UI 컴포넌트
├── lib/
│   └── api.ts    ← 모든 API 호출 중앙 관리
└── types/
    └── todo.ts   ← 공유 타입 정의
```

**Backend 레이어 규칙:**
- `routers/` → HTTP만, 비즈니스 로직 금지
- `schemas/` → 요청·응답 Pydantic 모델
- `models/` → SQLAlchemy DB 모델

### 포맷 패턴

**API 응답 형식 (직접 반환):**

```json
// 성공 (목록)
[{"id": 1, "title": "...", "is_completed": false}]

// 성공 (단건)
{"id": 1, "title": "...", "is_completed": false}

// 에러
{"detail": "에러 메시지"}
```

**날짜 형식:** ISO 8601 문자열 → `"2026-05-26"`

### 프로세스 패턴

**에러 처리:**
- Backend: `HTTPException(status_code=404, detail="Todo not found")`
- Frontend: TanStack Query의 `error` 상태 → 토스트 또는 인라인 메시지

**로딩 상태:**
- TanStack Query `isLoading` / `isFetching` 사용
- 로딩 중 버튼 비활성화 (중복 요청 방지)

**입력 검증:**
- Backend: Pydantic 스키마 (필수)
- Frontend: HTML required 속성 + 최소 클라이언트 검증

### 모든 AI 에이전트 준수 사항

- JSON 필드는 반드시 snake_case 사용
- API 호출은 반드시 `src/lib/api.ts` 통해서만
- 라우터 함수에 비즈니스 로직 작성 금지
- 환경 변수는 `.env` 파일에서만 관리

## 프로젝트 구조 및 경계

### 전체 디렉토리 구조

**루트 (모노레포 스타일):**

```
todo-list/
├── todo-frontend/             ← Next.js 앱
└── todo-backend/              ← FastAPI 앱
```

**Frontend (todo-frontend/):**

```
todo-frontend/
├── .env.local                 ← 로컬 환경 변수 (NEXT_PUBLIC_API_URL)
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── app/
    │   ├── layout.tsx         ← 루트 레이아웃
    │   ├── globals.css
    │   └── page.tsx           ← 메인 페이지 (FR-6,7: 목록+필터)
    ├── components/
    │   ├── todo-form.tsx      ← FR-1,2: 할일 추가/수정 폼
    │   ├── todo-item.tsx      ← FR-3,4: 완료 토글·삭제
    │   ├── todo-list.tsx      ← FR-6: 전체 목록 렌더링
    │   ├── filter-tabs.tsx    ← FR-7: 전체/완료/미완료 필터
    │   └── priority-badge.tsx ← FR-8: 우선순위 색상 배지
    ├── lib/
    │   └── api.ts             ← 모든 FastAPI 호출 중앙 관리
    └── types/
        └── todo.ts            ← Todo 타입 정의
```

**Backend (todo-backend/):**

```
todo-backend/
├── .env                       ← 로컬 환경 변수 (DATABASE_URL)
├── .env.example
├── .gitignore
├── requirements.txt
├── main.py                    ← FastAPI 앱 진입점, CORS 설정
├── routers/
│   └── todo_router.py         ← FR-1~8: 모든 Todo 엔드포인트
├── schemas/
│   └── todo_schema.py         ← TodoCreate, TodoUpdate, TodoResponse
├── models/
│   └── todo_model.py          ← SQLAlchemy Todo 모델
└── core/
    ├── database.py            ← DB 연결·세션 관리
    └── config.py              ← 환경 변수 설정 (Pydantic Settings)
```

### 아키텍처 경계

**API 경계:**

| 엔드포인트 | 파일 위치 | 담당 FR |
|-----------|-----------|---------|
| GET /todos | `routers/todo_router.py` | FR-6, FR-7 |
| POST /todos | `routers/todo_router.py` | FR-1, FR-2 |
| PUT /todos/{id} | `routers/todo_router.py` | FR-5 |
| PATCH /todos/{id}/toggle | `routers/todo_router.py` | FR-3 |
| DELETE /todos/{id} | `routers/todo_router.py` | FR-4 |

**컴포넌트 경계:**
- 모든 API 호출 → `src/lib/api.ts` (컴포넌트에서 직접 fetch 금지)
- TanStack Query 훅 → 각 컴포넌트 내부 사용

**데이터 경계:**
- DB 스키마: `todos` 테이블 1개
- 단방향 흐름: Frontend → FastAPI → Supabase

### 데이터 흐름

```
사용자 액션
    ↓
Next.js 컴포넌트 (TanStack Query mutation/query)
    ↓
src/lib/api.ts (HTTP 요청)
    ↓
FastAPI routers/ (HTTP 처리)
    ↓
FastAPI schemas/ (Pydantic 검증)
    ↓
FastAPI models/ (SQLAlchemy)
    ↓
Supabase PostgreSQL (todos 테이블)
```

### 배포 구조 (Railway)

- **Frontend 서비스:** `todo-frontend/` → Railway Node 환경, `NEXT_PUBLIC_API_URL` 설정
- **Backend 서비스:** `todo-backend/` → Railway Python 환경, `DATABASE_URL` 설정

## 아키텍처 검증 결과

### 일관성 검증 ✅

모든 기술 선택이 호환됨. Next.js + TanStack Query + Tailwind, FastAPI + SQLAlchemy + Pydantic, Supabase PostgreSQL 충돌 없음. snake_case 네이밍이 DB·API·코드 전반에 일관되게 적용됨.

### 요구사항 커버리지 검증 ✅

FR-1~FR-8 전체가 특정 컴포넌트 또는 엔드포인트에 매핑됨. 비기능 요구사항(단일 사용자, 인증 없음, Railway 배포) 모두 반영됨.

### 구현 준비도 검증 ✅

모든 결정이 문서화됨. 구조가 구체적이고 완전함. AI 에이전트 충돌 방지 패턴 정의됨.

### 갭 분석

**소규모 갭 (구현 단계에서 처리):**
- Railway 배포 config 파일 (Procfile, railway.toml) 미정의
- Alembic 마이그레이션 초기 스크립트 미정의
- 테스트 구조 미정의 (학습용 프로젝트, 선택사항)

### 아키텍처 완성도 체크리스트

**요구사항 분석**
- [x] 프로젝트 컨텍스트 분석 완료
- [x] 규모 및 복잡도 평가 완료
- [x] 기술 제약사항 식별 완료
- [x] 교차 관심사 매핑 완료

**아키텍처 결정**
- [x] 핵심 결정 버전 포함 문서화
- [x] 기술 스택 완전 명시
- [x] 통합 패턴 정의
- [x] 성능 고려사항 반영

**구현 패턴**
- [x] 네이밍 규칙 확립
- [x] 구조 패턴 정의
- [x] 통신 패턴 명시
- [x] 프로세스 패턴 문서화

**프로젝트 구조**
- [x] 전체 디렉토리 구조 정의
- [x] 컴포넌트 경계 확립
- [x] 통합 지점 매핑
- [x] FR→구조 매핑 완료

### 아키텍처 준비도 평가

**전체 상태:** READY FOR IMPLEMENTATION
**신뢰도:** 높음

**강점:**
- 단순하고 명확한 단일 엔티티 구조
- FR→파일 매핑이 구체적이어서 에이전트 혼란 없음
- 학습 목표에 적합한 적절한 복잡도

**향후 개선 영역:**
- 우선순위/마감날짜 기준 정렬 기능 추가 가능
- 사용자 인증 레이어 추가 시 Supabase Auth 활용 가능

### 구현 핸드오프

**첫 번째 구현 우선순위:**

```bash
# 1. Frontend 초기화
npx create-next-app@latest todo-frontend \
  --typescript --tailwind --eslint --app --src-dir --use-npm

# 2. Backend 초기화
mkdir todo-backend && cd todo-backend
python -m venv venv
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv alembic
```
