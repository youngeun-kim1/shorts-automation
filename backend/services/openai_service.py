import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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


def generate_script(keyword: str, tone: str, length: str) -> str:
    tone_desc = TONE_MAP.get(tone, tone)
    length_label, word_count = LENGTH_MAP.get(length, ("60초", 160))

    prompt = f"""당신은 유튜브 쇼츠 대본 전문가입니다.
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
- 섹션 레이블([훅], [본문], [마무리])은 대본에 포함하지 말고 내용만 출력"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )

    return response.choices[0].message.content
