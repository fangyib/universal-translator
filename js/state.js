const STORAGE_KEY = "ut-sessions-v1";

const AppState = {
  // 首次打开页面时没有会话历史，用户点击「新对话」后再创建
  sessions: [],
  currentId: null,
  mode: "text",
  user: null,
  // 当前正在编辑的附件草稿，发送后会清空
  attachments: []
};

function saveSessions() {
  try {
    const data = {
      sessions: AppState.sessions
        .filter((s) => s.messages && s.messages.length > 0)
        .map((s) => ({
          id: s.id,
          title: s.title,
          messages: s.messages
        }))
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("saveSessions failed", err);
  }
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.sessions)) return;
    AppState.sessions = data.sessions.filter((s) => s.messages && s.messages.length > 0);
    // 每次进入页面都显示主欢迎页，不自动恢复上次会话
    AppState.currentId = null;
  } catch (err) {
    console.warn("loadSessions failed", err);
  }
}

function clearAllSessions() {
  AppState.sessions = [];
  AppState.currentId = null;
  AppState.attachments = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("clearAllSessions failed", err);
  }
  if (typeof renderHistory === "function") renderHistory();
  if (typeof renderMessages === "function") renderMessages();
  if (typeof renderChips === "function") renderChips();
  const prompt = document.querySelector("#prompt");
  if (prompt) {
    prompt.value = "";
    prompt.style.height = "auto";
  }
}
