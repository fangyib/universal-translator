function $(sel) {
  return document.querySelector(sel);
}

function $$(sel) {
  return [...document.querySelectorAll(sel)];
}

function currentSession() {
  if (!AppState.currentId) return null;
  return AppState.sessions.find((s) => s.id === AppState.currentId) || null;
}

function renderHistory() {
  const list = $("#historyList");
  list.innerHTML = "";
  const sessions = AppState.sessions.filter((s) => s.messages && s.messages.length);
  if (!sessions.length) return;
  sessions.forEach((s) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.session = s.id;
    if (s.id === AppState.currentId) btn.classList.add("active");
    btn.textContent = s.title;
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderMessages() {
  const welcome = $("#welcome");
  const box = $("#messages");
  const session = currentSession();

  if (!session || !session.messages.length) {
    // 没有当前会话或会话为空时，显示大标题欢迎页
    welcome.hidden = false;
    box.hidden = true;
    box.innerHTML = "";
    return;
  }

  welcome.hidden = true;
  box.hidden = false;
  box.innerHTML = "";
  session.messages.forEach((msg) => {
    box.appendChild(buildMessage(msg));
  });
}

function buildMessage(msg) {
  const wrap = document.createElement("article");
  wrap.className = "msg " + msg.role;

  if (msg.role === "user") {
    const card = document.createElement("div");
    card.className = "bubble";
    if (msg.text) {
      const p = document.createElement("p");
      p.textContent = msg.text;
      card.appendChild(p);
    }
    (msg.attachments || []).forEach((a) => card.appendChild(buildAttachment(a)));
    wrap.appendChild(card);
    return wrap;
  }

  if (msg.role === "bot") {
    wrap.appendChild(buildBotBubble(msg.result || {}));
    return wrap;
  }

  return wrap;
}

/**
 * 显示框架：把后端返回的任意结构渲染成气泡。
 * 支持字段（后端给任意子集即可）：
 *   intro:  string          首段引导语
 *   text:   string          自由文本，按换行分段渲染
 *   lines:  [{label,value}] 键值对
 *   items:  [{label,value}] lines 的别名
 *   footer: string          尾注
 */
function buildBotBubble(result) {
  const view = typeof localizeReply === "function" ? localizeReply(result) : result;
  const card = document.createElement("div");
  card.className = "bubble";
  if (view._typing) card.classList.add("typing");

  if (view.intro) {
    const p = document.createElement("p");
    p.textContent = view.intro;
    card.appendChild(p);
  }

  if (typeof view.text === "string" && view.text.length) {
    view.text.split(/\r?\n/).forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      card.appendChild(p);
    });
  }

  const rows = Array.isArray(view.lines) ? view.lines
             : Array.isArray(view.items) ? view.items
             : [];
  rows.forEach((l) => {
    if (l == null) return;
    const row = document.createElement("div");
    row.className = "result-item";
    const label = l.label != null ? l.label : "";
    const value = l.value != null ? l.value : (typeof l === "string" ? l : "");
    row.innerHTML = `<b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span>`;
    card.appendChild(row);
  });

  if (view.footer) {
    const f = document.createElement("p");
    f.className = "meta";
    f.textContent = view.footer;
    card.appendChild(f);
  }

  // 内部字段不展示在气泡里
  const known = new Set([
    "intro", "text", "lines", "items", "footer",
    "_typing", "game_emotion", "game_url", "_raw", "_zh", "_en"
  ]);
  Object.keys(result).forEach((k) => {
    if (known.has(k)) return;
    const v = result[k];
    if (v == null) return;
    const row = document.createElement("div");
    row.className = "result-item";
    row.innerHTML = `<b>${escapeHtml(k)}</b><span>${escapeHtml(typeof v === "string" ? v : JSON.stringify(v))}</span>`;
    card.appendChild(row);
  });

  return card;
}

function buildAttachment(a) {
  const wrap = document.createElement("div");
  wrap.className = "attachment attach-" + a.type;
  if (a.type === "image" && a.url) {
    const img = document.createElement("img");
    img.src = a.url;
    img.alt = a.name || "image";
    wrap.appendChild(img);
  } else if (a.type === "audio" && a.url) {
    const au = document.createElement("audio");
    au.controls = true;
    au.src = a.url;
    wrap.appendChild(au);
  } else {
    const file = document.createElement("div");
    file.className = "file-row";
    file.innerHTML = `<span class="file-icon">📎</span><span class="file-name">${escapeHtml(a.name || "file")}</span>`;
    wrap.appendChild(file);
  }
  if (a.name) {
    const cap = document.createElement("p");
    cap.className = "meta";
    cap.textContent = a.name;
    wrap.appendChild(cap);
  }
  return wrap;
}

function renderChips() {
  const chips = $("#chips");
  if (!chips) return;
  chips.innerHTML = "";
  AppState.attachments.forEach((a, idx) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    const icon = a.type === "image" ? "🖼" : a.type === "audio" ? "🎙" : "📄";
    chip.innerHTML = `<span>${icon} ${escapeHtml(a.name || a.type)}</span>`;
    const rm = document.createElement("button");
    rm.type = "button";
    rm.title = t("chip.remove");
    rm.textContent = "×";
    rm.addEventListener("click", () => {
      if (a.url) URL.revokeObjectURL(a.url);
      AppState.attachments.splice(idx, 1);
      renderChips();
    });
    chip.appendChild(rm);
    chips.appendChild(chip);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function openOverlay(id) {
  const ov = document.getElementById(id);
  if (ov) ov.hidden = false;
}

function closeOverlay(id) {
  const ov = document.getElementById(id);
  if (ov) ov.hidden = true;
}

function showToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("in"));
  setTimeout(() => {
    toast.classList.remove("in");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
