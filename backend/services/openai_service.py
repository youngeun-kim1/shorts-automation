import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

TONE_MAP = {
    "진지한": "진지하고 신뢰감 있는",
    "유머러스": "유머러스하고 가볍게 웃을 수 있는",
    "동기부여": "강렬하고 동기부여가 되는",
}

LENGTH_MAP = {
    "30s": ("30초", 80),
    "45s": ("45초", 120),
    "60s": ("60초", 160),
}


def get_client(api_key: str = ""):
    key = api_key.strip() or os.getenv("OPENAI_API_KEY", "")
    return OpenAI(api_key=key)


def generate_script(keyword: str, tone: str, length: str, custom_prompt: str = "", api_key: str = "") -> str:
    client = get_client(api_key)
    tone_desc = TONE_MAP.get(tone, tone)
    length_label, word_count = LENGTH_MAP.get(length, ("60초", 160))

    base_prompt = f"""당신은 유튜브 쇼츠 대본 전문가입니다.
주제: {keyword}
분위기: {tone_desc}
영상 길이: {length_label} (약 {word_count}자 내외)
카테고리: 자기계발, 현대인, 사회생활 조언, 마인드셋

아래 형식으로 쇼츠 대본을 작성해주세요:
[훅] 첫 1~2문장으로 시청자를 즉시 사로잡는 강렬한 오프닝
[본문] 핵심 내용을 간결하게 전달 (2~4개 포인트)
[마무리] 공감을 유발하거나 행동을 촉구하는 CTA 한 문장

규칙:
- 구어체로 자연스럽게 말하듯 작성
- 각 문장은 짧고 임팩트 있게
- 한국어로 작성
- 섹션 레이블([훅], [본문], [마무리])은 포함하지 말고 내용만 출력"""

    if custom_prompt.strip():
        base_prompt += f"\n\n추가 지시사항:\n{custom_prompt}"

    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[{"role": "user", "content": base_prompt}],
        max_tokens=1024,
    )
    return response.choices[0].message.content


def generate_meta(script: str, keyword: str = "", api_key: str = "") -> dict:
    client = get_client(api_key)

    prompt = f"""유튜브 쇼츠 영상의 메타데이터를 생성해주세요.

대본:
{script}

키워드: {keyword or "없음"}

아래 JSON 형식으로 정확하게 반환해주세요:
{{
  "titles": ["제목1", "제목2", "제목3", "제목4", "제목5"],
  "description": "영상 설명 (200자 내외, 해시태그 포함)",
  "tags": ["태그1", "태그2"],
  "thumbnail": "썸네일 문구 (10자 이내)"
}}

규칙:
- 제목: 클릭하고 싶어지는 제목, 숫자/감성어 활용, 50자 이내
- 설명: 자연스러운 소개 + 관련 해시태그 5~7개
- 태그: 검색 최적화된 한국어/영어 혼합, 최대 20개
- 썸네일: 강렬하고 짧은 문구
- JSON만 반환, 다른 텍스트 없이"""

    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
