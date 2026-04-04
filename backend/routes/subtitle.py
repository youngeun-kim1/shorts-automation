from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import List
from services.whisper_service import transcribe_audio

router = APIRouter()


class Segment(BaseModel):
    index: int
    start: float
    end: float
    text: str


class SubtitleResponse(BaseModel):
    segments: List[Segment]


@router.post("/transcribe", response_model=SubtitleResponse)
async def transcribe(file: UploadFile = File(...)):
    allowed = {".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm"}
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"지원하지 않는 파일 형식입니다: {ext}")

    audio_bytes = await file.read()
    segments = transcribe_audio(audio_bytes, file.filename)
    return SubtitleResponse(segments=segments)


def format_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds % 1) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


@router.post("/export-srt")
async def export_srt(segments: List[Segment]):
    lines = []
    for seg in segments:
        lines.append(str(seg.index))
        lines.append(f"{format_time(seg.start)} --> {format_time(seg.end)}")
        lines.append(seg.text)
        lines.append("")
    srt_content = "\n".join(lines)
    return PlainTextResponse(content=srt_content, media_type="text/plain; charset=utf-8")
