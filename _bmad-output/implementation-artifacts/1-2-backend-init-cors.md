# Story 1.2: Backend 프로젝트 초기화 및 CORS 설정

Status: review

## Story

As a 개발자,
I want FastAPI 백엔드 프로젝트를 초기화하고 CORS를 설정하고 싶다,
So that API 개발과 프론트엔드 연결을 시작할 수 있다.

## Acceptance Criteria

1. `todo-backend/` 디렉토리에 가상환경 생성 후 `fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv alembic pydantic-settings` 설치 시 `main.py`, `routers/`, `schemas/`, `models/`, `core/` 폴더 구조가 생성된다.
2. `main.py`에 FastAPI 앱이 생성되고 `CORSMiddleware`가 등록되며 `http://localhost:3000` 도메인이 허용된다.
3. `core/config.py`에 Pydantic Settings로 `DATABASE_URL` 환경 변수 로딩이 구현된다.
4. `.env`와 `.env.example`이 `DATABASE_URL` 키와 함께 생성된다.
5. `uvicorn main:app --reload` 실행 시 `localhost:8000`에서 서버가 정상 기동된다.
6. `localhost:8000/docs`에서 Swagger UI가 접근 가능하다.

## Tasks / Subtasks

- [x] Task 1: 프로젝트 디렉토리 및 가상환경 생성 (AC: #1)
  - [x] 1.1: `todo-list/` 루트에서 `todo-backend/` 디렉토리 생성
  - [x] 1.2: `todo-backend/` 안에서 Python 가상환경 생성 (`python -m venv venv`)
  - [x] 1.3: 가상환경 활성화 후 의존성 설치 (`fastapi uvicorn[standard] sqlalchemy psycopg2-binary python-dotenv alembic pydantic-settings`)
  - [x] 1.4: `requirements.txt` 생성 (`pip freeze > requirements.txt`)
- [x] Task 2: 프로젝트 폴더 구조 생성 (AC: #1)
  - [x] 2.1: `routers/__init__.py` 생성
  - [x] 2.2: `schemas/__init__.py` 생성
  - [x] 2.3: `models/__init__.py` 생성
  - [x] 2.4: `core/__init__.py` 생성
- [x] Task 3: 환경 설정 구현 (AC: #3, #4)
  - [x] 3.1: `core/config.py` 생성 — Pydantic Settings로 `DATABASE_URL` 로딩
  - [x] 3.2: `.env` 생성 (`DATABASE_URL=postgresql://user:password@host:port/dbname`)
  - [x] 3.3: `.env.example` 생성 (`DATABASE_URL=<your-supabase-connection-string>`)
- [x] Task 4: FastAPI 앱 및 CORS 설정 (AC: #2)
  - [x] 4.1: `main.py` 생성 — FastAPI 앱 인스턴스, CORSMiddleware 등록, 기본 라우터 include 준비
- [x] Task 5: .gitignore 생성 (보안)
  - [x] 5.1: `todo-backend/.gitignore` 생성 (venv/, __pycache__/, .env, *.pyc 포함)
- [x] Task 6: 기동 검증 (AC: #5, #6)
  - [x] 6.1: `uvicorn main:app --reload` 실행 후 `localhost:8000` 정상 기동 확인
  - [x] 6.2: `localhost:8000/docs` Swagger UI 접근 확인 (HTTP 200)

## Dev Notes

### 기술 스택 버전

- **Python**: 3.11+ 필수
- **FastAPI**: 최신 (0.115.x+)
- **Pydantic**: v2 (FastAPI 기본값) — `pydantic-settings` 별도 설치 필요
- **SQLAlchemy**: 2.x (설치만, DB 연결은 Story 1.3)
- **Alembic**: 설치만, 설정은 Story 1.3
- **uvicorn**: `uvicorn[standard]` 설치 (websocket, http/2 지원 포함)

### 중요: 에픽 vs 실제 의존성 차이

에픽 문서에는 `python-dotenv`만 명시되어 있지만, FastAPI + Pydantic v2 기반의 `core/config.py`를 구현하려면 **`pydantic-settings` 패키지가 반드시 필요**하다.

```bash
# 올바른 설치 명령어 (uvicorn[standard] 포함, pydantic-settings 추가)
pip install fastapi "uvicorn[standard]" sqlalchemy psycopg2-binary python-dotenv alembic pydantic-settings
```

### core/config.py 구현 (Pydantic Settings v2)

```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

settings = Settings()
```

**주의**: Pydantic v2에서는 `class Config`가 아닌 `model_config` 딕셔너리를 사용한다. `class Config: env_file = ".env"` 방식은 Pydantic v1 문법이다.

### main.py 구현 (FastAPI + CORSMiddleware)

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

**CORS origins 주의**: `allow_origins`에 정확한 URL 문자열을 넣어야 한다. `"localhost:3000"`이 아닌 **`"http://localhost:3000"`** (scheme 포함). Story 3.2에서 Railway 프론트엔드 URL 추가 예정.

### 프로젝트 디렉토리 구조

이 스토리에서 생성되는 구조:

```
todo-list/
├── todo-frontend/                  ← Story 1.1 완료
└── todo-backend/                   ← 이 스토리에서 생성
    ├── .env                        ← NEW (DATABASE_URL=placeholder)
    ├── .env.example                ← NEW
    ├── .gitignore                  ← NEW
    ├── requirements.txt            ← NEW
    ├── main.py                     ← NEW (FastAPI + CORS)
    ├── routers/
    │   └── __init__.py             ← NEW (빈 파일)
    ├── schemas/
    │   └── __init__.py             ← NEW (빈 파일)
    ├── models/
    │   └── __init__.py             ← NEW (빈 파일)
    └── core/
        ├── __init__.py             ← NEW (빈 파일)
        └── config.py               ← NEW (Pydantic Settings)
```

**이 스토리에서 생성하지 않는 것** (Story 1.3에서 추가):
- `core/database.py` (SQLAlchemy 엔진·세션)
- `models/todo_model.py` (Todo SQLAlchemy 모델)
- `routers/todo_router.py` (API 엔드포인트) ← Story 2.1
- `schemas/todo_schema.py` (Pydantic 스키마) ← Story 2.1

### Windows 환경 가상환경 주의사항

Windows에서 가상환경 활성화 명령어가 다르다:

```powershell
# Windows PowerShell
python -m venv venv
venv\Scripts\Activate.ps1  # 또는
.\venv\Scripts\activate

# Windows CMD
venv\Scripts\activate.bat
```

uvicorn 실행도 `todo-backend/` 디렉토리 내에서 실행해야 한다:
```powershell
cd todo-backend
uvicorn main:app --reload
# 또는 가상환경 활성화 없이:
.\venv\Scripts\uvicorn.exe main:app --reload
```

### .gitignore 필수 항목

```gitignore
# 가상환경
venv/
.venv/
env/

# Python 캐시
__pycache__/
*.pyc
*.pyo
*.pyd

# 환경 변수 (민감정보)
.env
!.env.example

# 빌드 산출물
*.egg-info/
dist/
build/

# Alembic 관련
alembic/versions/*.py  # 선택사항

# IDE
.idea/
.vscode/
```

### 이전 스토리(1-1) 학습 내용

- `.gitignore`의 `.env*` 패턴이 `.env.example`도 무시함 → 반드시 `!.env.example` 예외 추가
- 새 패키지 설치 시 requirements.txt 즉시 업데이트
- 프로젝트 루트는 `todo-list/` (create-next-app과 동일한 레벨에 `todo-backend/` 생성)

### 테스트 전략

이 스토리는 설정 스토리이므로 단위 테스트 없음. 검증 방법:
- `uvicorn main:app --reload` 기동 후 에러 없음 → AC #5
- `http://localhost:8000/docs` Swagger UI 로드 → AC #6
- `http://localhost:8000/health` → `{"status": "ok"}` 응답 확인
- `import` 오류 없음 (Python 구문 검사: `python -m py_compile main.py`)

### 아키텍처 준수 필수 사항

1. **라우터 함수**: 비즈니스 로직 금지 — HTTP 처리만
2. **스키마**: `schemas/`에 Pydantic 요청·응답 모델
3. **모델**: `models/`에 SQLAlchemy DB 모델
4. **설정**: 환경 변수는 반드시 `core/config.py`의 `settings` 객체 통해 접근
5. **CORS origins**: scheme 포함한 전체 URL (`"http://localhost:3000"`)

### References

- [Source: _bmad-output/architecture.md#Backend: FastAPI]
- [Source: _bmad-output/architecture.md#핵심 아키텍처 결정#인증 및 보안]
- [Source: _bmad-output/architecture.md#구현 패턴 및 일관성 규칙]
- [Source: _bmad-output/epics.md#Story 1.2: Backend 프로젝트 초기화 및 CORS 설정]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Python 3.14.5 환경, FastAPI 0.136.3, Pydantic 2.13.4, pydantic-settings 2.14.1, SQLAlchemy 2.0.50
- Pydantic v2 `model_config` 딕셔너리 방식으로 Settings 구현 (class Config 아님)
- CORSMiddleware allow_origins에 scheme 포함 `"http://localhost:3000"` 적용
- `/health` 엔드포인트 응답 확인: `{"status": "ok"}`
- `/docs` HTTP 200, OpenAPI 스키마 title "Todo API" 확인
- `!.env.example` 예외를 .gitignore에 추가해 example 파일이 git에 추적되도록 설정

### File List

- todo-backend/.env (NEW — 플레이스홀더 DATABASE_URL 포함, git 제외됨)
- todo-backend/.env.example (NEW)
- todo-backend/.gitignore (NEW)
- todo-backend/requirements.txt (NEW)
- todo-backend/main.py (NEW — FastAPI 앱, CORSMiddleware)
- todo-backend/core/__init__.py (NEW)
- todo-backend/core/config.py (NEW — Pydantic Settings v2)
- todo-backend/models/__init__.py (NEW)
- todo-backend/routers/__init__.py (NEW)
- todo-backend/schemas/__init__.py (NEW)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — 이전 스토리 학습 반영, Pydantic v2 Settings 주의사항 추가 |
| 2026-05-26 | 1.1 | 구현 완료 — FastAPI 0.136.3 초기화, CORSMiddleware, Pydantic Settings, 서버 기동 확인 |
