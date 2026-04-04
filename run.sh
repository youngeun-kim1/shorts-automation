#!/bin/zsh
export PATH="/opt/homebrew/bin:$PATH"

ROOT="/Users/youngeun_kim/Claude/shorts-automation"

echo "🚀 쇼츠 자동화 시작..."

# 백엔드
echo "⚙️  백엔드 시작 (port 8000)..."
cd "$ROOT/backend"
source venv/bin/activate
uvicorn main:app --port 8000 &
BACKEND_PID=$!

# 프론트엔드
echo "🌐 프론트엔드 시작 (port 5173)..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 실행 완료!"
echo "   브라우저에서 열기 → http://localhost:5173"
echo ""
echo "종료하려면 Ctrl+C"

# Ctrl+C 시 둘 다 종료
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '👋 종료됨'" SIGINT SIGTERM
wait
