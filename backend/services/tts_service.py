import io
import tempfile
import os
from gtts import gTTS


def generate_tts(text: str) -> bytes:
    """
    텍스트를 한국어 TTS로 변환해 MP3 바이트 반환.
    """
    tts = gTTS(text=text, lang="ko", slow=False)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    return buf.read()
