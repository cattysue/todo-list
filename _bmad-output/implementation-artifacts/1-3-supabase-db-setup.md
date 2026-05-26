# Story 1.3: Supabase DB 설계 및 연결

Status: done

## Story

As a 개발자,
I want Supabase에 todos 테이블을 생성하고 FastAPI와 연결하고 싶다,
So that 할일 데이터를 저장하고 조회할 수 있다.

## Acceptance Criteria

1. Supabase SQL 에디터에서 테이블 생성 SQL을 실행하면 `todos(id SERIAL PRIMARY KEY, title VARCHAR NOT NULL, due_date DATE NULL, priority VARCHAR NOT NULL DEFAULT 'medium', is_completed BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMP DEFAULT now())` 테이블이 Supabase 대시보드에서 확인된다.
2. `core/database.py`에 SQLAlchemy 엔진(`engine`)과 `SessionLocal`이 `DATABASE_URL` 환경 변수를 사용해 설정된다.
3. `models/todo_model.py`에 `Todo` SQLAlchemy 모델이 위 테이블 구조와 정확히 일치하게 정의된다 (컬럼명, 타입, nullable, default 포함).
4. `todo-backend/.env`의 `DATABASE_URL`이 실제 Supabase 연결 문자열로 업데이트된다.
5. `uvicorn main:app --reload` 실행 시 DB 연결 오류 없이 정상 기동된다.
6. `localhost:8000/health` 호출 시 `{"status": "ok"}` 응답이 반환된다 (기존 엔드포인트 회귀 없음).

## Tasks / Subtasks

- [x] Task 1: Supabase todos 테이블 생성 (AC: #1) ⚠️ 수동 작업 — 개발자가 Supabase 대시보드에서 직접 실행
  - [x] 1.1: Supabase 대시보드 → SQL Editor에서 아래 SQL 실행:
        ```sql
        CREATE TABLE todos (
          id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          due_date DATE NULL,
          priority VARCHAR NOT NULL DEFAULT 'medium',
          is_completed BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP DEFAULT now()
        );
        ```
  - [x] 1.2: Supabase 대시보드 Table Editor에서 `todos` 테이블이 생성되었는지 확인
  - [x] 1.3: Supabase 프로젝트 Settings → Database → Connection string (URI 방식) 복사

- [x] Task 2: .env에 실제 Supabase 연결 문자열 설정 (AC: #4)
  - [x] 2.1: `todo-backend/.env`의 `DATABASE_URL` 값을 실제 Supabase URI로 업데이트

- [x] Task 3: core/database.py 구현 (AC: #2)
  - [x] 3.1: `core/database.py` 생성 — SQLAlchemy 2.0 스타일로 엔진·SessionLocal·Base·get_db 구현

- [x] Task 4: models/todo_model.py 구현 (AC: #3)
  - [x] 4.1: `models/todo_model.py` 생성 — `Todo` SQLAlchemy 2.0 mapped_column 모델 정의

- [x] Task 5: main.py 업데이트 (AC: #5)
  - [x] 5.1: `main.py`에 database import 추가 (앱 시작 시 모델 등록 확인용)

- [x] Task 6: 기동 검증 (AC: #5, #6)
  - [x] 6.1: `uvicorn main:app --reload` 실행 — DB 연결 오류 없이 정상 기동 확인
  - [x] 6.2: `localhost:8000/health` → `{"status": "ok"}` 응답 확인

### Review Findings (AI Code Review — 2026-05-26)

- [x] [Review][Patch] SSL 강제 적용 — `connect_args={"sslmode": "require"}` 추가 [core/database.py:5]
- [x] [Review][Patch] `get_db()` 예외 시 rollback 누락 [core/database.py:13]
- [x] [Review][Patch] `create_engine` pool_pre_ping + pool_recycle 누락 [core/database.py:5]
- [x] [Review][Patch] `created_at` timezone 미설정 — `DateTime(timezone=True)` 필요 [models/todo_model.py:16]
- [x] [Review][Patch] `priority`, `is_completed` server_default 누락 [models/todo_model.py:14-15]
- [x] [Review][Patch] `main.py`의 `Base, engine` 불필요한 dead import 제거 [main.py:3]
- [x] [Review][Defer] `String` 길이 미지정 (`title`, `priority`) [models/todo_model.py:12,14] — deferred, PostgreSQL TEXT로 정상 동작
- [x] [Review][Defer] `id` autoincrement 명시 없음 [models/todo_model.py:11] — deferred, SQLAlchemy가 정수 PK에서 올바르게 추론
- [x] [Review][Defer] CORS allow_origins 하드코딩 [main.py:9] — deferred, pre-existing (Story 1.2), Story 3.2에서 수정 예정
- [x] [Review][Defer] CORS wildcard methods/headers [main.py:10-11] — deferred, pre-existing, 학습용 프로젝트 허용
- [x] [Review][Defer] `sessionmaker(bind=engine)` SA 2.0 deprecation [core/database.py:6] — deferred, 서버 정상 동작 중
- [x] [Review][Defer] `Todo` `__repr__` 없음 [models/todo_model.py] — deferred, 기능 무관
- [x] [Review][Defer] `priority` DB check constraint 없음 [models/todo_model.py:14] — deferred, Story 2.1 API 검증으로 커버
- [x] [Review][Defer] 빈 DATABASE_URL 처리 없음 [core/config.py] — deferred, 이 프로젝트에서 .env 항상 존재

## Dev Notes

### ⚠️ 수동 작업 필수 — 자동화 불가

Task 1 (Supabase 테이블 생성)과 Task 2 (.env 업데이트)는 개발자가 직접 Supabase 대시보드에서 수행해야 한다. AI 에이전트가 대신 실행할 수 없다. 이 스토리 구현 전 사용자가 이 단계를 먼저 완료해야 함.

### 기술 스택 버전 (Story 1.2에서 확인된 실제 환경)

- **Python**: 3.14.5
- **FastAPI**: 0.136.3
- **Pydantic**: 2.13.4 (v2)
- **pydantic-settings**: 2.14.1
- **SQLAlchemy**: 2.0.50
- **psycopg2-binary**: 2.9.12

### Supabase 연결 방식

Supabase 대시보드 Settings → Database에서 세 가지 연결 방식을 제공한다:

| 방식 | 포트 | 권장 여부 |
|------|------|-----------|
| Direct Connection | 5432 | ✅ 로컬 개발 권장 |
| Transaction Pooler | 6543 | 서버리스 환경용 |
| Session Pooler | 5432 | 서버형 앱용 |

로컬 개발에서는 **Direct Connection** (포트 5432) URI를 사용한다:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**psycopg2-binary와 Supabase**: psycopg2-binary는 동기식 드라이버로, SQLAlchemy의 기본 동기 엔진과 함께 사용한다. asyncpg는 이 스토리에서 사용하지 않는다.

### core/database.py 구현 (SQLAlchemy 2.0)

```python
# core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from core.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**주의**: SQLAlchemy 2.0에서는 `declarative_base()` 함수 대신 `DeclarativeBase` 클래스를 상속하는 방식을 사용한다. `from sqlalchemy.orm import declarative_base` 패턴은 SQLAlchemy 1.x 문법이다.

### models/todo_model.py 구현 (SQLAlchemy 2.0 mapped_column)

```python
# models/todo_model.py
from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Boolean, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base

class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(String, default="medium", nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

**SQLAlchemy 2.0 핵심 차이점**:
- `Column` 대신 `mapped_column` 사용
- `Mapped[T]` 타입 힌트로 타입 안전성 확보
- `Optional[date]`는 nullable 컬럼에 사용
- `server_default=func.now()`는 DB 서버가 기본값을 설정 (Python 런타임이 아님)

### main.py 업데이트

현재 `main.py`에 database import를 추가한다:

```python
# main.py (기존 내용 유지, import 추가)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import Base, engine  # 추가

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

**참고**: `Base.metadata.create_all(engine)` 호출은 이 스토리에서 추가하지 않는다. 테이블은 Supabase SQL 에디터에서 이미 생성되어 있으므로, SQLAlchemy는 기존 테이블에 모델을 매핑하기만 하면 된다. 자동 테이블 생성은 이 프로젝트 패턴에 해당하지 않는다.

### 이전 스토리(1-1, 1-2) 학습 내용

- **Pydantic v2**: `model_config` 딕셔너리 방식 사용 (class Config 아님) — core/config.py는 이미 올바르게 구현됨
- **.gitignore `!.env.example` 예외**: todo-backend/.gitignore에 이미 포함되어 있음, 추가 불필요
- **Windows 환경**: PowerShell에서 `.\venv\Scripts\Activate.ps1`로 가상환경 활성화
- **uvicorn 실행**: `todo-backend/` 디렉토리 내에서 실행 (`cd todo-backend`)
- **requirements.txt 업데이트**: 새 패키지 설치 시 즉시 `pip freeze > requirements.txt`

### 프로젝트 디렉토리 구조

이 스토리에서 생성/수정되는 구조:

```
todo-backend/
├── .env                        ← UPDATE (실제 Supabase DATABASE_URL 입력)
├── .env.example                ← 변경 없음
├── .gitignore                  ← 변경 없음
├── requirements.txt            ← 변경 없음 (이미 SQLAlchemy 설치됨)
├── main.py                     ← UPDATE (database import 추가)
├── core/
│   ├── __init__.py             ← 변경 없음
│   ├── config.py               ← 변경 없음
│   └── database.py             ← NEW (SQLAlchemy 엔진·세션·Base)
├── models/
│   ├── __init__.py             ← 변경 없음
│   └── todo_model.py           ← NEW (Todo SQLAlchemy 모델)
├── routers/
│   └── __init__.py             ← 변경 없음
└── schemas/
    └── __init__.py             ← 변경 없음
```

**이 스토리에서 생성하지 않는 것** (Story 2.1에서 추가):
- `routers/todo_router.py` (API 엔드포인트)
- `schemas/todo_schema.py` (Pydantic 스키마)

### 테스트 전략

이 스토리는 DB 연결 설정 스토리이므로 단위 테스트 없음. 검증 방법:
- `uvicorn main:app --reload` 기동 후 에러 없음 → AC #5
- `http://localhost:8000/health` → `{"status": "ok"}` → AC #6
- Python 구문 검사: `python -m py_compile core/database.py models/todo_model.py`
- Supabase 대시보드에서 todos 테이블 확인 → AC #1

### 아키텍처 준수 필수 사항

1. **환경 변수**: `DATABASE_URL`은 반드시 `core/config.py`의 `settings.database_url`로만 접근
2. **DB 세션**: `get_db()` 의존성 주입 패턴 사용 (Story 2.1에서 활용 예정)
3. **모델 위치**: SQLAlchemy 모델은 반드시 `models/` 디렉토리에
4. **DB 연결**: `core/database.py`에서만 관리
5. **JSON 필드**: snake_case 유지 (`is_completed`, `due_date`)

### References

- [Source: _bmad-output/architecture.md#데이터 아키텍처]
- [Source: _bmad-output/architecture.md#프로젝트 구조 및 경계]
- [Source: _bmad-output/epics.md#Story 1.3: Supabase DB 설계 및 연결]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Python 3.14.5, SQLAlchemy 2.0.50, psycopg2-binary 2.9.12
- SQLAlchemy 2.0 DeclarativeBase 상속 방식 사용 (구 declarative_base() 아님)
- mapped_column + Mapped[T] 타입 힌트로 Todo 모델 정의
- server_default=func.now()로 created_at DB 서버 기본값 설정
- Supabase Direct Connection (포트 5432) 사용
- uvicorn 기동 시 DB 연결 오류 없음 — Application startup complete. 확인
- /health HTTP 200, {"status":"ok"} 응답 확인

### File List

- todo-backend/core/database.py (NEW)
- todo-backend/models/todo_model.py (NEW)
- todo-backend/main.py (UPDATE — database import 추가)
- todo-backend/.env (UPDATE — 실제 Supabase DATABASE_URL)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — SQLAlchemy 2.0 mapped_column 패턴, 수동 Supabase 설정 주의사항 포함 |
| 2026-05-26 | 1.1 | 구현 완료 — core/database.py, models/todo_model.py 생성, main.py 업데이트, 서버 기동 확인 |
