import os
import tempfile
from openai import OpenAI


def transcribe_audio(audio_bytes: bytes, filename: str) -> list[dict]:
    """
    오디오 파일을 OpenAI Whisper API로 분석해 자막 세그먼트 목록 반환.
    반환 형식: [{"index": 1, "start": 0.0, "end": 2.5, "text": "안녕하세요"}]
    """
    suffix = os.path.splitext(filename)[-1] or ".mp3"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
        with open(tmp_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="ko",
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )

        segments = []
        for i, seg in enumerate(result.segments):
            segments.append({
                "index": i + 1,
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
            })
        return segments
    finally:
        os.unlink(tmp_path)
