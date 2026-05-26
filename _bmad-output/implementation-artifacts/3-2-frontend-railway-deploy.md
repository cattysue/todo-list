# Story 3.2: Frontend Railway 배포 설정 및 CORS 업데이트

Status: ready-for-dev

## Story

As a 개발자,
I want Next.js 프론트엔드를 Railway에 배포하고 CORS를 업데이트하고 싶다,
So that 공개 URL로 앱 전체 기능이 동작한다.

## Acceptance Criteria

1. Railway 대시보드에서 프론트엔드 서비스가 생성되고 Root Directory가 `todo-frontend`로 설정된다
2. Railway 환경 변수에 `NEXT_PUBLIC_API_URL`이 백엔드 공개 URL(`https://xxx.up.railway.app`)로 설정된다
3. `todo-frontend/nixpacks.toml`이 생성되어 Railway Node.js 빌드/시작 명령이 명시된다
4. FastAPI `main.py`의 CORS `allow_origins`에 프론트엔드 공개 URL이 추가되어 백엔드가 재배포된다
5. 배포 후 프론트엔드 공개 URL에서 앱에 접근 가능하고 API 호출이 CORS 오류 없이 동작한다
6. 브라우저에서 할일 추가·완료 토글·삭제·수정·필터 기능이 모두 정상 동작한다

## Tasks / Subtasks

- [x] Task 1: todo-frontend/nixpacks.toml 생성 (AC: #3)
  - [x] 1.1: `todo-frontend/nixpacks.toml` 생성 — Node.js 20, npm install, npm run build, npm run start 명시 ✓
  - [x] 1.2: 파일 인코딩 확인 — UTF-8 without BOM (첫 3바이트: 91 112 104 = `[ph`) ✓

- [ ] Task 2: Railway 대시보드 — 프론트엔드 서비스 설정 (AC: #1~#2) — 사용자 직접 수행
  - [ ] 2.1: Railway 대시보드 → "New Service" → "GitHub Repo" → todo-list 저장소 선택
  - [ ] 2.2: 서비스 Settings → Source → Root Directory: `todo-frontend` 설정
  - [ ] 2.3: Variables 탭 → `NEXT_PUBLIC_API_URL` = 백엔드 Railway 공개 URL (`https://xxx.up.railway.app`) 추가
  - [ ] 2.4: 배포 완료 후 프론트엔드 공개 URL 확인 (`https://yyy.up.railway.app`)

- [ ] Task 3: CORS 업데이트 후 백엔드 재배포 (AC: #4) — Task 2 완료 후 진행
  - [ ] 3.1: `todo-backend/main.py`의 `allow_origins`에 프론트엔드 Railway URL 추가
  - [ ] 3.2: 변경사항 커밋·푸시 → Railway 백엔드 자동 재배포

- [ ] Task 4: 통합 검증 (AC: #5~#6) — 사용자 브라우저 직접 확인
  - [ ] 4.1: 프론트엔드 공개 URL 접속 → 할일 목록 표시 확인
  - [ ] 4.2: 할일 추가 → 목록 즉시 반영 확인
  - [ ] 4.3: 완료 토글 → 취소선 표시 확인
  - [ ] 4.4: 삭제 → 목록에서 제거 확인
  - [ ] 4.5: 수정 → 변경 내용 반영 확인
  - [ ] 4.6: 필터(전체/완료/미완료) → 필터링 동작 확인
  - [ ] 4.7: 브라우저 개발자도구 Network 탭 → CORS 오류 없음 확인

## Dev Notes

### 현재 파일 상태

**`todo-backend/main.py` — CORS 현재 설정:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ← Task 3에서 Railway URL 추가
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)
```
→ Task 3에서 프론트엔드 Railway URL을 추가해야 브라우저 CORS 오류가 사라짐.

**`todo-frontend/src/lib/api.ts` — 환경 변수 패턴 (변경 불필요):**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```
→ Railway에서 `NEXT_PUBLIC_API_URL`만 설정하면 자동으로 프로덕션 백엔드 URL 사용.

### Task 1: nixpacks.toml 생성

**`todo-frontend/nixpacks.toml` 내용:**
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"
```

**왜 nixpacks.toml이 필요한가?**
- Railway Nixpacks가 Next.js를 자동 감지하지만 Node.js 버전 등이 불명확해질 수 있음
- 명시적으로 선언하면 빌드 재현성이 높아지고 디버깅이 쉬워짐
- `npm run start` → `next start` → Next.js가 `PORT` 환경 변수 자동 인식 (Railway가 `PORT` 자동 설정)

**⚠️ 인코딩 주의:** 이 Windows 환경에서 Write 도구는 UTF-16을 출력할 수 있음. PowerShell `[System.IO.File]::WriteAllText(path, content, New-Object System.Text.UTF8Encoding($false))`로 UTF-8 without BOM 저장 필요.

### Task 2: Railway 대시보드 상세 가이드

**2.1~2.2: 서비스 생성 및 Root Directory 설정**
1. `railway.app` → 기존 프로젝트 (백엔드가 있는 프로젝트) → "Add Service" → "GitHub Repo"
2. todo-list 저장소 선택
3. 서비스 이름: `todo-frontend` (임의)
4. Settings → Source → Root Directory: `todo-frontend`

**2.3: 환경 변수 설정**
- Variables 탭 → `NEXT_PUBLIC_API_URL` = 백엔드 Railway URL
  - 형식: `https://[백엔드서비스명].up.railway.app`
  - Story 3.1에서 확인한 백엔드 공개 URL 사용
  - ⚠️ 끝에 `/` 없이 입력 (예: `https://todo-backend-production.up.railway.app`)

**Railway가 자동으로 처리하는 것들:**
- Node.js 버전 감지 (Nixpacks)
- `npm install` 실행
- `npm run build` 실행
- HTTPS 인증서 발급
- 공개 URL 생성 (`yyy.up.railway.app`)
- `PORT` 환경 변수 자동 설정 → Next.js가 해당 포트로 바인딩

### Task 3: CORS 업데이트

**프론트엔드 URL 확보 후 `main.py` 수정:**
```python
# 수정 전
allow_origins=["http://localhost:3000"],

# 수정 후 (프론트엔드 URL 추가)
allow_origins=[
    "http://localhost:3000",
    "https://[프론트엔드Railway URL].up.railway.app",
],
```

**중요:** 두 URL 모두 유지 — 로컬 개발 환경(`localhost:3000`)도 계속 동작해야 함.

**커밋·푸시 후 Railway 자동 재배포:**
- 백엔드 서비스가 GitHub 연동되어 있으므로 push하면 자동 재배포
- 재배포 완료까지 약 1~2분 소요

### 배포 후 검증 기준

| 검증 항목 | 기대 결과 |
|-----------|-----------|
| 프론트엔드 URL 접속 | 할일 목록 화면 표시 |
| 할일 추가 | 목록 즉시 반영 |
| 브라우저 콘솔 | CORS 오류 없음 |
| Network 탭 | API 요청이 백엔드 Railway URL로 전송됨 |

### 현재 프로젝트 구조 요약

```
todo-list/
├── todo-frontend/
│   ├── nixpacks.toml          ← NEW (Task 1)
│   ├── .env.local             ← 로컬용 (Railway에서 무시됨, .gitignore 필수)
│   ├── .env.example           ← 형식 가이드
│   ├── next.config.ts         ← 변경 없음
│   └── src/
│       └── lib/api.ts         ← 변경 없음 (NEXT_PUBLIC_API_URL 자동 사용)
└── todo-backend/
    ├── main.py                ← UPDATE (Task 3): CORS allow_origins 확장
    ├── nixpacks.toml          ← 이미 존재 (Story 3.1에서 생성)
    └── requirements.txt       ← 이미 존재 (UTF-8 수정 완료)
```

### ⚠️ 주의 사항

- `NEXT_PUBLIC_` 접두사가 붙은 환경 변수만 Next.js 클라이언트 코드에서 사용 가능 — 이미 올바르게 구성됨
- `.env.local`은 `.gitignore`에 포함되어 있어 GitHub에 올라가지 않음 — Railway는 대시보드 환경 변수 사용
- 백엔드 CORS 업데이트 없이 프론트엔드 배포하면 API 호출 시 브라우저에서 CORS 오류 발생

### References

- [Source: _bmad-output/epics.md#Story 3.2: Frontend Railway 배포 설정 및 CORS 업데이트]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `todo-frontend/nixpacks.toml`: Node.js 20, npm install/build/start 명시. UTF-8 without BOM으로 저장. Railway PORT 자동 인식 → AC#3 만족
- Task 2 (2.1~2.4): Railway 대시보드 작업 — 사용자 직접 수행. Dev Notes에 상세 가이드 포함.
- Task 3 (3.1~3.2): 프론트엔드 URL 확보 후 main.py CORS 업데이트 및 재배포 — 사용자 직접 수행.
- Task 4 (4.1~4.7): 배포 후 브라우저 통합 검증 — 사용자 직접 수행.
- AC#1, #2, #4, #5, #6: Railway 대시보드 + 브라우저 검증 후 만족 여부 확인

### File List

- todo-frontend/nixpacks.toml (NEW)
- todo-backend/main.py (UPDATE — Task 3에서 CORS allow_origins 확장)

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-27 | 1.0 | 스토리 생성 — nixpacks.toml, CORS 업데이트, Railway 대시보드 가이드 포함 |
