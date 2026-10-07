/* ============================================
   A&O Team — Spotlight Border & Ambient Glow
   Эффект радиальной подсветки рамок (Linear/Vercel style)
   и плавающего мягкого ореола за курсором
   ============================================ */
(function () {
  "use strict";

  // Отключаем на тач-устройствах и при prefers-reduced-motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const glow = document.querySelector(".spotlight-glow");

  // Плавное следование фонового ореола через GSAP (или прямой transform)
  let moveGlow = null;
  if (glow) {
    if (window.gsap) {
      const xTo = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" });
      moveGlow = (x, y) => {
        xTo(x);
        yTo(y);
        if (glow.style.opacity !== "1") glow.style.opacity = "1";
      };
    } else {
      moveGlow = (x, y) => {
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (glow.style.opacity !== "1") glow.style.opacity = "1";
      };
    }

    document.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });
  }

  // Делегированный обработчик mousemove:
  // 1. Управляет координатами --mouse-x/y внутри .card и .portfolio__item
  // 2. Двигает фоновый ambient spotlight
  window.addEventListener(
    "mousemove",
    (e) => {
      // Движение фонового света
      if (moveGlow) {
        moveGlow(e.clientX, e.clientY);
      }

      // Точечные координаты для радиальной рамки карточки
      const card = e.target.closest(".card, .portfolio__item");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      }
    },
    { passive: true }
  );
})();
