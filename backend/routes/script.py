from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.openai_service import generate_script

router = APIRouter()


class ScriptRequest(BaseModel):
    keyword: str
    tone: str   # 진지한 | 유머러스 | 동기부여
    length: str  # 30s | 45s | 60s


class ScriptResponse(BaseModel):
    script: str


@router.post("/generate", response_model=ScriptResponse)
def generate(req: ScriptRequest):
    if not req.keyword.strip():
        raise HTTPException(status_code=400, detail="키워드를 입력해주세요.")
    script = generate_script(req.keyword, req.tone, req.length)
    return ScriptResponse(script=script)
