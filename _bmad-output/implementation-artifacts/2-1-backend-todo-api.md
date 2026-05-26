# Story 2.1: Backend Todo API 전체 구현

Status: review

## Story

As a 개발자,
I want 모든 Todo CRUD API 엔드포인트를 구현하고 싶다,
So that 프론트엔드가 데이터를 주고받을 수 있다.

## Acceptance Criteria

1. `GET /todos` — 전체 목록 반환 (선택적 `status` 쿼리 파라미터: `completed` / `incomplete`로 필터링), 생성 순(id 오름차순) 정렬
2. `POST /todos` — title 필수, due_date/priority 선택, priority 기본값 `'medium'`, 생성된 Todo 반환 (HTTP 201)
3. `PUT /todos/{id}` — title/due_date/priority 수정, 수정된 Todo 반환, 없으면 HTTP 404
4. `PATCH /todos/{id}/toggle` — is_completed 반전, 업데이트된 Todo 반환, 없으면 HTTP 404
5. `DELETE /todos/{id}` — 삭제 성공 시 HTTP 204, 없으면 HTTP 404
6. title이 빈 문자열이면 HTTP 422 응답 반환
7. `localhost:8000/docs`에서 모든 엔드포인트가 확인 가능하다
8. 기존 `GET /health` 엔드포인트가 회귀 없이 정상 동작한다

## Tasks / Subtasks

- [x] Task 1: schemas/todo_schema.py 생성 (AC: #1~#6)
  - [x] 1.1: `schemas/todo_schema.py` 생성 — `TodoCreate`, `TodoUpdate`, `TodoResponse` Pydantic v2 스키마 정의
  - [x] 1.2: `title` 빈 문자열 검증 — `field_validator`로 422 응답 보장
  - [x] 1.3: `priority` 유효값 제한 — `Literal['low', 'medium', 'high']` 타입으로 422 자동 처리
  - [x] 1.4: `TodoResponse`에 `model_config = ConfigDict(from_attributes=True)` 설정 (ORM 객체 직렬화)

- [x] Task 2: routers/todo_router.py 생성 (AC: #1~#5)
  - [x] 2.1: `routers/todo_router.py` 생성 — `APIRouter(prefix="/todos", tags=["todos"])` 설정
  - [x] 2.2: `GET /todos` — 전체 목록 반환, status 쿼리 파라미터로 필터링, id 오름차순 정렬
  - [x] 2.3: `POST /todos` — Todo 생성, status_code=201 반환
  - [x] 2.4: `PUT /todos/{todo_id}` — Todo 수정, 없으면 404
  - [x] 2.5: `PATCH /todos/{todo_id}/toggle` — is_completed 토글, 없으면 404
  - [x] 2.6: `DELETE /todos/{todo_id}` — Todo 삭제, 성공 시 204, 없으면 404

- [x] Task 3: main.py 업데이트 (AC: #7, #8)
  - [x] 3.1: `main.py`에 `todo_router` import 및 `app.include_router(todo_router)` 추가
  - [x] 3.2: 기존 `/health` 엔드포인트 회귀 없음 확인

- [x] Task 4: 엔드포인트 검증 (AC: #1~#8)
  - [x] 4.1: `uvicorn main:app --reload` 기동 후 에러 없음 확인
  - [x] 4.2: `localhost:8000/docs`에서 5개 엔드포인트 모두 확인
  - [x] 4.3: `POST /todos` → 코드 정상, 실제 DB CRUD는 사용자 로컬 환경에서 확인 필요 (샌드박스 DNS 제한)
  - [x] 4.4: `GET /todos` → 코드 정상, 실제 DB 반환은 사용자 로컬 환경에서 확인 필요
  - [x] 4.5: `DELETE /todos/{id}` → 코드 정상, 204 응답은 사용자 로컬 환경에서 확인 필요
  - [x] 4.6: 빈 title로 `POST /todos` → 422 반환 확인 ✅

## Dev Notes

### 기술 스택 버전 (실제 확인된 환경)

- **Python**: 3.14.5
- **FastAPI**: 0.136.3
- **Pydantic**: 2.13.4 (v2) + pydantic-settings 2.14.1
- **SQLAlchemy**: 2.0.50
- **psycopg2-binary**: 2.9.12

### 현재 백엔드 구조 (Story 1.3 완료 후 상태)

이 스토리에서 **수정/추가**되는 파일:

```
todo-backend/
├── main.py                    ← UPDATE (todo_router include 추가)
├── routers/
│   ├── __init__.py             ← 변경 없음
│   └── todo_router.py          ← NEW
├── schemas/
│   ├── __init__.py             ← 변경 없음
│   └── todo_schema.py          ← NEW
└── (아래는 이미 존재, 변경 없음)
    ├── core/config.py
    ├── core/database.py
    └── models/todo_model.py
```

### 현재 main.py 상태 (UPDATE 대상)

```python
# 현재 상태
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models.todo_model  # noqa: F401

app = FastAPI(title="Todo API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], ...)

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

**이 스토리에서 추가할 내용:**
```python
from routers.todo_router import router as todo_router
# ... (기존 코드 유지)
app.include_router(todo_router)
```

### schemas/todo_schema.py 구현 (Pydantic v2)

```python
# schemas/todo_schema.py
from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, field_validator


class TodoCreate(BaseModel):
    title: str
    due_date: Optional[date] = None
    priority: Literal['low', 'medium', 'high'] = 'medium'

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('title cannot be empty')
        return v


class TodoUpdate(BaseModel):
    title: str
    due_date: Optional[date] = None
    priority: Literal['low', 'medium', 'high'] = 'medium'

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('title cannot be empty')
        return v


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    due_date: Optional[date] = None
    priority: str
    is_completed: bool
    created_at: datetime
```

**Pydantic v2 핵심 패턴 주의:**
- `class Config: orm_mode = True` → **`model_config = ConfigDict(from_attributes=True)`** (v2)
- `@validator` → **`@field_validator`** + `@classmethod` (v2)
- `.dict()` → **`.model_dump()`** (v2)
- `Literal['low', 'medium', 'high']`는 FastAPI가 자동으로 422 반환 (별도 validator 불필요)

### routers/todo_router.py 구현

```python
# routers/todo_router.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from core.database import get_db
from models.todo_model import Todo
from schemas.todo_schema import TodoCreate, TodoUpdate, TodoResponse

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=list[TodoResponse])
def get_todos(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Todo)
    if status == "completed":
        query = query.filter(Todo.is_completed == True)
    elif status == "incomplete":
        query = query.filter(Todo.is_completed == False)
    return query.order_by(Todo.id).all()


@router.post("", response_model=TodoResponse, status_code=201)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    for key, value in todo.model_dump().items():
        setattr(db_todo, key, value)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
def toggle_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db_todo.is_completed = not db_todo.is_completed
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.delete("/{todo_id}", status_code=204)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(db_todo)
    db.commit()
    return Response(status_code=204)
```

**라우터 함수 규칙 (아키텍처 필수):**
- HTTP 처리만 담당 — 비즈니스 로직 금지
- DB 세션은 반드시 `db: Session = Depends(get_db)`로 주입
- 에러는 `HTTPException` 표준 사용

### DELETE 204 응답 처리 주의

FastAPI에서 `status_code=204` 엔드포인트는 본문을 반환하면 안 된다. `return Response(status_code=204)` 또는 그냥 `return None`을 사용한다. `return db_todo` 하면 안 됨.

### GET /todos 필터링 파라미터

쿼리 파라미터 `status`의 유효값:
- 파라미터 없음 → 전체 반환
- `?status=completed` → `is_completed == True`
- `?status=incomplete` → `is_completed == False`
- 그 외 값 → 전체 반환 (에러 아님)

### SQLAlchemy 2.0 쿼리 패턴

이 스토리에서는 레거시 스타일 `db.query(Todo)` 사용 (Story 1.3과 동일한 동기 패턴 유지). SQLAlchemy 2.0의 `select()` 스타일도 가능하지만, 이 프로젝트는 레거시 쿼리 스타일로 일관성 유지.

### 이전 스토리(1.3) 학습 내용 반영

- **Pydantic v2**: `model_config = ConfigDict(...)` 사용 — `class Config` 아님
- **SQLAlchemy 2.0**: `Mapped[T]` + `mapped_column` 패턴이 이미 Todo 모델에 적용됨
- **SSL + pool**: `core/database.py` engine에 이미 `sslmode=require`, `pool_pre_ping=True` 적용됨
- **코드 리뷰 패치**: `get_db()` rollback, `DateTime(timezone=True)`, `server_default` 이미 반영됨
- **Windows 환경**: `.\venv\Scripts\uvicorn.exe main:app --reload`로 서버 실행

### 테스트 전략

이 스토리는 API 설정 스토리이므로 단위 테스트 없음 (학습용 프로젝트). 검증 방법:
- Python 구문 검사: `python -m py_compile schemas/todo_schema.py routers/todo_router.py main.py`
- 서버 기동 후 `/docs` Swagger UI에서 5개 엔드포인트 확인
- `POST /todos` + `GET /todos`로 실제 DB 연결 확인
- 빈 title로 `POST /todos` → 422 확인

### 아키텍처 준수 필수 사항

1. **라우터**: HTTP 처리만, 비즈니스 로직 금지
2. **스키마**: `schemas/todo_schema.py`에 Pydantic 모델
3. **JSON 필드**: snake_case 유지 (`is_completed`, `due_date`)
4. **DB 세션**: `get_db()` 의존성 주입만 사용
5. **에러**: `HTTPException` 표준 사용
6. **API URL**: `src/lib/api.ts`를 통해서만 (프론트엔드 규칙, 이 스토리는 백엔드)

### References

- [Source: _bmad-output/architecture.md#API 및 통신 패턴]
- [Source: _bmad-output/architecture.md#구현 패턴 및 일관성 규칙]
- [Source: _bmad-output/epics.md#Story 2.1: Backend Todo API 전체 구현]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Pydantic v2 `ConfigDict(from_attributes=True)` + `field_validator` + `@classmethod` 패턴 적용
- `Literal['low', 'medium', 'high']` 타입으로 priority 422 자동 처리
- DELETE 204: `return Response(status_code=204)` 패턴 사용
- GET /todos: `status` 쿼리파라미터로 `completed`/`incomplete` 필터링, `order_by(Todo.id)` 정렬
- /health 회귀 없음, /docs 200, 빈 title 422 확인
- 샌드박스 환경의 DNS 격리로 실제 DB CRUD 자동 검증 불가 — 로컬 uvicorn 실행 후 /docs에서 수동 확인 필요

### File List

- todo-backend/schemas/todo_schema.py (NEW)
- todo-backend/routers/todo_router.py (NEW)
- todo-backend/main.py (UPDATE — todo_router include 추가)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — Pydantic v2 패턴, SQLAlchemy 의존성 주입, DELETE 204 처리 주의사항 포함 |
| 2026-05-26 | 1.1 | 구현 완료 — schemas/todo_schema.py, routers/todo_router.py 생성, main.py 업데이트 |
