# Changelog — 쇼츠 자동화 앱

> React(Vite) + FastAPI · Vercel + Railway

---

## v0.6.0 — 2026-04-05
### 메타데이터 UX + 상태 유지

- **메타데이터 탭 결과 유지**: 탭 이동 후 돌아와도 생성 결과 그대로 보존 (상태 App.jsx로 lift)
- **✕ 다시 시작 버튼**: 결과 있을 때만 생성 버튼 옆에 표시, 클릭 시 초기화
- **AI 설정 버튼 각 탭으로 분리**: 헤더 전역 설정 버튼 제거 → GPT 카드·메타데이터 카드 각각 ⚙️ 버튼
- **모델 선택 드롭다운**: OpenAI(10종) / Claude(5종) 각각 선택 가능
  - OpenAI: GPT-5.4, 5.4-mini, 5.4-nano, 4.1, 4.1-mini, 4.1-nano, 4o, 4o-mini, o3, o4-mini
  - Claude: Opus 4.5, Sonnet 4.5, 3.5 Sonnet, 3.5 Haiku, 3 Opus
- **AI 태그**: 실제 선택된 모델명으로 동적 표시
- **SRT 저장 버튼 이동**: 왼쪽 패널 → 오른쪽 패널 (영상 길이 → SRT 저장 → TTS 순)

---

## v0.5.0 — 2026-04-05
### 커스텀 프롬프트 템플릿 + 모바일 반응형

- **템플릿 커스텀 저장**: "💾 현재 설정 저장" 버튼 → 이름 입력 → 드롭다운에 추가
- **템플릿 개별 삭제**: 유저 템플릿 ✕ 버튼으로 삭제
- **내 템플릿 초기화**: 유저 템플릿만 삭제, 기본 템플릿 유지
- **템플릿 localStorage 저장**: 새로고침 후에도 커스텀 템플릿 유지
- **선택된 템플릿 표시**: 버튼에 이름 표시(보라색), 드롭다운 항목에 ✓ 강조
- **빈 페이지 템플릿**: 드롭다운 최상단 항목으로 추가
- **모바일 반응형**: 700px 이하에서 에디터(오른쪽) 먼저, 자막 목록 아래로
- **GPT 자동저장 제거**: keyword/tone 자동저장 기능 삭제

---

## v0.4.0 — 2026-04-05
### 프롬프트 템플릿 + 영상 길이 컨트롤 개선

- **저장된 프롬프트 드롭다운**: 6개 기본 템플릿 제공
  - 10대·20대 타겟 / 직장인 공감 / 질문 형식 훅 / 숫자·데이터 활용 / 감성적 스타일 / 영어 믹스
- **템플릿 선택 시 3개 필드 동시 반영**: keyword + tone + customPrompt
- **영상 길이**: 슬라이더 + 숫자 input 동시 지원 (15~60초)
- **GPT 모델 변경**: gpt-4o → gpt-4.1 → gpt-5.4-mini
- **max_tokens → max_completion_tokens**: 신규 모델 호환

---

## v0.3.0 — 2026-04-04
### UI/UX 개선

- **탭 순서 변경**: GPT 생성 → 직접 입력 → SRT 업로드
- **워크스페이스 모드 유지**: 탭 전환 후 돌아와도 작업 중인 화면 유지 (상태 App.jsx로 lift)
- **전체 컨테이너 가운데 정렬**: `max-width: 1100px`, `justify-content: center`
- **초기화 / 빈 페이지 버튼**: 원본 대본 복구 / 전체 초기화 기능
- **✕ 처음으로 버튼**: 워크스페이스에서 모드 선택 화면으로 복귀

---

## v0.2.0 — 2026-04-03
### 핵심 기능 구현

- **GPT 대본 생성**: keyword + tone + 길이 + 커스텀 프롬프트 → GPT/Claude API 호출
- **직접 입력 모드**: 대본 붙여넣기/직접 작성
- **SRT 업로드 모드**: .srt 파일 파싱 → 자막 목록 자동 반영
- **자막 목록 에디터**: 타임코드 수동 편집, 항목 추가/삭제
- **SRT 다운로드**: 자막을 .srt 파일로 로컬 저장
- **TTS 음성 생성**: gTTS 기반 한국어 음성 생성 + 인라인 재생
- **YouTube 메타데이터 생성**: 제목 5개 / 설명 / 태그 / 썸네일 문구
- **설정 모달**: OpenAI / Claude API 키 입력, 프로바이더 전환
- **Claude 지원**: claude_service.py, provider 파라미터로 분기

---

## v0.1.0 — 2026-04-02
### 초기 셋업 및 배포

- **프로젝트 구조**: React(Vite) 프론트 + FastAPI 백엔드 모노레포
- **배포 환경**: Vercel(프론트) + Railway(백엔드)
- **CORS 설정**: `ALLOWED_ORIGINS` 환경변수로 관리
- **Whisper API 연동**: 음성 → 텍스트 변환 (cloud API, PyTorch 미포함)
- **Vercel 자동 배포**: GitHub main 브랜치 push → 자동 배포
- **Railway 배포 안정화**: `railway.toml` startCommand, Root Directory 설정

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 프론트엔드 | React 18, Vite, inline styles (dark theme) |
| 백엔드 | Python 3.9, FastAPI, uvicorn |
| AI | OpenAI API (GPT-5.4-mini 기본), Anthropic Claude API |
| TTS | gTTS (한국어) |
| 배포 | Vercel (프론트) + Railway (백엔드) |
| 저장소 | localStorage (설정, 커스텀 템플릿) |
