# 쇼츠 자동화 웹앱

## 실행 전 준비

### 1. API 키 설정
```bash
cd backend
cp .env.example .env
# .env 파일에 ANTHROPIC_API_KEY 입력
```

### 2. Node.js 설치 (없는 경우)
```bash
brew install node
```

---

## 백엔드 실행

```bash
cd backend

# 가상환경 생성 및 패키지 설치
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 서버 시작
uvicorn main:app --reload --port 8000
```

> Whisper 모델은 첫 실행 시 자동 다운로드됩니다 (~150MB)

---

## 프론트엔드 실행

```bash
cd frontend

npm install
npm run dev
```

브라우저에서 http://localhost:5173 열기

---

## 사용 방법

1. **📝 대본 생성 탭** → 키워드/주제 입력 후 Claude AI 대본 자동 생성
2. **🎙️ 음성 처리 탭** → 직접 녹음한 파일 업로드 또는 TTS로 음성 생성 → Whisper로 자막 타이밍 자동 인식
3. **🎬 자막 편집 탭** → 자막 텍스트/타이밍 수동 조정 → SRT 파일 다운로드
