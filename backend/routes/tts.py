from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from services.tts_service import generate_tts

router = APIRouter()


class TTSRequest(BaseModel):
    text: str


@router.post("/generate")
def generate(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="텍스트를 입력해주세요.")
    audio_bytes = generate_tts(req.text)
    return Response(content=audio_bytes, media_type="audio/mpeg")
