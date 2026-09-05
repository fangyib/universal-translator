"""
LLM integration — returns one of six game emotions.
"""

from __future__ import annotations

import json
import logging
import re
from abc import ABC, abstractmethod

import httpx

from app.config import Settings
from app.models import EMOTION_LABELS_EN, EMOTION_LABELS_ZH, EmotionType, LLMSceneParams

logger = logging.getLogger(__name__)

SCENE_ANALYSIS_PROMPT_ZH = """你是一位情绪分析助手。用户会分享最近的经历、抱怨或叙事。
请判断其主要情绪，并从以下六种中**只选一种**作为 primary_emotion：

- joy（快乐）
- calm（平静）
- anger（愤怒）
- fatigue（疲惫）
- sadness（悲伤）
- anxiety（焦虑）

只返回 JSON，不要输出其他内容：
{
  "primary_emotion": "joy|calm|anger|fatigue|sadness|anxiety",
  "confidence": 0.0-1.0,
  "keywords": ["2-5个关键词"],
  "summary": "一句话概括用户情绪（中文）",
  "summary_en": "One sentence summarizing the user's emotion (English)"
}
"""

SCENE_ANALYSIS_PROMPT_EN = """You are an emotion analysis assistant. The user shares experiences, complaints, or narratives.
Pick exactly one primary_emotion from:

- joy
- calm
- anger
- fatigue
- sadness
- anxiety

Return JSON only:
{
  "primary_emotion": "joy|calm|anger|fatigue|sadness|anxiety",
  "confidence": 0.0-1.0,
  "keywords": ["2-5 keywords"],
  "summary": "One sentence in Chinese summarizing the user's emotion",
  "summary_en": "One sentence in English summarizing the user's emotion"
}
"""

EMOTION_SUMMARY_ZH: dict[EmotionType, str] = {
    EmotionType.JOY: "感受到你的快乐。",
    EmotionType.CALM: "感受到你的平静。",
    EmotionType.ANGER: "感受到你的愤怒。",
    EmotionType.FATIGUE: "感受到你的疲惫。",
    EmotionType.SADNESS: "感受到你的悲伤。",
    EmotionType.ANXIETY: "感受到你的焦虑。",
}

EMOTION_SUMMARY_EN: dict[EmotionType, str] = {
    EmotionType.JOY: "I sense joy in what you shared.",
    EmotionType.CALM: "I sense calm in what you shared.",
    EmotionType.ANGER: "I sense anger in what you shared.",
    EmotionType.FATIGUE: "I sense fatigue in what you shared.",
    EmotionType.SADNESS: "I sense sadness in what you shared.",
    EmotionType.ANXIETY: "I sense anxiety in what you shared.",
}


class BaseLLMClient(ABC):
    @abstractmethod
    async def analyze(self, text: str, lang: str = "zh") -> LLMSceneParams:
        pass


class DevMockLLMClient(BaseLLMClient):
    async def analyze(self, text: str, lang: str = "zh") -> LLMSceneParams:
        rules: list[tuple[tuple[str, ...], EmotionType]] = [
            (("开心", "高兴", "快乐", "幸福", "joy", "happy"), EmotionType.JOY),
            (("愤怒", "生气", "恼火", "angry", "mad", "fuck"), EmotionType.ANGER),
            (("疲惫", "累", "疲倦", "乏力", "tired", "fatigue"), EmotionType.FATIGUE),
            (("悲伤", "难过", "伤心", "沮丧", "sad"), EmotionType.SADNESS),
            (("焦虑", "紧张", "担心", "压力", "anxious", "stress"), EmotionType.ANXIETY),
            (("平静", "安静", "放松", "calm", "peace"), EmotionType.CALM),
        ]
        lowered = text.lower()
        emotion = EmotionType.CALM
        for words, value in rules:
            if any(w in text or w in lowered for w in words):
                emotion = value
                break
        return _build_params(
            emotion,
            0.75,
            _extract_keywords(text),
            EMOTION_SUMMARY_ZH[emotion],
            EMOTION_SUMMARY_EN[emotion],
        )


class OpenAICompatibleLLMClient(BaseLLMClient):
    def __init__(self, settings: Settings) -> None:
        self._base_url = (settings.llm_base_url or "https://api.openai.com/v1").rstrip("/")
        self._api_key = settings.llm_api_key
        self._model = settings.llm_model
        self._timeout = settings.llm_timeout_seconds

    async def analyze(self, text: str, lang: str = "zh") -> LLMSceneParams:
        if not self._api_key:
            raise RuntimeError("LLM_API_KEY is not configured")

        system_prompt = SCENE_ANALYSIS_PROMPT_EN if lang == "en" else SCENE_ANALYSIS_PROMPT_ZH
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(
                f"{self._base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return _parse_llm_params(_extract_json(content))


def _extract_json(content: str) -> dict:
    text = content.strip()
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if fenced:
        text = fenced.group(1).strip()
    return json.loads(text)


def _parse_llm_params(data: dict) -> LLMSceneParams:
    raw = str(data.get("primary_emotion", "calm")).lower()
    try:
        emotion = EmotionType(raw)
    except ValueError:
        emotion = _match_emotion_from_text(raw) or EmotionType.CALM
    summary = str(data.get("summary", EMOTION_SUMMARY_ZH[emotion]))
    summary_en = str(data.get("summary_en", EMOTION_SUMMARY_EN[emotion]))
    return _build_params(
        emotion,
        float(data.get("confidence", 0.8)),
        [str(k) for k in data.get("keywords", [])][:5],
        summary,
        summary_en,
    )


def _match_emotion_from_text(text: str) -> EmotionType | None:
    for emotion, label in EMOTION_LABELS_ZH.items():
        if label in text or emotion.value in text:
            return emotion
    return None


def _build_params(
    emotion: EmotionType,
    confidence: float,
    keywords: list[str],
    summary: str,
    summary_en: str,
) -> LLMSceneParams:
    return LLMSceneParams(
        primary_emotion=emotion,
        label_zh=EMOTION_LABELS_ZH[emotion],
        label_en=EMOTION_LABELS_EN[emotion],
        confidence=confidence,
        keywords=keywords,
        summary=summary,
        summary_en=summary_en,
    )


def _extract_keywords(text: str) -> list[str]:
    words = [w.strip("，。！？,.!?") for w in text.split() if len(w.strip("，。！？,.!?")) >= 2]
    return words[:5] if words else [text[:12]]


def create_llm_client(settings: Settings) -> BaseLLMClient:
    provider = settings.llm_provider.lower()
    if provider in {"openai", "azure", "custom", "cntokenworld"}:
        return OpenAICompatibleLLMClient(settings)
    return DevMockLLMClient()
