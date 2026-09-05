from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EmotionType(str, Enum):
    JOY = "joy"
    CALM = "calm"
    ANGER = "anger"
    FATIGUE = "fatigue"
    SADNESS = "sadness"
    ANXIETY = "anxiety"


EMOTION_LABELS_ZH: dict[EmotionType, str] = {
    EmotionType.JOY: "快乐",
    EmotionType.CALM: "平静",
    EmotionType.ANGER: "愤怒",
    EmotionType.FATIGUE: "疲惫",
    EmotionType.SADNESS: "悲伤",
    EmotionType.ANXIETY: "焦虑",
}

EMOTION_LABELS_EN: dict[EmotionType, str] = {
    EmotionType.JOY: "Joy",
    EmotionType.CALM: "Calm",
    EmotionType.ANGER: "Anger",
    EmotionType.FATIGUE: "Fatigue",
    EmotionType.SADNESS: "Sadness",
    EmotionType.ANXIETY: "Anxiety",
}


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)
    mode: str = Field(default="text")
    session_id: str | None = None
    lang: str = Field(default="zh", pattern="^(zh|en)$")


class LLMSceneParams(BaseModel):
    primary_emotion: EmotionType
    label_zh: str
    label_en: str = ""
    confidence: float = Field(ge=0.0, le=1.0)
    keywords: list[str] = Field(default_factory=list)
    summary: str
    summary_en: str = ""


class GameScene(BaseModel):
    scene_id: str
    name_zh: str
    name_en: str
    description_zh: str
    description_en: str
    emotions: list[EmotionType]
    weather: str
    game_emotion: str = Field(description="情绪小屋 data-suggest 键名")


class SceneSelection(BaseModel):
    scene: GameScene
    match_score: float = 1.0
    match_reason: str


class ReplyLine(BaseModel):
    label: str
    value: str


class ReplyCard(BaseModel):
    intro: str
    lines: list[ReplyLine] = Field(default_factory=list)
    footer: str
    game_emotion: str | None = None
    game_url: str | None = None


class AnalyzeResponse(BaseModel):
    llm_params: LLMSceneParams
    scene: SceneSelection
    reply: ReplyCard
    source: str
    meta: dict[str, Any] = Field(default_factory=dict)
