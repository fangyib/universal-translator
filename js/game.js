const GAME_PATH = "game/room.html";
const GAME_VERSION = "20260905-i18n";

let gameFrame = null;
let gameView = null;

function initGame() {
  gameView = document.getElementById("gameView");
  gameFrame = document.getElementById("gameFrame");
  const closeBtn = document.getElementById("gameCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", () => exitGame());
  window.addEventListener("message", handleGameMessage);
}

function handleGameMessage(event) {
  if (!event.data || event.data.type !== "emotion-room-exit") return;
  exitGame();
}

function openGame(emotionKey) {
  if (!gameView || !gameFrame) initGame();
  const key = emotionKey || "calm";
  const lang = typeof getLang === "function" ? getLang() : "zh";
  gameFrame.src = `${GAME_PATH}?embed=1&emotion=${encodeURIComponent(key)}&lang=${encodeURIComponent(lang)}&v=${GAME_VERSION}&t=${Date.now()}`;
  gameView.hidden = false;
  document.body.classList.add("game-open");
  if (typeof applyI18n === "function") applyI18n(gameView);
}

function exitGame() {
  if (!gameView || !gameFrame) return;
  gameView.hidden = true;
  document.body.classList.remove("game-open");
  gameFrame.src = "about:blank";
  if (typeof saveSessions === "function") saveSessions();
}

document.addEventListener("DOMContentLoaded", initGame);
