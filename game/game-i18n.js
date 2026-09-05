(function () {
  const LANG_KEY = "ut-lang";

  const MSG = {
    "正在加载模型…": "Loading model…",
    "拖动旋转 · 滚轮缩放 · 右键平移 · 点击任意表面选中": "Drag to rotate · Scroll to zoom · Right-drag to pan · Click a surface to select",
    "点击喷泉试试...": "Tap the fountain…",
    "点击秋千椅试试...": "Try the swing…",
    "戳戳雪人~": "Poke the snowman~",
    "击打沙袋吧！": "Punch the sandbag!",
    "或许你想睡一觉（点击床试试）": "Maybe you need a nap (tap the bed)",
    "🧍 W A S D 走动 · 空格 跳跃 · 拖拽/滚轮 看方向 · Shift 加速 · V 俯瞰 / 第一视角": "🧍 WASD move · Space jump · Drag/scroll look · Shift sprint · V overview / first person",
    "按 Enter 跳过": "Press Enter to skip",
    "退出": "Exit",
    "退出游戏 (Esc)": "Exit game (Esc)",
    "🚪 出门": "🚪 Go out",
    "🏠 回房": "🏠 Go in",
    "默认视角": "Default",
    "前": "Front",
    "后": "Back",
    "左": "Left",
    "右": "Right",
    "顶": "Top",
    "↺ 撤销": "↺ Undo",
    "重置": "Reset",
    "🎲 随机配色": "🎲 Random colors",
    "⬇ 导出 GLB": "⬇ Export GLB",
    "复制配置": "Copy config",
    "导入配置": "Import config",
    "情绪小屋 · 情绪 → 室内外天气场景": "Emotion Room · Mood → indoor & outdoor weather",
    "输入情绪，生成属于你的小屋与天气": "Enter a mood to generate your room and weather",
    "撤销上一步": "Undo last step",
    "恢复模型原始外观": "Restore original look",
    "随机换一套配色": "Random color palette",
    "把当前颜色/大小烘焙后导出为新的 .glb 文件": "Export current colors/size baked into a new .glb",
    "复制一份参数配置 JSON 到剪贴板": "Copy settings JSON to clipboard",
    "导入之前保存的参数配置": "Import saved settings",
    "📷 取景器 · 点击下方照片可再次保存": "📷 Viewfinder · Tap a photo below to save again",
    "缩小": "Zoom out",
    "放大": "Zoom in",
    "左转": "Turn left",
    "右转": "Turn right",
    "上仰": "Look up",
    "下俯": "Look down",
    "📸 拍照": "📸 Photo",
    "← → 转向 · ↑ ↓ 俯仰 · + − 缩放 · 空格 拍照 · Esc 退出": "← → turn · ↑ ↓ pitch · + − zoom · Space photo · Esc exit",
    "🎠 荡秋千 · 剩余": "🎠 Swing · Remaining",
    "⏸ 暂停": "⏸ Pause",
    "⬇ 提前结束": "⬇ End early",
    "空格 暂停/继续 · ← → 视线左转/右转 · ↑ ↓ 抬头/低头 · Esc 结束": "Space pause/resume · ← → look · ↑ ↓ pitch · Esc end",
    "场景": "Scene",
    "部件": "Parts",
    "说明": "Help",
    "🎭 输入情绪，生成室内外天气场景": "🎭 Enter a mood to generate indoor & outdoor weather",
    "例：快乐 / 平静 / 愤怒 / 疲惫 / 悲伤 / 焦虑": "e.g. joy / calm / anger / fatigue / sadness / anxiety",
    "生成": "Generate",
    "😊 快乐 → 晴天": "😊 Joy → Sunny",
    "😌 平静 → 多云": "😌 Calm → Cloudy",
    "😠 愤怒 → 雷暴": "😠 Anger → Thunder",
    "😪 疲惫 → 下雨": "😪 Fatigue → Rain",
    "😢 悲伤 → 下雪": "😢 Sadness → Snow",
    "😰 焦虑 → 晚霞": "😰 Anxiety → Dusk",
    "🏠 温馨日常改造": "🏠 Cozy daily makeover",
    "温馨日常": "Cozy mode",
    "恢复原始房间": "Restore original room",
    "门口的墙": "Wall by the door",
    "换成窗户（靠门口那块）": "Window (by the door)",
    "换成窗户（另一块墙板）": "Window (other wall panel)",
    "不换，保留原来的板": "Keep original panels",
    "门口放一只小橘猫（代替行李箱）": "Place an orange cat by the door (replaces luggage)",
    "房间角落加绿植和花": "Add plants and flowers in corners",
    "使用温馨暖色配色": "Use warm cozy palette",
    "房间": "Room",
    "整体大小": "Overall scale",
    "背景颜色": "Background color",
    "灯光": "Lighting",
    "环境光": "Ambient light",
    "主光强度": "Key light intensity",
    "主光角度": "Key light angle",
    "阴影": "Shadows",
    "快速改色": "Quick recolor",
    "按原始材质分组（场景中所有同色表面一起换）": "Grouped by original material (same color changes together)",
    "搜索部件": "Search parts",
    "输入材质名 / 编号 / 颜色，如 mat21 或 #fff": "Material name / id / color, e.g. mat21 or #fff",
    "当前选中": "Selected",
    "颜色": "Color",
    "不透明度": "Opacity",
    "大小（以选中部件的原尺寸为 100%）": "Size (100% = original)",
    "恢复原始大小": "Reset size",
    "显示此部件": "Show this part",
    "把颜色应用到整组「": "Apply color to group «",
    "」": "»",
    "对准此部件": "Focus this part",
    "地板 & 大表面": "Floor & large surfaces",
    "可整组换色，也可点开逐块调整": "Recolor groups or adjust piece by piece",
    "其它部件": "Other parts",
    "按材质分组，点击“颜色”可给整组换色": "Grouped by material; use Color to recolor a group",
    "怎么用": "How to use",
    "说明与限制": "Notes & limits",
    "🎮 雷暴游戏厅": "🎮 Thunder Arcade",
    "三台街机，选一台开玩": "Three cabinets—pick one to play",
    "俄罗斯方块": "Tetris",
    "5 关 · 消除行数闯关": "5 levels · clear lines to advance",
    "数独": "Sudoku",
    "5 关 · 难度递增": "5 levels · increasing difficulty",
    "拼图": "Jigsaw",
    "3 关 · 3×3 / 4×4 / 5×5": "3 levels · 3×3 / 4×4 / 5×5",
    "关闭游戏厅": "Close arcade",
    "← 返回选择游戏": "← Back to game select",
    "← 关卡": "← Levels",
    "快乐": "Joy",
    "平静": "Calm",
    "愤怒": "Anger",
    "疲惫": "Fatigue",
    "悲伤": "Sadness",
    "焦虑": "Anxiety",
    "开心 · 晴天": "Joy · Sunny",
    "快乐 · 晴天": "Joy · Sunny",
    "平静 · 多云": "Calm · Cloudy",
    "愤怒 · 雷雨": "Anger · Thunderstorm",
    "愤怒 · 雷暴": "Anger · Thunderstorm",
    "疲惫 · 下雨": "Fatigue · Rain",
    "悲伤 · 下雪": "Sadness · Snow",
    "焦虑 · 晚霞": "Anxiety · Sunset",
    "阳光洒满小屋，院子里花开正好": "Sunlight fills the cabin; flowers bloom in the yard",
    "风很轻，云慢慢飘过院子": "A light breeze; clouds drift slowly over the yard",
    "天色暗了下来，闪电在云间亮起": "The sky darkens; lightning flashes between the clouds",
    "雨声很轻，适合窝在屋里": "Soft rain—perfect for staying indoors",
    "雪安静地落下，给小屋盖上白毯": "Snow falls quietly, blanketing the cabin in white",
    "天色烧成红色，晚霞压得很低": "The sky burns red; the sunset hangs low",
    "室外大本底已就绪（已去掉棕色栅栏与灰色小屋）：点击门或按「出门」": "Outdoor grounds are ready (fence and gray cabin removed): click the door or press Go out",
    "室外大本底已就绪：点击门或按「出门」": "Outdoor grounds are ready: click the door or press Go out",
    "已应用「": "Applied preset «",
    "」固定场景": "»",
    "已切回手动模式（原始配色）": "Switched back to manual mode (original colors)",
    "正在加载模型…": "Loading model…",
    "正在解析房间模型…": "Parsing room model…",
    "正在构建房间模型…": "Building room model…",
    "加载失败：": "Load failed: ",
    "页面脚本出错：": "Script error: ",
    "加载出错：": "Load error: "
  };

  const EMOTION_EN = {
    joy: "Joy",
    calm: "Calm",
    anger: "Anger",
    fatigue: "Fatigue",
    sadness: "Sadness",
    anxiety: "Anxiety"
  };

  function readLang() {
    try {
      const params = new URLSearchParams(location.search);
      const fromUrl = params.get("lang");
      if (fromUrl === "en" || fromUrl === "zh") return fromUrl;
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "zh") return saved;
    } catch (_) {}
    return "zh";
  }

  let lang = readLang();
  window.__gameLang = lang;

  function gameT(text) {
    if (!text) return text;
    if (lang !== "en") return text;
    if (MSG[text]) return MSG[text];
    let out = text;
    Object.keys(MSG).sort((a, b) => b.length - a.length).forEach((zh) => {
      if (out.includes(zh)) out = out.split(zh).join(MSG[zh]);
    });
    return out;
  }

  const DYNAMIC_IDS = ["hint", "status", "toast", "mood-overlay-title", "mood-overlay-sub"];
  let dynamicObserversReady = false;

  function translateDynamicEl(el) {
    if (!el) return;
    const raw = el.textContent || "";
    if (!raw.trim()) return;
    if (lang === "en") {
      if (!el.dataset.zhText && /[\u4e00-\u9fff]/.test(raw)) el.dataset.zhText = raw;
      const src = el.dataset.zhText || raw;
      const next = gameT(src);
      if (next !== el.textContent) el.textContent = next;
    } else if (el.dataset.zhText) {
      el.textContent = el.dataset.zhText;
    }
  }

  function setupDynamicObservers() {
    if (dynamicObserversReady) return;
    dynamicObserversReady = true;
    DYNAMIC_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new MutationObserver(() => translateDynamicEl(el));
      obs.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  function translateDynamicAll() {
    DYNAMIC_IDS.forEach((id) => translateDynamicEl(document.getElementById(id)));
  }

  function translateNodeText(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.textContent;
      if (!raw || !/[\u4e00-\u9fff]/.test(raw)) return;
      const parent = node.parentElement;
      if (parent && !parent.dataset.zhText) parent.dataset.zhText = raw;
      let next = raw;
      Object.keys(MSG).sort((a, b) => b.length - a.length).forEach((zh) => {
        if (next.includes(zh)) next = next.split(zh).join(MSG[zh]);
      });
      if (next !== raw) node.textContent = next;
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return;
      if (el.hasAttribute("placeholder")) {
        const ph = el.getAttribute("placeholder");
        if (MSG[ph]) {
          if (!el.dataset.zhPlaceholder) el.dataset.zhPlaceholder = ph;
          el.setAttribute("placeholder", MSG[ph]);
        }
      }
      if (el.hasAttribute("title")) {
        const ti = el.getAttribute("title");
        if (MSG[ti]) {
          if (!el.dataset.zhTitle) el.dataset.zhTitle = ti;
          el.setAttribute("title", MSG[ti]);
        }
      }
      if (el.hasAttribute("alt") && MSG[el.getAttribute("alt")]) {
        if (!el.dataset.zhAlt) el.dataset.zhAlt = el.getAttribute("alt");
        el.setAttribute("alt", MSG[el.getAttribute("alt")]);
      }
      [...el.childNodes].forEach(translateNodeText);
    }
  }

  function applyGameI18n() {
    lang = window.__gameLang || lang;
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    setupDynamicObservers();

    if (lang === "en") {
      translateNodeText(document.body);
      translateDynamicAll();
    } else {
      document.querySelectorAll("[data-zh-text]").forEach((el) => {
        el.textContent = el.dataset.zhText;
      });
      document.querySelectorAll("[data-zh-placeholder]").forEach((el) => {
        el.setAttribute("placeholder", el.dataset.zhPlaceholder);
      });
      document.querySelectorAll("[data-zh-title]").forEach((el) => {
        el.setAttribute("title", el.dataset.zhTitle);
      });
      document.querySelectorAll("[data-zh-alt]").forEach((el) => {
        el.setAttribute("alt", el.dataset.zhAlt);
      });
      translateDynamicAll();
    }

    const exitBtn = document.getElementById("btn-exit-embed");
    if (exitBtn) {
      exitBtn.textContent = lang === "en" ? gameT("退出") : "退出";
      exitBtn.title = lang === "en" ? gameT("退出游戏 (Esc)") : "退出游戏 (Esc)";
    }

    const rideTop = document.querySelector(".ride-top");
    if (rideTop) {
      const time = document.getElementById("ride-time");
      const timeHtml = time ? time.outerHTML : "<b id=\"ride-time\">05:00</b>";
      const zhPrefix = "🎠 荡秋千 · 剩余";
      if (lang === "en") {
        rideTop.innerHTML = gameT(zhPrefix) + " " + timeHtml;
      } else {
        rideTop.innerHTML = zhPrefix + " " + timeHtml;
      }
    }
  }

  window.__gameT = gameT;
  window.__applyGameI18n = applyGameI18n;
  window.__gameEmotionLabel = function (key) {
    if (lang === "en") return EMOTION_EN[key] || key;
    return ({ joy: "快乐", calm: "平静", anger: "愤怒", fatigue: "疲惫", sadness: "悲伤", anxiety: "焦虑" })[key] || key;
  };

  window.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.type !== "set-lang") return;
    window.__gameLang = data.lang === "en" ? "en" : "zh";
    lang = window.__gameLang;
    applyGameI18n();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyGameI18n);
  } else {
    applyGameI18n();
  }
  window.addEventListener("load", () => {
    setTimeout(() => {
      applyGameI18n();
      setInterval(translateDynamicAll, 800);
    }, 100);
  });
})();
