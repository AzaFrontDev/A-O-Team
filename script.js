/* ============================================
   A&O Team — vanilla JS (ES6+)
   ============================================ */
(function () {
  "use strict";

/* ---------- 1. Fixed header background on scroll ---------- */
const header = document.getElementById("header");

const onScroll = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

// Не вызывай синхронно прямо при старте! Дай браузеру сначала нарисовать DOM.
requestAnimationFrame(onScroll);

window.addEventListener("scroll", onScroll, { passive: true });
  /* ---------- 2. Mobile burger menu ---------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobile-menu");

  const setMenu = (open) => {
    mobileMenu.hidden = !open;
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger.addEventListener("click", () => setMenu(mobileMenu.hidden));

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mobileMenu.hidden) {
      setMenu(false);
      burger.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && !mobileMenu.hidden) setMenu(false);
  });

  /* ---------- 3. Scroll reveal micro-animations ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = `${Math.min(i * 80, 320)}ms`;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

/* ---------- 4. Contact form ---------- */
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

const showStatus = (message, isError = false) => {
  status.classList.toggle("is-error", isError);
  status.textContent = message;
};

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let valid = true;

    // 1. Проверяем обязательные текстовые поля (заменили contact на whatsapp)
    const requiredFields = ["name", "whatsapp", "message"].map((id) => document.getElementById(id));
    requiredFields.forEach((field) => {
      const empty = !field || !field.value || field.value.trim() === "";
      if (field) field.classList.toggle("is-invalid", empty);
      if (empty) valid = false;
    });

    // 2. Проверяем выбор услуги (радиокнопки)
    const serviceRadio = document.querySelector('input[name="service"]:checked');
    const serviceValue = serviceRadio ? serviceRadio.value : null;

    if (!serviceValue) {
      valid = false;
    }

    if (!valid) {
      showStatus("Пожалуйста, заполните все обязательные поля и выберите услугу.", true);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || "Отправить";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Отправка...";
    }

    // 3. Собираем данные
    const name = document.getElementById("name")?.value.trim();
    const whatsapp = document.getElementById("whatsapp")?.value.trim();
    // Email не обязательный, если пустой — ставим заглушку
    const email = document.getElementById("email")?.value.trim() || "Не указан";
    const message = document.getElementById("message")?.value.trim();

    const payload = {
      name,
      whatsapp,
      email,
      service: serviceValue,
      message,
    };

    try {
      const apiUrl = window.location.hostname === "localhost"
        ? "/api/contact"
        : "https://a-o-team.onrender.com/api/contact";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "API error");
      }

      showStatus("✓ Заявка отправлена — свяжемся с вами в течение 24 часов.");
      form.reset();

      window.setTimeout(() => {
        showStatus("");
      }, 6000);
    } catch (error) {
      console.error(error);
      showStatus("❌ Ошибка отправки. Напишите нам напрямую в WhatsApp.", true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });

  // Сброс красных рамок при вводе
  form.querySelectorAll(".input, input[type='radio']").forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("is-invalid"));
    input.addEventListener("change", () => input.classList.remove("is-invalid"));
  });
}

 /* ---------- 4. Portfolio Slider ---------- */
 document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('portfolioSlider');
  const track = document.getElementById('portfolioTrack');

  // Автоматически клонируем карточки, чтобы заполнить ширину
  const items = Array.from(track.children);
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let currentX = 0;
  let isDown = false;
  let startX = 0;
  let prevX = 0;
  let isHovered = false;
  const speed = 0.6; // Скорость автопрокрутки

  // Расчет точки сброса (ширина оригинальной половины ленты)
  function getResetWidth() {
    return track.scrollWidth / 2;
  }

  function animate() {
    if (!isHovered && !isDown) {
      currentX -= speed;

      // Бесшовный сброс
      const resetWidth = getResetWidth();
      if (Math.abs(currentX) >= resetWidth) {
        currentX = 0;
      }

      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Пауза при наведении
  slider.addEventListener('mouseenter', () => isHovered = true);
  slider.addEventListener('mouseleave', () => {
    isHovered = false;
    isDown = false;
  });

  // Drag мышью
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX;
    prevX = currentX;
  });

  window.addEventListener('mouseup', () => isDown = false);

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const diff = e.pageX - startX;
    currentX = prevX + diff;

    const resetWidth = getResetWidth();
    if (currentX > 0) {
      currentX = -resetWidth;
      prevX = currentX - diff;
    } else if (Math.abs(currentX) >= resetWidth) {
      currentX = 0;
      prevX = currentX - diff;
    }

    track.style.transform = `translate3d(${currentX}px, 0, 0)`;
  });

  // Свайп на мобилках (Touch)
  slider.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX;
    prevX = currentX;
  }, { passive: true });

  window.addEventListener('touchend', () => isDown = false);

  window.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const diff = e.touches[0].pageX - startX;
    currentX = prevX + diff;

    const resetWidth = getResetWidth();
    if (currentX > 0) {
      currentX = -resetWidth;
      prevX = currentX - diff;
    } else if (Math.abs(currentX) >= resetWidth) {
      currentX = 0;
      prevX = currentX - diff;
    }

    track.style.transform = `translate3d(${currentX}px, 0, 0)`;
  }, { passive: true });
});

  /* ---------- 5. Footer year ---------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
