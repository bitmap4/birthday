(() => {
  const canvas = document.getElementById("tape");
  const frame = document.querySelector(".tape-frame");
  const sz = document.getElementById("sz");
  const ink = document.getElementById("ink");
  const tex = document.getElementById("tex");
  const streakLen = document.getElementById("streak-len");
  const streakWidth = document.getElementById("streak-width");
  const streakLenOut = document.getElementById("streak-len-out");
  const streakWidthOut = document.getElementById("streak-width-out");
  if (
    !canvas ||
    !frame ||
    !tex ||
    !streakLen ||
    !streakWidth ||
    !streakLenOut ||
    !streakWidthOut
  ) {
    return;
  }

  const W = 800;
  const H = 400;
  const dpr = 2;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let strokes = [];
  let curr = null;
  let dirty = false;
  let redrawQueued = false;

  function rand(seed) {
    let z = seed >>> 0;
    return () => {
      z += 0x6d2b79f5;
      let n = z;
      n = Math.imul(n ^ (n >>> 15), n | 1);
      n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
      return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sizeFrame() {
    const work = document.querySelector(".ed-work");
    if (!work) return;
    const k = Math.min(1, work.clientWidth / W, work.clientHeight / H);
    frame.style.transform = "scale(" + k + ")";
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  }

  function resample(pts, step) {
    if (pts.length < 2) return pts.slice();
    const out = [{ x: pts[0].x, y: pts[0].y }];
    let prev = pts[0];
    let carry = 0;
    for (let i = 1; i < pts.length; i++) {
      const end = pts[i];
      let dx = end.x - prev.x;
      let dy = end.y - prev.y;
      let len = Math.hypot(dx, dy);
      while (carry + len >= step && len > 0) {
        const t = (step - carry) / len;
        prev = { x: prev.x + dx * t, y: prev.y + dy * t };
        out.push(prev);
        dx = end.x - prev.x;
        dy = end.y - prev.y;
        len = Math.hypot(dx, dy);
        carry = 0;
      }
      carry += len;
      prev = end;
    }
    const last = pts[pts.length - 1];
    const tail = out[out.length - 1];
    if (Math.hypot(last.x - tail.x, last.y - tail.y) > 1) out.push(last);
    return out;
  }

  function smoothNoise(a) {
    for (let pass = 0; pass < 3; pass++) {
      const old = a.slice();
      for (let i = 1; i + 1 < a.length; i++) {
        a[i] = old[i - 1] * 0.25 + old[i] * 0.5 + old[i + 1] * 0.25;
      }
    }
  }

  function makeStrip(st) {
    const random = rand(st.seed || 1);
    let pts = resample(st.pts, 5);
    if (pts.length === 1) {
      pts = [
        { x: pts[0].x - st.size * 0.55, y: pts[0].y },
        { x: pts[0].x + st.size * 0.55, y: pts[0].y },
      ];
    }

    const n = pts.length;
    const edgeTop = [];
    const edgeBot = [];
    for (let i = 0; i < n; i++) {
      edgeTop.push(random() * 2 - 1);
      edgeBot.push(random() * 2 - 1);
    }
    smoothNoise(edgeTop);
    smoothNoise(edgeBot);

    const top = [];
    const bot = [];
    const tangents = [];
    const phase = random() * Math.PI * 2;
    const edgeAmp = Math.min(2.6, Math.max(1.2, st.size * 0.022));
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(n - 1, i + 1)];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      tangents.push({ x: dx, y: dy });
      const nx = -dy;
      const ny = dx;
      const drift =
        Math.sin(i * 0.23 + phase) * 0.018 +
        Math.sin(i * 0.071 + phase * 1.7) * 0.013;
      const half = st.size * 0.5 * (1 + drift);
      top.push({
        x: pts[i].x + nx * (half + edgeTop[i] * edgeAmp),
        y: pts[i].y + ny * (half + edgeTop[i] * edgeAmp),
      });
      bot.push({
        x: pts[i].x - nx * (half + edgeBot[i] * edgeAmp),
        y: pts[i].y - ny * (half + edgeBot[i] * edgeAmp),
      });
    }

    const path = new Path2D();
    path.moveTo(top[0].x, top[0].y);
    for (let i = 1; i < n; i++) path.lineTo(top[i].x, top[i].y);

    const end = pts[n - 1];
    const et = tangents[n - 1];
    const en = { x: -et.y, y: et.x };
    const eh = st.size * 0.5;
    const endCap = [top[n - 1]];
    for (let i = 1; i <= 9; i++) {
      const t = i / 9;
      const across = eh * (1 - 2 * t);
      const tear = (random() * 2 - 1) * Math.min(3.2, st.size * 0.035);
      const p = {
        x: end.x + en.x * across + et.x * tear,
        y: end.y + en.y * across + et.y * tear,
      };
      endCap.push(p);
      path.lineTo(p.x, p.y);
    }
    endCap.push(bot[n - 1]);

    for (let i = n - 2; i >= 0; i--) path.lineTo(bot[i].x, bot[i].y);

    const start = pts[0];
    const stg = tangents[0];
    const sn = { x: -stg.y, y: stg.x };
    const sh = st.size * 0.5;
    const startCap = [bot[0]];
    for (let i = 1; i <= 9; i++) {
      const t = i / 9;
      const across = -sh + sh * 2 * t;
      const tear = (random() * 2 - 1) * Math.min(3.2, st.size * 0.035);
      const p = {
        x: start.x + sn.x * across + stg.x * tear,
        y: start.y + sn.y * across + stg.y * tear,
      };
      startCap.push(p);
      path.lineTo(p.x, p.y);
    }
    startCap.push(top[0]);
    path.closePath();
    return { path, pts, top, bot, startCap, endCap };
  }

  function layer() {
    const el = document.createElement("canvas");
    el.width = W * dpr;
    el.height = H * dpr;
    const c = el.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { el, c };
  }

  function smoothstep(low, high, x) {
    const t = Math.max(0, Math.min(1, (x - low) / (high - low)));
    return t * t * (3 - 2 * t);
  }

  function latticeNoise(x, y, seed) {
    let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function valueNoise(x, y, scale, seed) {
    const gx = x / scale;
    const gy = y / scale;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const tx = smoothstep(0, 1, gx - x0);
    const ty = smoothstep(0, 1, gy - y0);
    const a = latticeNoise(x0, y0, seed);
    const b = latticeNoise(x0 + 1, y0, seed);
    const c = latticeNoise(x0, y0 + 1, seed);
    const d = latticeNoise(x0 + 1, y0 + 1, seed);
    const top = a + (b - a) * tx;
    const bottom = c + (d - c) * tx;
    return top + (bottom - top) * ty;
  }

  function makeOpacityGrain(seed, clipMask) {
    const sw = 200;
    const sh = 100;
    const small = document.createElement("canvas");
    small.width = sw;
    small.height = sh;
    const c = small.getContext("2d");
    const image = c.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const value =
          valueNoise(x, y, 11, seed) * 0.52 +
          valueNoise(x, y, 4.5, seed ^ 0x9e3779b9) * 0.31 +
          valueNoise(x, y, 1.7, seed ^ 0x85ebca6b) * 0.17;
        const density = 0.05 + smoothstep(0.34, 0.67, value) * 0.95;
        const i = (y * sw + x) * 4;
        image.data[i] = 160;
        image.data[i + 1] = 4;
        image.data[i + 2] = 8;
        image.data[i + 3] = Math.round(density * 255);
      }
    }
    c.putImageData(image, 0, 0);

    const grain = layer();
    grain.c.imageSmoothingEnabled = true;
    grain.c.drawImage(small, 0, 0, W, H);
    grain.c.globalCompositeOperation = "destination-in";
    grain.c.drawImage(clipMask, 0, 0, W, H);
    return grain;
  }

  function drawRibbon(c, x, startY, len, width, drift, strength, random, direction) {
    const n = 10;
    const left = [];
    const right = [];
    const phase = random() * Math.PI * 2;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const yy = startY + direction * len * t;
      const center =
        x +
        drift * Math.sin(Math.PI * (t - 0.5)) +
        drift * 0.28 * Math.sin(Math.PI * 2 * t + phase);
      const taper = 0.45 + 0.4 * (1 - t) + 0.35 * Math.sin(Math.PI * t);
      const half = width * taper * 0.5;
      left.push({ x: center - half, y: yy });
      right.push({ x: center + half, y: yy });
    }

    const path = new Path2D();
    path.moveTo(left[0].x, left[0].y);
    for (let i = 1; i <= n; i++) path.lineTo(left[i].x, left[i].y);
    for (let i = n; i >= 0; i--) path.lineTo(right[i].x, right[i].y);
    path.closePath();

    const fill = c.createLinearGradient(
      0,
      startY,
      0,
      startY + direction * len,
    );
    fill.addColorStop(0, "rgba(160,4,8," + strength * 0.62 + ")");
    fill.addColorStop(0.12, "rgba(160,4,8," + strength + ")");
    fill.addColorStop(0.52, "rgba(160,4,8," + strength * 0.82 + ")");
    fill.addColorStop(0.82, "rgba(160,4,8," + strength * 0.38 + ")");
    fill.addColorStop(1, "rgba(160,4,8,0)");
    c.fillStyle = fill;
    c.fill(path);
  }

  function drawEdgeSignal(c, side, seed) {
    if (side.length < 2) return;
    const random = rand(seed);
    const phaseA = random() * Math.PI * 2;
    const phaseB = random() * Math.PI * 2;
    const phaseC = random() * Math.PI * 2;
    let distance = 0;
    c.strokeStyle = "#A00408";
    c.lineCap = "round";

    for (let i = 1; i < side.length; i++) {
      const a = side[i - 1];
      const b = side[i];
      distance += Math.hypot(b.x - a.x, b.y - a.y);
      const signal =
        Math.sin((Math.PI * 2 * distance) / 155 + phaseA) * 0.58 +
        Math.sin((Math.PI * 2 * distance) / 68 + phaseB) * 0.28 +
        Math.sin((Math.PI * 2 * distance) / 27 + phaseC) * 0.14;
      const deposit = 0.13 + smoothstep(0.12, 0.75, signal) * 0.87;
      c.globalAlpha = deposit;
      c.lineWidth =
        7 +
        2 * Math.sin((Math.PI * 2 * distance) / 93 + phaseB) +
        deposit * 2.5;
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  function paintDrawing() {
    const live = strokes.filter((st) => st.pts.length);
    if (!live.length) return;
    const strips = live.map(makeStrip);

    const mask = layer();
    mask.c.fillStyle = "#fff";
    strips.forEach((strip) => mask.c.fill(strip.path));

    const softMask = layer();
    softMask.c.filter = "blur(2.2px)";
    softMask.c.drawImage(mask.el, 0, 0, W, H);
    softMask.c.filter = "none";

    const base = layer();
    base.c.fillStyle = "#A00408";
    base.c.fillRect(0, 0, W, H);
    base.c.globalCompositeOperation = "destination-in";
    base.c.drawImage(softMask.el, 0, 0, W, H);

    let minX = W;
    let minY = H;
    let maxX = 0;
    let maxY = 0;
    strips.forEach((strip) => {
      strip.top.concat(strip.bot).forEach((p) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
    });

    let drawingSeed = 2166136261;
    live.forEach((st, i) => {
      drawingSeed = Math.imul(drawingSeed ^ (st.seed || i + 1), 16777619);
    });
    const grain = makeOpacityGrain(drawingSeed ^ 0x27d4eb2f, softMask.el);
    const streakRandom = rand(drawingSeed ^ 0x9e3779b9);
    const streaks = layer();
    const maskPixels = mask.c.getImageData(
      0,
      0,
      mask.el.width,
      mask.el.height,
    ).data;

    function verticalSpan(x) {
      const px = Math.max(
        0,
        Math.min(mask.el.width - 1, Math.round(x * dpr)),
      );
      let top = -1;
      let bottom = -1;
      for (let py = 0; py < mask.el.height; py += dpr) {
        if (maskPixels[(py * mask.el.width + px) * 4 + 3] < 128) continue;
        if (top < 0) top = py / dpr;
        bottom = py / dpr;
      }
      return top < 0 ? null : { top, bottom };
    }

    const meanLength = +streakLen.value;
    const meanWidth = +streakWidth.value;
    let streakX = minX + 38 + streakRandom() * 42;
    let streakIndex = 0;
    while (streakX < maxX - 24 && streakIndex < 10) {
      const span = verticalSpan(streakX);
      if (span) {
        const fromTop = (streakIndex + (drawingSeed & 1)) % 2 === 0;
        const available = Math.max(1, span.bottom - span.top);
        const len = Math.min(
          meanLength * (0.6 + streakRandom() * 0.8),
          available * 0.84,
        );
        const width = meanWidth * (0.68 + streakRandom() * 0.64);
        const drift = (streakRandom() - 0.5) * 6;
        const strength = 0.5 + streakRandom() * 0.35;
        const startY = fromTop ? span.top : span.bottom;
        const direction = fromTop ? 1 : -1;
        drawRibbon(
          streaks.c,
          streakX,
          startY,
          len,
          width * 1.65,
          drift,
          strength * 0.22,
          streakRandom,
          direction,
        );
        drawRibbon(
          streaks.c,
          streakX,
          startY,
          len,
          width,
          drift,
          strength,
          streakRandom,
          direction,
        );
      }
      streakX += 82 + streakRandom() * 68;
      streakIndex++;
    }
    streaks.c.globalCompositeOperation = "destination-in";
    streaks.c.drawImage(softMask.el, 0, 0, W, H);

    const erosion = layer();
    erosion.c.drawImage(mask.el, 0, 0, W, H);
    erosion.c.globalCompositeOperation = "destination-in";
    const radius = 8;
    const shifts = [
      [-radius, 0],
      [radius, 0],
      [0, -radius],
      [0, radius],
      [-radius * 0.7, -radius * 0.7],
      [radius * 0.7, -radius * 0.7],
      [-radius * 0.7, radius * 0.7],
      [radius * 0.7, radius * 0.7],
    ];
    shifts.forEach(([x, y]) => erosion.c.drawImage(mask.el, x, y, W, H));

    const edge = layer();
    edge.c.drawImage(mask.el, 0, 0, W, H);
    edge.c.globalCompositeOperation = "destination-out";
    edge.c.drawImage(erosion.el, 0, 0, W, H);

    const rawAccents = layer();
    strips.forEach((strip, z) => {
      const st = live[z];
      drawEdgeSignal(rawAccents.c, strip.top, (st.seed || z + 1) ^ 0x85ebca6b);
      drawEdgeSignal(rawAccents.c, strip.bot, (st.seed || z + 1) ^ 0xc2b2ae35);
      drawEdgeSignal(
        rawAccents.c,
        strip.startCap,
        (st.seed || z + 1) ^ 0x27d4eb2f,
      );
      drawEdgeSignal(
        rawAccents.c,
        strip.endCap,
        (st.seed || z + 1) ^ 0x165667b1,
      );
    });
    const accents = layer();
    accents.c.filter = "blur(2px)";
    accents.c.drawImage(rawAccents.el, 0, 0, W, H);
    accents.c.filter = "none";
    accents.c.globalCompositeOperation = "destination-in";
    accents.c.drawImage(edge.el, 0, 0, W, H);

    const opacity = +ink.value / 100;
    const texture = +tex.value / 100;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(base.el, 0, 0, W, H);
    ctx.globalAlpha = Math.min(0.15, opacity * 0.34 * texture);
    ctx.drawImage(grain.el, 0, 0, W, H);
    ctx.globalAlpha = Math.min(0.31, opacity * 0.63 * texture);
    ctx.drawImage(streaks.el, 0, 0, W, H);
    ctx.globalAlpha = Math.min(0.36, opacity * 0.82 * texture);
    ctx.drawImage(accents.el, 0, 0, W, H);
    ctx.restore();
  }

  function redraw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    paintDrawing();
  }

  function queueRedraw() {
    if (redrawQueued) return;
    redrawQueued = true;
    requestAnimationFrame(() => {
      redrawQueued = false;
      redraw();
    });
  }

  function onDown(e) {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const p = pos(e);
    curr = {
      size: +sz.value,
      alpha: +ink.value,
      seed: Math.floor(Math.random() * 0xffffffff),
      pts: [p],
    };
    strokes.push(curr);
    queueRedraw();
    dirty = true;
  }

  function onMove(e) {
    if (!curr) return;
    const p = pos(e);
    const last = curr.pts[curr.pts.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 1.2) return;
    curr.pts.push(p);
    queueRedraw();
  }

  function onUp(e) {
    if (curr && e) {
      const p = pos(e);
      const last = curr.pts[curr.pts.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) > 1) curr.pts.push(p);
    }
    curr = null;
    queueRedraw();
  }

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  ink.addEventListener("input", queueRedraw);
  tex.addEventListener("input", queueRedraw);
  streakLen.addEventListener("input", () => {
    streakLenOut.textContent = streakLen.value + " px";
    queueRedraw();
  });
  streakWidth.addEventListener("input", () => {
    streakWidthOut.textContent = streakWidth.value + " px";
    queueRedraw();
  });

  document.getElementById("undo").onclick = () => {
    strokes.pop();
    redraw();
    dirty = true;
  };

  document.getElementById("clear").onclick = () => {
    strokes = [];
    redraw();
    dirty = true;
  };

  document.getElementById("save").onclick = () => {
    const out = document.createElement("canvas");
    out.width = W * dpr;
    out.height = H * dpr;
    const octx = out.getContext("2d");
    octx.drawImage(canvas, 0, 0);
    const png = out.toDataURL("image/png");
    fetch("/__tape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        png,
        w: W,
        h: H,
        renderer: 12,
        size: +sz.value,
        alpha: +ink.value,
        texture: +tex.value,
        streakLength: +streakLen.value,
        streakWidth: +streakWidth.value,
        strokes,
      }),
    }).then((r) => {
      dirty = !r.ok;
      document.getElementById("save").textContent = r.ok ? "Saved" : "Save failed";
      setTimeout(() => {
        document.getElementById("save").textContent = "Save";
      }, 900);
    });
  };

  fetch("/refs/tape.json?t=" + Date.now())
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data || !Array.isArray(data.strokes)) return;
      strokes = data.strokes.map((st, i) => ({
        ...st,
        seed: st.seed || i + 1,
      }));
      if (data.size) sz.value = data.size;
      if (data.alpha) ink.value = data.alpha;
      if (data.texture) tex.value = data.texture;
      if (data.streakLength) streakLen.value = data.streakLength;
      if (data.streakWidth) streakWidth.value = data.streakWidth;
      streakLenOut.textContent = streakLen.value + " px";
      streakWidthOut.textContent = streakWidth.value + " px";
      redraw();
    })
    .catch(() => {});

  sizeFrame();
  window.addEventListener("resize", sizeFrame);
  window.addEventListener("beforeunload", (e) => {
    if (dirty) e.preventDefault();
  });
})();
