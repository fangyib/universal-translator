from pathlib import Path
import base64
import re

GAME_SRC = Path("情绪小屋-单文件版.html")
GAME_DST = Path("game/room.html")

EMBED_CSS = """
/* --- embed mode: 仅保留中间游戏画面 --- */
html.embed,
html.embed body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
html.embed #topbar,
html.embed #panel {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  border: 0 !important;
}
html.embed main {
  display: block !important;
  width: 100% !important;
  height: 100vh !important;
  height: 100dvh !important;
  margin: 0 !important;
  padding: 0 !important;
}
html.embed #stage-wrap {
  position: fixed !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  flex: none !important;
  min-width: 0 !important;
}
html.embed #viewer {
  width: 100% !important;
  height: 100% !important;
}
html.embed #camera-bar {
  position: fixed;
  right: 12px;
  bottom: 10px;
  z-index: 50;
}
html.embed #camera-bar > button:not(#btn-go-in):not(#btn-exit-embed) { display: none !important; }
html.embed #btn-exit-embed {
  margin-left: 4px;
  padding: 4px 12px;
  font-size: 12px;
  background: rgba(220, 80, 60, 0.85);
  border: 1px solid rgba(255, 120, 100, 0.5);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
html.embed #btn-exit-embed:hover { background: rgba(240, 90, 70, 0.95); }
"""

EMBED_EARLY = """
<script>
(function () {
  var params = new URLSearchParams(location.search);
  if (params.get("embed") === "1" || window.parent !== window) {
    document.documentElement.classList.add("embed");
  }
})();
</script>
"""

EMBED_BRIDGE = """
<script>
(function () {
  const params = new URLSearchParams(location.search);
  const isEmbed = params.get("embed") === "1" || window.parent !== window;
  if (!isEmbed) return;

  window.__gameLang = params.get("lang") || localStorage.getItem("ut-lang") || "zh";

  function relayoutEmbed() {
    document.documentElement.classList.add("embed");
    window.dispatchEvent(new Event("resize"));
  }
  relayoutEmbed();

  const EMOTION_LABELS = {
    joy: "快乐",
    calm: "平静",
    anger: "愤怒",
    fatigue: "疲惫",
    sadness: "悲伤",
    anxiety: "焦虑"
  };

  const EMOTION_WEATHER = {
    joy: "sunny",
    calm: "cloudy",
    anger: "thunder",
    fatigue: "rain",
    sadness: "snow",
    anxiety: "dusk"
  };

  const COZY_KEY = "room-cozy-v1";

  function seedCozyEmotion(key) {
    if (!EMOTION_WEATHER[key]) return;
    try {
      const raw = localStorage.getItem(COZY_KEY);
      const cozy = raw ? JSON.parse(raw) : {};
      cozy.emotion = key;
      cozy.weather = EMOTION_WEATHER[key];
      cozy.mode = cozy.mode !== false;
      localStorage.setItem(COZY_KEY, JSON.stringify(cozy));
    } catch (_) {}
  }

  const targetEmotion = params.get("emotion");
  if (targetEmotion) seedCozyEmotion(targetEmotion);

  function applyEmotion(key) {
    const label = window.__gameEmotionLabel ? window.__gameEmotionLabel(key) : EMOTION_LABELS[key];
    if (!label) return false;
    const btn = document.querySelector('#emotion-suggest button[data-suggest="' + key + '"]');
    if (btn) {
      btn.click();
      return true;
    }
    const input = document.getElementById("emotion-input");
    const go = document.getElementById("btn-emotion-go");
    if (input && go) {
      input.value = label;
      go.click();
      return true;
    }
    return false;
  }

  function notifyReady(key) {
    window.parent.postMessage({ type: "emotion-room-ready", emotion: key || null }, "*");
  }

  function isGameReady() {
    const status = document.getElementById("status");
    return status && status.classList.contains("done") && !document.body.classList.contains("wake-intro");
  }

  function tryInitialEmotion() {
    const key = params.get("emotion");
    if (!key) {
      notifyReady(null);
      return;
    }
    if (!isGameReady()) {
      setTimeout(tryInitialEmotion, 400);
      return;
    }
    if (applyEmotion(key)) {
      notifyReady(key);
      return;
    }
    setTimeout(tryInitialEmotion, 400);
  }

  window.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.type === "set-emotion" && applyEmotion(data.emotion)) {
      notifyReady(data.emotion);
    }
    if (data.type === "set-lang") {
      window.__gameLang = data.lang === "en" ? "en" : "zh";
      if (window.__applyGameI18n) window.__applyGameI18n();
      const exitBtn = document.getElementById("btn-exit-embed");
      if (exitBtn && window.__gameT) {
        exitBtn.textContent = window.__gameT("退出");
        exitBtn.title = window.__gameT("退出游戏 (Esc)");
      }
    }
  });

  function requestExit() {
    window.parent.postMessage({ type: "emotion-room-exit" }, "*");
  }

  function setupEmbedControls() {
    const bar = document.getElementById("camera-bar");
    if (!bar || document.getElementById("btn-exit-embed")) return;
    const exitBtn = document.createElement("button");
    exitBtn.id = "btn-exit-embed";
    exitBtn.type = "button";
    exitBtn.textContent = window.__gameT ? window.__gameT("退出") : "退出";
    exitBtn.title = window.__gameT ? window.__gameT("退出游戏 (Esc)") : "退出游戏 (Esc)";
    exitBtn.addEventListener("click", requestExit);
    bar.appendChild(exitBtn);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.body.classList.contains("cam-active") || document.body.classList.contains("ride-active")) return;
    const wake = document.getElementById("wake-overlay");
    if (wake && !wake.classList.contains("hidden")) return;
    e.preventDefault();
    requestExit();
  });

  window.addEventListener("load", () => {
    relayoutEmbed();
    setupEmbedControls();
    setTimeout(tryInitialEmotion, 300);
  });
})();
</script>
"""

THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"

GAME_JS_PATCHES = [
    (
        "if (wakeAllowed()) enterRoomWake();",
        'if (wakeAllowed() && params.get("embed") !== "1") enterRoomWake();',
    ),
    (
        "var propsRef = {",
        """const REMOVED_ROOM_PART_IDS = new Set([4, 14, 15, 16, 17]);
	var propsRef = {""",
    ),
    (
        "async function buildParts(root, onProgress) {",
        """function isBedsideTableObject(object) {
		const name = String(object && (object.name || object.userData && object.userData.name) || "").toLowerCase();
		return /床头柜|床边柜|bedside|nightstand|night\\s*table/.test(name);
	}
	async function buildParts(root, onProgress) {""",
    ),
    (
        "if (!o.isMesh) return;",
        "if (!o.isMesh || isBedsideTableObject(o)) return;",
    ),
    (
        "if (ps.visible === void 0) ps.visible = true;",
        """if (ps.visible === void 0) ps.visible = true;
			if (REMOVED_ROOM_PART_IDS.has(p.id)) ps.visible = false;""",
    ),
    (
        "g.position.set(ax, minY, az);",
        "g.position.set(ax, minY, az);\n\t\t\tif (REMOVED_ROOM_PART_IDS.has(part.id)) g.visible = false;",
    ),
    (
        'tv.position.set(.5, FLOOR_Y, 1.25);\n\t\ttv.rotation.y = Math.PI;\n\t\ttv.visible = false;',
        """tv.position.set(.5, 1.05, 2.15);
		tv.rotation.y = Math.PI;
		tv.visible = false;
		// 挂墙电视不再保留落地支架和底座。
		for (const part of tv.children.slice(2)) part.visible = false;""",
    ),
    (
        'g.userData.tailRoot = tailRoot;\n\t\tg.scale.setScalar(1);',
        """g.userData.tailRoot = tailRoot;
		g.userData.head = head;
		g.userData.restRotationY = 0;
		g.userData.lookAtPlayer = false;
		g.scale.setScalar(.9);""",
    ),
    (
        "function applyRemodelStructure() {",
        """let importedCatLoadPromise = null;
	// 该 GLB 是单个静态网格（无骨骼蒙皮），坐姿已经是我们想要的最终姿态，
	// 不需要拆分部件，直接整只缩放摆放到床上即可；朝向/看向玩家时整体转身模拟“抬头”。
	const CAT_REST_ROTATION_Y = Math.PI / 2;
	const CAT_TARGET_HEIGHT = .34;
	function placeImportedCat(root) {
		root.name = "SittingCat";
		root.position.set(0, 0, 0);
		root.rotation.set(0, CAT_REST_ROTATION_Y, 0);
		root.scale.setScalar(1);
		root.updateMatrixWorld(true);
		let box = new Box3().setFromObject(root);
		let size = box.getSize(new Vector3());
		const scale = CAT_TARGET_HEIGHT / (size.y || 1);
		root.scale.setScalar(scale);
		root.updateMatrixWorld(true);
		box = new Box3().setFromObject(root);
		const center = box.getCenter(new Vector3());
		const bedCenterX = -1.25;
		const bedTopY = -.11;
		const bedFootZ = .35;
		root.position.set(
			bedCenterX - center.x,
			bedTopY - box.min.y,
			bedFootZ - center.z
		);
		root.userData.restRotationY = CAT_REST_ROTATION_Y;
		root.userData.restRotationX = 0;
		root.userData.imported = true;
		root.traverse((o) => {
			if (o.isMesh) {
				o.castShadow = true;
				o.receiveShadow = true;
			}
		});
	}
	function ensureImportedCat() {
		// 注意：不能用 cozyRefs.cat 作为已加载判断——原版代码会无条件用 makeCat() 预先
		// 生成门口的橘猫并赋给 cozyRefs.cat，用它当判断条件会导致这里直接短路，永远加载不到新模型。
		if (cozyRefs.importedCat) return Promise.resolve(cozyRefs.importedCat);
		if (importedCatLoadPromise) return importedCatLoadPromise;
		importedCatLoadPromise = loadRawScene("assets/sitting_catbritish_shorthair_blue_cat.glb").then((root) => {
			placeImportedCat(root);
			root.visible = true;
			innerGroup.add(root);
			cozyRefs.importedCat = root;
			return root;
		}).catch((error) => {
			console.error("小猫模型加载失败", error);
			return null;
		});
		return importedCatLoadPromise;
	}
	function applyRemodelStructure() {""",
    ),
    (
        "const wantCat = modeOn && cozySettings.cat;",
        "const wantCat = true;",
    ),
    (
        """		if (wantCat) {
			cozyRefs.hidden.suitcase = regions.suitcase;
			setPartsVisible(state.partsById, regions.suitcase, false);
			cozyRefs.cat.visible = true;
			cozyRefs.cat.position.set(-.5, FLOOR_Y, -1);
			cozyRefs.cat.rotation.y = -.2;""",
        """		if (wantCat) {
			cozyRefs.hidden.suitcase = regions.suitcase;
			setPartsVisible(state.partsById, regions.suitcase, false);
			// 原生门口橘猫对象保留（其它逻辑仍会引用 cozyRefs.cat），但一律隐藏；
			// 真正显示的猫改成写实模型，固定坐在床上，不再放在门口或行李箱上。
			cozyRefs.cat.visible = false;
			ensureImportedCat();
			if (cozyRefs.importedCat) {
				cozyRefs.importedCat.visible = true;
				placeImportedCat(cozyRefs.importedCat);
			}""",
    ),
    (
        "requestAnimationFrame(animate);\n\t\tconst nowT = performance.now();",
        """let __meowAudioPool = null;
	let __meowAudioIdx = 0;
	function playCatMeow() {
		try {
			if (!__meowAudioPool) {
				// 注意：three.js 在这个 bundle 里自己定义了一个同名的 Audio 类（继承自 Object3D，
				// 用来配合 AudioListener 播放空间音效），会覆盖掉浏览器原生的 window.Audio(url)，
				// 因此这里必须显式用 window.Audio 才能拿到真正的 <audio> 元素构造函数。
				__meowAudioPool = [0, 1, 2].map(() => {
					const a = new window.Audio("assets/cry-of-a-hungry-cat.mp3");
					a.volume = .55;
					a.preload = "auto";
					return a;
				});
			}
			const a = __meowAudioPool[__meowAudioIdx % __meowAudioPool.length];
			__meowAudioIdx++;
			a.currentTime = 0;
			const p = a.play();
			if (p && p.catch) p.catch(() => {});
		} catch (e) {}
	}
	function updateCatLookAtPlayer() {
		const cat = cozyRefs.importedCat;
		if (!cat || !cat.visible) return;
		const restY = cat.userData.restRotationY || 0;
		const restX = cat.userData.restRotationX || 0;
		if (!fpMode || !fpMode.active) {
			cat.rotation.y += (restY - cat.rotation.y) * .08;
			cat.rotation.x += (restX - cat.rotation.x) * .08;
			cat.userData.lookAtPlayer = false;
			return;
		}
		const dx = fpMode.x - cat.position.x;
		const dz = fpMode.z - cat.position.z;
		const distance = Math.hypot(dx, dz);
		const near = distance < 1.6;
		const targetY = near ? Math.atan2(dx, dz) : restY;
		const targetX = near ? restX - .16 : restX;
		let deltaY = targetY - cat.rotation.y;
		deltaY = Math.atan2(Math.sin(deltaY), Math.cos(deltaY));
		cat.rotation.y += deltaY * .12;
		cat.rotation.x += (targetX - cat.rotation.x) * .1;
		if (near && !cat.userData.lookAtPlayer) playCatMeow();
		cat.userData.lookAtPlayer = near;
	}
		requestAnimationFrame(animate);
		const nowT = performance.now();""",
    ),
    (
        "if (cozyRefs.cat && cozyRefs.cat.visible && cozyRefs.cat.userData.tailRoot) cozyRefs.cat.userData.tailRoot.rotation.z = Math.sin(nowT / 700) * .18;",
        "if (cozyRefs.cat && cozyRefs.cat.visible && cozyRefs.cat.userData.tailRoot) cozyRefs.cat.userData.tailRoot.rotation.z = Math.sin(nowT / 700) * .18;\n\t\tupdateCatLookAtPlayer();",
    ),
    (
        """    goOutside,
    goInside
  };""",
        """    goOutside,
    goInside,
    get fpMode() { return fpMode; },
    get propsRef() { return propsRef; },
    get controls() { return controls; },
    initFirstPerson,
    enableFirstPerson,
    disableFirstPerson,
    startCamFlight,
    get camFlight() { return camFlight; }
  };""",
    ),
]


def patch_obfuscated_game_js(html: str) -> str:
    match = re.search(r'eval\(atob\("([^"]+)"\)\)', html)
    if not match:
        return html

    js = base64.b64decode(match.group(1)).decode("utf-8")
    for old, new in GAME_JS_PATCHES:
        if old not in js:
            raise RuntimeError(f"game js patch anchor not found: {old!r}")
        js = js.replace(old, new, 1)

    encoded = base64.b64encode(js.encode("utf-8")).decode("ascii")
    return html.replace(match.group(0), f'eval(atob("{encoded}"))', 1)


def main() -> None:
    GAME_DST.parent.mkdir(parents=True, exist_ok=True)
    html = GAME_SRC.read_text(encoding="utf-8")

    html = html.replace(
        '{ "imports": { "three": "./lib/three.module.js" } }',
        f'{{ "imports": {{ "three": "{THREE_CDN}" }} }}',
    )

    html = patch_obfuscated_game_js(html)

    embed_css_pattern = r"/\* --- embed mode:.*?\*/[\s\S]*?html\.embed #btn-exit-embed:hover[^\}]*\}"
    if re.search(embed_css_pattern, html):
        html = re.sub(embed_css_pattern, EMBED_CSS.strip(), html, count=1)
    elif "html.embed #topbar" not in html:
        html = html.replace("</style>", EMBED_CSS + "\n  </style>", 1)

    if "document.documentElement.classList.add(\"embed\")" not in html.split("</head>", 1)[0]:
        html = html.replace("</head>", EMBED_EARLY + "\n</head>", 1)

    if "game-i18n.js" not in html.split("</head>", 1)[0]:
        html = html.replace("</head>", '<script src="game-i18n.js"></script>\n</head>', 1)

    bridge_pattern = r'<script>\s*\(function \(\) \{[\s\S]*?emotion-room-ready[\s\S]*?\}\)\(\);\s*</script>'
    if re.search(bridge_pattern, html):
        html = re.sub(bridge_pattern, EMBED_BRIDGE.strip(), html, count=1)
    elif "emotion-room-ready" not in html:
        html = html.replace("</body>", EMBED_BRIDGE + "\n</body>", 1)

    GAME_DST.write_text(html, encoding="utf-8")
    print(f"Wrote {GAME_DST} ({GAME_DST.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
