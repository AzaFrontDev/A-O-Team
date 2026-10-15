/* ============================================
   A&O Team — vanilla JS (ES6+)
   ============================================ */
(function () {
  "use strict";

  /* ---------- 1. Dynamic Island header & Sliding indicator (Scrollspy) ---------- */
  const header = document.getElementById("header");
  const nav = document.querySelector(".header .nav");
  const indicator = document.getElementById("nav-indicator");
  const navLinks = Array.from(document.querySelectorAll(".header .nav__link"));
  const mobileLinks = Array.from(document.querySelectorAll(".mobile-menu__link"));

  // Связываем каждый пункт меню с его секцией
  const sectionMap = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      const section = document.querySelector(href);
      if (section) sectionMap.set(link, section);
    }
  });

  let activeLink = null;
  let isNavClicking = false;
  let clickTimer = null;
  let scrollTicking = false;

  // Плавное перемещение подложки к указанному элементу
  const moveToLink = (link, animate = true) => {
    if (!indicator || !nav) return;
    if (!link) {
      indicator.classList.remove("is-visible");
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    if (linkRect.width === 0 && linkRect.height === 0) {
      indicator.classList.remove("is-visible");
      return;
    }

    const left = linkRect.left - navRect.left;
    const top = linkRect.top - navRect.top;
    const width = linkRect.width;
    const height = linkRect.height;

    if (!animate) {
      indicator.style.transition = "none";
    }

    indicator.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
    indicator.style.width = `${Math.round(width)}px`;
    indicator.style.height = `${Math.round(height)}px`;
    indicator.classList.add("is-visible");

    if (!animate) {
      indicator.offsetHeight; // Принудительный reflow
      indicator.style.transition = "";
    }
  };

  // Установка активной секции / ссылки
  const setActiveLink = (link, animate = true) => {
    if (activeLink === link) return;
    activeLink = link;

    navLinks.forEach((l) => {
      const isCurrent = l === link;
      l.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        l.setAttribute("aria-current", "page");
      } else {
        l.removeAttribute("aria-current");
      }
    });

    if (link) {
      const href = link.getAttribute("href");
      mobileLinks.forEach((m) => {
        m.classList.toggle("is-active", m.getAttribute("href") === href);
      });
    } else {
      mobileLinks.forEach((m) => m.classList.remove("is-active"));
    }

    moveToLink(link, animate);
  };

  // Определение активной секции при скролле (Scrollspy)
  const updateActiveSectionOnScroll = () => {
    if (isNavClicking) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // 1. Доскроллили до самого низа страницы -> активна последняя секция (Контакты)
    if (scrollY + viewportHeight >= docHeight - 45) {
      const lastLink = navLinks[navLinks.length - 1];
      setActiveLink(lastLink, true);
      return;
    }

    // 2. В самом верху страницы (Hero) -> подложка плавно скрывается
    const firstLink = navLinks[0];
    const firstSec = sectionMap.get(firstLink);
    if (firstSec) {
      const firstRect = firstSec.getBoundingClientRect();
      if (firstRect.top > 160) {
        setActiveLink(null, true);
        return;
      }
    }

    // 3. Линия фокуса чтения
    const focusLine = scrollY + 160;
    let foundLink = null;

    for (let i = navLinks.length - 1; i >= 0; i--) {
      const link = navLinks[i];
      const sec = sectionMap.get(link);
      if (!sec) continue;

      const secTop = sec.getBoundingClientRect().top + scrollY;
      if (secTop <= focusLine) {
        foundLink = link;
        break;
      }
    }

    setActiveLink(foundLink, true);
  };

  const onScroll = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateActiveSectionOnScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  };

  // Клик по навигационным ссылкам
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveLink(link, true);
      isNavClicking = true;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        isNavClicking = false;
        updateActiveSectionOnScroll();
      }, 850);
    });

    // Hover-эффект следования подложки
    link.addEventListener("mouseenter", () => {
      if (window.innerWidth >= 1024) {
        moveToLink(link, true);
      }
    });
  });

  if (nav) {
    nav.addEventListener("mouseleave", () => {
      if (window.innerWidth >= 1024) {
        if (activeLink) {
          moveToLink(activeLink, true);
        } else {
          indicator?.classList.remove("is-visible");
        }
      }
    });
  }

  // Клик по кнопке "Обсудить проект" -> ведет на #contacts
  const headerCta = document.querySelector(".header__cta");
  if (headerCta) {
    headerCta.addEventListener("click", () => {
      const contactsLink = navLinks.find((l) => l.getAttribute("href") === "#contacts");
      if (contactsLink) {
        setActiveLink(contactsLink, true);
        isNavClicking = true;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
          isNavClicking = false;
          updateActiveSectionOnScroll();
        }, 850);
      }
    });
  }

  // Клик по логотипу -> Hero
  const logoLink = document.querySelector(".header .logo");
  if (logoLink) {
    logoLink.addEventListener("click", () => {
      setActiveLink(null, true);
      isNavClicking = true;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        isNavClicking = false;
        updateActiveSectionOnScroll();
      }, 850);
    });
  }

  // Пересчет позиции при ресайзе
  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth >= 1024) {
        if (activeLink) {
          moveToLink(activeLink, false);
        } else {
          indicator?.classList.remove("is-visible");
        }
      } else {
        indicator?.classList.remove("is-visible");
      }
    },
    { passive: true }
  );

  // Когда шрифты загружены, уточняем ширину ссылок
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (window.innerWidth >= 1024 && activeLink) {
        moveToLink(activeLink, false);
      }
    });
  }

  // Deep linking (если открыли сразу с #hash)
  if (window.location.hash) {
    const hashLink = navLinks.find((l) => l.getAttribute("href") === window.location.hash);
    if (hashLink) {
      setTimeout(() => setActiveLink(hashLink, false), 150);
    }
  }

  // Первоначальный расчет
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

  /* ---------- 4. Contact form & input mask ---------- */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const contactInput = document.getElementById("whatsapp");

  const showStatus = (message, isError = false) => {
    if (!status) return;
    status.classList.toggle("is-error", isError);
    status.textContent = message;
  };

  const formatContactInput = (val, isDelete = false) => {
    if (!val) return "";
    val = val.trimStart();
    if (!val) return "";

    const isPhone = /^[\d\+]/.test(val);

    if (isPhone) {
      let digits = val.replace(/\D/g, "");
      if (!digits.length) {
        return isDelete ? "" : "+7 (";
      }

      // Если ввод начат с 7 или 8, отсекаем первую цифру как код страны
      if (digits[0] === "7" || digits[0] === "8") {
        digits = digits.slice(1);
      }

      // Строго максимум 10 цифр абонентского номера
      digits = digits.slice(0, 10);

      if (!digits.length) {
        return isDelete ? "" : "+7 (";
      }

      let res = "+7 (";
      if (digits.length > 0) res += digits.slice(0, 3);
      if (digits.length > 3) res += ") " + digits.slice(3, 6);
      if (digits.length > 6) res += " " + digits.slice(6, 8);
      if (digits.length > 8) res += "-" + digits.slice(8, 10);
      return res;
    } else {
      // Режим Telegram
      let clean = val.replace(/^https?:\/\/t\.me\//i, "").replace(/^t\.me\//i, "");
      if (clean.startsWith("@")) clean = clean.slice(1);
      clean = clean.replace(/\s+/g, "").slice(0, 32);

      if (!clean.length) {
        return isDelete ? "" : "@";
      }
      return "@" + clean;
    }
  };

  const isValidContact = (val) => {
    if (!val) return false;
    const trimmed = val.trim();
    // Телефон РФ: +7 (XXX) XXX XX-XX (строго 10 цифр)
    const phoneRegex = /^\+7 \(\d{3}\) \d{3} \d{2}-\d{2}$/;
    if (phoneRegex.test(trimmed)) return true;

    // Telegram: @ + минимум 4 символа (латиница, цифры, _)
    const tgRegex = /^@[a-zA-Z0-9_]{4,32}$/;
    if (tgRegex.test(trimmed)) return true;

    return false;
  };

  if (contactInput) {
    contactInput.addEventListener("keydown", (e) => {
      // Если при Backspace остались только символы маски, очищаем всё поле
      if (e.key === "Backspace") {
        const v = contactInput.value;
        if (v === "@" || v === "+7" || v === "+7 (" || v === "+") {
          e.preventDefault();
          contactInput.value = "";
          contactInput.classList.remove("is-invalid");
        }
      }
    });

    contactInput.addEventListener("input", (e) => {
      contactInput.classList.remove("is-invalid");
      const isDelete = e.inputType && e.inputType.startsWith("delete");
      const cur = contactInput.value;
      if (!cur) return;
      contactInput.value = formatContactInput(cur, isDelete);
    });

    contactInput.addEventListener("blur", () => {
      const v = contactInput.value.trim();
      if (v === "@" || v === "+7" || v === "+7 (" || v === "+") {
        contactInput.value = "";
      } else if (v && !isValidContact(v)) {
        contactInput.classList.add("is-invalid");
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let valid = true;

      // 1. Проверяем обязательные текстовые поля
      const nameField = document.getElementById("name");
      const whatsappField = document.getElementById("whatsapp");
      const messageField = document.getElementById("message");

      const isNameEmpty = !nameField || !nameField.value.trim();
      if (nameField) nameField.classList.toggle("is-invalid", isNameEmpty);

      const isMessageEmpty = !messageField || !messageField.value.trim();
      if (messageField) messageField.classList.toggle("is-invalid", isMessageEmpty);

      const contactVal = whatsappField?.value.trim() || "";
      const isContactValid = isValidContact(contactVal);
      if (whatsappField) whatsappField.classList.toggle("is-invalid", !isContactValid);

      // 2. Проверяем выбор услуги (радиокнопки)
      const serviceRadio = document.querySelector('input[name="service"]:checked');
      const serviceValue = serviceRadio ? serviceRadio.value : null;

      if (isNameEmpty || isMessageEmpty || !isContactValid || !serviceValue) {
        valid = false;
      }

      if (!valid) {
        if (whatsappField && !isContactValid && !isNameEmpty && !isMessageEmpty && serviceValue) {
          showStatus("Укажите корректный Telegram (@username) или номер РФ (+7 (123) 456 78-90).", true);
        } else {
          showStatus("Пожалуйста, заполните все обязательные поля и выберите услугу.", true);
        }
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent || "Отправить";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка...";
      }

      // 3. Собираем данные
      const name = nameField?.value.trim();
      const whatsapp = contactVal;
      const email = document.getElementById("email")?.value.trim() || "Не указан";
      const message = messageField?.value.trim();

      const payload = {
        name,
        whatsapp,
        email,
        service: serviceValue,
        message,
      };

      try {
        // Vercel Serverless Function (same-origin, моментальный ответ без cold-start Render)
        const apiUrl = window.location.protocol === "file:"
          ? "https://a-o-team.vercel.app/api/contact"
          : "/api/contact";

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "API error");
        }

        showStatus("✓ Заявка отправлена — свяжемся с вами в ближайшее время.");
        form.reset();

        window.setTimeout(() => {
          showStatus("");
        }, 6000);
      } catch (error) {
        console.error(error);
        showStatus("❌ Ошибка отправки. Напишите нам напрямую в Telegram: @ao_team_official", true);
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

  /* ---------- 5. Footer year ---------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 6. Quick copy to clipboard with toast ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  const showToast = (text) => {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2800);
  };

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      // Если это ссылка, но юзер кликнул по иконке копирования
      const textToCopy = btn.dataset.copy;
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`✓ Скопировано: ${textToCopy}`);
      } catch (err) {
        showToast(`Контакт: ${textToCopy}`);
      }
    });
  });
})();
