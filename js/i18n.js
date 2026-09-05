const LANG_KEY = "ut-lang";

const STRINGS = {
  zh: {
    "page.title": "RESONA｜共鸣",
    "newChat": "新对话",
    "sectionLabel": "近期会话",
    "loginBtn": "登录",
    "aboutBtn": "关于",
    "welcome.kicker": "A translator for your emotion",
    "welcome.h2": "向共鸣倾诉，进入你的内心",
    "welcome.lead": "让情绪被看见，让语言被理解，让空间回应每一次心境的变化",
    "prompt.placeholder": "向共鸣倾诉…",
    "tool.upload": "图片/文件",
    "tool.uploadTitle": "上传图片或文件",
    "tool.voice": "语音输入",
    "tool.voiceTitle": "语音输入",
    "send": "发送",
    "gameStatus": "情绪小屋 · 根据你的心情生成场景",
    "gameClose": "返回对话",
    "login.title": "登录 RESONA",
    "login.subtitle": "Sign in to RESONA",
    "login.close": "关闭",
    "login.user": "用户名",
    "login.pass": "密码",
    "login.userPh": "请输入用户名",
    "login.passPh": "请输入密码",
    "login.submit": "登录",
    "login.divider": "或使用其他方式",
    "login.tip.empty": "请输入用户名和密码",
    "login.tip.signing": "正在登录…",
    "login.tip.welcome": "欢迎回来，{name} ✓",
    "login.tip.social": "正在通过 {label} 登录…",
    "login.tip.success": "{label} 登录成功 ✓",
    "about.title": "RESONA｜共鸣",
    "about.subtitle": "Emotional resonance space",
    "about.close": "关闭",
    "about.p1": "RESONA 是一个情绪共鸣空间。向共鸣倾诉，进入你的内心；让情绪被看见，让语言被理解，让空间回应每一次心境的变化。",
    "about.li1": "对话式倾诉，简洁而专注。",
    "about.li2": "情绪场景生成，空间随心境变化。",
    "about.li3": "实时回应，让每一次表达都被温柔接住。",
    "session.untitled": "未命名会话",
    "thinking": "正在思考中…",
    "voice.start": "语音输入",
    "voice.stop": "停止",
    "chip.remove": "移除",
    "offline.intro": "（演示模式 · 后端未连接：{err}）这是占位响应，真实回答由后端返回。",
    "offline.echo": "原话",
    "offline.visual": "图像情绪",
    "offline.vocal": "语音情绪",
    "offline.file": "文件情绪",
    "offline.footer": "请确认后端已启动：cd backend && uvicorn app.main:app --port 8000",
    "lang.label": "中文",
    "lang.zh": "中文",
    "lang.en": "English",
    "social.wechat": "微信",
    "reply.intro": "我听到了你的声音。此刻的你，带着一丝{emotion}。",
    "reply.footer": "正在为你打开情绪小屋…",
    "reply.emotion": "情绪 · Emotion",
    "reply.scene": "场景 · Scene",
    "reply.keywords": "关键词 · Keywords",
    "reply.summary": "感受 · Summary"
  },
  en: {
    "page.title": "RESONA｜共鸣",
    "newChat": "New Session",
    "sectionLabel": "Recent",
    "loginBtn": "Sign In",
    "aboutBtn": "About",
    "welcome.kicker": "A translator for your emotion",
    "welcome.h2": "Speak to Resona, enter your inner world",
    "welcome.lead": "Let emotions be seen, language be understood, and space respond to every shift in mood",
    "prompt.placeholder": "Speak to Resona…",
    "tool.upload": "Image / File",
    "tool.uploadTitle": "Upload image or file",
    "tool.voice": "Voice Input",
    "tool.voiceTitle": "Voice input",
    "send": "Send",
    "gameStatus": "Emotion Room · Scene generated from your mood",
    "gameClose": "Back to Chat",
    "login.title": "Sign in to RESONA",
    "login.subtitle": "Sign in to RESONA",
    "login.close": "Close",
    "login.user": "Username",
    "login.pass": "Password",
    "login.userPh": "Enter username",
    "login.passPh": "Enter password",
    "login.submit": "Sign In",
    "login.divider": "Or use other methods",
    "login.tip.empty": "Please enter username and password",
    "login.tip.signing": "Signing in…",
    "login.tip.welcome": "Welcome back, {name} ✓",
    "login.tip.social": "Signing in with {label}…",
    "login.tip.success": "{label} sign-in successful ✓",
    "about.title": "RESONA｜共鸣",
    "about.subtitle": "Emotional resonance space",
    "about.close": "Close",
    "about.p1": "RESONA is an emotional resonance space. Speak to Resona and step into your inner world—where feelings are seen, language is understood, and the space responds to every shift in mood.",
    "about.li1": "Conversational expression, simple and focused.",
    "about.li2": "Emotion-driven scenes that change with how you feel.",
    "about.li3": "Real-time responses that meet every expression with care.",
    "session.untitled": "Untitled Session",
    "thinking": "Thinking…",
    "voice.start": "Voice Input",
    "voice.stop": "Stop",
    "chip.remove": "Remove",
    "offline.intro": "(Demo mode · backend offline: {err}) Placeholder response; real answers come from the backend.",
    "offline.echo": "Echo",
    "offline.visual": "Visual Mood",
    "offline.vocal": "Vocal Mood",
    "offline.file": "File Mood",
    "offline.footer": "Start the backend: cd backend && uvicorn app.main:app --port 8000",
    "lang.label": "EN",
    "lang.zh": "中文",
    "lang.en": "English",
    "social.wechat": "WeChat",
    "reply.intro": "I hear you. Right now, you're carrying a trace of {emotion}.",
    "reply.footer": "Opening your Emotion Room…",
    "reply.emotion": "Emotion",
    "reply.scene": "Scene",
    "reply.keywords": "Keywords",
    "reply.summary": "Summary"
  }
};

const MOOD_NOTES = {
  zh: {
    calm: "像等距房间里那面青蓝墙面，呼吸均匀。",
    warm: "像橙色台灯漫出的余光，温度刚刚好。",
    bright: "像墙角那束黄，明媚却不刺眼。",
    vivid: "像屋里那抹玫红，直率且充满张力。",
    deep: "像窗外的深蓝夜色，安静却绵长。",
    natural: "像桌上那盆绿植，自在生长。"
  },
  en: {
    calm: "Like the teal wall in an isometric room—steady, even breath.",
    warm: "Like the soft glow of an orange lamp, just the right warmth.",
    bright: "Like a splash of yellow in the corner—lively but not harsh.",
    vivid: "Like magenta in the room—direct and full of tension.",
    deep: "Like deep blue night outside the window—quiet and lingering.",
    natural: "Like the potted plant on the desk—growing freely."
  }
};

const MOOD_TONES = {
  zh: { calm: "平静", warm: "温暖", bright: "明亮", vivid: "热烈", deep: "沉静", natural: "自然" },
  en: { calm: "Calm", warm: "Warm", bright: "Bright", vivid: "Vivid", deep: "Deep", natural: "Natural" }
};

const EMOTION_EN = {
  joy: "Joy",
  calm: "Calm",
  anger: "Anger",
  fatigue: "Fatigue",
  sadness: "Sadness",
  anxiety: "Anxiety"
};

const SCENE_ZH_TO_EN = {
  "快乐 · 晴天": "Joy · Sunny",
  "平静 · 多云": "Calm · Cloudy",
  "愤怒 · 雷暴": "Anger · Thunder",
  "疲惫 · 下雨": "Fatigue · Rain",
  "悲伤 · 下雪": "Sadness · Snow",
  "焦虑 · 晚霞": "Anxiety · Sunset"
};

let currentLang = "zh";

function moodTone(enKey) {
  const tones = MOOD_TONES[currentLang] || MOOD_TONES.zh;
  return tones[enKey] || MOOD_TONES.zh[enKey] || enKey;
}

function snapshotReplyLocales(result, raw) {
  if (!result || result._typing) return result;
  if (raw) result._raw = raw;
  const base = { ...result, _raw: raw || result._raw };
  const zh = localizeReply(base, "zh");
  const en = localizeReply(base, "en");
  result._zh = { intro: zh.intro, lines: zh.lines, footer: zh.footer };
  result._en = { intro: en.intro, lines: en.lines, footer: en.footer };
  return result;
}

function translateSceneName(name) {
  if (!name) return name;
  return SCENE_ZH_TO_EN[name] || name;
}

function translateReplyFallback(result) {
  if (currentLang === "zh") return result;
  const zh = result._zh || result;
  const introMatch = String(zh.intro || "").match(/^我听到了你的声音。此刻的你，带着一丝(.+)。$/);
  const emotionZh = introMatch ? introMatch[1] : "";
  const emotionEn = Object.entries({
    快乐: "Joy", 平静: "Calm", 愤怒: "Anger", 疲惫: "Fatigue", 悲伤: "Sadness", 焦虑: "Anxiety"
  }).find(([k]) => emotionZh.includes(k))?.[1] || emotionZh;

  const lines = (zh.lines || []).map((line) => {
    const label = String(line.label || "");
    const value = String(line.value || "");
    if (label.includes("情绪")) {
      const em = value.match(/（([^）]+)）/);
      const key = em ? em[1] : "";
      const enLabel = EMOTION_EN[key] || value.split("（")[0];
      return { label: t("reply.emotion"), value: `${enLabel} (${key || "emotion"})` };
    }
    if (label.includes("场景")) {
      return { label: t("reply.scene"), value: translateSceneName(value) };
    }
    if (label.includes("关键词")) {
      return { label: t("reply.keywords"), value };
    }
    if (label.includes("感受") || label.includes("Summary")) {
      return { label: t("reply.summary"), value };
    }
    return line;
  });

  return {
    ...result,
    intro: introMatch ? t("reply.intro", { emotion: emotionEn }) : zh.intro,
    lines,
    footer: t("reply.footer")
  };
}

function localizeReply(result, lang) {
  if (!result || result._typing) return result;
  const useLang = lang || currentLang;
  if (useLang === "zh") {
    if (result._zh) {
      return {
        ...result,
        intro: result._zh.intro,
        lines: result._zh.lines,
        footer: result._zh.footer
      };
    }
    return result;
  }

  if (result._en) {
    return {
      ...result,
      intro: result._en.intro,
      lines: result._en.lines,
      footer: result._en.footer
    };
  }

  const raw = result._raw;
  if (raw && raw.llm_params) {
    const p = raw.llm_params;
    const scene = raw.scene && raw.scene.scene;
    const labelEn = p.label_en || EMOTION_EN[p.primary_emotion] || p.label_zh;
    const keywords = (p.keywords || []).join("、") || "—";
    return {
      ...result,
      intro: t("reply.intro", { emotion: labelEn }),
      lines: [
        { label: t("reply.emotion"), value: `${labelEn} (${p.primary_emotion})` },
        { label: t("reply.scene"), value: scene?.name_en || translateSceneName(result._zh?.lines?.[1]?.value) },
        { label: t("reply.keywords"), value: keywords },
        { label: t("reply.summary"), value: p.summary_en || p.summary }
      ],
      footer: t("reply.footer")
    };
  }

  return translateReplyFallback(result);
}

function getLang() {
  return currentLang;
}

function t(key, vars) {
  const table = STRINGS[currentLang] || STRINGS.zh;
  let text = table[key] ?? STRINGS.zh[key] ?? key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return text;
}

function setLang(lang, persist) {
  const next = lang === "en" ? "en" : "zh";
  currentLang = next;
  if (persist !== false) {
    try { localStorage.setItem(LANG_KEY, next); } catch (_) {}
  }
  document.documentElement.lang = next === "en" ? "en" : "zh-CN";
  applyI18n();
  syncGameLang();
  window.dispatchEvent(new CustomEvent("ut-lang-change", { detail: { lang: next } }));
}

function loadLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "zh") currentLang = saved;
  } catch (_) {}
  document.documentElement.lang = currentLang === "en" ? "en" : "zh-CN";
}

function applyI18n(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.textContent = t(key);
  });
  scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  scope.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  document.title = t("page.title");

  const langBtn = document.getElementById("langBtn");
  if (langBtn) {
    const label = langBtn.querySelector("[data-i18n='lang.label']");
    if (label) label.textContent = t("lang.label");
    langBtn.setAttribute("aria-label", currentLang === "en" ? "Language: English" : "语言：中文");
  }

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}

function syncGameLang() {
  const frame = document.getElementById("gameFrame");
  if (!frame || !frame.contentWindow || frame.src === "about:blank") return;
  try {
    frame.contentWindow.postMessage({ type: "set-lang", lang: currentLang }, "*");
  } catch (_) {}
}

function setupLangSwitch() {
  const btn = document.getElementById("langBtn");
  const menu = document.getElementById("langMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !menu.hidden;
    menu.hidden = open;
    btn.setAttribute("aria-expanded", open ? "false" : "true");
  });

  menu.querySelectorAll("[data-lang]").forEach((item) => {
    item.addEventListener("click", () => {
      setLang(item.dataset.lang);
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (!menu.hidden && !e.target.closest("#langSwitch")) {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

function moodNote(enKey) {
  const notes = MOOD_NOTES[currentLang] || MOOD_NOTES.zh;
  return notes[enKey] || MOOD_NOTES.zh[enKey] || "";
}

function moodTone(enKey) {
  const tones = MOOD_TONES[currentLang] || MOOD_TONES.zh;
  return tones[enKey] || MOOD_TONES.zh[enKey] || enKey;
}

loadLang();

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  setupLangSwitch();
});

window.addEventListener("ut-lang-change", () => {
  applyI18n();
  if (typeof renderMessages === "function") renderMessages();
});
