/* ============================================
   A&O Team — клик по услуге → форма заявки
   Ссылка .service__cta (data-service) прокручивает к форме,
   выбирает нужную радиокнопку и подсвечивает её.
   ============================================ */
(function () {
  "use strict";

  const links = document.querySelectorAll("[data-service]");
  const target = document.getElementById("contacts");
  if (!links.length || !target) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  // Фокус в поле имени — когда прокрутка закончилась (на тач-устройствах не трогаем,
  // чтобы не выезжала клавиатура)
  const focusWhenSettled = (el) => {
    if (!el || coarse) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      el.focus({ preventScroll: true });
    };
    if ("onscrollend" in window) window.addEventListener("scrollend", go, { once: true });
    window.setTimeout(go, 900);
  };

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const value = link.dataset.service;
      const radio = Array.from(
        document.querySelectorAll('input[name="service"]')
      ).find((input) => input.value === value);

      if (radio) {
        radio.checked = true;
        // script.js слушает change, чтобы снять красную подсветку ошибки
        radio.dispatchEvent(new Event("change", { bubbles: true }));

        const card = radio.closest(".form__service-card");
        if (card) {
          card.classList.remove("is-picked");
          void card.offsetWidth; // перезапуск анимации
          card.classList.add("is-picked");
          card.addEventListener("animationend", () => card.classList.remove("is-picked"), {
            once: true,
          });
        }
      }

      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      focusWhenSettled(document.getElementById("name"));
    });
  });
})();
