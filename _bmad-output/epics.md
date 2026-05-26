---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: '2026-05-26'
inputDocuments:
  - _bmad-output/prds/prd-todo-list-2026-05-26/prd.md
  - _bmad-output/architecture.md
---

# todo-list - Epic Breakdown

## Overview

이 문서는 todo-list 프로젝트의 PRD와 아키텍처 요구사항을 구현 가능한 에픽과 스토리로 분해합니다.

## Requirements Inventory

### Functional Requirements

FR-1: 사용자는 제목을 입력하여 할일을 생성할 수 있다. 제목이 비어 있으면 저장 불가. 마감날짜는 선택 입력. 저장 후 목록에 즉시 반영.
FR-2: 할일 생성 시 우선순위를 지정하지 않으면 기본값은 중간(Medium)으로 설정된다.
FR-3: 사용자는 할일의 완료 상태를 완료↔미완료로 토글할 수 있다. 토글 즉시 UI 및 DB에 반영. 완료 항목은 취소선으로 시각적 구분.
FR-4: 사용자는 할일을 삭제할 수 있다. 삭제 즉시 목록에서 제거. 영구 삭제, 복구 없음.
FR-5: 사용자는 할일의 제목, 마감날짜, 우선순위를 수정할 수 있다. 수정 후 저장 즉시 목록에 반영. 제목 비워두면 오류.
FR-6: 사용자는 저장된 모든 할일을 목록으로 볼 수 있다. 페이지 진입 시 전체 할일 표시. 생성 순 정렬.
FR-7: 사용자는 전체 / 완료 / 미완료 중 하나를 선택해 목록을 필터링할 수 있다. 기본 필터는 "전체".
FR-8: 목록에서 각 할일의 우선순위가 색상 배지로 시각적으로 구분되어 표시된다. 높음/중간/낮음이 서로 다른 색상.

### NonFunctional Requirements

NFR-1: 단일 사용자 앱 — 인증·로그인 불필요.
NFR-2: Railway에 프론트엔드와 백엔드를 각각 독립 서비스로 배포 가능한 구조.
NFR-3: 기본 웹 성능 수준 (일반적인 CRUD 응답 속도).
NFR-4: 환경 변수는 .env 파일로 관리, 하드코딩 금지.

### Additional Requirements

- AR-1: [스타터 템플릿] Frontend 초기화: `npx create-next-app@latest todo-frontend --typescript --tailwind --eslint --app --src-dir --use-npm`
- AR-2: [스타터 템플릿] Backend 초기화: FastAPI + SQLAlchemy + psycopg2-binary + python-dotenv + alembic
- AR-3: [DB 설계] Supabase PostgreSQL에 `todos` 테이블 생성 (id, title, due_date, priority, is_completed, created_at)
- AR-4: [CORS] FastAPI에 CORSMiddleware 설정 — Next.js 도메인만 허용
- AR-5: [Frontend 상태] TanStack Query로 서버 상태 관리 (설치 및 QueryClientProvider 설정 필요)
- AR-6: [배포] Railway에 Frontend 서비스 + Backend 서비스 각각 배포 설정
- AR-7: [패턴] 모든 API 호출은 `src/lib/api.ts` 통해서만, JSON 필드는 snake_case, 라우터에 비즈니스 로직 금지

### UX Design Requirements

UX 설계 문서 없음 — 해당 없음.

### FR Coverage Map

AR-1: Epic 1 — Frontend(Next.js) 프로젝트 초기화
AR-2: Epic 1 — Backend(FastAPI) 프로젝트 초기화
AR-3: Epic 1 — Supabase todos 테이블 생성
AR-4: Epic 1 — FastAPI CORS 설정
AR-5: Epic 1 — TanStack Query 설치 및 설정
FR-1: Epic 2 — 할일 생성 (제목 필수, 마감날짜 선택)
FR-2: Epic 2 — 우선순위 기본값 Medium 설정
FR-3: Epic 2 — 완료 상태 토글
FR-4: Epic 2 — 할일 삭제
FR-5: Epic 2 — 할일 수정
FR-6: Epic 2 — 전체 목록 조회 (생성 순)
FR-7: Epic 2 — 상태 필터 (전체/완료/미완료)
FR-8: Epic 2 — 우선순위 색상 배지 표시
AR-6: Epic 3 — Railway 서비스 배포 설정
AR-7: Epic 3 — 프로덕션 환경 변수 적용

## Epic List

### Epic 1: 프로젝트 기반 설정
로컬에서 Next.js ↔ FastAPI ↔ Supabase가 연결되어 개발 환경이 완전히 준비된다.
**FRs covered:** AR-1, AR-2, AR-3, AR-4, AR-5

### Epic 2: 할일 전체 관리 기능
사용자가 할일을 추가·조회·완료·삭제·수정·필터·우선순위로 완전히 관리할 수 있다.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8

### Epic 3: Railway 배포
앱이 Railway에 배포되어 공개 URL로 접근 가능하다.
**FRs covered:** AR-6, AR-7

---

## Epic 1: 프로젝트 기반 설정

로컬에서 Next.js ↔ FastAPI ↔ Supabase가 연결되어 개발 환경이 완전히 준비된다.

### Story 1.1: Frontend 프로젝트 초기화

As a 개발자,
I want Next.js 프론트엔드 프로젝트를 초기화하고 TanStack Query와 API 레이어를 설정하고 싶다,
So that UI 개발을 시작할 수 있다.

**Acceptance Criteria:**

**Given** Node.js와 npm이 설치된 개발 환경에서
**When** `npx create-next-app@latest todo-frontend --typescript --tailwind --eslint --app --src-dir --use-npm` 실행 후 `@tanstack/react-query`를 설치할 때
**Then** `src/app/`, `src/components/`, `src/lib/api.ts`, `src/types/todo.ts` 디렉토리 구조가 생성된다
**And** `QueryClientProvider`가 `src/app/layout.tsx` 루트 레이아웃에 등록된다
**And** `src/lib/api.ts`에 `NEXT_PUBLIC_API_URL` 환경 변수를 읽는 기본 fetch 헬퍼 함수가 구현된다
**And** `.env.local`과 `.env.example`이 `NEXT_PUBLIC_API_URL` 키와 함께 생성된다
**And** `npm run dev` 실행 시 `localhost:3000`에서 앱이 정상 기동된다

### Story 1.2: Backend 프로젝트 초기화 및 CORS 설정

As a 개발자,
I want FastAPI 백엔드 프로젝트를 초기화하고 CORS를 설정하고 싶다,
So that API 개발과 프론트엔드 연결을 시작할 수 있다.

**Acceptance Criteria:**

**Given** Python 3.11+ 환경에서
**When** `todo-backend/` 디렉토리에 가상환경 생성 후 `fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv alembic` 설치할 때
**Then** `main.py`, `routers/`, `schemas/`, `models/`, `core/` 폴더 구조가 생성된다
**And** `main.py`에 FastAPI 앱이 생성되고 `CORSMiddleware`가 등록되며 `localhost:3000` 도메인이 허용된다
**And** `core/config.py`에 Pydantic Settings로 `DATABASE_URL` 환경 변수 로딩이 구현된다
**And** `.env`와 `.env.example`이 `DATABASE_URL` 키와 함께 생성된다
**And** `uvicorn main:app --reload` 실행 시 `localhost:8000`에서 서버가 정상 기동된다
**And** `localhost:8000/docs`에서 Swagger UI가 접근 가능하다

### Story 1.3: Supabase DB 설계 및 연결

As a 개발자,
I want Supabase에 todos 테이블을 생성하고 FastAPI와 연결하고 싶다,
So that 할일 데이터를 저장하고 조회할 수 있다.

**Acceptance Criteria:**

**Given** Supabase 프로젝트가 생성된 상태에서
**When** Supabase SQL 에디터에서 테이블 생성 SQL을 실행할 때
**Then** `todos(id SERIAL PRIMARY KEY, title VARCHAR NOT NULL, due_date DATE NULL, priority VARCHAR NOT NULL DEFAULT 'medium', is_completed BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMP DEFAULT now())` 테이블이 생성된다
**And** `core/database.py`에 SQLAlchemy 엔진과 `SessionLocal`이 설정된다
**And** `models/todo_model.py`에 `Todo` SQLAlchemy 모델이 위 테이블 구조와 일치하게 정의된다
**And** FastAPI 앱 기동 시 DB 연결 오류 없이 정상 기동된다
**And** Supabase 대시보드에서 `todos` 테이블이 확인된다

---

## Epic 2: 할일 전체 관리 기능

사용자가 할일을 추가·조회·완료·삭제·수정·필터·우선순위로 완전히 관리할 수 있다.

### Story 2.1: Backend Todo API 전체 구현

As a 개발자,
I want 모든 Todo CRUD API 엔드포인트를 구현하고 싶다,
So that 프론트엔드가 데이터를 주고받을 수 있다.

**Acceptance Criteria:**

**Given** Epic 1이 완료되어 DB 연결이 준비된 상태에서
**When** `schemas/todo_schema.py`와 `routers/todo_router.py`에 모든 엔드포인트를 구현할 때
**Then** `GET /todos` — 전체 목록 반환 (선택적 `status` 쿼리 파라미터로 필터링)
**And** `POST /todos` — title 필수, due_date/priority 선택, priority 기본값 'medium', 생성된 Todo 반환
**And** `PUT /todos/{id}` — title/due_date/priority 수정, 수정된 Todo 반환, 없으면 404
**And** `PATCH /todos/{id}/toggle` — is_completed 반전, 업데이트된 Todo 반환
**And** `DELETE /todos/{id}` — 삭제 성공 시 204, 없으면 404
**And** title이 빈 문자열이면 422 응답 반환
**And** `localhost:8000/docs`에서 모든 엔드포인트 확인 가능

### Story 2.2: 할일 목록 조회 화면 구현

As a 사용자,
I want 앱에 접속하면 저장된 할일 목록을 보고 싶다,
So that 무엇을 해야 할지 파악할 수 있다.

**Acceptance Criteria:**

**Given** 앱(`localhost:3000`)에 접속한 상태에서
**When** 메인 페이지가 로드될 때
**Then** TanStack Query `useQuery`로 `GET /todos`를 호출하여 전체 할일 목록이 표시된다
**And** 각 할일 항목에 제목, 마감날짜(있으면), 우선순위 배지가 표시된다
**And** 우선순위 배지는 높음(빨강)/중간(노랑)/낮음(초록) 색상으로 구분된다
**And** 할일이 없으면 "할일이 없습니다" 빈 상태 메시지가 표시된다
**And** 데이터 로딩 중 로딩 인디케이터가 표시된다

### Story 2.3: 할일 추가 기능 구현

As a 사용자,
I want 새 할일을 추가하고 싶다,
So that 해야 할 일을 기록할 수 있다.

**Acceptance Criteria:**

**Given** 메인 페이지의 추가 폼에서
**When** 제목을 입력하고 저장 버튼을 클릭할 때
**Then** `POST /todos` API가 호출되고 새 할일이 목록에 즉시 추가된다
**And** 제목 미입력 상태에서 저장 시 오류 메시지가 표시되고 API가 호출되지 않는다
**And** 마감날짜와 우선순위는 선택 입력이며 미입력 시 priority는 'medium'으로 저장된다
**And** 저장 성공 후 폼 입력값이 초기화된다
**And** 저장 중 저장 버튼이 비활성화된다

### Story 2.4: 완료 토글 및 삭제 구현

As a 사용자,
I want 할일을 완료 표시하거나 삭제하고 싶다,
So that 목록을 최신 상태로 관리할 수 있다.

**Acceptance Criteria:**

**Given** 할일 목록이 표시된 상태에서
**When** 할일의 체크박스를 클릭할 때
**Then** `PATCH /todos/{id}/toggle` API가 호출되고 완료 상태가 즉시 반전된다
**And** 완료된 할일은 제목에 취소선이 적용되어 시각적으로 구분된다
**When** 삭제 버튼을 클릭할 때
**Then** `DELETE /todos/{id}` API가 호출되고 목록에서 해당 항목이 즉시 제거된다
**And** 토글/삭제 처리 중 해당 항목의 버튼이 비활성화된다

### Story 2.5: 할일 수정 기능 구현

As a 사용자,
I want 기존 할일을 수정하고 싶다,
So that 잘못 입력한 내용을 고칠 수 있다.

**Acceptance Criteria:**

**Given** 할일 목록이 표시된 상태에서
**When** 수정 버튼을 클릭할 때
**Then** 해당 할일의 현재 값(제목, 마감날짜, 우선순위)이 채워진 수정 폼이 표시된다
**When** 값을 수정하고 저장 버튼을 클릭할 때
**Then** `PUT /todos/{id}` API가 호출되고 목록에 수정된 값이 즉시 반영된다
**And** 제목을 비워두고 저장하면 오류 메시지가 표시되고 API가 호출되지 않는다
**And** 취소 버튼 클릭 시 수정 폼이 닫히고 원래 값이 유지된다

### Story 2.6: 상태 필터 구현

As a 사용자,
I want 완료/미완료 상태로 할일을 필터링하고 싶다,
So that 남은 할일만 집중해서 볼 수 있다.

**Acceptance Criteria:**

**Given** 메인 페이지에 "전체 / 완료 / 미완료" 필터 탭이 표시된 상태에서
**When** 필터 탭 중 하나를 선택할 때
**Then** 선택한 상태의 할일만 목록에 표시된다
**And** 기본 선택 탭은 "전체"다
**And** "완료" 선택 시 `GET /todos?status=completed`, "미완료" 선택 시 `GET /todos?status=incomplete` API가 호출된다
**And** 선택된 탭이 시각적으로 강조(활성) 표시된다

---

## Epic 3: Railway 배포

앱이 Railway에 배포되어 공개 URL로 접근 가능하다.

### Story 3.1: Backend Railway 배포 설정

As a 개발자,
I want FastAPI 백엔드를 Railway에 배포하고 싶다,
So that 공개 API URL을 얻어 프론트엔드와 연결할 수 있다.

**Acceptance Criteria:**

**Given** Epic 2가 완료되어 로컬에서 모든 기능이 동작하는 상태에서
**When** Railway 대시보드에서 새 Python 서비스를 생성하고 `todo-backend/` 저장소를 연결할 때
**Then** `requirements.txt`가 Railway에서 자동 인식되어 의존성이 설치된다
**And** Railway 환경 변수에 `DATABASE_URL`(Supabase 연결 문자열)이 설정된다
**And** 배포 후 Railway가 제공하는 공개 URL(`https://xxx.railway.app`)의 `/docs`에 접근 가능하다
**And** 공개 URL의 `GET /todos` 호출 시 Supabase DB의 실제 데이터가 반환된다

### Story 3.2: Frontend Railway 배포 설정 및 CORS 업데이트

As a 개발자,
I want Next.js 프론트엔드를 Railway에 배포하고 CORS를 업데이트하고 싶다,
So that 공개 URL로 앱 전체 기능이 동작한다.

**Acceptance Criteria:**

**Given** Story 3.1이 완료되어 백엔드 공개 URL이 확보된 상태에서
**When** Railway 대시보드에서 새 Node.js 서비스를 생성하고 `todo-frontend/` 저장소를 연결할 때
**Then** Railway 환경 변수에 `NEXT_PUBLIC_API_URL`이 백엔드 공개 URL로 설정된다
**And** FastAPI `main.py`의 CORS `allow_origins`에 프론트엔드 공개 URL이 추가되어 재배포된다
**And** 배포 후 프론트엔드 공개 URL에서 앱에 접근 가능하다
**And** 브라우저에서 할일 추가·완료·삭제·수정·필터 기능이 모두 정상 동작한다
