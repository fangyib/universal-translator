/**
 * Cloudflare Pages Function — GET /api/v1/scenes
 * 与后端 backend/app/data/scenes.json 保持一致。
 */
const SCENES = [
  { scene_id: "joy", name_zh: "快乐 · 晴天", name_en: "Joy · Sunny", description_zh: "阳光明媚的小屋，适合喜悦与轻松的心情。", description_en: "A sunny cabin for joyful moods.", emotions: ["joy"], weather: "sunny", game_emotion: "joy" },
  { scene_id: "calm", name_zh: "平静 · 多云", name_en: "Calm · Cloudy", description_zh: "多云柔和的光线，安静而平衡。", description_en: "Soft cloudy light, calm and balanced.", emotions: ["calm"], weather: "cloudy", game_emotion: "calm" },
  { scene_id: "anger", name_zh: "愤怒 · 雷暴", name_en: "Anger · Thunder", description_zh: "雷暴翻涌，释放压抑的怒火。", description_en: "Thunderstorm to channel anger.", emotions: ["anger"], weather: "thunder", game_emotion: "anger" },
  { scene_id: "fatigue", name_zh: "疲惫 · 下雨", name_en: "Fatigue · Rain", description_zh: "细雨绵绵，适合疲惫时需要休息的时刻。", description_en: "Rainy weather for exhaustion and rest.", emotions: ["fatigue"], weather: "rain", game_emotion: "fatigue" },
  { scene_id: "sadness", name_zh: "悲伤 · 下雪", name_en: "Sadness · Snow", description_zh: "飘雪寂静，陪伴悲伤的情绪。", description_en: "Snowy stillness for sadness.", emotions: ["sadness"], weather: "snow", game_emotion: "sadness" },
  { scene_id: "anxiety", name_zh: "焦虑 · 晚霞", name_en: "Anxiety · Sunset", description_zh: "晚霞天色，映照焦虑与不安。", description_en: "Sunset hues for anxious feelings.", emotions: ["anxiety"], weather: "sunset", game_emotion: "anxiety" }
];

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  return new Response(JSON.stringify(SCENES), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() }
  });
}
