(() => {
  const B = window.Bday;
  const stage = document.querySelector(".stage");
  const hero = document.querySelector(".hero");
  const frame = document.querySelector(".ed-frame");
  const handles = document.getElementById("handles");
  const textTools = document.getElementById("text-tools");
  const paperTools = document.getElementById("paper-tools");
  if (!stage || !handles || !hero || !frame) return;

  let selected = null;
  let mode = null;

  function frameScale() {
    const match = String(frame.style.transform || "").match(
      /scale\(([-0-9.]+)\)/,
    );
    return match ? parseFloat(match[1]) || 1 : 1;
  }

  function elementScale(el) {
    if (el.closest(".body-stage")) {
      return (
        parseFloat(
          getComputedStyle(el.closest(".body-stage")).getPropertyValue(
            "--body-fit",
          ),
        ) || 1
      );
    }
    return B.fitVal();
  }

  const FONTS = ["Gochi Hand", "Cup Cakes", "handwriting-8"];
  const SWATCHES = ["#1c1410", "#8a0807", "#ffffff", "#c9a227"];

  function select(el) {
    if (selected) selected.classList.remove("is-selected");
    selected = el;
    if (!selected) {
      handles.hidden = true;
      textTools.hidden = true;
      return;
    }
    selected.classList.add("is-selected");
    handles.hidden = false;
    handles.classList.toggle(
      "free-resize",
      selected.hasAttribute("data-free-resize"),
    );
    textTools.hidden = selected.dataset.edit !== "text";
    syncTools();
    layoutHandles();
  }

  function layoutHandles() {
    if (!selected) return;
    if (selected.classList.contains("placed")) {
      const scale = elementScale(selected);
      const outer = frameScale();
      const selectedRect = selected.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const width = selected.offsetWidth * scale;
      const height = selected.offsetHeight * scale;
      const centerX =
        (selectedRect.left + selectedRect.right) / 2 - frameRect.left;
      const centerY =
        (selectedRect.top + selectedRect.bottom) / 2 - frameRect.top;
      handles.style.left = centerX / outer - width / 2 + "px";
      handles.style.top = centerY / outer - height / 2 + "px";
      handles.style.width = width + "px";
      handles.style.height = height + "px";
      handles.style.transform = `rotate(${B.cssNum(selected, "--r", 0)}deg)`;
    } else {
      const s = B.fitVal();
      const er = selected.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      handles.style.left = (er.left - sr.left) / s + "px";
      handles.style.top = (er.top - sr.top) / s + "px";
      handles.style.width = er.width / s + "px";
      handles.style.height = er.height / s + "px";
      handles.style.transform = "";
    }
  }

  function syncTools() {
    if (!selected || selected.dataset.edit !== "text") return;
    const fam = getComputedStyle(selected).fontFamily;
    textTools.querySelectorAll("[data-font]").forEach((btn) => {
      btn.classList.toggle("on", fam.includes(btn.dataset.font));
    });
    const hex = rgbToHex(getComputedStyle(selected).color);
    const picker = document.getElementById("ed-color");
    if (picker) picker.value = hex;
    textTools.querySelectorAll("[data-swatch]").forEach((b) => {
      b.classList.toggle("on", b.dataset.swatch.toLowerCase() === hex);
    });
  }

  function syncPaperTools() {
    if (!paperTools) return;
    paperTools.querySelectorAll("[data-paper-style]").forEach((button) => {
      const paper = document.querySelector(
        `[data-name="${button.dataset.paperStyle}"]`,
      );
      const label =
        button.dataset.paperStyle === "details-paper"
          ? "Details"
          : "Inspo title";
      const style =
        paper?.dataset.edgeStyle === "fracture"
          ? "paper fracture"
          : "hero separator";
      button.textContent = `${label} edge: ${style}`;
    });
  }

  function rgbToHex(c) {
    const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return "#1c1410";
    return (
      "#" +
      [m[1], m[2], m[3]]
        .map((n) => Number(n).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function beginMove(e, el) {
    if (!el.classList.contains("placed")) return;
    mode = {
      kind: "move",
      el,
      x0: B.cssNum(el, "--x", el.offsetLeft),
      y0: B.cssNum(el, "--y", el.offsetTop),
      px: e.clientX,
      py: e.clientY,
      s: elementScale(el) * frameScale(),
    };
  }

  function beginResize(e) {
    const el = selected;
    const r = el.getBoundingClientRect();
    const edge = ["n", "e", "s", "w"].find(
      (name) =>
        e.target.classList.contains("edge") && e.target.classList.contains(name),
    );
    const corner = ["nw", "ne", "sw", "se"].find((name) =>
      e.target.classList.contains(name),
    );
    mode = {
      kind: "resize",
      el,
      edge,
      corner,
      x0: B.cssNum(el, "--x", el.offsetLeft),
      y0: B.cssNum(el, "--y", el.offsetTop),
      w0: B.cssNum(el, "--w", el.offsetWidth),
      h0: B.cssNum(el, "--h", el.offsetHeight),
      fs0: parseFloat(getComputedStyle(el).fontSize) || 24,
      px: e.clientX,
      py: e.clientY,
      angle: (B.cssNum(el, "--r", 0) * Math.PI) / 180,
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      d0: Math.max(8, Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))),
      s: elementScale(el) * frameScale(),
    };
  }

  function beginRotate(e) {
    const el = selected;
    if (!el.classList.contains("placed")) return;
    const r = el.getBoundingClientRect();
    mode = {
      kind: "rotate",
      el,
      r0: B.cssNum(el, "--r", 0),
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      a0: Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)),
    };
  }

  handles.addEventListener("pointerdown", (e) => {
    if (!selected) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.target.classList.contains("rot")) beginRotate(e);
    else if (e.target.classList.contains("h")) beginResize(e);
  });

  frame.addEventListener("pointerdown", (e) => {
    if (e.target.closest("#handles")) return;
    const el = e.target.closest("[data-edit]");
    if (!el) {
      select(null);
      return;
    }
    e.preventDefault();
    select(el);
    beginMove(e, el);
  });

  frame.addEventListener("click", (e) => {
    if (e.target.closest("a[data-edit]")) e.preventDefault();
  });

  if (paperTools) {
    paperTools.addEventListener("click", (e) => {
      const button = e.target.closest("[data-paper-style]");
      if (!button) return;
      const paper = document.querySelector(
        `[data-name="${button.dataset.paperStyle}"]`,
      );
      if (!paper) return;
      paper.dataset.edgeStyle =
        paper.dataset.edgeStyle === "fracture" ? "separator" : "fracture";
      window.dispatchEvent(new CustomEvent("bday-paper-signal"));
      syncPaperTools();
      B.save();
    });
  }

  window.addEventListener("pointermove", (e) => {
    if (!mode) return;
    const { el } = mode;
    if (mode.kind === "move") {
      const dx = (e.clientX - mode.px) / mode.s;
      const dy = (e.clientY - mode.py) / mode.s;
      B.setVar(el, "--x", Math.round(mode.x0 + dx) + "px");
      B.setVar(el, "--y", Math.round(mode.y0 + dy) + "px");
    } else if (mode.kind === "resize") {
      if (mode.edge) {
        const dx = (e.clientX - mode.px) / mode.s;
        const dy = (e.clientY - mode.py) / mode.s;
        const cos = Math.cos(mode.angle);
        const sin = Math.sin(mode.angle);
        const localX = dx * cos + dy * sin;
        const localY = -dx * sin + dy * cos;
        let w = mode.w0;
        let h = mode.h0;
        let cx = mode.x0 + mode.w0 / 2;
        let cy = mode.y0 + mode.h0 / 2;

        if (mode.edge === "e" || mode.edge === "w") {
          w = Math.max(
            16,
            mode.w0 + (mode.edge === "e" ? localX : -localX),
          );
          const moved = mode.edge === "e" ? w - mode.w0 : mode.w0 - w;
          cx += (cos * moved) / 2;
          cy += (sin * moved) / 2;
        } else {
          h = Math.max(
            16,
            mode.h0 + (mode.edge === "s" ? localY : -localY),
          );
          const moved = mode.edge === "s" ? h - mode.h0 : mode.h0 - h;
          cx += (-sin * moved) / 2;
          cy += (cos * moved) / 2;
        }

        B.setVar(el, "--x", Math.round(cx - w / 2) + "px");
        B.setVar(el, "--y", Math.round(cy - h / 2) + "px");
        B.setVar(el, "--w", Math.round(w) + "px");
        B.setVar(el, "--h", Math.round(h) + "px");
      } else {
        const d = Math.hypot(e.clientX - mode.cx, e.clientY - mode.cy);
        const t = d / mode.d0;
        if (el.dataset.edit === "text") {
          const fs = Math.max(8, Math.round(mode.fs0 * t)) + "px";
          if (el.classList.contains("title") || el.classList.contains("hl-label")) {
            B.setVar(el, "--fs", fs);
            el.style.removeProperty("font-size");
          } else {
            B.setVar(el, "font-size", fs);
          }
          B.syncNoteSizes(el);
        } else if (el.hasAttribute("data-scale-box")) {
          const dx = (e.clientX - mode.px) / mode.s;
          const dy = (e.clientY - mode.py) / mode.s;
          const cos = Math.cos(mode.angle);
          const sin = Math.sin(mode.angle);
          const localX = dx * cos + dy * sin;
          const localY = -dx * sin + dy * cos;
          const sx = mode.corner?.includes("e") ? 1 : -1;
          const sy = mode.corner?.includes("s") ? 1 : -1;
          const t = Math.max(
            16 / Math.min(mode.w0, mode.h0),
            1 +
              (localX * sx * mode.w0 + localY * sy * mode.h0) /
                (mode.w0 * mode.w0 + mode.h0 * mode.h0),
          );
          const w = mode.w0 * t;
          const h = mode.h0 * t;
          const dw = w - mode.w0;
          const dh = h - mode.h0;
          const cx =
            mode.x0 +
            mode.w0 / 2 +
            (cos * sx * dw - sin * sy * dh) / 2;
          const cy =
            mode.y0 +
            mode.h0 / 2 +
            (sin * sx * dw + cos * sy * dh) / 2;

          B.setVar(el, "--x", Math.round(cx - w / 2) + "px");
          B.setVar(el, "--y", Math.round(cy - h / 2) + "px");
          B.setVar(el, "--w", Math.round(w) + "px");
          B.setVar(el, "--h", Math.round(h) + "px");
        } else {
          B.setVar(el, "--w", Math.max(16, Math.round(mode.w0 * t)) + "px");
        }
      }
    } else if (mode.kind === "rotate") {
      const a = Math.atan2(e.clientY - mode.cy, e.clientX - mode.cx);
      const deg = mode.r0 + ((a - mode.a0) * 180) / Math.PI;
      B.setVar(el, "--r", Math.round(deg) + "deg");
    }
    layoutHandles();
  });

  window.addEventListener("pointerup", () => {
    if (!mode) return;
    mode = null;
    B.save();
    if (B.whichBreak() === "mobile") B.applyFrame(hero);
    layoutHandles();
  });

  frame.addEventListener("dblclick", (e) => {
    const el = e.target.closest('[data-edit="text"]');
    if (!el) return;
    el.contentEditable = "true";
    el.focus();
    const done = () => {
      el.contentEditable = "false";
      el.removeEventListener("blur", done);
      B.restoreNoteMarks();
      B.save();
    };
    el.addEventListener("blur", done);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (document.activeElement && document.activeElement.isContentEditable) {
        document.activeElement.blur();
        return;
      }
      select(null);
      return;
    }
    if (!selected || !selected.classList.contains("placed")) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const x = B.cssNum(selected, "--x", selected.offsetLeft);
      const y = B.cssNum(selected, "--y", selected.offsetTop);
      if (e.key === "ArrowLeft") B.setVar(selected, "--x", x - step + "px");
      if (e.key === "ArrowRight") B.setVar(selected, "--x", x + step + "px");
      if (e.key === "ArrowUp") B.setVar(selected, "--y", y - step + "px");
      if (e.key === "ArrowDown") B.setVar(selected, "--y", y + step + "px");
      layoutHandles();
      B.save();
    }
    if (e.key === "]" || e.key === "[") {
      const z = B.cssNum(selected, "--z", 1);
      B.setVar(selected, "--z", String(e.key === "]" ? z + 1 : Math.max(0, z - 1)));
      B.save();
    }
  });

  textTools.addEventListener("click", (e) => {
    const font = e.target.closest("[data-font]");
    if (font && selected) {
      selected.style.fontFamily = `"${font.dataset.font}", cursive`;
      B.save();
      syncTools();
    }
    const sw = e.target.closest("[data-swatch]");
    if (sw && selected) {
      selected.style.color = sw.dataset.swatch;
      B.save();
      syncTools();
    }
  });

  const picker = document.getElementById("ed-color");
  if (picker) {
    picker.addEventListener("input", () => {
      if (!selected) return;
      selected.style.color = picker.value;
      B.save();
      syncTools();
    });
  }

  document.getElementById("ed-reset").addEventListener("click", () => {
    location.reload();
  });

  function sizeFrame() {
    const work = document.querySelector(".ed-work");
    const box = document.querySelector(".ed-frame");
    if (!work || !box) return;
    const f = B.frame();
    const mobileHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--hero"),
      ) || f.h;
    const body = document.querySelector(".body");
    const wideHeight =
      hero.offsetHeight + (parseFloat(body?.style.height || "") || 0);
    const height =
      B.whichBreak() === "mobile"
        ? mobileHeight
        : wideHeight > hero.offsetHeight
          ? wideHeight
          : f.h;
    box.style.width = f.w + "px";
    box.style.height = height + "px";
    document.documentElement.style.setProperty("--frame-w", f.w + "px");
    document.documentElement.style.setProperty("--frame-h", height + "px");
    const style = getComputedStyle(work);
    const availableWidth =
      work.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    const availableHeight =
      work.clientHeight -
      parseFloat(style.paddingTop) -
      parseFloat(style.paddingBottom);
    const k = Math.min(1, availableWidth / f.w, availableHeight / height);
    box.style.transform = "scale(" + k + ")";
  }

  function setBreak(name) {
    B.setBreak(name);
    location.hash = name;
    document.querySelectorAll(".ed-breaks [data-break]").forEach((btn) => {
      btn.classList.toggle("on", btn.dataset.break === name);
    });
    if (paperTools) paperTools.hidden = name !== "mobile";
    syncPaperTools();
    sizeFrame();
    B.applyFrame(hero);
    if (selected && !B.showsOn(selected, name)) select(null);
    else layoutHandles();
  }

  document.querySelector(".ed-breaks").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-break]");
    if (btn) setBreak(btn.dataset.break);
  });

  window.addEventListener("bday-mobile-end", sizeFrame);
  window.addEventListener("bday-body-size", sizeFrame);

  const start =
    (location.hash || "").replace("#", "") || "desktop";
  B.forceBreak = B.FRAMES[start] ? start : "desktop";
  setBreak(B.forceBreak);

  window.addEventListener("resize", () => {
    sizeFrame();
    B.fitStage(hero);
    layoutHandles();
  });
  select(null);
})();
