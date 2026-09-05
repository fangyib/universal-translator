from __future__ import annotations

from app.models import EMOTION_LABELS_ZH, EmotionType, GameScene, LLMSceneParams, SceneSelection
from app.services.scene_catalog import get_scene_by_emotion


def select_scene(params: LLMSceneParams) -> SceneSelection:
    scene = get_scene_by_emotion(params.primary_emotion)
    if not scene:
        raise RuntimeError(f"No scene configured for emotion: {params.primary_emotion}")

    label = EMOTION_LABELS_ZH[params.primary_emotion]
    return SceneSelection(
        scene=scene,
        match_score=1.0,
        match_reason=f"情绪「{label}」→ 游戏场景「{scene.name_zh}」",
    )
