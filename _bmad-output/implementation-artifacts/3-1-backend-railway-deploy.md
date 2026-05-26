# Story 3.1: Backend Railway 배포 설정

Status: review

## Story

As a 개발자,
I want FastAPI 백엔드를 Railway에 배포하고 싶다,
So that 공개 API URL을 얻어 프론트엔드와 연결할 수 있다.

## Acceptance Criteria

1. `requirements.txt`가 UTF-8 인코딩으로 저장되어 Railway pip install이 정상 작동한다
2. `Procfile`이 생성되어 Railway가 `uvicorn main:app --host 0.0.0.0 --port $PORT`로 앱을 기동한다
3. Railway 대시보드에서 `todo-backend/` 루트 디렉토리로 서비스가 설정된다
4. Railway 환경 변수에 `DATABASE_URL`(Supabase 연결 문자열)이 설정된다
5. 배포 성공 후 Railway 공개 URL의 `/health` 엔드포인트가 `{"status": "ok"}`를 반환한다
6. Railway 공개 URL의 `/docs`에서 Swagger UI가 접근 가능하다

## Tasks / Subtasks

- [x] Task 1: requirements.txt 재생성 (AC: #1)
  - [x] 1.1: venv 활성화 후 `pip freeze > requirements.txt` 실행 — UTF-8 인코딩으로 재생성
  - [x] 1.2: 파일 인코딩 확인 — UTF-8, BOM 없음 (`UTF-8 without BOM`) ✓

- [x] Task 2: Procfile 생성 (AC: #2)
  - [x] 2.1: `todo-backend/Procfile` 생성 — 내용: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

- [ ] Task 3: Railway 배포 (AC: #3~#6) — 대시보드 작업 (사용자 직접 수행)
  - [ ] 3.1: Railway 대시보드(railway.app)에서 새 프로젝트 생성
  - [ ] 3.2: "Deploy from GitHub repo" 선택 → todo-list 저장소 연결
  - [ ] 3.3: 서비스 설정에서 Root Directory를 `todo-backend`로 지정
  - [ ] 3.4: 환경 변수 탭에서 `DATABASE_URL` = Supabase 연결 문자열 추가
  - [ ] 3.5: 배포 완료 후 Railway 공개 URL의 `/health` 응답 확인
  - [ ] 3.6: Railway 공개 URL의 `/docs` Swagger UI 접근 확인

## Dev Notes

### 현재 백엔드 구조

```
todo-backend/
├── core/
│   ├── config.py       ← DATABASE_URL 환경 변수 로드 (pydantic-settings)
│   └── database.py     ← SQLAlchemy 엔진 (sslmode=require 포함 ✓)
├── models/
│   └── todo_model.py
├── routers/
│   └── todo_router.py
├── schemas/
│   └── todo_schema.py
├── main.py             ← FastAPI 앱, CORS 설정
├── requirements.txt    ← ⚠️ 현재 UTF-16 LE 인코딩 → 재생성 필요
├── .env                ← 로컬 개발용 (커밋 금지)
└── .env.example        ← DATABASE_URL 플레이스홀더
```

### ⚠️ 중요: requirements.txt 인코딩 문제 (Task 1 필수)

현재 `requirements.txt`가 **UTF-16 LE with BOM**으로 저장되어 있다. Railway의 pip는 UTF-8을 기대하므로 그대로 배포하면 `pip install` 단계에서 실패한다.

**해결 방법:**
```powershell
# todo-backend 폴더에서
cd todo-backend
.\venv\Scripts\activate
pip freeze > requirements.txt
# 저장 후 파일 인코딩 확인: UTF-8 without BOM
```

재생성된 `requirements.txt` 예시 (UTF-8):
```
alembic==1.18.4
annotated-doc==0.0.4
annotated-types==0.7.0
anyio==4.13.0
click==8.4.1
colorama==0.4.6
fastapi==0.136.3
greenlet==3.5.1
h11==0.16.0
httptools==0.8.0
idna==3.16
Mako==1.3.12
MarkupSafe==3.0.3
psycopg2-binary==2.9.12
pydantic==2.13.4
pydantic-settings==2.14.1
pydantic_core==2.46.4
python-dotenv==1.2.2
PyYAML==6.0.3
SQLAlchemy==2.0.50
starlette==1.1.0
typing-inspection==0.4.2
typing_extensions==4.15.0
uvicorn==0.48.0
watchfiles==1.2.0
websockets==16.0
```

### Procfile 내용 (Task 2)

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**왜 `--host 0.0.0.0`인가?**: Railway 컨테이너에서 외부 트래픽을 받으려면 모든 인터페이스에 바인딩해야 함. 기본값 `127.0.0.1`이면 Railway 외부에서 접근 불가.

**왜 `$PORT`인가?**: Railway가 동적으로 포트를 할당하고 `PORT` 환경 변수로 전달함. 고정 포트(8000)를 사용하면 Railway 프록시가 연결하지 못함.

### Railway 배포 설정 상세 (Task 3)

**3.1 ~ 3.2: 프로젝트 생성 및 GitHub 연결**
1. `railway.app` → "New Project" → "Deploy from GitHub repo"
2. todo-list 저장소 선택

**3.3: Root Directory 설정 (중요)**
- 서비스 Settings → Source → Root Directory: `todo-backend`
- 이 설정이 없으면 Railway가 저장소 루트에서 `requirements.txt`를 찾으려 함 → 배포 실패

**3.4: 환경 변수 설정**
- 서비스 → Variables 탭
- `DATABASE_URL` = Supabase Connection String (Session Mode, 포트 5432)
  - Supabase 대시보드 → Project Settings → Database → Connection string → URI

  **⚠️ 중요**: Supabase Connection Pooler URL (포트 6543)이 아닌 **Direct Connection URL (포트 5432)** 사용
  - 형식: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
  - `.env` 파일의 `DATABASE_URL`과 동일한 값

**Railway가 자동으로 처리하는 것들:**
- Python 버전 감지 (Nixpacks)
- `pip install -r requirements.txt` 실행
- `Procfile`의 명령어로 앱 시작
- HTTPS 인증서 발급
- 공개 URL 생성 (`xxx.up.railway.app`)

### 현재 `main.py` CORS 설정 확인

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Story 3.2에서 Railway URL 추가 예정
    ...
)
```

→ 이 스토리에서는 CORS 수정 없음. Story 3.2에서 프론트엔드 Railway URL 확보 후 추가.

### `core/database.py` Railway 호환성 확인

```python
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=280,
    connect_args={"sslmode": "require"},  # Supabase SSL 필수 ✓
)
```

→ `sslmode=require`가 이미 설정되어 있어 Railway → Supabase 연결에 문제 없음 ✓

### 배포 후 검증

배포 완료 후 브라우저에서 확인:
- `https://[Railway URL]/health` → `{"status": "ok"}`
- `https://[Railway URL]/docs` → Swagger UI 표시
- `https://[Railway URL]/todos` → Supabase DB의 할일 목록 반환

### .gitignore 확인 사항

배포 전 `.env`가 `.gitignore`에 포함되어 있는지 확인 (GitHub에 절대 커밋 금지):
```
# todo-backend/.gitignore
.env
venv/
__pycache__/
```

### References

- [Source: _bmad-output/epics.md#Story 3.1: Backend Railway 배포 설정]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `requirements.txt`: UTF-16 LE with BOM → UTF-8 without BOM으로 재생성. venv pip freeze 실행 후 Write 도구로 저장. BOM 바이트 확인 완료 → AC#1 만족
- `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT` 생성. `--host 0.0.0.0`으로 Railway 컨테이너 외부 트래픽 수용, `$PORT`로 Railway 동적 포트 사용 → AC#2 만족
- Task 3 (3.1~3.6): Railway 대시보드 작업 — 코드 변경 불필요, 사용자가 직접 수행. 스토리 파일의 Dev Notes에 상세 가이드 포함.
- AC#3~#6: Railway 대시보드 배포 후 사용자가 직접 검증 필요

### File List

- todo-backend/requirements.txt (UPDATE — UTF-8 재생성)
- todo-backend/Procfile (NEW)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-26 | 1.0 | 스토리 생성 — UTF-16 인코딩 수정, Procfile, Railway 대시보드 설정 가이드 포함 |
| 2026-05-26 | 1.1 | 코드 작업 완료 — requirements.txt UTF-8 재생성, Procfile 생성. Task 3은 사용자 Railway 대시보드 작업 |
