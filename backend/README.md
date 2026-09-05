# Universal Translator Backend

情绪识别由大模型完成，后端根据 LLM 返回的参数从**预置场景目录**中选择游戏场景。

游戏场景资源尚未导入时，使用 `app/data/scenes.json` 中的占位条目；导入后替换 `asset_bundle` / `bgm_track` / `character_spawn` 即可。

## 架构

```
用户输入
  → POST /api/v1/analyze
  → LLM 返回场景参数 (emotion, weather, time_of_day, bgm_mood, tags...)
  → scene_selector 从 scenes.json 匹配最佳场景
  → 返回 scene_id + 资源引用 + 回复卡片
```

## 快速启动

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env   # 配置 LLM_API_KEY 后切换 LLM_PROVIDER=openai

uvicorn app.main:app --reload --port 8000
```

访问 `http://127.0.0.1:8000/docs` 查看 Swagger。

## API

### `POST /api/v1/analyze`

**请求：**
```json
{
  "text": "最近工作压力好大，晚上一个人在家觉得很孤独。",
  "session_id": "optional"
}
```

**响应：**
```json
{
  "llm_params": {
    "primary_emotion": "lonely",
    "confidence": 0.87,
    "weather": "rainy",
    "time_of_day": "night",
    "bgm_mood": "melancholic_piano",
    "summary": "...",
    "scene_tags": ["indoor", "rain", "window"]
  },
  "scene": {
    "scene": {
      "scene_id": "rainy_night_window",
      "asset_bundle": "YOUR_SCENE_ASSET_ID",
      "bgm_track": "YOUR_BGM_ID",
      "character_spawn": "spawn_window"
    },
    "match_score": 0.92,
    "match_reason": "..."
  },
  "reply": { "intro": "...", "lines": [...], "footer": "..." },
  "source": "llm"
}
```

### `GET /api/v1/scenes`

返回场景目录列表。

## 导入游戏场景

编辑 `app/data/scenes.json`，每条场景包含：

| 字段 | 说明 |
|------|------|
| `scene_id` | 唯一 ID，前端/游戏引擎用来加载场景 |
| `emotions` | 可匹配的情绪列表 |
| `weather` / `time_of_day` / `bgm_mood` | 与 LLM 输出对齐的匹配条件 |
| `asset_bundle` | 游戏场景资源包 ID |
| `bgm_track` | BGM 资源 ID |
| `character_spawn` | 角色出生点 ID |

新增场景只需往 JSON 里加一条，选择器会自动纳入匹配。

## LLM 配置

| 变量 | 说明 |
|------|------|
| `LLM_PROVIDER` | `mock`（开发）/ `cntokenworld` / `openai` / `custom` |
| `LLM_API_KEY` | API Key（放在 `.env`，勿提交 git） |
| `LLM_BASE_URL` | 词元天下默认 `https://www.cntokenworld.com/api/aistore/v1` |
| `LLM_MODEL` | 词元天下示例 `neice-glm5.1` |

词元天下快速配置：

```env
LLM_PROVIDER=cntokenworld
LLM_API_KEY=你的_aip_密钥
LLM_BASE_URL=https://www.cntokenworld.com/api/aistore/v1
LLM_MODEL=neice-glm5.1
```

## 情绪参数：需要公式吗？

**不需要。** 直接把用户原文交给大模型，让它输出结构化 JSON 即可（`primary_emotion`、`weather`、`time_of_day`、`bgm_mood` 等）。

后端流程：
1. **System Prompt** 约束输出字段和可选枚举值
2. **大模型** 从叙事/抱怨中直接判断情绪与氛围参数
3. **scene_selector** 用这些参数在 `scenes.json` 里匹配已有场景

公式只在你想做「规则兜底」或「混合打分」时才有用，例如 LLM 挂了时用关键词 fallback，或对 `confidence` 做阈值校验。当前架构下让 AI 判断即可。
