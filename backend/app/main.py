from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.models import AnalyzeRequest, AnalyzeResponse, GameScene
from app.services.analyzer import analyze_user_input
from app.services.scene_catalog import list_scenes

settings = get_settings()
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent

app = FastAPI(
    title=settings.app_name,
    description="情绪识别 + 游戏场景选择 API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post(f"{settings.api_prefix}/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    接收用户叙述，调用大模型识别情绪并返回场景选择参数，
    再从预置场景目录中匹配最合适的游戏场景。
    """
    return await analyze_user_input(request, settings)


@app.get(f"{settings.api_prefix}/scenes", response_model=list[GameScene])
async def get_scenes():
    """返回所有已注册的游戏场景（占位目录，导入资源后更新 scenes.json）。"""
    return list_scenes()


if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
