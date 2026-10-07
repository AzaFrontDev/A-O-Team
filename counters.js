/* ============================================
   A&O Team — анимированные метрики Hero (GSAP)
   [data-counter]  — числовой счётчик 0 → N (+ data-suffix)
   [data-scramble] — текстовый «дешифратор»
   ============================================ */
(function () {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Уважаем prefers-reduced-motion: оставляем финальные значения из HTML
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const stats = document.querySelector(".stats");
  if (!stats) return;

  const counters = gsap.utils.toArray("[data-counter]", stats);
  const scrambles = gsap.utils.toArray("[data-scramble]", stats);
  const GLYPHS = "#%01X$@&<>/";

  // Подсветка в момент, когда значение «встало» на место
  const finish = (el) => {
    el.classList.add("is-done");
    gsap.delayedCall(0.8, () => el.classList.remove("is-done"));
  };

  // Стартовое состояние (блок ещё скрыт через .reveal, мигания не будет)
  counters.forEach((el) => {
    el.textContent = "0" + (el.dataset.suffix || "");
  });
  scrambles.forEach((el) => {
    el.textContent = el.dataset.scramble.replace(/./g, () => randomGlyph());
  });

  function randomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  function play() {
    const tl = gsap.timeline({ delay: 0.4 });

    // Числовые счётчики
    counters.forEach((el, i) => {
      const target = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.suffix || "";
      const state = { val: 0 };

      tl.to(
        state,
        {
          val: target,
          duration: 1.8,
          ease: "expo.out",
          onUpdate: () => {
            el.textContent = Math.round(state.val) + suffix;
          },
          onComplete: () => {
            el.textContent = target + suffix;
            finish(el);
          },
        },
        i * 0.15
      );
    });

    // Текстовый дешифратор: буквы «собираются» слева направо
    scrambles.forEach((el) => {
      const finalText = el.dataset.scramble;
      const state = { p: 0 };

      tl.to(
        state,
        {
          p: 1,
          duration: 1.4,
          ease: "power2.inOut",
          onUpdate: () => {
            const resolved = Math.floor(state.p * finalText.length);
            el.textContent = finalText
              .split("")
              .map((ch, idx) => (idx < resolved ? ch : randomGlyph()))
              .join("");
          },
          onComplete: () => {
            el.textContent = finalText;
            finish(el);
          },
        },
        0.15
      );
    });
  }

  // Запуск один раз при появлении блока в зоне видимости
  ScrollTrigger.create({
    trigger: stats,
    start: "top 90%",
    once: true,
    onEnter: play,
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
