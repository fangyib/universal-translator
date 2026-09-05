from __future__ import annotations

from app.config import Settings
from app.models import (
    AnalyzeRequest,
    AnalyzeResponse,
    EMOTION_LABELS_EN,
    LLMSceneParams,
    ReplyCard,
    ReplyLine,
)
from app.services.llm import create_llm_client
from app.services.scene_selector import select_scene


async def analyze_user_input(request: AnalyzeRequest, settings: Settings) -> AnalyzeResponse:
    lang = request.lang if request.lang in {"zh", "en"} else "zh"
    llm = create_llm_client(settings)
    llm_params = await llm.analyze(request.text, lang=lang)
    selection = select_scene(llm_params)
    game_emotion = selection.scene.game_emotion
    game_url = f"{settings.game_embed_path}?embed=1&emotion={game_emotion}&lang={lang}"
    reply = _build_reply(llm_params, selection.scene, game_emotion, game_url, lang)

    source = "dev_mock" if settings.llm_provider.lower() == "mock" else "llm"

    return AnalyzeResponse(
        llm_params=llm_params,
        scene=selection,
        reply=reply,
        source=source,
        meta={
            "session_id": request.session_id,
            "mode": request.mode,
            "lang": lang,
            "scene_id": selection.scene.scene_id,
            "game_emotion": game_emotion,
        },
    )


def _build_reply(
    params: LLMSceneParams,
    scene,
    game_emotion: str,
    game_url: str,
    lang: str,
) -> ReplyCard:
    keywords = "、".join(params.keywords) if params.keywords else "—"
    label_en = params.label_en or EMOTION_LABELS_EN[params.primary_emotion]
    summary_en = params.summary_en or params.summary

    if lang == "en":
        intro = f"I hear you. Right now, you're carrying a trace of {label_en}."
        lines = [
            ReplyLine(label="Emotion", value=f"{label_en} ({params.primary_emotion.value})"),
            ReplyLine(label="Scene", value=scene.name_en),
            ReplyLine(label="Keywords", value=keywords),
            ReplyLine(label="Summary", value=summary_en),
        ]
        footer = "Opening your Emotion Room…"
    else:
        intro = f"我听到了你的声音。此刻的你，带着一丝{params.label_zh}。"
        lines = [
            ReplyLine(label="情绪 · Emotion", value=f"{params.label_zh}（{params.primary_emotion.value}）"),
            ReplyLine(label="场景 · Scene", value=scene.name_zh),
            ReplyLine(label="关键词 · Keywords", value=keywords),
            ReplyLine(label="感受 · Summary", value=params.summary),
        ]
        footer = "正在为你打开情绪小屋…"

    return ReplyCard(
        intro=intro,
        lines=lines,
        footer=footer,
        game_emotion=game_emotion,
        game_url=game_url,
    )
