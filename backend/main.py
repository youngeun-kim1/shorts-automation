import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import script, subtitle, tts
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Shorts Automation API")

# ALLOWED_ORIGINS 환경변수로 Vercel URL 추가 가능
# 예) ALLOWED_ORIGINS=https://my-app.vercel.app,http://localhost:5173
_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(script.router, prefix="/api/script", tags=["script"])
app.include_router(subtitle.router, prefix="/api/subtitle", tags=["subtitle"])
app.include_router(tts.router, prefix="/api/tts", tags=["tts"])


@app.get("/health")
def health():
    return {"status": "ok"}
