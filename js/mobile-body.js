(() => {
  "use strict";

  const SCRIPT = document.currentScript;
  const asset = (path) => new URL("../" + path, SCRIPT.src).href;
  const config = window.BdayConfig;
  if (!config) throw new Error("Birthday configuration was not loaded");
  const board = config.pinterestBoard;
  const rsvp = config.rsvpUrl;
  const map = config.mapUrl;
  const stage = document.querySelector(".stage");
  const bodyHost = document.querySelector(".body > div");
  if (!stage) return;

  const photos = Array.from({ length: 8 }, (_, i) => {
    const number = String(i + 1).padStart(2, "0");
    return `<span class="instant-photo photo-${i + 1}"><img src="${asset(
      `assets/inspo/${number}.jpg`,
    )}" alt="" loading="lazy"></span>`;
  }).join("");

  const mobileMarkup = `
    <main class="mobile-body" aria-label="Party details">
      <article class="placed mobile-paper details-paper" data-edit="sticker" data-name="details-paper" data-show="mobile" data-scale-box data-free-resize data-edge-seed="20260921" data-edge-style="separator">
        <canvas class="paper-card-bg" data-paper-seed="20260921" aria-hidden="true"></canvas>
      </article>

      <svg class="placed mobile-detail-icon" data-edit="sticker" data-name="details-when-icon" data-show="mobile" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="17"></circle><path d="M24 13v12l9 5"></path>
      </svg>
      <h2 class="placed mobile-detail-title" data-edit="text" data-name="details-when-title" data-show="mobile">WHEN?</h2>
      <p class="placed mobile-detail-copy" data-edit="text" data-name="details-when-copy" data-show="mobile">12th September 2026
7:00 PM onwards</p>
      <span class="placed mobile-detail-rule" data-edit="sticker" data-name="details-rule-1" data-show="mobile" aria-hidden="true"><canvas class="mobile-rule-canvas" data-rule-seed="20260922"></canvas></span>

      <svg class="placed mobile-detail-icon" data-edit="sticker" data-name="details-where-icon" data-show="mobile" viewBox="0 0 48 56" aria-hidden="true">
        <path d="M24 52S8 33 8 21a16 16 0 1 1 32 0c0 12-16 31-16 31Z"></path><circle cx="24" cy="21" r="5"></circle>
      </svg>
      <h2 class="placed mobile-detail-title" data-edit="text" data-name="details-where-title" data-show="mobile">WHERE?</h2>
      <a class="placed mobile-detail-copy" data-edit="text" data-name="details-where-copy" data-show="mobile" href="${map}" target="_blank" rel="noopener noreferrer">Uru stays
Kanakamamidi, Hyderabad,
Telangana
View on Google Maps ↗</a>
      <span class="placed mobile-detail-rule" data-edit="sticker" data-name="details-rule-2" data-show="mobile" aria-hidden="true"><canvas class="mobile-rule-canvas" data-rule-seed="20260923"></canvas></span>

      <span class="placed mobile-detail-icon image-detail-icon" data-edit="sticker" data-name="details-dress-icon" data-show="mobile" aria-hidden="true"><img src="${asset("assets/stickers/dress-shirt-sketch.svg")}" alt=""></span>
      <h2 class="placed mobile-detail-title" data-edit="text" data-name="details-dress-title" data-show="mobile">DRESS CODE?</h2>
      <p class="placed mobile-detail-copy" data-edit="text" data-name="details-dress-copy" data-show="mobile">After Dark — dark, elegant tones
or soft neutrals. Please avoid
bright or neon colours.</p>
      <p class="placed details-aside" data-edit="text" data-name="details-aside" data-show="mobile">Dress it up,
keep it classy.</p>
      <span class="placed doodle-svg" data-edit="sticker" data-name="details-star" data-show="mobile" aria-hidden="true"><img src="${asset("assets/stickers/star-sketchy.svg")}" alt=""></span>
      <span class="placed doodle-svg" data-edit="sticker" data-name="details-heart" data-show="mobile" aria-hidden="true"><img src="${asset("assets/stickers/heart-sketchy.svg")}" alt=""></span>

      <article class="placed mobile-paper inspo-paper" data-edit="sticker" data-name="inspo-paper" data-show="mobile" data-scale-box data-free-resize data-edge-seed="20261013" data-edge-style="separator">
        <canvas class="paper-card-bg" data-paper-seed="20261013" aria-hidden="true"></canvas>
      </article>
      <span class="placed inspo-title-ink" data-edit="sticker" data-name="inspo-title-ink" data-show="mobile" data-scale-box data-free-resize data-edge-seed="20261014" data-edge-style="separator" aria-hidden="true">
        <canvas class="inspo-title-ink-canvas" data-ink-seed="20261014" data-ink-shape="torn"></canvas>
      </span>
      <a class="placed inspo-banner" data-edit="text" data-name="inspo-title" data-show="mobile" href="${board}" target="_blank" rel="noopener noreferrer">DRESS CODE INSPO</a>
      <span class="placed pinterest-mark" data-edit="sticker" data-name="inspo-pinterest-mark" data-show="mobile" aria-hidden="true"><img src="${asset("assets/stickers/pinterest.svg")}" alt=""></span>
      <a class="placed inspo-note" data-edit="text" data-name="inspo-note" data-show="mobile" href="${board}" target="_blank" rel="noopener noreferrer">view the full board
on Pinterest ↘</a>
      <a class="placed inspo-collage" data-edit="sticker" data-name="inspo-collage" data-show="mobile" href="${board}" target="_blank" rel="noopener noreferrer" aria-label="View dress code inspiration on Pinterest">${photos}</a>
      <span class="placed doodle-svg inspo-star" data-edit="sticker" data-name="inspo-star" data-show="mobile" aria-hidden="true"><img src="${asset("assets/stickers/star-swirl-sketch.svg")}" alt=""></span>

      <section class="placed rsvp-ink-piece" data-edit="sticker" data-name="rsvp-ink" data-show="mobile" data-scale-box data-free-resize>
        <canvas class="rsvp-ink" data-ink-seed="20261107" aria-hidden="true"></canvas>
      </section>
      <h2 class="placed rsvp-heading" data-edit="text" data-name="rsvp-heading" data-show="mobile">RSVP</h2>
      <span class="placed doodle-svg light-doodle" data-edit="sticker" data-name="rsvp-heart" data-show="mobile" aria-hidden="true"><img src="${asset("assets/stickers/heart-sketchy-light.svg")}" alt=""></span>
      <button type="button" class="placed rsvp-primary" data-edit="sticker" data-name="rsvp-primary" data-show="mobile"><img class="rsvp-brand-icon" src="${asset("assets/stickers/whatsapp.svg")}" alt=""><strong>Yes! I’m coming</strong><span aria-hidden="true">→</span></button>
      <small class="placed rsvp-small" data-edit="text" data-name="rsvp-small" data-show="mobile">(no hard feelings!)</small>
      <p class="placed rsvp-note" data-edit="text" data-name="rsvp-note" data-show="mobile">can’t wait
to see you!</p>
      <span class="placed doodle-svg light-doodle" data-edit="sticker" data-name="rsvp-note-heart" data-show="mobile" aria-hidden="true"><img src="${asset("assets/stickers/heart-duma-light.svg")}" alt=""></span>
    </main>`;

  const wideMarkup = `
    <main class="wide-body" aria-label="Party details and invitation">
      <article class="placed mobile-paper wide-details-paper" data-edit="sticker" data-name="wide-details-paper" data-show="wide" data-scale-box data-free-resize data-edge-seed="20261201" data-edge-style="separator">
        <canvas class="paper-card-bg" data-paper-seed="20261201" aria-hidden="true"></canvas>
      </article>

      <svg class="placed mobile-detail-icon" data-edit="sticker" data-name="wide-when-icon" data-show="wide" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17"></circle><path d="M24 13v12l9 5"></path></svg>
      <h2 class="placed mobile-detail-title" data-edit="text" data-name="wide-when-title" data-show="wide">WHEN?</h2>
      <p class="placed mobile-detail-copy" data-edit="text" data-name="wide-when-copy" data-show="wide">12th September 2026
7:00 PM onwards</p>

      <svg class="placed mobile-detail-icon" data-edit="sticker" data-name="wide-where-icon" data-show="wide" viewBox="0 0 48 56" aria-hidden="true"><path d="M24 52S8 33 8 21a16 16 0 1 1 32 0c0 12-16 31-16 31Z"></path><circle cx="24" cy="21" r="5"></circle></svg>
      <h2 class="placed mobile-detail-title" data-edit="text" data-name="wide-where-title" data-show="wide">WHERE?</h2>
      <a class="placed mobile-detail-copy" data-edit="text" data-name="wide-where-copy" data-show="wide" href="${map}" target="_blank" rel="noopener noreferrer">Uru stays
Kanakamamidi, Hyderabad, Telangana
View on Google Maps ↗</a>

      <span class="placed mobile-detail-icon image-detail-icon" data-edit="sticker" data-name="wide-dress-icon" data-show="wide" aria-hidden="true"><img src="${asset("assets/stickers/dress-shirt-sketch.svg")}" alt=""></span>
      <h2 class="placed mobile-detail-title" data-edit="text" data-name="wide-dress-title" data-show="wide">DRESS CODE?</h2>
      <p class="placed mobile-detail-copy" data-edit="text" data-name="wide-dress-copy" data-show="wide">After Dark — dark, elegant tones or soft neutrals.
Please avoid bright or neon colours.</p>

      <span class="placed mobile-detail-rule wide-rule" data-edit="sticker" data-name="wide-rule-1" data-show="wide" aria-hidden="true"><canvas class="mobile-rule-canvas" data-rule-seed="20261202"></canvas></span>
      <span class="placed mobile-detail-rule wide-rule" data-edit="sticker" data-name="wide-rule-2" data-show="wide" aria-hidden="true"><canvas class="mobile-rule-canvas" data-rule-seed="20261203"></canvas></span>

      <article class="placed mobile-paper wide-inspo-paper" data-edit="sticker" data-name="wide-inspo-paper" data-show="wide" data-scale-box data-free-resize data-edge-seed="20261204" data-edge-style="separator">
        <canvas class="paper-card-bg" data-paper-seed="20261204" aria-hidden="true"></canvas>
      </article>
      <span class="placed inspo-title-ink" data-edit="sticker" data-name="wide-inspo-title-ink" data-show="wide" data-scale-box data-free-resize data-edge-seed="20261205" data-edge-style="separator" aria-hidden="true"><canvas class="inspo-title-ink-canvas" data-ink-seed="20261205" data-ink-shape="torn"></canvas></span>
      <a class="placed inspo-banner" data-edit="text" data-name="wide-inspo-title" data-show="wide" href="${board}" target="_blank" rel="noopener noreferrer">DRESS CODE INSPO</a>
      <span class="placed pinterest-mark" data-edit="sticker" data-name="wide-pinterest-mark" data-show="wide" aria-hidden="true"><img src="${asset("assets/stickers/pinterest.svg")}" alt=""></span>
      <a class="placed inspo-note" data-edit="text" data-name="wide-inspo-note" data-show="wide" href="${board}" target="_blank" rel="noopener noreferrer">view the full board
on Pinterest ↘</a>
      <a class="placed inspo-collage" data-edit="sticker" data-name="wide-inspo-collage" data-show="wide" href="${board}" target="_blank" rel="noopener noreferrer" aria-label="View dress code inspiration on Pinterest">${photos}</a>
      <span class="placed doodle-svg inspo-star" data-edit="sticker" data-name="wide-inspo-star" data-show="wide" aria-hidden="true"><img src="${asset("assets/stickers/star-swirl-sketch.svg")}" alt=""></span>

      <figure class="placed invite-card" data-edit="sticker" data-name="wide-invite" data-show="wide">
        <img src="${asset("assets/canva/invite.jpg")}" alt="Birthday invitation">
      </figure>

      <section class="placed rsvp-ink-piece" data-edit="sticker" data-name="wide-rsvp-ink" data-show="wide" data-scale-box data-free-resize>
        <canvas class="rsvp-ink" data-ink-seed="20261206" aria-hidden="true"></canvas>
      </section>
      <h2 class="placed rsvp-heading" data-edit="text" data-name="wide-rsvp-heading" data-show="wide">RSVP</h2>
      <span class="placed doodle-svg light-doodle" data-edit="sticker" data-name="wide-rsvp-heart" data-show="wide" aria-hidden="true"><img src="${asset("assets/stickers/heart-sketchy-light.svg")}" alt=""></span>
      <button type="button" class="placed rsvp-primary" data-edit="sticker" data-name="wide-rsvp-primary" data-show="wide"><img class="rsvp-brand-icon" src="${asset("assets/stickers/whatsapp.svg")}" alt=""><strong>Yes! I’m coming</strong><span aria-hidden="true">→</span></button>
      <small class="placed rsvp-small" data-edit="text" data-name="wide-rsvp-small" data-show="wide">(no hard feelings!)</small>
      <p class="placed rsvp-note" data-edit="text" data-name="wide-rsvp-note" data-show="wide">can’t wait
to see you!</p>
      <span class="placed doodle-svg light-doodle" data-edit="sticker" data-name="wide-rsvp-note-heart" data-show="wide" aria-hidden="true"><img src="${asset("assets/stickers/heart-duma-light.svg")}" alt=""></span>
      <span class="placed doodle-svg" data-edit="sticker" data-name="wide-rsvp-star" data-show="wide" aria-hidden="true"><img src="${asset("assets/stickers/star-sketchy.svg")}" alt=""></span>
    </main>`;

  const wideDefaults = {
    "wide-details-paper": { x: "60px", y: "90px", z: "1", r: "-1deg", w: "1320px", h: "310px", edgeSeed: 20261201, edgeStyle: "separator" },
    "wide-when-icon": { x: "105px", y: "150px", z: "3", r: "-4deg", w: "72px" },
    "wide-when-title": { x: "195px", y: "140px", z: "3", r: "-1deg", w: "270px", fontSize: "54px", text: "WHEN?" },
    "wide-when-copy": { x: "195px", y: "205px", z: "3", r: "0deg", w: "300px", fontSize: "27px", text: "12th September 2026\n7:00 PM onwards" },
    "wide-where-icon": { x: "535px", y: "150px", z: "3", r: "3deg", w: "72px" },
    "wide-where-title": { x: "625px", y: "140px", z: "3", r: "1deg", w: "250px", fontSize: "54px", text: "WHERE?" },
    "wide-where-copy": { x: "625px", y: "205px", z: "3", r: "0deg", w: "315px", fontSize: "25px", text: "Uru stays\nKanakamamidi, Hyderabad, Telangana\nView on Google Maps ↗" },
    "wide-dress-icon": { x: "965px", y: "150px", z: "3", r: "-5deg", w: "75px" },
    "wide-dress-title": { x: "1050px", y: "140px", z: "3", r: "-1deg", w: "285px", fontSize: "34px", text: "DRESS CODE?" },
    "wide-dress-copy": { x: "1050px", y: "196px", z: "3", r: "0deg", w: "275px", fontSize: "23px", text: "After Dark — dark, elegant tones or soft neutrals.\nPlease avoid bright or neon colours." },
    "wide-rule-1": { x: "470px", y: "145px", z: "3", r: "90deg", w: "190px" },
    "wide-rule-2": { x: "900px", y: "145px", z: "3", r: "90deg", w: "190px" },
    "wide-inspo-paper": { x: "65px", y: "530px", z: "1", r: "-1deg", w: "650px", h: "770px", edgeSeed: 20261204, edgeStyle: "separator" },
    "wide-inspo-title-ink": { x: "45px", y: "470px", z: "3", r: "-4deg", w: "600px", h: "112px", edgeSeed: 20261205, edgeStyle: "separator" },
    "wide-inspo-title": { x: "75px", y: "505px", z: "4", r: "-4deg", w: "540px", fontSize: "48px", text: "DRESS CODE INSPO" },
    "wide-pinterest-mark": { x: "125px", y: "595px", z: "4", r: "-8deg", w: "72px" },
    "wide-inspo-note": { x: "215px", y: "585px", z: "4", r: "-6deg", w: "300px", fontSize: "33px", text: "view the full board\non Pinterest ↘" },
    "wide-inspo-collage": { x: "100px", y: "710px", z: "3", r: "0deg", w: "575px", h: "520px" },
    "wide-inspo-star": { x: "75px", y: "1160px", z: "4", r: "-12deg", w: "92px" },
    "wide-invite": { x: "835px", y: "495px", z: "2", r: "1deg", w: "500px" },
    "wide-rsvp-ink": { x: "0px", y: "1370px", z: "2", r: "0deg", w: "1440px", h: "430px" },
    "wide-rsvp-heading": { x: "90px", y: "1490px", z: "4", r: "-6deg", w: "280px", fontSize: "112px", text: "RSVP" },
    "wide-rsvp-heart": { x: "170px", y: "1600px", z: "4", r: "-10deg", w: "90px" },
    "wide-rsvp-primary": { x: "455px", y: "1535px", z: "4", r: "0deg", w: "560px" },
    "wide-rsvp-small": { x: "520px", y: "1650px", z: "4", r: "1deg", w: "350px", fontSize: "34px", text: "(no hard feelings!)" },
    "wide-rsvp-note": { x: "1080px", y: "1500px", z: "4", r: "-7deg", w: "210px", fontSize: "48px", text: "can’t wait\nto see you!" },
    "wide-rsvp-note-heart": { x: "1140px", y: "1620px", z: "4", r: "12deg", w: "78px" },
    "wide-rsvp-star": { x: "1300px", y: "1450px", z: "4", r: "8deg", w: "100px" },
  };

  const handles = stage.querySelector("#handles");
  if (handles) handles.insertAdjacentHTML("beforebegin", mobileMarkup);
  else stage.insertAdjacentHTML("beforeend", mobileMarkup);
  if (bodyHost) {
    bodyHost.classList.add("body-stage");
    bodyHost.innerHTML = wideMarkup;
  }
  if (window.Bday && window.Bday.FILE) {
    ["desktop", "medium"].forEach((breakpoint) => {
      const layout = window.Bday.FILE[breakpoint] || (window.Bday.FILE[breakpoint] = {});
      Object.entries(wideDefaults).forEach(([name, value]) => {
        if (!layout[name]) layout[name] = { ...value };
      });
    });
  }
  if (window.Bday && bodyHost) {
    window.Bday.fitBody = () => {
      const body = bodyHost.parentElement;
      if (!body) return;
      if (window.Bday.whichBreak() === "mobile") {
        body.style.removeProperty("height");
        return;
      }
      const fit = body.clientWidth / 1440;
      bodyHost.style.setProperty("--body-fit", String(fit));
      body.style.height = 1800 * fit + "px";
      window.dispatchEvent(new CustomEvent("bday-body-size"));
    };
  }
  if (window.Bday && window.Bday.applyPlaced) {
    window.Bday.applyPlaced();
    window.Bday.applyFrame();
  }
  fetch("/__pinterest?url=" + encodeURIComponent(board), { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data || !Array.isArray(data.images)) return;
      document.querySelectorAll(".inspo-collage").forEach((collage) => {
        collage.querySelectorAll("img").forEach((image, i) => {
          if (data.images[i]) image.src = data.images[i];
        });
      });
    })
    .catch(() => {
      /* Keep the bundled image fallback on static hosts or while offline. */
    });

  function bootRsvpForm() {
    if (document.getElementById("rsvp-overlay")) return;
    const editing = Boolean(document.getElementById("handles"));
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div id="rsvp-overlay" class="rsvp-overlay" hidden>
        <article class="rsvp-sheet" role="dialog" aria-modal="true" aria-labelledby="rsvp-form-title" data-edge-seed="20260902" data-edge-style="separator">
          <canvas class="paper-card-bg" data-paper-seed="20260902" aria-hidden="true"></canvas>
          <form class="rsvp-form" id="rsvp-form" novalidate>
            <button type="button" class="rsvp-close" aria-label="Close">&times;</button>
            <h2 id="rsvp-form-title">RSVP</h2>
            <p class="rsvp-form-lead">can you make it?</p>
            <label class="rsvp-field">
              <span>your name</span>
              <input type="text" name="name" autocomplete="name" maxlength="80" required>
            </label>
            <div class="rsvp-choices">
              <button type="submit" class="rsvp-choice" name="coming" value="yes">I’ll be there</button>
              <button type="submit" class="rsvp-choice rsvp-choice-out" name="coming" value="no">can’t make it</button>
            </div>
            <p class="rsvp-form-status" role="status" aria-live="polite"></p>
          </form>
        </article>
      </div>`,
    );

    const overlay = document.getElementById("rsvp-overlay");
    const form = document.getElementById("rsvp-form");
    const nameInput = form.querySelector('input[name="name"]');
    const status = form.querySelector(".rsvp-form-status");
    const closeBtn = form.querySelector(".rsvp-close");
    let lastFocus = null;
    let pending = false;

    function paintSheet() {
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent("bday-paper-signal"));
      });
    }

    function openForm() {
      lastFocus = document.activeElement;
      overlay.hidden = false;
      document.documentElement.classList.add("rsvp-open");
      paintSheet();
      setTimeout(() => nameInput.focus(), 40);
    }

    function closeForm() {
      if (pending) return;
      overlay.hidden = true;
      document.documentElement.classList.remove("rsvp-open");
      form.reset();
      status.textContent = "";
      form.querySelectorAll(".rsvp-choice").forEach((button) => {
        button.disabled = false;
      });
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    if (!editing) {
      document.querySelectorAll(".rsvp-primary").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          openForm();
        });
      });
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeForm();
    });
    closeBtn.addEventListener("click", closeForm);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) closeForm();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (pending) return;
      const coming = e.submitter && e.submitter.value === "no" ? "no" : "yes";
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        status.textContent = "leave your name first";
        return;
      }
      pending = true;
      form.querySelectorAll(".rsvp-choice").forEach((button) => {
        button.disabled = true;
      });
      status.textContent = "sending…";
      const api = config.rsvpApi || "/__rsvp";
      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, coming }),
        });
        if (!response.ok) throw new Error("bad");
        if (coming === "yes") {
          status.textContent = "see you there — opening the group…";
          window.location.assign(rsvp);
          return;
        }
        status.textContent = "thanks for letting us know";
        pending = false;
        setTimeout(closeForm, 1400);
      } catch (err) {
        pending = false;
        if (coming === "yes") {
          status.textContent = "couldn’t save that — opening the group anyway";
          setTimeout(() => window.location.assign(rsvp), 800);
        } else {
          status.textContent = "couldn’t send that — try again";
          form.querySelectorAll(".rsvp-choice").forEach((button) => {
            button.disabled = false;
          });
        }
      }
    });

    if (!editing && location.hash === "#rsvp") openForm();
  }

  bootRsvpForm();

  const root = document.documentElement;
  const paperCanvases = [...document.querySelectorAll(".paper-card-bg")];
  const inkCanvases = [
    ...document.querySelectorAll(".rsvp-ink, .inspo-title-ink-canvas"),
  ];
  const ruleCanvases = [...document.querySelectorAll(".mobile-rule-canvas")];
  if (!paperCanvases.length && !inkCanvases.length && !ruleCanvases.length) return;
  const paperTexture = new Image();
  paperTexture.decoding = "async";
  paperTexture.addEventListener("load", scheduleRender);
  paperTexture.src = asset("assets/stickers/bg.png");
  const inkMask = new Image();
  inkMask.decoding = "async";
  inkMask.addEventListener("load", scheduleRender);
  inkMask.src = asset("assets/stickers/ink-mask-clean.png");

  function hash(n) {
    n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
    n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }

  function random(seed) {
    let n = seed >>> 0;
    return () => {
      n += 0x6d2b79f5;
      let z = n;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }

  function smooth(t) {
    return t * t * (3 - 2 * t);
  }

  function noise1(x, seed) {
    const i = Math.floor(x);
    const t = smooth(x - i);
    const a = hash(i ^ seed) * 2 - 1;
    const b = hash((i + 1) ^ seed) * 2 - 1;
    return a + (b - a) * t;
  }

  function noise2(x, y, seed) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const tx = smooth(x - ix);
    const ty = smooth(y - iy);
    const a = hash(ix ^ Math.imul(iy, 374761393) ^ seed) * 2 - 1;
    const b = hash((ix + 1) ^ Math.imul(iy, 374761393) ^ seed) * 2 - 1;
    const c = hash(ix ^ Math.imul(iy + 1, 374761393) ^ seed) * 2 - 1;
    const d = hash((ix + 1) ^ Math.imul(iy + 1, 374761393) ^ seed) * 2 - 1;
    const top = a + (b - a) * tx;
    const bot = c + (d - c) * tx;
    return top + (bot - top) * ty;
  }

  function fbm2(x, y, seed) {
    return (
      noise2(x, y, seed) * 0.54 +
      noise2(x * 2.1, y * 2.1, seed ^ 0x9e3779b9) * 0.29 +
      noise2(x * 4.6, y * 4.6, seed ^ 0x85ebca6b) * 0.17
    );
  }

  function fitCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w < 2 || h < 2) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h, dpr };
  }

  function makeProfile(length, seed, amplitude, step, notches, gain) {
    const points = [];

    for (let p = 0; p <= length; p += step) {
      const envelope = 0.62 + 0.68 * ((noise1(p / 86, seed ^ 0x721b5) + 1) / 2);
      let value = gain * envelope * (
        amplitude * 0.52 * noise1(p / 42, seed ^ 0x45d9f3b) +
        amplitude * 0.3 * noise1(p / 15, seed ^ 0x119de1f3) +
        amplitude * 0.18 * noise1(p / 4.5, seed ^ 0x3449f)
      );
      notches.forEach((notch) => {
        if (p < notch.center) {
          const d = (p - (notch.center - notch.left)) / notch.left;
          if (d >= 0 && d <= 1) value -= notch.depth * Math.pow(d, notch.leftPower);
        } else {
          const d = (notch.center + notch.right - p) / notch.right;
          if (d >= 0 && d <= 1) value -= notch.depth * Math.pow(d, notch.rightPower);
        }
      });
      points.push({ p, value });
    }
    if (points.at(-1).p !== length) {
      points.push({ p: length, value: points.at(-1).value });
    }
    const start = points[0].value;
    const end = points.at(-1).value;
    points.forEach((point) => {
      point.value -= start + (end - start) * (point.p / length);
    });
    return points;
  }

  function allocateNotches(lengths, seed, amplitude, damageScale) {
    const result = lengths.map(() => []);
    if (!damageScale) return result;
    const rng = random(seed ^ 0x6ac690c5);
    const perimeter = lengths.reduce((sum, length) => sum + length, 0);
    const count = Math.max(1, Math.min(4, Math.round(perimeter / 290 + rng() - 0.35)));
    const used = [];
    for (let event = 0; event < count; event += 1) {
      let chosen = null;
      for (let attempt = 0; attempt < 24 && !chosen; attempt += 1) {
        const around = rng() * perimeter;
        let cursor = 0;
        for (let side = 0; side < lengths.length; side += 1) {
          const length = lengths[side];
          if (around <= cursor + length) {
            const center = around - cursor;
            const globalGap = used.every((position) => {
              const gap = Math.abs(position - around);
              return Math.min(gap, perimeter - gap) > 42;
            });
            if (center > 13 && center < length - 13 && globalGap) {
              chosen = { side, center, around };
            }
            break;
          }
          cursor += length;
        }
      }
      if (!chosen) continue;
      used.push(chosen.around);
      const width = (7 + rng() * 18) * damageScale;
      const split = 0.2 + rng() * 0.2;
      result[chosen.side].push({
        center: chosen.center,
        left: width * split,
        right: width * (1 - split),
        depth: amplitude * damageScale * (1.1 + rng() * 2.35),
        leftPower: 0.65 + rng() * 0.7,
        rightPower: 0.65 + rng() * 0.7,
      });
    }
    return result;
  }

  function makeRoughShape(w, h, seed, inset, amplitude, step, damageScale = 1) {
    const lengths = [w - inset * 2, h - inset * 2, w - inset * 2, h - inset * 2];
    const notches = allocateNotches(lengths, seed, amplitude, damageScale);
    const gainRng = random(seed ^ 0x94d049bb);
    const gains = lengths.map(() => 0.68 + gainRng() * 0.67);
    gains[Math.floor(gainRng() * 4)] *= 0.68;
    const top = makeProfile(lengths[0], seed ^ 0x13687, amplitude, step, notches[0], gains[0]);
    const right = makeProfile(
      lengths[1],
      seed ^ 0x5bd1e995,
      amplitude,
      step,
      notches[1],
      gains[1],
    );
    const bottom = makeProfile(
      lengths[2],
      seed ^ 0x27d4eb2f,
      amplitude,
      step,
      notches[2],
      gains[2],
    );
    const left = makeProfile(
      lengths[3],
      seed ^ 0x165667b1,
      amplitude,
      step,
      notches[3],
      gains[3],
    );
    const sides = [
      top.map(({ p, value }) => ({ x: inset + p, y: inset - value, nx: 0, ny: -1 })),
      right.map(({ p, value }) => ({
        x: w - inset + value,
        y: inset + p,
        nx: 1,
        ny: 0,
      })),
      [...bottom].reverse().map(({ p, value }) => ({
        x: inset + p,
        y: h - inset + value,
        nx: 0,
        ny: 1,
      })),
      [...left].reverse().map(({ p, value }) => ({
        x: inset - value,
        y: inset + p,
        nx: -1,
        ny: 0,
      })),
    ];
    const all = sides.flat();
    const path = new Path2D();
    path.moveTo(all[0].x, all[0].y);
    all.slice(1).forEach((point) => path.lineTo(point.x, point.y));
    path.closePath();
    return { path, sides, all };
  }

  function drawTornFibers(ctx, shape, seed) {
    const rng = random(seed);
    ctx.save();
    ctx.lineCap = "round";
    shape.sides.forEach((side) => {
      let i = Math.floor(rng() * 5);
      while (i < side.length) {
        const point = side[i];
        const length = 1.3 + rng() * 4.8;
        const drift = (rng() - 0.5) * 3.2;
        ctx.beginPath();
        ctx.moveTo(point.x - point.nx * 0.5, point.y - point.ny * 0.5);
        ctx.quadraticCurveTo(
          point.x + point.nx * length * 0.55,
          point.y + point.ny * length * 0.55,
          point.x + point.nx * length + point.ny * drift,
          point.y + point.ny * length - point.nx * drift,
        );
        ctx.strokeStyle = `rgba(255, 250, 239, ${0.25 + rng() * 0.34})`;
        ctx.lineWidth = 0.25 + rng() * 0.4;
        ctx.stroke();
        i += Math.max(3, Math.round((12 + rng() * 18) / 3));
      }
    });
    ctx.restore();
  }

  function drawPaperRim(ctx, shape, seed) {
    shape.sides.forEach((side, sideIndex) => {
      let drawing = false;
      ctx.beginPath();
      side.forEach((point, i) => {
        const signal = noise1(i / 8, seed ^ Math.imul(sideIndex + 1, 0x45d9f3b));
        if (signal > (sideIndex === 1 || sideIndex === 2 ? -0.18 : 0.22)) {
          if (!drawing) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
          drawing = true;
        } else {
          drawing = false;
        }
      });
      ctx.strokeStyle = "rgba(117, 82, 57, 0.13)";
      ctx.lineWidth = 0.65;
      ctx.lineCap = "round";
      ctx.stroke();
    });
  }

  function makeDesktopTearShape(w, h, seed) {
    const makeSignal = window.Bday && window.Bday.makeTearNoise;
    if (!makeSignal) return makeRoughShape(w, h, seed, 7, 2.6, 3);
    const inset = 7;
    const amp = 3.8;
    const count = 129;
    const topSignal = makeSignal(seed);
    const rightSignal = makeSignal(seed + 31);
    const bottomSignal = makeSignal(seed + 67);
    const leftSignal = makeSignal(seed + 101);
    const sample = (signal, t) => {
      const at = t * (signal.length - 1);
      const i = Math.floor(at);
      const f = at - i;
      return signal[i] + (signal[Math.min(i + 1, signal.length - 1)] - signal[i]) * f;
    };
    const sides = [[], [], [], []];
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      sides[0].push({
        x: inset + (w - inset * 2) * t,
        y: inset + amp * sample(topSignal, t),
        nx: 0,
        ny: -1,
      });
    }
    for (let i = 1; i < count; i += 1) {
      const t = i / (count - 1);
      sides[1].push({
        x: w - inset + amp * 0.65 * sample(rightSignal, t),
        y: inset + (h - inset * 2) * t,
        nx: 1,
        ny: 0,
      });
    }
    for (let i = 1; i < count; i += 1) {
      const t = i / (count - 1);
      sides[2].push({
        x: w - inset - (w - inset * 2) * t,
        y: h - inset + amp * sample(bottomSignal, t),
        nx: 0,
        ny: 1,
      });
    }
    for (let i = 1; i < count; i += 1) {
      const t = i / (count - 1);
      sides[3].push({
        x: inset + amp * 0.65 * sample(leftSignal, t),
        y: h - inset - (h - inset * 2) * t,
        nx: -1,
        ny: 0,
      });
    }
    const all = sides.flat();
    const path = new Path2D();
    path.moveTo(all[0].x, all[0].y);
    all.slice(1).forEach((point) => path.lineTo(point.x, point.y));
    path.closePath();
    return { path, sides, all };
  }

  function renderPaper(canvas) {
    const fit = fitCanvas(canvas);
    if (!fit) return;
    const { ctx, w, h } = fit;
    const seed = +(canvas.parentElement.dataset.edgeSeed || canvas.dataset.paperSeed || 1);
    const edgeStyle = canvas.parentElement.dataset.edgeStyle || "separator";
    const rng = random(seed ^ 0x51f15e);
    const shape =
      edgeStyle === "fracture"
        ? makeRoughShape(w, h, seed, 7, 2.6, 3)
        : makeDesktopTearShape(w, h, seed);

    ctx.save();
    ctx.shadowColor = "rgba(50, 31, 20, 0.2)";
    ctx.shadowBlur = 3.5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "rgba(255, 250, 240, 0.94)";
    ctx.fill(shape.path);
    ctx.restore();

    ctx.save();
    ctx.clip(shape.path);
    if (paperTexture.complete && paperTexture.naturalWidth) {
      const pattern = ctx.createPattern(paperTexture, "repeat");
      if (pattern) {
        if (pattern.setTransform) {
          pattern.setTransform(
            new DOMMatrix().translate(-(seed % 173), -((seed >>> 8) % 211)),
          );
        }
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
    }
    ctx.fillStyle = "rgba(255, 250, 240, 0.56)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "multiply";
    for (let i = 0; i < Math.round((w * h) / 145); i += 1) {
      const x = rng() * w;
      const y = rng() * h;
      const length = 2 + rng() * 17;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + (rng() - 0.5) * 1.3);
      ctx.strokeStyle = `rgba(104, 77, 55, ${0.012 + rng() * 0.034})`;
      ctx.lineWidth = 0.25 + rng() * 0.35;
      ctx.stroke();
    }
    ctx.restore();

    drawPaperRim(ctx, shape, seed ^ 0x3449f);
    drawTornFibers(ctx, shape, seed ^ 0x7f4a7c15);
  }

  function renderRule(canvas) {
    const fit = fitCanvas(canvas);
    if (!fit) return;
    const { ctx, w, h } = fit;
    const seed = +(canvas.dataset.ruleSeed || 1);
    ctx.beginPath();
    for (let x = 1; x < w; x += 1.5) {
      const y =
        h * 0.5 +
        noise1(x / 18, seed ^ 0x45d9f3b) * h * 0.16 +
        noise1(x / 4.5, seed ^ 0x119de1f3) * h * 0.08;
      if (x === 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(160, 4, 8, 0.86)";
    ctx.lineWidth = canvas.closest(".wide-rule") ? 2.2 : 0.82;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function makeInkBlot(w, h, seed) {
    const rng = random(seed ^ 0x3c6ef372);
    const phases = Array.from({ length: 6 }, () => rng() * Math.PI * 2);
    const count = Math.max(96, Math.round((w + h) / 3));
    const cx = w * (0.49 + (rng() - 0.5) * 0.025);
    const cy = h * (0.5 + (rng() - 0.5) * 0.04);
    const rx = w * 0.49;
    const ry = h * 0.43;
    const points = [];

    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const ellipseRadius = 1 / Math.sqrt((cos * cos) / (rx * rx) + (sin * sin) / (ry * ry));
      const contour =
        1 +
        0.075 * Math.sin(angle * 3 + phases[0]) +
        0.043 * Math.sin(angle * 7 + phases[1]) +
        0.025 * Math.sin(angle * 13 + phases[2]) +
        0.03 * Math.sin(angle * 29 + phases[3]) +
        0.022 * Math.sin(angle * 47 + phases[4]) +
        0.012 * Math.sin(angle * 83 + phases[5]);
      const radius = ellipseRadius * contour;
      const nx0 = cos / rx;
      const ny0 = sin / ry;
      const normalLength = Math.hypot(nx0, ny0) || 1;
      points.push({
        x: cx + cos * radius,
        y: cy + sin * radius,
        nx: nx0 / normalLength,
        ny: ny0 / normalLength,
      });
    }

    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
    path.closePath();
    return { path, sides: [points], all: points };
  }

  function drawInkWicks(ctx, shape, seed) {
    const rng = random(seed);
    ctx.save();
    ctx.lineCap = "round";
    shape.all.forEach((point, i) => {
      if (i % 2 || rng() > 0.34) return;
      const length = 1.5 + Math.pow(rng(), 2) * 10;
      const tangent = (rng() - 0.5) * length * 0.75;
      const midX = point.x + point.nx * length * 0.55 + point.ny * tangent * 0.4;
      const midY = point.y + point.ny * length * 0.55 - point.nx * tangent * 0.4;
      const endX = point.x + point.nx * length + point.ny * tangent;
      const endY = point.y + point.ny * length - point.nx * tangent;
      ctx.beginPath();
      ctx.moveTo(point.x - point.nx, point.y - point.ny);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.strokeStyle = `rgba(160, 4, 8, ${0.2 + rng() * 0.36})`;
      ctx.lineWidth = 0.3 + rng() * 0.75;
      ctx.stroke();
      if (length > 6 && rng() > 0.62) {
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(
          midX + point.nx * length * 0.35 - point.ny * tangent * 0.35,
          midY + point.ny * length * 0.35 + point.nx * tangent * 0.35,
        );
        ctx.strokeStyle = "rgba(160, 4, 8, 0.12)";
        ctx.lineWidth = 0.35;
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  function drawInkEdgeBloom(ctx, shape, seed) {
    const rng = random(seed);
    ctx.save();
    shape.all.forEach((point, i) => {
      if (i % 3 || rng() > 0.32) return;
      const radius = 0.5 + rng() * 2.2;
      const offset = (rng() - 0.35) * 2.6;
      ctx.beginPath();
      ctx.arc(
        point.x + point.nx * offset,
        point.y + point.ny * offset,
        radius,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = `rgba(160, 4, 8, ${0.05 + rng() * 0.13})`;
      ctx.fill();
    });
    ctx.restore();
  }

  function drawBrokenRim(ctx, shape, seed) {
    shape.sides.forEach((side, sideIndex) => {
      let drawing = false;
      ctx.beginPath();
      side.forEach((point, i) => {
        const signal = noise1(i / 6.5, seed ^ Math.imul(sideIndex + 1, 0x45d9f3b));
        if (signal > -0.08) {
          if (!drawing) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
          drawing = true;
        } else {
          drawing = false;
        }
      });
      ctx.strokeStyle = "rgba(87, 0, 4, 0.24)";
      ctx.lineWidth = 0.85;
      ctx.lineCap = "round";
      ctx.stroke();
    });
  }

  function renderInk(canvas) {
    const fit = fitCanvas(canvas);
    if (!fit) return;
    const { ctx, w, h, dpr } = fit;
    const seed = +(canvas.dataset.inkSeed || 1);
    const torn = canvas.dataset.inkShape === "torn";
    const edgeStyle = canvas.parentElement.dataset.edgeStyle || "fracture";
    const hasMask = !torn && inkMask.complete && inkMask.naturalWidth;
    const shape = torn
      ? edgeStyle === "separator"
        ? makeDesktopTearShape(w, h, seed)
        : makeRoughShape(w, h, seed, 3, 3.4, 2, 1)
      : hasMask
        ? null
        : makeInkBlot(w, h, seed);

    if (shape) {
      ctx.save();
      ctx.filter = torn ? "blur(0.35px)" : "blur(2.1px)";
      ctx.fillStyle = "rgba(160, 4, 8, 0.3)";
      ctx.fill(shape.path);
      ctx.restore();
    } else {
      const halo = document.createElement("canvas");
      halo.width = canvas.width;
      halo.height = canvas.height;
      const hctx = halo.getContext("2d");
      hctx.fillStyle = "rgba(160, 4, 8, 0.34)";
      hctx.fillRect(0, 0, halo.width, halo.height);
      hctx.globalCompositeOperation = "destination-in";
      hctx.drawImage(inkMask, 0, 0, halo.width, halo.height);
      ctx.save();
      ctx.filter = "blur(1.15px)";
      ctx.drawImage(halo, 0, 0, w, h);
      ctx.restore();
    }

    const texture = document.createElement("canvas");
    texture.width = canvas.width;
    texture.height = canvas.height;
    const tctx = texture.getContext("2d");
    const image = tctx.createImageData(texture.width, texture.height);
    for (let py = 0; py < texture.height; py += 1) {
      for (let px = 0; px < texture.width; px += 1) {
        const x = px / dpr;
        const y = py / dpr;
        const broad = fbm2(x / 41, y / 12, seed ^ 0x9e3779b9);
        const fiber = fbm2(x / 8, y / 2.2, seed ^ 0x85ebca6b);
        const grain = hash(px ^ Math.imul(py, 374761393) ^ seed) * 2 - 1;
        const alpha = Math.max(
          135,
          Math.min(238, 194 + broad * 38 + fiber * 17 + grain * 5),
        );
        const i = (py * texture.width + px) * 4;
        image.data[i] = 160;
        image.data[i + 1] = 4;
        image.data[i + 2] = 8;
        image.data[i + 3] = alpha;
      }
    }
    tctx.putImageData(image, 0, 0);
    tctx.globalCompositeOperation = "destination-in";
    if (hasMask) {
      tctx.drawImage(inkMask, 0, 0, texture.width, texture.height);
    } else {
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tctx.fill(shape.path);
    }
    ctx.drawImage(texture, 0, 0, w, h);

    if (torn) {
      drawInkEdgeBloom(ctx, shape, seed ^ 0x51f15e);
      drawBrokenRim(ctx, shape, seed ^ 0xc2b2ae35);
    }
  }

  function renderAll() {
    paperCanvases.forEach(renderPaper);
    inkCanvases.forEach(renderInk);
    ruleCanvases.forEach(renderRule);
  }

  let frame = 0;
  function scheduleRender() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(renderAll);
  }

  const resizeObserver = new ResizeObserver(scheduleRender);
  paperCanvases.concat(inkCanvases, ruleCanvases).forEach((canvas) => {
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
  });
  new MutationObserver(scheduleRender).observe(root, {
    attributes: true,
    attributeFilter: ["data-break"],
  });
  window.addEventListener("resize", scheduleRender, { passive: true });
  window.addEventListener("bday-paper-signal", scheduleRender);
  scheduleRender();
})();
