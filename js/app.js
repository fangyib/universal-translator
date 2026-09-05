document.addEventListener("DOMContentLoaded", () => {
  loadSessions();
  renderHistory();
  renderMessages();
  renderChips();

  const prompt = $("#prompt");
  prompt.addEventListener("input", () => {
    prompt.style.height = "auto";
    prompt.style.height = Math.min(prompt.scrollHeight, 160) + "px";
  });
  prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  $("#sendBtn").addEventListener("click", send);
  $("#newChatBtn").addEventListener("click", () => newChat());
  $("#clearHistoryBtn").addEventListener("click", () => {
    if (!AppState.sessions.length) return;
    if (!window.confirm(t("clearHistory.confirm"))) return;
    clearAllSessions();
  });
  $("#aboutBtn").addEventListener("click", () => openOverlay("aboutOverlay"));
  $("#loginBtn").addEventListener("click", () => openOverlay("loginOverlay"));

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeOverlay(btn.dataset.close));
  });
  document.querySelectorAll(".overlay").forEach((ov) => {
    ov.addEventListener("click", (e) => {
      if (e.target === ov) ov.hidden = true;
    });
  });

  $("#historyList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-session]");
    if (!btn) return;
    AppState.currentId = btn.dataset.session;
    renderHistory();
    renderMessages();
  });

  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const user = $("#loginUser").value.trim();
    const pass = $("#loginPass").value;
    if (!user || !pass) {
      showLoginTip(t("login.tip.empty"));
      return;
    }
    showLoginTip(t("login.tip.signing"));
    setTimeout(() => {
      AppState.user = { name: user, provider: "password" };
      showLoginTip(t("login.tip.welcome", { name: user }));
      setTimeout(() => closeOverlay("loginOverlay"), 800);
    }, 600);
  });

  document.querySelectorAll(".social-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.dataset.provider;
      const label = { google: "Google", github: "GitHub", wechat: t("social.wechat") }[provider] || provider;
      showLoginTip(t("login.tip.social", { label }));
      setTimeout(() => {
        AppState.user = { name: label + " User", provider };
        showLoginTip(t("login.tip.success", { label }));
        setTimeout(() => closeOverlay("loginOverlay"), 800);
      }, 800);
    });
  });

  // 图片 / 文件上传
  $("#imgBtn").addEventListener("click", () => $("#imgInput").click());
  $("#imgInput").addEventListener("change", handleFilePick);

  window.addEventListener("ut-lang-change", () => {
    const tip = $("#loginTip");
    if (tip && tip.textContent) applyI18n(document.getElementById("loginOverlay"));
  });
});

function showLoginTip(msg) {
  const tip = $("#loginTip");
  tip.textContent = msg;
}

function ensureSession() {
  let session = currentSession();
  if (session) return session;

  const id = "s" + Date.now();
  session = { id, title: t("session.untitled"), messages: [] };
  AppState.sessions.unshift(session);
  AppState.currentId = id;
  return session;
}

function newChat() {
  const session = currentSession();

  // 当前会话没有消息时，不保留空记录
  if (session && !session.messages.length) {
    const idx = AppState.sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) AppState.sessions.splice(idx, 1);
  }

  AppState.currentId = null;
  AppState.attachments = [];
  $("#prompt").value = "";
  $("#prompt").style.height = "auto";
  renderChips();
  renderHistory();
  renderMessages();
  saveSessions();
}

function handleFilePick(e) {
  const files = [...e.target.files || []];
  if (!files.length) return;
  files.forEach((file) => {
    const isImage = file.type.startsWith("image/");
    const att = {
      type: isImage ? "image" : "file",
      name: file.name,
      mime: file.type,
      size: file.size,
      url: isImage ? URL.createObjectURL(file) : null
    };
    AppState.attachments.push(att);
  });
  e.target.value = "";
  renderChips();
}

async function send() {
  const text = $("#prompt").value.trim();
  const atts = AppState.attachments.slice();
  if (!text && atts.length === 0) return;

  // 首次发送时才创建会话并写入历史
  const session = ensureSession();
  const payload = { text, mode: AppState.mode, attachments: atts };

  session.messages.push({ role: "user", ...payload });
  if (!session.title || session.title.startsWith("未命名") || session.title.startsWith("Untitled") || session.title.includes("晨雾")) {
    session.title = (text || atts[0].name || (getLang() === "en" ? "New Session" : "新会话")).slice(0, 18);
  }

  $("#prompt").value = "";
  $("#prompt").style.height = "auto";
  // 清空草稿附件
  AppState.attachments = [];
  renderChips();
  renderHistory();
  renderMessages();
  scrollChatToEnd();

  // 思考中占位气泡，等后端返回后替换
  const typing = { role: "bot", result: { intro: t("thinking"), _typing: true } };
  session.messages.push(typing);
  renderMessages();
  scrollChatToEnd();

  const result = await translate(payload);
  typing.result = result;
  renderMessages();
  scrollChatToEnd();
  saveSessions();

  if (result.game_emotion && typeof openGame === "function") {
    setTimeout(() => openGame(result.game_emotion), 600);
  }
}

function scrollChatToEnd() {
  const chat = $("#chatView");
  if (chat) chat.scrollTop = chat.scrollHeight;
}
