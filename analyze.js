/**
 * Cloudflare Pages Function — 移植自 backend/app (FastAPI)
 * 路由：POST /api/v1/analyze
 *
 * 在 Cloudflare 边缘运行：调用大模型识别情绪 → 匹配游戏场景 → 返回回复卡片。
 * 环境变量（Pages 控制台 → Settings → Environment variables 配置）：
 *   LLM_API_KEY    词元天下 / OpenAI 兼容接口密钥（不配置时自动使用关键词 mock 兜底）
 *   LLM_BASE_URL   默认 https://www.cntokenworld.com/api/aistore/v1
 *   LLM_MODEL      默认 neice-glm5.1
 */

const SCENES = [
  { scene_id: "joy", name_zh: "快乐 · 晴天", name_en: "Joy · Sunny", description_zh: "阳光明媚的小屋，适合喜悦与轻松的心情。", description_en: "A sunny cabin for joyful moods.", emotions: ["joy"], weather: "sunny", game_emotion: "joy" },
  { scene_id: "calm", name_zh: "平静 · 多云", name_en: "Calm · Cloudy", description_zh: "多云柔和的光线，安静而平衡。", description_en: "Soft cloudy light, calm and balanced.", emotions: ["calm"], weather: "cloudy", game_emotion: "calm" },
  { scene_id: "anger", name_zh: "愤怒 · 雷暴", name_en: "Anger · Thunder", description_zh: "雷暴翻涌，释放压抑的怒火。", description_en: "Thunderstorm to channel anger.", emotions: ["anger"], weather: "thunder", game_emotion: "anger" },
  { scene_id: "fatigue", name_zh: "疲惫 · 下雨", name_en: "Fatigue · Rain", description_zh: "细雨绵绵，适合疲惫时需要休息的时刻。", description_en: "Rainy weather for exhaustion and rest.", emotions: ["fatigue"], weather: "rain", game_emotion: "fatigue" },
  { scene_id: "sadness", name_zh: "悲伤 · 下雪", name_en: "Sadness · Snow", description_zh: "飘雪寂静，陪伴悲伤的情绪。", description_en: "Snowy stillness for sadness.", emotions: ["sadness"], weather: "snow", game_emotion: "sadness" },
  { scene_id: "anxiety", name_zh: "焦虑 · 晚霞", name_en: "Anxiety · Sunset", description_zh: "晚霞天色，映照焦虑与不安。", description_en: "Sunset hues for anxious feelings.", emotions: ["anxiety"], weather: "sunset", game_emotion: "anxiety" }
];

const EMOTIONS = ["joy", "calm", "anger", "fatigue", "sadness", "anxiety"];

const LABELS_ZH = { joy: "快乐", calm: "平静", anger: "愤怒", fatigue: "疲惫", sadness: "悲伤", anxiety: "焦虑" };
const LABELS_EN = { joy: "Joy", calm: "Calm", anger: "Anger", fatigue: "Fatigue", sadness: "Sad", anxiety: "Anxiety" };

const SUMMARY_ZH = {
  joy: "感受到你的快乐。", calm: "感受到你的平静。", anger: "感受到你的愤怒。",
  fatigue: "感受到你的疲惫。", sadness: "感受到你的悲伤。", anxiety: "感受到你的焦虑。"
};
const SUMMARY_EN = {
  joy: "I sense joy in what you shared.", calm: "I sense calm in what you shared.",
  anger: "I sense anger in what you shared.", fatigue: "I sense fatigue in what you shared.",
  sadness: "I sense sadness in what you shared.", anxiety: "I sense anxiety in what you shared."
};

const PROMPT_ZH = `你是一位情绪分析助手。用户会分享最近的经历、抱怨或叙事。
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
`;

const PROMPT_EN = `You are an emotion analysis assistant. The user shares experiences, complaints, or narratives.
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
`;

const MOCK_RULES = [
  [["开心", "高兴", "快乐", "幸福", "joy", "happy"], "joy"],
  [["愤怒", "生气", "恼火", "angry", "mad", "fuck"], "anger"],
  [["疲惫", "累", "疲倦", "乏力", "tired", "fatigue"], "fatigue"],
  [["悲伤", "难过", "伤心", "沮丧", "sad"], "sadness"],
  [["焦虑", "紧张", "担心", "压力", "anxious", "stress"], "anxiety"],
  [["平静", "安静", "放松", "calm", "peace"], "calm"]
];

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() }
  });
}

function getSceneByEmotion(emotion) {
  return SCENES.find((s) => s.emotions.includes(emotion)) || SCENES.find((s) => s.emotions.includes("calm"));
}

function buildParams(emotion, confidence, keywords, summary, summaryEn) {
  return {
    primary_emotion: emotion,
    label_zh: LABELS_ZH[emotion],
    label_en: LABELS_EN[emotion],
    confidence,
    keywords,
    summary,
    summary_en: summaryEn
  };
}

function extractKeywords(text) {
  const words = text
    .split(/\s+/)
    .map((w) => w.replace(/^[，。！？,.!?]+|[，。！？,.!?]+$/g, ""))
    .filter((w) => w.length >= 2);
  return words.length ? words.slice(0, 5) : [text.slice(0, 12)];
}

/** 关键词兜底：没配 API Key 或 LLM 调用失败时保证演示不中断 */
function mockAnalyze(text) {
  const lowered = text.toLowerCase();
  let emotion = "calm";
  for (const [words, value] of MOCK_RULES) {
    if (words.some((w) => text.includes(w) || lowered.includes(w))) {
      emotion = value;
      break;
    }
  }
  return buildParams(emotion, 0.75, extractKeywords(text), SUMMARY_ZH[emotion], SUMMARY_EN[emotion]);
}

function extractJson(content) {
  let text = content.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) text = fenced[1].trim();
  return JSON.parse(text);
}

function normalizeEmotion(raw) {
  const value = String(raw || "").toLowerCase();
  if (EMOTIONS.includes(value)) return value;
  for (const e of EMOTIONS) {
    if (value.includes(e) || value.includes(LABELS_ZH[e])) return e;
  }
  return "calm";
}

function parseLlmParams(data) {
  const emotion = normalizeEmotion(data.primary_emotion);
  const summary = String(data.summary || SUMMARY_ZH[emotion]);
  const summaryEn = String(data.summary_en || SUMMARY_EN[emotion]);
  const keywords = Array.isArray(data.keywords) ? data.keywords.map(String).slice(0, 5) : [];
  const confidence = Number(data.confidence);
  return buildParams(
    emotion,
    Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0.8,
    keywords,
    summary,
    summaryEn
  );
}

async function llmAnalyze(text, lang, env) {
  const baseUrl = (env.LLM_BASE_URL || "https://www.cntokenworld.com/api/aistore/v1").replace(/\/$/, "");
  const model = env.LLM_MODEL || "neice-glm5.1";
  const timeoutMs = Number(env.LLM_TIMEOUT_SECONDS || 90) * 1000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.LLM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: lang === "en" ? PROMPT_EN : PROMPT_ZH },
          { role: "user", content: text }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return parseLlmParams(extractJson(content));
  } finally {
    clearTimeout(timer);
  }
}

function buildReply(params, scene, lang) {
  const keywords = params.keywords && params.keywords.length ? params.keywords.join("、") : "—";
  const gameUrl = `/game/room.html?embed=1&emotion=${scene.game_emotion}&lang=${lang}`;

  if (lang === "en") {
    return {
      intro: `I hear you. Right now, you're carrying a trace of ${params.label_en}.`,
      lines: [
        { label: "Emotion", value: `${params.label_en} (${params.primary_emotion})` },
        { label: "Scene", value: scene.name_en },
        { label: "Keywords", value: keywords },
        { label: "Summary", value: params.summary_en || params.summary }
      ],
      footer: "Opening your Emotion Room…",
      game_emotion: scene.game_emotion,
      game_url: gameUrl
    };
  }
  return {
    intro: `我听到了你的声音。此刻的你，带着一丝${params.label_zh}。`,
    lines: [
      { label: "情绪 · Emotion", value: `${params.label_zh}（${params.primary_emotion}）` },
      { label: "场景 · Scene", value: scene.name_zh },
      { label: "关键词 · Keywords", value: keywords },
      { label: "感受 · Summary", value: params.summary }
    ],
    footer: "正在为你打开情绪小屋…",
    game_emotion: scene.game_emotion,
    game_url: gameUrl
  };
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (request.method !== "POST") {
    return json({ detail: "Method not allowed. Use POST." }, 405);
  }

  const { env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ detail: "Invalid JSON body" }, 422);
  }

  const text = String(body.text || "").trim();
  if (!text) return json({ detail: "text is required" }, 422);
  if (text.length > 4000) return json({ detail: "text too long" }, 422);

  const lang = body.lang === "en" ? "en" : "zh";
  const sessionId = body.session_id || null;
  const mode = body.mode || "text";

  let params;
  let source = "llm";
  if (env.LLM_API_KEY) {
    try {
      params = await llmAnalyze(text, lang, env);
    } catch (err) {
      // LLM 故障时降级为关键词分析，保证演示可用
      params = mockAnalyze(text);
      source = "dev_mock";
    }
  } else {
    params = mockAnalyze(text);
    source = "dev_mock";
  }

  const scene = getSceneByEmotion(params.primary_emotion);
  const reply = buildReply(params, scene, lang);

  return json({
    llm_params: params,
    scene: {
      scene,
      match_score: 1.0,
      match_reason: `情绪「${params.label_zh}」→ 游戏场景「${scene.name_zh}」`
    },
    reply,
    source,
    meta: {
      session_id: sessionId,
      mode,
      lang,
      scene_id: scene.scene_id,
      game_emotion: scene.game_emotion
    }
  });
}
