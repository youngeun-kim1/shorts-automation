from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import openai_service, claude_service

router = APIRouter()


class MetaRequest(BaseModel):
    script: str
    keyword: str = ""
    provider: str = "openai"
    api_key: str = ""
    model: str = ""


class MetaResponse(BaseModel):
    titles: list
    description: str
    tags: list
    thumbnail: str


@router.post("/generate", response_model=MetaResponse)
def generate(req: MetaRequest):
    if not req.script.strip():
        raise HTTPException(status_code=400, detail="대본을 입력해주세요.")
    try:
        if req.provider == "claude":
            result = claude_service.generate_meta(req.script, req.keyword, req.api_key, req.model)
        else:
            result = openai_service.generate_meta(req.script, req.keyword, req.api_key, req.model)
        return MetaResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
