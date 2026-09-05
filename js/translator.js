function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 简单的色彩 / 情绪池，仅用于「后端未连接」时给附件一个可变的占位情绪。
// 真实回答完全由后端决定，这里不写死任何翻译模板。
const MOODS = [
  { tone: "平静", en: "calm", note: "像等距房间里那面青蓝墙面，呼吸均匀。" },
  { tone: "温暖", en: "warm", note: "像橙色台灯漫出的余光，温度刚刚好。" },
  { tone: "明亮", en: "bright", note: "像墙角那束黄，明媚却不刺眼。" },
  { tone: "热烈", en: "vivid", note: "像屋里那抹玫红，直率且充满张力。" },
  { tone: "沉静", en: "deep", note: "像窗外的深蓝夜色，安静却绵长。" },
  { tone: "自然", en: "natural", note: "像桌上那盆绿植，自在生长。" }
];
function hash(s) {
  let h = 0;
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h;
}

function pickMood(seed) {
  return MOODS[Math.abs(hash(seed)) % MOODS.length];
}

/**
 * 调用后端 /api/v1/analyze，把 reply 卡片交给 UI 渲染。
 */
async function translate(payload) {
  const text = (payload.text || "").trim()
    || (payload.attachments || []).map((a) => a.name).filter(Boolean).join("、")
    || (getLang() === "en" ? "(attachment)" : "（附件）");
  try {
    const res = await fetch("/api/v1/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        mode: payload.mode || "text",
        session_id: typeof AppState !== "undefined" ? AppState.currentId : null,
        lang: typeof getLang === "function" ? getLang() : "zh"
      })
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const reply = data.reply || {};
    const result = {
      intro: reply.intro,
      lines: reply.lines,
      footer: reply.footer,
      game_emotion: reply.game_emotion || data.meta?.game_emotion,
      game_url: reply.game_url,
      _raw: data
    };
    return typeof snapshotReplyLocales === "function" ? snapshotReplyLocales(result, data) : result;
  } catch (err) {
    const fb = offlineFallback(payload, String(err && err.message ? err.message : err));
    return typeof snapshotReplyLocales === "function" ? snapshotReplyLocales(fb, null) : fb;
  }
}

function offlineFallback(payload, err) {
  const atts = payload.attachments || [];
  const lines = [];

  if (payload.text) {
    lines.push({ label: `Echo · ${t("offline.echo")}`, value: payload.text });
  }
  atts.forEach((a, i) => {
    const mood = pickMood((a.name || "") + ":" + (a.size || 0) + ":" + i);
    const label = a.type === "image" ? t("offline.visual")
                : a.type === "audio" ? t("offline.vocal")
                : t("offline.file");
    const tone = typeof moodTone === "function" ? moodTone(mood.en) : mood.tone;
    const note = typeof moodNote === "function" ? moodNote(mood.en) : mood.note;
    lines.push({
      label,
      value: `${tone} · ${mood.en}（${note}）`
    });
  });

  return {
    intro: t("offline.intro", { err }),
    lines,
    footer: t("offline.footer"),
    _raw: null
  };
}
