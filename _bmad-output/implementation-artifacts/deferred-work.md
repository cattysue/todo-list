# Deferred Work

## Deferred from: code review of 1-3-supabase-db-setup (2026-05-26)

- `String` 길이 미지정 (`title`, `priority`) — PostgreSQL TEXT로 정상 동작하므로 skip
- `id` autoincrement 명시 없음 — SQLAlchemy 정수 PK에서 올바르게 추론
- CORS `allow_origins` 하드코딩 — Story 1.2 pre-existing, Story 3.2에서 Railway URL 추가 시 수정
- CORS wildcard methods/headers — Story 1.2 pre-existing, 학습용 프로젝트 허용
- `sessionmaker(bind=engine)` SA 2.0 deprecation — 서버 정상 동작 중, 추후 리팩터링 시 수정
- `Todo` `__repr__` 없음 — 기능 무관, 필요 시 추가
- `priority` DB check constraint 없음 — Story 2.1 Pydantic 스키마로 API 레벨 검증으로 커버
- 빈 `DATABASE_URL` 처리 없음 — 이 프로젝트에서 `.env`는 항상 존재 (사용자 결정)
