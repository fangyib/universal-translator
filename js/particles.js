(function () {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let ripples = [];
  let dots = [];
  let mouse = { x: -9999, y: -9999, active: false, px: -9999, py: -9999 };
  let hue = 0;

  // 等距房间配色（取自 GLB 材质，与背景色温一致）
  const COLORS = [
    "rgba(56, 187, 212,",   // 青蓝墙面 mat3
    "rgba(255, 156, 64,",   // 暖橙 mat18
    "rgba(255, 212, 10,",   // 明黄 mat12
    "rgba(222, 31, 74,",    // 玫红 mat7
    "rgba(0, 86, 201,",     // 深蓝 mat5
    "rgba(245, 236, 217,"   // 暖白（灯光） mat21
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 背景漂浮小点（低透明度、不再闪烁，仅作静谧氛围）
    dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      s: Math.random() * 0.3 + 0.05,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: Math.random() * 0.22 + 0.14
    }));
  }

  function addRipple(x, y, big = false) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const layers = big ? 3 : 1;
    for (let i = 0; i < layers; i++) {
      ripples.push({
        x, y,
        r: 2 + i * 4,
        maxR: big ? 180 + Math.random() * 100 : 60 + Math.random() * 40,
        speed: big ? 3.2 + Math.random() * 0.8 : 1.8 + Math.random() * 0.6,
        color,
        alpha: big ? 0.85 : 0.6,
        line: big ? 2.2 : 1.4
      });
    }
    // 限制数组长度
    if (ripples.length > 260) ripples.splice(0, ripples.length - 260);
  }

  function tick() {
    hue += 0.3;
    // 轻微淡出残影（与新背景深色一致）
    ctx.fillStyle = "rgba(13, 18, 24, 0.18)";
    ctx.fillRect(0, 0, W, H);

    // 漂浮小点
    dots.forEach((d) => {
      d.y -= d.s;
      d.x += Math.sin((d.y + d.x) / 50) * 0.3;
      if (d.y < -4) {
        d.y = H + 4;
        d.x = Math.random() * W;
      }
      ctx.beginPath();
      ctx.fillStyle = d.c + d.a + ")";
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 水波纹
    for (let i = ripples.length - 1; i >= 0; i--) {
      const p = ripples[i];
      p.r += p.speed;
      const progress = p.r / p.maxR;
      const a = p.alpha * (1 - progress);

      if (a <= 0.01 || p.r >= p.maxR) {
        ripples.splice(i, 1);
        continue;
      }

      // 多层环线
      ctx.beginPath();
      ctx.strokeStyle = p.color + a + ")";
      ctx.lineWidth = p.line * (1 - progress * 0.5);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();

      // 内部柔光
      const grad = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r * 0.9);
      grad.addColorStop(0, p.color + (a * 0.25) + ")");
      grad.addColorStop(1, p.color + "0)");
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.r * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 附加第二圈
      if (progress < 0.6) {
        ctx.beginPath();
        ctx.strokeStyle = p.color + (a * 0.35) + ")";
        ctx.lineWidth = p.line * 0.6;
        ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 鼠标拖尾波纹 - 只在鼠标移动过的路径上产生小波纹
    if (mouse.active) {
      const dx = mouse.x - mouse.px;
      const dy = mouse.y - mouse.py;
      const dist = Math.hypot(dx, dy);
      if (dist > 3) {
        const count = Math.min(3, Math.floor(dist / 15));
        for (let i = 0; i < count; i++) {
          const t = count === 1 ? 0.5 : i / (count - 1);
          addRipple(mouse.px + dx * t, mouse.py + dy * t, false);
        }
      }
      mouse.px = mouse.x;
      mouse.py = mouse.y;
    }

    requestAnimationFrame(tick);
  }

  // 鼠标事件
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // 首次进入时同步初始位置，避免在屏幕上拉出一条意外的波纹
    if (!mouse.active) {
      mouse.px = e.clientX;
      mouse.py = e.clientY;
    }
    mouse.active = true;
  });
  window.addEventListener("mousedown", (e) => {
    // 点击只在点击位置闪烁波纹
    addRipple(e.clientX, e.clientY, true);
  });
  window.addEventListener("mouseleave", () => { mouse.active = false; });
  window.addEventListener("touchmove", (e) => {
    if (e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      if (!mouse.active) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
      mouse.active = true;
    }
  }, { passive: true });
  window.addEventListener("touchstart", (e) => {
    if (e.touches[0]) {
      addRipple(e.touches[0].clientX, e.touches[0].clientY, true);
    }
  }, { passive: true });

  window.addEventListener("resize", resize);
  resize();
  tick();
})();
