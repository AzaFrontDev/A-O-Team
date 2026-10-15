/* ============================================
   A&O Team — Интерактивный калькулятор стоимости & сметы
   Динамический расчет вилки цен, сроков и перенос
   структурированного ТЗ в форму заявки.
   ============================================ */
(function () {
  "use strict";

  const calcSection = document.getElementById("calculator");
  if (!calcSection) return;

  const priceValEl = document.getElementById("calc-price-display");
  const daysValEl = document.getElementById("calc-days-display");
  const applyBtn = document.getElementById("calc-apply-btn");

  const TYPES = {
    landing: {
      title: "Конверсионный лендинг",
      serviceRadio: "Конверсионный лендинг",
      min: 35000,
      max: 45000,
      daysMin: 5,
      daysMax: 8,
    },
    redesign: {
      title: "Комплексный редизайн",
      serviceRadio: "Комплексный редизайн",
      min: 45000,
      max: 60000,
      daysMin: 7,
      daysMax: 14,
    },
    multipage: {
      title: "Многостраничная платформа",
      serviceRadio: "Многостраничные платформы",
      min: 70000,
      max: 95000,
      daysMin: 14,
      daysMax: 25,
    },
    ecommerce: {
      title: "E-Commerce & Сервис",
      serviceRadio: "E-Commerce & Web-сервисы",
      min: 90000,
      max: 130000,
      daysMin: 20,
      daysMax: 35,
    },
    fix: {
      title: "Доработка чужого сайта / баги",
      serviceRadio: "Доработка & Рефакторинг",
      min: 15000,
      max: 25000,
      daysMin: 1,
      daysMax: 3,
    },
  };

  const DESIGNS = {
    "has-design": {
      title: "Есть готовый макет в Figma",
      min: 0,
      max: 0,
      daysMin: 0,
      daysMax: 0,
    },
    "need-design": {
      title: "Нужен индивидуальный дизайн в Figma с нуля",
      min: 18000,
      max: 28000,
      daysMin: 3,
      daysMax: 6,
    },
    "need-rework": {
      title: "Только референсы / доработка имеющегося стиля",
      min: 10000,
      max: 15000,
      daysMin: 2,
      daysMax: 3,
    },
  };

  const FEATURES = {
    "feat-tg": {
      title: "Telegram-бот заявок & уведомлений",
      min: 5000,
      max: 8000,
      daysMin: 1,
      daysMax: 1,
    },
    "feat-pay": {
      title: "Приём онлайн-платежей (эквайринг)",
      min: 12000,
      max: 18000,
      daysMin: 2,
      daysMax: 3,
    },
    "feat-calc": {
      title: "Интерактивный калькулятор / конфигуратор",
      min: 10000,
      max: 15000,
      daysMin: 2,
      daysMax: 3,
    },
    "feat-anim": {
      title: "Сложные GSAP / 3D анимации и вау-эффекты",
      min: 10000,
      max: 15000,
      daysMin: 2,
      daysMax: 3,
    },
    "feat-i18n": {
      title: "Многоязычность (RU / EN)",
      min: 8000,
      max: 12000,
      daysMin: 1,
      daysMax: 2,
    },
  };

  const formatPrice = (num) => {
    return Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const calculate = () => {
    const selectedTypeInput = calcSection.querySelector('input[name="calc-type"]:checked');
    const typeKey = selectedTypeInput ? selectedTypeInput.value : "landing";
    const typeData = TYPES[typeKey] || TYPES.landing;

    const selectedDesignInput = calcSection.querySelector('input[name="calc-design"]:checked');
    const designKey = selectedDesignInput ? selectedDesignInput.value : "has-design";
    const designData = DESIGNS[designKey] || DESIGNS["has-design"];

    const isExpress = calcSection.querySelector('input[name="calc-urgency"]:checked')?.value === "express";

    let totalMin = typeData.min + designData.min;
    let totalMax = typeData.max + designData.max;
    let totalDaysMin = typeData.daysMin + designData.daysMin;
    let totalDaysMax = typeData.daysMax + designData.daysMax;

    const checkedFeatures = [];
    calcSection.querySelectorAll('input[name="calc-features"]:checked').forEach((cb) => {
      const featData = FEATURES[cb.value];
      if (featData) {
        checkedFeatures.push(featData.title);
        totalMin += featData.min;
        totalMax += featData.max;
        totalDaysMin += featData.daysMin;
        totalDaysMax += featData.daysMax;
      }
    });

    if (isExpress) {
      totalMin = Math.round(totalMin * 1.3);
      totalMax = Math.round(totalMax * 1.3);
      totalDaysMin = Math.max(1, Math.round(totalDaysMin * 0.65));
      totalDaysMax = Math.max(2, Math.round(totalDaysMax * 0.65));
    }

    if (priceValEl) {
      priceValEl.textContent = `${formatPrice(totalMin)} — ${formatPrice(totalMax)} ₽`;
    }
    if (daysValEl) {
      daysValEl.textContent = `~${totalDaysMin}–${totalDaysMax} рабочих дней`;
    }

    return {
      typeName: typeData.title,
      serviceRadioVal: typeData.serviceRadio,
      designName: designData.title,
      features: checkedFeatures,
      isExpress,
      totalMin,
      totalMax,
      totalDaysMin,
      totalDaysMax,
    };
  };

  // Пересчет при любом клике / изменении инпутов
  calcSection.addEventListener("change", calculate);
  calculate(); // Первый расчёт

  // Кнопка «Зафиксировать расчет в заявке»
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const state = calculate();
      const contactForm = document.getElementById("contact-form");
      const messageField = document.getElementById("message");
      const contactsSection = document.getElementById("contacts");

      if (!contactForm || !contactsSection) return;

      // 1. Выбираем радиокнопку услуги в контактной форме
      const targetRadio = Array.from(
        document.querySelectorAll('input[name="service"]')
      ).find((r) => r.value === state.serviceRadioVal);

      if (targetRadio) {
        targetRadio.checked = true;
        targetRadio.dispatchEvent(new Event("change", { bubbles: true }));
        const card = targetRadio.closest(".form__service-card");
        if (card) {
          card.classList.remove("is-picked");
          void card.offsetWidth;
          card.classList.add("is-picked");
        }
      }

      // 2. Формируем подробное структурированное ТЗ
      const featuresStr = state.features.length > 0
        ? state.features.map((f) => `  • ${f}`).join("\n")
        : "  • Базовый функционал без доп. интеграций";

      const briefText = 
`📋 [Конфигурация из калькулятора]
• Тип проекта: ${state.typeName}
• Дизайн: ${state.designName}
• Интеграции и опции:
${featuresStr}
• Срочность: ${state.isExpress ? "⚡ Экспресс (+30%)" : "Стандарт"}
• Предварительная смета: ${formatPrice(state.totalMin)} – ${formatPrice(state.totalMax)} ₽ (срок ~${state.totalDaysMin}–${state.totalDaysMax} раб. дн.)

Дополнительные детали:
`;

      if (messageField) {
        messageField.value = briefText;
        messageField.classList.remove("is-invalid");
      }

      // 3. Плавный скролл к форме и фокус
      contactsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      const nameField = document.getElementById("name");
      if (nameField && window.matchMedia("(pointer: fine)").matches) {
        setTimeout(() => nameField.focus({ preventScroll: true }), 700);
      }
    });
  }
})();
