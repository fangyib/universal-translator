from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from app.models import EmotionType, GameScene

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SCENES_FILE = DATA_DIR / "scenes.json"


@lru_cache
def load_scene_catalog() -> list[GameScene]:
    raw = json.loads(SCENES_FILE.read_text(encoding="utf-8"))
    return [GameScene.model_validate(item) for item in raw]


def get_scene_by_id(scene_id: str) -> GameScene | None:
    for scene in load_scene_catalog():
        if scene.scene_id == scene_id:
            return scene
    return None


def get_scene_by_emotion(emotion: EmotionType) -> GameScene | None:
    for scene in load_scene_catalog():
        if emotion in scene.emotions:
            return scene
    return None


def list_scenes() -> list[GameScene]:
    return load_scene_catalog()
