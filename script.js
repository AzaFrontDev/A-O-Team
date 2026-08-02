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

  onScroll();
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

      const fields = ["name", "contact", "message"].map((id) => document.getElementById(id));
      let valid = true;

      fields.forEach((field) => {
        const empty = field.value.trim() === "";
        field.classList.toggle("is-invalid", empty);
        if (empty) valid = false;
      });

      if (!valid) {
        showStatus("Пожалуйста, заполните все поля.", true);
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent || "Отправить";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка...";
      }

      const name = document.getElementById("name")?.value.trim();
      const contact = document.getElementById("contact")?.value.trim();
      const message = document.getElementById("message")?.value.trim();

      const payload = {
        name,
        contact,
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
          throw new Error(data.error || "Telegram API error");
        }

        showStatus("✓ Заявка отправлена — свяжемся с вами в ближайшее время.");
        form.reset();

        window.setTimeout(() => {
          showStatus("");
        }, 6000);
      } catch (error) {
        console.error(error);
        showStatus("❌ Ошибка отправки. Напишите нам напрямую в Telegram.", true);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });

    form.querySelectorAll(".input").forEach((input) => {
      input.addEventListener("input", () => input.classList.remove("is-invalid"));
    });
  }

  /* ---------- 5. Footer year ---------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
