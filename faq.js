/* ============================================
   A&O Team — FAQ Accordion (Linear Style)
   Доступный аккордеон с плавной микро-анимацией,
   поддержкой клавиатуры (WAI-ARIA) и фокусом.
   ============================================ */
(function () {
  "use strict";

  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector(".faq-item__trigger");
    const panel = item.querySelector(".faq-item__panel");

    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Если хотим режим одиночного открытия (закрывать остальные):
      items.forEach((other) => {
        if (other !== item && other.classList.contains("is-open")) {
          other.classList.remove("is-open");
          const otherTrigger = other.querySelector(".faq-item__trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });

      // Переключаем текущий
      item.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });
})();
