(function () {
  const BAR_COUNT = 7;
  let recording = false;
  let audioCtx = null;
  let analyser = null;
  let micStream = null;
  let rafId = null;
  let recognition = null;
  let voiceBaseText = "";

  function initVoiceBars() {
    ["voiceBarsLeft", "voiceBarsRight"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el || el.children.length) return;
      for (let i = 0; i < BAR_COUNT; i++) {
        const bar = document.createElement("div");
        bar.className = "voice-bar";
        el.appendChild(bar);
      }
    });
  }

  function getSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.lang = getLang() === "en" ? "en-US" : "zh-CN";
    rec.continuous = true;
    rec.interimResults = true;
    return rec;
  }

  function showPanel(show) {
    const panel = $("#voicePanel");
    const btn = $("#voiceBtn");
    if (!panel || !btn) return;
    panel.hidden = !show;
    btn.classList.toggle("active", show);
    btn.classList.toggle("is-recording", show);
    btn.setAttribute("aria-pressed", show ? "true" : "false");
    const label = btn.querySelector("span");
    if (label) label.textContent = show ? t("voice.stop") : t("voice.start");
  }

  function animateBars(level) {
    const micSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--voice-mic-size")) || 44;
    document.querySelectorAll(".voice-bar").forEach((bar, idx) => {
      const parent = bar.parentElement;
      const sideIdx = parent?.classList.contains("voice-bars--right")
        ? idx
        : BAR_COUNT - 1 - idx;
      const taper = 1 - (sideIdx / Math.max(BAR_COUNT - 1, 1)) * 0.75;
      const h = Math.max(6, micSize * taper * (0.28 + level * 0.72));
      bar.style.height = `${h}px`;
    });
  }

  function startVisualizer(stream) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      if (!recording) return;
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      animateBars(sum / data.length / 255);
      rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopVisualizer() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    analyser = null;
    animateBars(0.12);
  }

  function cleanupStream() {
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
  }

  function stopRecognition() {
    if (!recognition) return;
    try {
      recognition.stop();
    } catch (_) {}
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition = null;
  }

  async function startVoice() {
    const prompt = $("#prompt");
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast("当前浏览器不支持麦克风");
      return;
    }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceBaseText = prompt.value;
      if (voiceBaseText && !voiceBaseText.endsWith(" ")) voiceBaseText += " ";

      initVoiceBars();
      showPanel(true);
      recording = true;
      startVisualizer(micStream);

      recognition = getSpeechRecognition();
      if (!recognition) {
        showToast("当前浏览器不支持语音转文字，请换用 Chrome/Edge");
        return;
      }

      recognition.onresult = (event) => {
        let interim = "";
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += chunk;
          else interim += chunk;
        }
        prompt.value = voiceBaseText + finalText + interim;
        prompt.dispatchEvent(new Event("input"));
      };

      recognition.onerror = (event) => {
        if (event.error === "not-allowed") showToast("麦克风权限被拒绝");
      };

      recognition.onend = () => {
        if (recording) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognition.start();
    } catch (err) {
      showToast("无法访问麦克风");
      stopVoice();
    }
  }

  function stopVoice() {
    recording = false;
    showPanel(false);
    stopVisualizer();
    cleanupStream();
    stopRecognition();
    const prompt = $("#prompt");
    if (prompt) voiceBaseText = prompt.value;
  }

  function toggleVoice() {
    if (recording) stopVoice();
    else startVoice();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initVoiceBars();
    const btn = $("#voiceBtn");
    if (btn) btn.addEventListener("click", toggleVoice);
    window.addEventListener("ut-lang-change", () => {
      const btn = $("#voiceBtn");
      const panel = $("#voicePanel");
      if (!btn || !panel) return;
      const label = btn.querySelector("span");
      if (label) label.textContent = panel.hidden ? t("voice.start") : t("voice.stop");
    });
  });
})();
