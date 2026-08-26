window.Bday = window.Bday || {};

(function (B) {
  B.KEY = "bday-hero-v1";
  B.STAGE_W = 1440;
  B.STAGE_H = 820;
  B.NOTE_GROUPS = [
    ["note-1", "note-our", "note-bday"],
    ["note-2", "note-make"],
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
      const fs = src.style.fontSize || "";
      g.forEach((name) => {
        const n = document.querySelector(`[data-name="${name}"]`);
        if (!n) return;
        if (fs) n.style.fontSize = fs;
        else n.style.removeProperty("font-size");
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

  B.items = () => [...document.querySelectorAll(".stage [data-edit]")];

  B.sel = function sel(el) {
    const n = el.dataset.name;
    if (n === "highlight") return ".hl";
    if (n === "title") return ".title";
    if (el.classList.contains("s-" + n)) return ".s-" + n;
    return "." + n;
  };

  B.ruleFor = function ruleFor(el) {
    const want = B.sel(el);
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (!rule.selectorText) continue;
        const parts = rule.selectorText.split(",").map((s) => s.trim());
        if (parts.length === 1 && parts[0] === want) return rule;
      }
    }
    return null;
  };

  B.getVar = function getVar(el, prop) {
    const rule = B.ruleFor(el);
    return rule ? rule.style.getPropertyValue(prop) : "";
  };

  B.setVar = function setVar(el, prop, value) {
    const rule = B.ruleFor(el);
    if (rule) rule.style.setProperty(prop, value);
    else el.style.setProperty(prop, value);
  };

  B.dumpPlacedCss = function dumpPlacedCss() {
    const seen = new Set();
    const lines = [];
    B.items().forEach((el) => {
      if (!el.classList.contains("placed")) return;
      const sel = B.sel(el);
      if (seen.has(sel)) return;
      seen.add(sel);
      const rule = B.ruleFor(el);
      if (!rule) return;
      const body = rule.style.cssText.trim();
      if (body) lines.push(sel + " { " + body + " }");
    });
    return lines.join("\n");
  };

  B.savePlaced = function savePlaced() {
    const css = B.dumpPlacedCss();
    return fetch("/__placed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ css }),
    }).catch(() => {});
  };

  B.load = function load() {
    try {
      return JSON.parse(localStorage.getItem(B.KEY) || "{}");
    } catch {
      return {};
    }
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

  B.applySaved = function applySaved() {
    const data = B.load();
    B.items().forEach((el) => {
      const o = data[el.dataset.name];
      if (!o) return;
      if (o.x) el.style.setProperty("--x", o.x);
      if (o.y) el.style.setProperty("--y", o.y);
      if (o.w) el.style.setProperty("--w", o.w);
      if (o.h) el.style.setProperty("--h", o.h);
      if (o.r) el.style.setProperty("--r", o.r);
      if (o.z) el.style.setProperty("--z", o.z);
      if (el.dataset.edit === "text") {
        if (o.fontSize) el.style.fontSize = o.fontSize;
        if (o.color && !B.isThemeRed(o.color) && !B.isThemeInk(o.color)) {
          el.style.color = o.color;
        }
        if (o.letterSpacing && !/^hl-/.test(el.dataset.name || "")) {
          el.style.letterSpacing = o.letterSpacing;
        }
        if (o.fontFamily && !el.classList.contains("note")) {
          el.style.fontFamily = o.fontFamily;
        }
        if (o.text != null && o.text !== "") {
          let t = o.text;
          if (
            el.dataset.name === "title" &&
            /^it's our birthday!?$/i.test(t.replace(/\s+/g, " ").trim())
          ) {
            t = "It's our\nbirthday!";
          }
          if (el.classList.contains("note")) {
            t = t.replace(/[♡♥❤☺😊]/g, "").replace(/[ \t]+$/gm, "");
          }
          if (el.dataset.name === "note-1") {
            t = t
              .replace(/\bour\b/gi, "")
              .replace(/\bbday\b/gi, "")
              .replace(/\n+/g, " ")
              .replace(/[ \t]+$/g, "")
              .trim();
          }
          if (el.dataset.name === "note-2") {
            t = t
              .replace(/\bmake it\b/gi, "")
              .replace(/\n+/g, " ")
              .replace(/[ \t]+$/g, "")
              .trim();
          }
          el.innerText = t;
        }
      }
    });
    B.syncNoteSizes();
    B.restoreNoteMarks();
  };

  B.snapshot = function snapshot(el) {
    const o = {
      x: el.style.getPropertyValue("--x") || "",
      y: el.style.getPropertyValue("--y") || "",
      w: el.style.getPropertyValue("--w") || "",
      h: el.style.getPropertyValue("--h") || "",
      r: el.style.getPropertyValue("--r") || "",
      z: el.style.getPropertyValue("--z") || "",
    };
    if (el.dataset.edit === "text") {
      o.fontSize = el.style.fontSize || "";
      o.color =
        B.isThemeRed(el.style.color) || B.isThemeInk(el.style.color)
          ? ""
          : el.style.color || "";
      o.letterSpacing = el.style.letterSpacing || "";
      o.fontFamily = el.style.fontFamily || "";
      o.text = el.innerText;
    }
    return o;
  };

  B.save = function save() {
    const data = B.load();
    B.items().forEach((el) => {
      if (el.dataset.name) data[el.dataset.name] = B.snapshot(el);
    });
    localStorage.setItem(B.KEY, JSON.stringify(data));
  };

  B.heroMetrics = function heroMetrics(hero) {
    let probe = document.getElementById("bday-svh");
    if (!probe) {
      probe = document.createElement("div");
      probe.id = "bday-svh";
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText =
        "position:fixed;left:0;top:0;width:100%;height:var(--hero);visibility:hidden;pointer-events:none";
      document.documentElement.appendChild(probe);
    }
    return {
      w: Math.max(120, hero ? hero.clientWidth : probe.offsetWidth),
      h: Math.max(120, probe.offsetHeight),
    };
  };

  B.fitStage = function fitStage(hero) {
    const stage = document.querySelector(".stage");
    const node = hero || document.querySelector(".hero");
    if (!stage) return 1;
    const { w, h } = B.heroMetrics(node);
    const s = Math.min(w / B.STAGE_W, h / B.STAGE_H);
    stage.style.setProperty("--fit", String(s));
    return s;
  };

  B.updateTear = function updateTear(hero, shadowSvg, shadowPath, noise) {
    if (!hero || !shadowPath) return;
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
    const w = document.documentElement.clientWidth;
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

  B.makeTearNoise = function makeTearNoise() {
    const N = (1 << 9) + 1;
    const shape = fbm(N, 0.66, 20260826);
    const fiber = fbm(N, 0.25, 20260827);
    return normalize(
      Float64Array.from(shape, (v, i) => v + 0.28 * fiber[i])
    );
  };

  // Felt-tip highlight: slow centerline drift (H~0.82) + pressure width
  // (H~0.55) + paper-fiber edge jitter (H~0.28). Caps are a noisy
  // half-ellipse so the ends look placed/lifted, not squared off.
  function markerStroke(x0, x1, y, half, seed) {
    const n = (1 << 7) + 1;
    const k = (1 << 3) + 1;
    const drift = fbm(n, 0.82, seed);
    const press = fbm(n, 0.55, seed + 11);
    const topN = fbm(n, 0.28, seed + 23);
    const botN = fbm(n, 0.28, seed + 41);
    const rng = mulberry32(seed + 99);
    const slantL = (rng() - 0.4) * 7;
    const slantR = (rng() - 0.6) * 7;
    const top = [];
    const bot = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = x0 + (x1 - x0) * t;
      const c = y + drift[i] * half * 0.22;
      const taper = 0.78 + 0.22 * Math.sin(Math.PI * t) ** 0.22;
      const h = half * (0.86 + 0.2 * press[i]) * taper;
      const xt = x + (1 - t) * slantL + t * slantR * 0.15;
      const xb = x + (1 - t) * slantL * 0.2 + t * slantR;
      top.push([xt, c - h + topN[i] * half * 0.2]);
      bot.push([xb, c + h + botN[i] * half * 0.2]);
    }
    function cap(cx, cy, r, a0, a1, s) {
      const ns = fbm(k, 0.32, s);
      const pts = [];
      for (let i = 0; i < k; i++) {
        const u = i / (k - 1);
        const a = a0 + (a1 - a0) * u;
        const rr = r * (0.78 + 0.28 * ns[i]);
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      return pts;
    }
    const rL = half * (0.9 + 0.15 * rng());
    const rR = half * (0.9 + 0.15 * rng());
    const left = cap(x0 + slantL * 0.4, y, rL, Math.PI * 0.55, Math.PI * 1.45, seed + 70);
    const right = cap(x1 + slantR * 0.4, y, rR, -Math.PI * 0.45, Math.PI * 0.45, seed + 80);
    const pts = top.concat(right, bot.slice().reverse(), left);
    let d = "";
    for (let i = 0; i < pts.length; i++) {
      d += `${i ? "L" : "M"}${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`;
    }
    return d + "Z";
  }

  B.paintHighlight = function paintHighlight() {
    const top = document.getElementById("hl-path-top");
    const bot = document.getElementById("hl-path-bot");
    if (!top || !bot) return;
    top.setAttribute("d", markerStroke(10, 350, 28, 17, 20260901));
    bot.setAttribute("d", markerStroke(78, 282, 101, 16, 20260914));
  };

  B.bootHero = function bootHero() {
    const hero = document.querySelector(".hero");
    const shadowSvg = document.querySelector(".tear-shadow");
    const shadowPath = document.getElementById("tear-shadow-path");
    const noise = B.makeTearNoise();
    function sync() {
      B.applySaved();
      B.fitStage(hero);
      B.updateTear(hero, shadowSvg, shadowPath, noise);
    }
    sync();
    window.addEventListener("resize", sync);
  };

  B.fitVal = function fitVal() {
    const stage = document.querySelector(".stage");
    return parseFloat(getComputedStyle(stage).getPropertyValue("--fit")) || 1;
  };
})(window.Bday);
