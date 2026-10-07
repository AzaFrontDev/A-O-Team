/* ============================================
   A&O Team — Portfolio & Before/After Slider
   Интерактивный сплит-слайдер «До / После»
   с поддержкой мыши, тача и доступности (A11y)
   ============================================ */
(function () {
  "use strict";

  const initBeforeAfterSliders = () => {
    const sliders = document.querySelectorAll("[data-ba-slider]");

    sliders.forEach((slider) => {
      const handle = slider.querySelector(".ba-slider__handle");
      const card = slider.closest(".portfolio-card") || slider;
      const hint = slider.querySelector(".ba-slider__hint");

      if (!handle) return;

      let isDragging = false;
      let currentPos = 50; // Начальная позиция 50%

      const setPosition = (pos) => {
        // Ограничиваем от 2% до 98% для эстетичного вида ручки
        const clamped = Math.max(2, Math.min(98, Math.round(pos * 10) / 10));
        currentPos = clamped;
        slider.style.setProperty("--ba-pos", `${clamped}%`);
        handle.setAttribute("aria-valuenow", String(Math.round(clamped)));
      };

      const calculatePosFromEvent = (e) => {
        const rect = slider.getBoundingClientRect();
        if (rect.width <= 0) return 50;
        const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
        if (clientX === undefined) return currentPos;
        const rawPct = ((clientX - rect.left) / rect.width) * 100;
        return rawPct;
      };

      const startDrag = (e) => {
        // Игнорируем если клик не левой кнопкой мыши
        if (e.pointerType === "mouse" && e.button !== 0) return;

        isDragging = true;
        slider.classList.add("is-dragging");
        card.classList.add("is-dragging");

        if (hint) {
          hint.classList.add("is-hidden");
        }

        try {
          slider.setPointerCapture(e.pointerId);
        } catch (_) {}

        setPosition(calculatePosFromEvent(e));
        e.preventDefault();
      };

      const moveDrag = (e) => {
        if (!isDragging) return;
        setPosition(calculatePosFromEvent(e));
      };

      const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        slider.classList.remove("is-dragging");
        card.classList.remove("is-dragging");

        try {
          if (slider.hasPointerCapture(e.pointerId)) {
            slider.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}
      };

      slider.addEventListener("pointerdown", startDrag);
      slider.addEventListener("pointermove", moveDrag);
      slider.addEventListener("pointerup", stopDrag);
      slider.addEventListener("pointercancel", stopDrag);

      // Доступность: управление клавишами со стрелками
      handle.addEventListener("keydown", (e) => {
        let step = 5;
        if (e.shiftKey) step = 10;

        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          setPosition(currentPos - step);
          if (hint) hint.classList.add("is-hidden");
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          setPosition(currentPos + step);
          if (hint) hint.classList.add("is-hidden");
        } else if (e.key === "Home") {
          e.preventDefault();
          setPosition(0);
          if (hint) hint.classList.add("is-hidden");
        } else if (e.key === "End") {
          e.preventDefault();
          setPosition(100);
          if (hint) hint.classList.add("is-hidden");
        }
      });

      // Инициализируем стартовое значение
      setPosition(50);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBeforeAfterSliders);
  } else {
    initBeforeAfterSliders();
  }
})();
