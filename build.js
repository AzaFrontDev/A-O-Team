/* ============================================
   A&O Team — «Run build» в окне ao-team.config.js
   По клику в нижней части окна выезжает лог «сборки»,
   строки печатаются по очереди, в конце — итог.
   ============================================ */
(function () {
  "use strict";

  const btn = document.getElementById("run-build");
  const log = document.getElementById("build-log");
  if (!btn || !log) return;

  const label = btn.querySelector(".window__run-label");
  const icon = btn.querySelector(".window__run-icon");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // text — содержимое строки, wait — пауза (мс) перед её появлением
  const STEPS = [
    { cls: "cmd", text: "$ ao-team build", wait: 0 },
    { cls: "", text: "› compiling components…", wait: 450 },
    { cls: "", text: "› optimizing images → webp", wait: 420 },
    { cls: "", text: "› minifying css & js", wait: 380 },
    { cls: "ok", text: "✓ 0 dependencies · 100% responsive", wait: 360 },
    { cls: "done", text: "✓ Build succeeded in 28ms · Lighthouse 98", wait: 440 },
  ];
  const AUTO_CLOSE_MS = 6000;

  let timers = [];
  const later = (fn, ms) => timers.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.forEach(window.clearTimeout);
    timers = [];
  };

  const setIdle = (text) => {
    btn.disabled = false;
    btn.classList.remove("is-running");
    btn.removeAttribute("aria-busy");
    icon.textContent = "▶";
    label.textContent = text;
  };

  const closeLog = () => {
    clearTimers();
    log.classList.remove("is-open");
    setIdle("Run build");
  };

  const addLine = ({ cls, text }) => {
    const line = document.createElement("div");
    line.className = "build-log__line" + (cls ? ` build-log__line--${cls}` : "");
    line.textContent = text;
    log.appendChild(line);
    requestAnimationFrame(() => line.classList.add("is-in"));
  };

  const run = () => {
    clearTimers();
    log.replaceChildren();
    log.classList.add("is-open");

    btn.disabled = true;
    btn.classList.add("is-running");
    btn.setAttribute("aria-busy", "true");
    icon.textContent = "◌";
    label.textContent = "Building…";

    let t = 0;
    STEPS.forEach((step, i) => {
      t += reduce ? 0 : step.wait;
      later(() => {
        addLine(step);
        if (i === STEPS.length - 1) {
          setIdle("Run again");
          later(closeLog, AUTO_CLOSE_MS);
        }
      }, t);
    });
  };

  btn.addEventListener("click", run);
  // Клик по логу или Escape — убрать панель
  log.addEventListener("click", () => {
    if (!btn.disabled) closeLog();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && log.classList.contains("is-open") && !btn.disabled) {
      closeLog();
    }
  });
})();
