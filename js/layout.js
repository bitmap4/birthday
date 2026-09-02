window.Bday = window.Bday || {};

(function (B) {
  const SCRIPT = document.currentScript;
  B.STAGE_W = 1440;
  B.STAGE_H = 820;
  B.FILE = {};
  B.forceBreak = null;
  B.FRAMES = {
    mobile: { w: 390, h: 844, hero: 1, max: 699 },
    medium: { w: 1024, h: 768, hero: 0.7, max: 1199 },
    desktop: { w: 1585, h: 963, hero: 0.7, max: Infinity },
  };
  B.NOTE_GROUPS = [
    ["note-1", "note-our", "note-bday"],
    ["note-2", "note-make"],
    ["hl-top", "hl-bot"],
  ];

  B.restoreNoteMarks = function restoreNoteMarks() {
    const specs = [
      ["note-bday", "note-mark-heart"],
      ["note-make", "note-mark-smile"],
    ];
    specs.forEach(([name, kind]) => {
      const el = document.querySelector(`[data-name="${name}"]`);
      if (!el || el.querySelector(".note-mark")) return;
      const wrap = document.createElement("span");
      wrap.className = "note-mark";
      wrap.setAttribute("aria-hidden", "true");
      const shape = document.createElement("span");
      shape.className = "note-mark-shape " + kind;
      wrap.appendChild(shape);
      el.appendChild(wrap);
    });
  };

  B.syncNoteSizes = function syncNoteSizes(fromEl) {
    const run = (g, src) => {
      const fs =
        src.style.fontSize ||
        B.getVar(src, "--fs") ||
        B.getVar(src, "font-size") ||
        "";
      g.forEach((name) => {
        const n = document.querySelector(`[data-name="${name}"]`);
        if (n && fs) {
          if (n.classList.contains("hl-label") || n.classList.contains("title")) {
            B.setVar(n, "--fs", fs);
            n.style.removeProperty("font-size");
          } else {
            B.setVar(n, "font-size", fs);
          }
        }
      });
    };
    if (fromEl) {
      const g = B.NOTE_GROUPS.find((g) => g.includes(fromEl.dataset.name));
      if (g) run(g, fromEl);
      return;
    }
    B.NOTE_GROUPS.forEach((g) => {
      const head = document.querySelector(`[data-name="${g[0]}"]`);
      if (head) run(g, head);
    });
  };

  B.items = () => [
    ...document.querySelectorAll(
      ".stage [data-edit], .body-stage [data-edit]",
    ),
  ];

  B.showsOn = function showsOn(el, bp) {
    const raw = el.dataset.show;
    if (!raw) return true;
    const tags = raw.split(/\s+/);
    if (tags.includes(bp)) return true;
    if (tags.includes("wide") && bp !== "mobile") return true;
    return false;
  };

  B.syncAssets = function syncAssets() {
    document.documentElement.dataset.break = B.whichBreak();
  };

  B.placedUrl = function placedUrl() {
    return new URL("../placed.json", SCRIPT.src).href;
  };

  B.getVar = function getVar(el, prop) {
    if (prop === "font-size") return el.style.fontSize || "";
    return el.style.getPropertyValue(prop) || "";
  };

  B.setVar = function setVar(el, prop, value) {
    if (prop === "font-size") el.style.fontSize = value;
    else el.style.setProperty(prop, value);
  };

  B.whichBreak = function whichBreak(w) {
    if (B.forceBreak && B.FRAMES[B.forceBreak]) return B.forceBreak;
    const x = w != null ? w : document.documentElement.clientWidth;
    if (x <= B.FRAMES.mobile.max) return "mobile";
    if (x <= B.FRAMES.medium.max) return "medium";
    return "desktop";
  };

  B.frame = function frame() {
    return B.FRAMES[B.whichBreak()];
  };

  B.viewBox = function viewBox() {
    if (B.forceBreak) {
      const f = B.frame();
      return { w: f.w, h: f.h };
    }
    return {
      w: Math.max(120, document.documentElement.clientWidth),
      h: Math.max(120, window.innerHeight),
    };
  };

  B.designScale = function designScale() {
    const f = B.frame();
    const v = B.viewBox();
    return Math.min(v.w / f.w, v.h / f.h);
  };

  B.normalizeFile = function normalizeFile(raw) {
    if (raw && raw.desktop && typeof raw.desktop === "object" && !raw.desktop.x) {
      const copy = (src) => JSON.parse(JSON.stringify(src || {}));
      return {
        desktop: copy(raw.desktop),
        medium: copy(raw.medium || raw.desktop),
        mobile: copy(raw.mobile || raw.desktop),
      };
    }
    const one = raw || {};
    const copy = JSON.parse(JSON.stringify(one));
    return { desktop: one, medium: copy, mobile: JSON.parse(JSON.stringify(one)) };
  };

  B.layout = function layout() {
    return B.FILE[B.whichBreak()] || {};
  };

  B.loadPlaced = function loadPlaced() {
    try {
      localStorage.removeItem("bday-hero-v1");
    } catch {
      /* ignore */
    }
    try {
      const xhr = new XMLHttpRequest();
      const q = document.body.classList.contains("edit-page") ? "?t=" + Date.now() : "";
      xhr.open("GET", B.placedUrl() + q, false);
      xhr.send();
      B.FILE = B.normalizeFile(JSON.parse(xhr.responseText));
    } catch {
      B.FILE = B.normalizeFile(B.FILE);
    }
    return B.FILE;
  };

  B.savePlaced = function savePlaced() {
    B.dumpPlaced();
    return fetch("/__placed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(B.FILE),
    })
      .then((r) => r.ok)
      .catch(() => false);
  };

  B.cssNum = function cssNum(el, prop, fallback) {
    const inline = el.style.getPropertyValue(prop);
    if (inline) {
      const n = parseFloat(inline);
      if (Number.isFinite(n)) return n;
    }
    const n = parseFloat(getComputedStyle(el).getPropertyValue(prop));
    return Number.isFinite(n) ? n : fallback;
  };

  function rgbOf(c) {
    if (!c) return null;
    const s = String(c).trim().toLowerCase();
    const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) h = [...h].map((ch) => ch + ch).join("");
      return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
      ];
    }
    const m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : null;
  }

  function sameRgb(a, b) {
    return !!(a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
  }

  B.isThemeInk = function isThemeInk(c) {
    const rgb = rgbOf(c);
    const ink = rgbOf(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ink")
        .trim() || "#1c1410"
    );
    return sameRgb(rgb, ink) || sameRgb(rgb, rgbOf("#1c1410"));
  };

  B.isThemeRed = function isThemeRed(c) {
    const rgb = rgbOf(c);
    if (!rgb) return false;
    const theme = rgbOf(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--red")
        .trim() || "#8a0807"
    );
    const old = [
      rgbOf("#c51f24"),
      rgbOf("#851216"),
      rgbOf("#8a0807"),
      theme,
    ];
    return old.some((r) => sameRgb(r, rgb));
  };

  B.applyPlaced = function applyPlaced() {
    const data = B.layout();
    const desk = B.FILE.desktop || {};
    B.items().forEach((el) => {
      const o = data[el.dataset.name];
      if (!o) return;
      if (o.x) B.setVar(el, "--x", o.x);
      if (o.y) B.setVar(el, "--y", o.y);
      if (o.w) B.setVar(el, "--w", o.w);
      if (o.h) B.setVar(el, "--h", o.h);
      if (o.r) B.setVar(el, "--r", o.r);
      if (o.z) B.setVar(el, "--z", o.z);
      if (o.edgeSeed != null) el.dataset.edgeSeed = String(o.edgeSeed);
      if (o.edgeStyle) el.dataset.edgeStyle = o.edgeStyle;
      if (el.dataset.edit === "text") {
        if (o.fontSize) {
          if (el.classList.contains("title") || el.classList.contains("hl-label")) {
            B.setVar(el, "--fs", o.fontSize);
            el.style.removeProperty("font-size");
          } else {
            B.setVar(el, "font-size", o.fontSize);
          }
        }
        if (o.color && !B.isThemeRed(o.color) && !B.isThemeInk(o.color)) {
          el.style.color = o.color;
        }
        if (o.letterSpacing && !/^hl-/.test(el.dataset.name || "")) {
          el.style.letterSpacing = o.letterSpacing;
        }
        if (o.fontFamily && !el.classList.contains("note")) {
          el.style.fontFamily = o.fontFamily;
        }
        const text = o.text || (desk[el.dataset.name] && desk[el.dataset.name].text);
        if (text != null && text !== "") {
          if (el.dataset.name === "title") {
            el.innerHTML = String(text)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/\n/g, "<br>");
          } else {
            el.innerText = text;
          }
        }
      }
    });
    B.syncNoteSizes();
    B.restoreNoteMarks();
  };

  B.snapshot = function snapshot(el) {
    const read = (p) =>
      el.style.getPropertyValue(p) ||
      getComputedStyle(el).getPropertyValue(p) ||
      "";
    const add = (o, k, v) => {
      v = String(v || "").trim();
      if (v) o[k] = v;
    };
    const o = {};
    add(o, "x", read("--x"));
    add(o, "y", read("--y"));
    add(o, "z", read("--z"));
    add(o, "r", read("--r"));
    add(o, "w", read("--w"));
    add(o, "h", read("--h"));
    if (el.dataset.edgeSeed) o.edgeSeed = Number(el.dataset.edgeSeed);
    if (el.dataset.edgeStyle) o.edgeStyle = el.dataset.edgeStyle;
    if (el.dataset.edit === "text") {
      add(
        o,
        "fontSize",
        el.style.fontSize ||
          el.style.getPropertyValue("--fs") ||
          getComputedStyle(el).getPropertyValue("--fs") ||
          getComputedStyle(el).fontSize
      );
      if (el.style.color && !B.isThemeRed(el.style.color) && !B.isThemeInk(el.style.color)) {
        add(o, "color", el.style.color);
      }
      add(o, "letterSpacing", el.style.letterSpacing);
      add(o, "fontFamily", el.style.fontFamily);
      add(o, "text", el.innerText);
    }
    return o;
  };

  B.dumpPlaced = function dumpPlaced() {
    const key = B.whichBreak();
    const prev = B.FILE[key] || {};
    B.items().forEach((el) => {
      if (!el.dataset.name || !el.classList.contains("placed")) return;
      if (!B.showsOn(el, key)) return;
      prev[el.dataset.name] = B.snapshot(el);
    });
    B.FILE[key] = prev;
    B.items().forEach((el) => {
      if (el.dataset.edit !== "text" || !el.dataset.name) return;
      const t = prev[el.dataset.name] && prev[el.dataset.name].text;
      if (t == null) return;
      ["desktop", "medium", "mobile"].forEach((k) => {
        if (B.FILE[k] && B.FILE[k][el.dataset.name]) B.FILE[k][el.dataset.name].text = t;
      });
    });
    return B.FILE;
  };

  B.save = function save() {
    B.savePlaced();
  };

  B.syncMobileEnd = function syncMobileEnd(hero) {
    if (B.whichBreak() !== "mobile") return;
    const node = hero || document.querySelector(".hero");
    const cherry = document.querySelector('[data-name="cherries-2"]');
    if (!node || !cherry || !cherry.offsetHeight) return;
    const frame = document.querySelector(".ed-frame");
    const match = String(frame?.style.transform || "").match(
      /scale\(([-0-9.]+)\)/,
    );
    const outerScale = match ? parseFloat(match[1]) || 1 : 1;
    const heroTop = node.getBoundingClientRect().top;
    const cherryBottom = cherry.getBoundingClientRect().bottom;
    const height = Math.ceil((cherryBottom - heroTop) / outerScale + 8);
    document.documentElement.style.setProperty("--hero", height + "px");
    window.dispatchEvent(
      new CustomEvent("bday-mobile-end", { detail: { height } }),
    );
  };

  B.applyFrame = function applyFrame(hero) {
    const name = B.whichBreak();
    const f = B.frame();
    const v = B.viewBox();
    const ds = B.designScale();
    const root = document.documentElement;
    root.dataset.break = name;
    B.syncAssets();
    const stage = document.querySelector(".stage");
    const node = hero || document.querySelector(".hero");
    if (!stage) return 1;
    const w = node ? node.clientWidth : v.w;
    let heroH;
    let stageTop;
    let fitH;
    if (name === "mobile") {
      const mobileScale = v.w / f.w;
      stageTop = 392 * mobileScale;
      fitH = f.h * mobileScale;
      root.style.setProperty("--tear", "0px");
    } else {
      heroH = f.hero * f.h * ds;
      stageTop = 0.375 * f.h * ds;
      fitH = 0.75 * f.h * ds;
      root.style.setProperty("--tear", "28px");
    }
    const s = Math.min(w / B.STAGE_W, fitH / B.STAGE_H);
    if (name === "mobile") {
      const mobileScale = v.w / f.w;
      const cherry = document.querySelector('[data-name="cherries-2"]');
      const cherryY = cherry ? B.cssNum(cherry, "--y", 2097) : 2097;
      const cherryW = cherry ? B.cssNum(cherry, "--w", 142) : 142;
      const cherryH = cherry && cherry.offsetHeight ? cherry.offsetHeight : cherryW * (496 / 409);
      const angle = cherry ? (B.cssNum(cherry, "--r", 0) * Math.PI) / 180 : 0;
      const rotatedBottom =
        cherryY +
        cherryH / 2 +
        Math.abs(Math.sin(angle)) * cherryW / 2 +
        Math.abs(Math.cos(angle)) * cherryH / 2;
      const stageTopEdge = stageTop - (B.STAGE_H * s) / 2;
      heroH = stageTopEdge + rotatedBottom * s + 8 * mobileScale;
    }
    root.style.setProperty("--hero", heroH + "px");
    root.style.setProperty("--stage-top", stageTop + "px");
    stage.style.setProperty("--fit", String(s));
    if (B.fitBody) B.fitBody();
    if (name === "mobile") {
      requestAnimationFrame(() => B.syncMobileEnd(node));
    }
    return s;
  };

  B.fitStage = function fitStage(hero) {
    return B.applyFrame(hero);
  };

  B.reveal = function reveal() {
    document.documentElement.classList.add("is-ready");
  };

  B.setBreak = function setBreak(name) {
    if (!B.FRAMES[name]) return;
    B.forceBreak = name;
    document.documentElement.dataset.break = name;
    B.applyFrame();
    B.applyPlaced();
    B.paintHighlight();
  };

  B.updateTear = function updateTear(hero, shadowSvg, shadowPath, noise) {
    if (!hero) return;
    if (B.whichBreak() === "mobile") {
      hero.style.clipPath = "none";
      if (shadowSvg) shadowSvg.style.display = "none";
      return;
    }
    if (shadowSvg) shadowSvg.style.display = "";
    if (!shadowPath) return;
    const tear = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--tear")
    );
    const heroH = hero.getBoundingClientRect().height;
    const join = ((heroH - tear) / heroH) * 100;
    const amp = (tear / heroH) * 100;
    const n = noise.length;
    const pts = ["0% 0%", "100% 0%"];
    for (let i = n - 1; i >= 0; i--) {
      pts.push(
        `${((i / (n - 1)) * 100).toFixed(3)}% ${(join + noise[i] * amp).toFixed(3)}%`
      );
    }
    hero.style.clipPath = `polygon(${pts.join(",")})`;

    if (!shadowSvg) return;
    const w = hero.clientWidth || document.documentElement.clientWidth;
    const band = tear * 2;
    const lip = 4;
    shadowSvg.setAttribute("viewBox", `0 0 ${w} ${band}`);
    let d = "";
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * w;
      const y = tear * (1 + noise[i]);
      d += `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }
    for (let i = n - 1; i >= 0; i--) {
      const x = (i / (n - 1)) * w;
      const y = tear * (1 + noise[i]) + lip;
      d += `L${x.toFixed(2)},${y.toFixed(2)}`;
    }
    shadowPath.setAttribute("d", `${d}Z`);
  };

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function rng() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gaussian(rng) {
    const u = Math.max(1e-12, 1 - rng());
    const v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function normalize(y) {
    let mean = 0;
    for (let i = 0; i < y.length; i++) mean += y[i];
    mean /= y.length;
    let peak = 0;
    for (let i = 0; i < y.length; i++) {
      y[i] -= mean;
      peak = Math.max(peak, Math.abs(y[i]));
    }
    if (peak > 0) {
      for (let i = 0; i < y.length; i++) y[i] /= peak;
    }
    return y;
  }

  function fbm(n, hurst, seed) {
    const y = new Float64Array(n);
    const rng = mulberry32(seed);
    let step = n - 1;
    let std = 1;
    const persist = 2 ** -hurst;
    while (step >= 2) {
      const half = step >> 1;
      for (let i = half; i < n; i += step) {
        y[i] = 0.5 * (y[i - half] + y[i + half]) + gaussian(rng) * std;
      }
      std *= persist;
      step = half;
    }
    return normalize(y);
  }

  B.makeTearNoise = function makeTearNoise(seed = 20260826) {
    const N = (1 << 9) + 1;
    const shape = fbm(N, 0.66, seed);
    const fiber = fbm(N, 0.25, seed + 1);
    return normalize(
      Float64Array.from(shape, (v, i) => v + 0.28 * fiber[i])
    );
  };

  function edge(n, seed) {
    const slow = fbm(n, 0.45, seed);
    const tooth = fbm(n, 0.22, seed + 17);
    return normalize(
      Float64Array.from(slow, (v, i) => v + 0.4 * tooth[i])
    );
  }

  function noisyRectPts(x0, y0, x1, y1, seed, amp) {
    const n = (1 << 7) + 1;
    const top = edge(n, seed);
    const right = edge(n, seed + 3);
    const bot = edge(n, seed + 5);
    const left = edge(n, seed + 7);
    const w = x1 - x0;
    const h = y1 - y0;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      pts.push([x0 + w * t, y0 + amp * top[i]]);
    }
    for (let i = 1; i < n; i++) {
      const t = i / (n - 1);
      pts.push([x1 + amp * 0.65 * right[i], y0 + h * t]);
    }
    for (let i = 1; i < n; i++) {
      const t = i / (n - 1);
      pts.push([x1 - w * t, y1 + amp * bot[i]]);
    }
    for (let i = 1; i < n; i++) {
      const t = i / (n - 1);
      pts.push([x0 + amp * 0.65 * left[i], y1 - h * t]);
    }
    return pts;
  }

  function hash2(ix, iy, seed) {
    let a = (Math.imul(ix | 0, 374761393) + Math.imul(iy | 0, 668265263) + (seed | 0)) >>> 0;
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function valueNoise2(x, y, seed) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = hash2(x0, y0, seed);
    const b = hash2(x0 + 1, y0, seed);
    const c = hash2(x0, y0 + 1, seed);
    const d = hash2(x0 + 1, y0 + 1, seed);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  function fbm2(x, y, seed, octaves) {
    let s = 0;
    let a = 1;
    let f = 1;
    let n = 0;
    for (let i = 0; i < octaves; i++) {
      s += a * valueNoise2(x * f, y * f, seed + i * 19);
      n += a;
      a *= 0.5;
      f *= 2.05;
    }
    return s / n;
  }

  function smoothstep(e0, e1, x) {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  function inkAlpha(u, v, seed) {
    const ev = 0.7 + 0.3 * Math.pow(Math.sin(Math.PI * v), 0.55);
    const eu = smoothstep(0, 0.06, u) * smoothstep(0, 0.08, 1 - u);
    const ridge = 0.86 + 0.14 * Math.exp(-((v - 0.4) / 0.24) * ((v - 0.4) / 0.24));
    const wet = fbm2(u * 1.05, v * 0.65, seed, 4);
    const pressure = fbm2(u * 1.7, 0.18, seed + 11, 3);
    const streak = fbm2(u * 0.4, v * 15, seed + 23, 5);
    const grain = fbm2(u * 24, v * 18, seed + 41, 2);
    let a =
      0.56 *
      ev *
      ridge *
      (0.52 + 0.48 * eu) *
      (0.68 + 0.58 * wet) *
      (0.8 + 0.38 * pressure) *
      (0.74 + 0.5 * streak) *
      (0.93 + 0.24 * grain);
    if (a < 0.16) a = 0.16;
    if (a > 0.9) a = 0.9;
    return a;
  }

  function paintBar(ctx, scale, x0, y0, x1, y1, seed, amp) {
    const pts = noisyRectPts(x0, y0, x1, y1, seed, amp);
    const path = new Path2D();
    for (let i = 0; i < pts.length; i++) {
      const x = pts[i][0] * scale;
      const y = pts[i][1] * scale;
      if (i) path.lineTo(x, y);
      else path.moveTo(x, y);
    }
    path.closePath();

    const pad = Math.ceil(amp * scale + 2);
    const bx = Math.floor(x0 * scale) - pad;
    const by = Math.floor(y0 * scale) - pad;
    const bw = Math.ceil((x1 - x0) * scale) + pad * 2;
    const bh = Math.ceil((y1 - y0) * scale) + pad * 2;
    const img = ctx.createImageData(bw, bh);
    const d = img.data;
    const rgb = paintBar._rgb || (paintBar._rgb = [160, 4, 8]);
    const R = rgb[0];
    const G = rgb[1];
    const Bcol = rgb[2];
    for (let j = 0; j < bh; j++) {
      const v = (j - pad) / ((y1 - y0) * scale);
      for (let i = 0; i < bw; i++) {
        const u = (i - pad) / ((x1 - x0) * scale);
        if (u < -0.04 || u > 1.04 || v < -0.08 || v > 1.08) continue;
        const a = inkAlpha(Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)), seed);
        const k = (j * bw + i) * 4;
        d[k] = R;
        d[k + 1] = G;
        d[k + 2] = Bcol;
        d[k + 3] = (a * 255) | 0;
      }
    }

    const tmp = paintBar._tmp || (paintBar._tmp = document.createElement("canvas"));
    tmp.width = ctx.canvas.width;
    tmp.height = ctx.canvas.height;
    const tctx = tmp.getContext("2d");
    tctx.clearRect(0, 0, tmp.width, tmp.height);
    tctx.putImageData(img, bx, by);
    tctx.globalCompositeOperation = "destination-in";
    tctx.fill(path);
    tctx.globalCompositeOperation = "source-over";
    ctx.drawImage(tmp, 0, 0);
  }

  B.paintHighlight = function paintHighlight() {
    const canvas = document.querySelector("canvas.hl-asset");
    if (!canvas) return;
    const hex = (
      getComputedStyle(document.documentElement).getPropertyValue("--red") ||
      "#A00408"
    ).trim();
    const m = hex.match(/^#([0-9a-f]{6})$/i);
    paintBar._rgb = m
      ? [
          parseInt(m[1].slice(0, 2), 16),
          parseInt(m[1].slice(2, 4), 16),
          parseInt(m[1].slice(4, 6), 16),
        ]
      : [160, 4, 8];
    const scale = 2;
    canvas.width = 360 * scale;
    canvas.height = 133 * scale;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paintBar(ctx, scale, 8, 11, 352, 47, 20260901, 7);
    paintBar(ctx, scale, 76, 84, 284, 120, 20260914, 7);
  };

  B.bootHero = function bootHero() {
    const hero = document.querySelector(".hero");
    const shadowSvg = document.querySelector(".tear-shadow");
    const shadowPath = document.getElementById("tear-shadow-path");
    const noise = B.makeTearNoise();
    B.loadPlaced();
    B.applyPlaced();
    document.querySelectorAll("img.wash-asset").forEach((el) => {
      const u = (el.getAttribute("src") || "").split("?")[0];
      if (u) el.src = u + "?t=" + Date.now();
    });
    let lastBreak = B.whichBreak();
    function sync() {
      B.applyFrame(hero);
      const now = B.whichBreak();
      if (now !== lastBreak) {
        lastBreak = now;
        B.applyPlaced();
      }
      B.paintHighlight();
      B.updateTear(hero, shadowSvg, shadowPath, noise);
    }
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("load", sync);

    const kids = document.querySelector('[data-name="kids"] img');
    if (kids && !document.body.classList.contains("edit-page")) {
      const rec = { L: [], R: [] };
      kids.addEventListener("click", (e) => {
        if (e.button) return;
        const box = kids.getBoundingClientRect();
        const k = e.clientX < box.left + box.width / 2 ? "L" : "R";
        const now = performance.now();
        rec[k] = rec[k].filter((t) => now - t <= 3000);
        rec[k].push(now);
        if (rec[k].length < 3) return;
        rec.L = [];
        rec.R = [];
        location.assign(
          new URL(k === "L" ? "assets/out/mansi.png" : "assets/out/romil.mp4", document.baseURI).href,
        );
      });
    }
  };

  B.fitVal = function fitVal() {
    const stage = document.querySelector(".stage");
    return parseFloat(getComputedStyle(stage).getPropertyValue("--fit")) || 1;
  };

  B.screenFit = function screenFit() {
    let k = 1;
    const box = document.querySelector(".ed-frame");
    if (box) {
      const m = String(box.style.transform || "").match(/scale\(([-0-9.]+)\)/);
      if (m) k = parseFloat(m[1]) || 1;
    }
    return B.fitVal() * k;
  };
})(window.Bday);
