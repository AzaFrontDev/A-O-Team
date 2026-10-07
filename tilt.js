/* ============================================
   A&O Team — 3D Tilt (GSAP)
   Элементы с атрибутом [data-tilt] плавно наклоняются
   в сторону курсора и слегка приподнимаются.
   ============================================ */
(function () {
  "use strict";
  if (!window.gsap) return;

  // Только для устройств с мышью и без reduced-motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const MAX_ANGLE = 8; // максимальный наклон, градусов
  const LIFT = -6; // подъём при наведении (как у .card--hover)

  document.querySelectorAll("[data-tilt]").forEach((el) => {
    let ready = false;
    let rx, ry, ty;

    const maxAngle = Number(el.dataset.tiltMax) || MAX_ANGLE;
    const lift = el.dataset.tiltLift !== undefined ? Number(el.dataset.tiltLift) : LIFT;

    // Инициализация при первом наведении, когда reveal-анимация уже отработала
    const init = () => {
      if (ready) return;
      ready = true;

      // CSS-переход transform конфликтует с GSAP — отключаем его для этого элемента
      el.classList.add("is-tilt");
      el.style.transitionDelay = "0ms";

      gsap.set(el, { transformPerspective: 1000, transformOrigin: "50% 50%" });
      const opts = { duration: 0.5, ease: "power3.out" };
      rx = gsap.quickTo(el, "rotationX", opts);
      ry = gsap.quickTo(el, "rotationY", opts);
      ty = gsap.quickTo(el, "y", opts);
    };

    el.addEventListener("pointerenter", () => {
      init();
      if (!el.classList.contains("is-dragging")) {
        ty(lift);
      }
    });

    el.addEventListener(
      "pointermove",
      (e) => {
        if (!ready) return;
        if (el.classList.contains("is-dragging")) {
          rx(0);
          ry(0);
          return;
        }
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5…0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        ry(px * 2 * maxAngle);
        rx(-py * 2 * maxAngle);
      },
      { passive: true }
    );

    el.addEventListener("pointerleave", () => {
      if (!ready) return;
      rx(0);
      ry(0);
      ty(0);
    });
  });
})();
