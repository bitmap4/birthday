(() => {
  const B = window.Bday;
  const stage = document.querySelector(".stage");
  const hero = document.querySelector(".hero");
  const handles = document.getElementById("handles");
  const textTools = document.getElementById("text-tools");
  if (!stage || !handles || !hero) return;

  let selected = null;
  let mode = null;

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
    textTools.hidden = selected.dataset.edit !== "text";
    syncTools();
    layoutHandles();
  }

  function layoutHandles() {
    if (!selected) return;
    if (selected.classList.contains("placed")) {
      handles.style.left = B.cssNum(selected, "--x", selected.offsetLeft) + "px";
      handles.style.top = B.cssNum(selected, "--y", selected.offsetTop) + "px";
      handles.style.width = selected.offsetWidth + "px";
      handles.style.height = selected.offsetHeight + "px";
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
      s: B.fitVal(),
    };
  }

  function beginResize(e) {
    const el = selected;
    const s = B.fitVal();
    const r = el.getBoundingClientRect();
    mode = {
      kind: "resize",
      el,
      w0: B.cssNum(el, "--w", el.offsetWidth),
      fs0: parseFloat(getComputedStyle(el).fontSize) || 24,
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      d0: Math.max(8, Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))),
      s,
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

  stage.addEventListener("pointerdown", (e) => {
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

  window.addEventListener("pointermove", (e) => {
    if (!mode) return;
    const { el } = mode;
    if (mode.kind === "move") {
      const dx = (e.clientX - mode.px) / mode.s;
      const dy = (e.clientY - mode.py) / mode.s;
      B.setVar(el, "--x", Math.round(mode.x0 + dx) + "px");
      B.setVar(el, "--y", Math.round(mode.y0 + dy) + "px");
    } else if (mode.kind === "resize") {
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
      } else {
        B.setVar(el, "--w", Math.max(16, Math.round(mode.w0 * t)) + "px");
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
    layoutHandles();
  });

  stage.addEventListener("dblclick", (e) => {
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

  B.fitStage(hero);
  window.addEventListener("resize", () => {
    B.fitStage(hero);
    layoutHandles();
  });
  select(null);
})();
