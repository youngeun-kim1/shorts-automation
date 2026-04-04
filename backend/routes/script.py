from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import openai_service, claude_service

router = APIRouter()


class ScriptRequest(BaseModel):
    keyword: str
    tone: str
    length: str
    custom_prompt: str = ""
    provider: str = "openai"
    api_key: str = ""
    model: str = ""


class ScriptResponse(BaseModel):
    script: str


@router.post("/generate", response_model=ScriptResponse)
def generate(req: ScriptRequest):
    if not req.keyword.strip():
        raise HTTPException(status_code=400, detail="키워드를 입력해주세요.")
    try:
        if req.provider == "claude":
            script = claude_service.generate_script(
                req.keyword, req.tone, req.length, req.custom_prompt, req.api_key, req.model
            )
        else:
            script = openai_service.generate_script(
                req.keyword, req.tone, req.length, req.custom_prompt, req.api_key, req.model
            )
        return ScriptResponse(script=script)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
