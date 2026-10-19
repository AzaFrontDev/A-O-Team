/* ============================================
   A&O Team — Интерактивный таймлайн Process (GSAP)
   Синхронное заполнение неоновой линии, движение искры
   и включение узлов на десктопе и мобильных устройствах.
   ============================================ */
(function () {
  "use strict";

  /* ---------- Динамическая синхронизация со сметой Калькулятора ---------- */
  const initProcessSync = () => {
    const bar = document.getElementById("process-calc-bar");
    const typeEl = document.getElementById("process-calc-type");
    const badgeEl = document.getElementById("process-calc-badge");
    const daysEl = document.getElementById("process-calc-days");
    const dateEl = document.getElementById("process-calc-date");
    const timeTags = document.querySelectorAll("[data-process-time]");

    if (!bar) return;

    let updateTimeout = null;

    const applyCalcData = (data) => {
      if (!data) return;

      const { typeName, isExpress, totalDaysMin, totalDaysMax, targetDateStr, stepSchedule } = data;

      if (typeEl && typeName) {
        typeEl.textContent = typeName;
      }

      if (badgeEl) {
        badgeEl.textContent = isExpress ? "⚡ Экспресс" : "Стандарт";
        badgeEl.classList.toggle("is-express", Boolean(isExpress));
      }

      if (daysEl) {
        daysEl.textContent = `~${totalDaysMin}–${totalDaysMax} раб. дней`;
      }

      if (dateEl && targetDateStr) {
        dateEl.textContent = `к ${targetDateStr}`;
      }

      if (stepSchedule && timeTags.length) {
        timeTags.forEach((tag) => {
          const stepNum = tag.dataset.processTime;
          const val = stepSchedule[stepNum];
          if (val) {
            tag.textContent = val;
            tag.classList.remove("is-highlighted");
            void tag.offsetWidth; // перезапуск анимации
            tag.classList.add("is-highlighted");
          }
        });
      }

      bar.classList.remove("is-updated");
      void bar.offsetWidth;
      bar.classList.add("is-updated");
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        bar.classList.remove("is-updated");
      }, 700);
    };

    window.addEventListener("ao:calc-update", (e) => {
      applyCalcData(e.detail);
    });

    // Если калькулятор уже успел посчитать до инициализации
    if (window.__AO_CALC_STATE__) {
      applyCalcData(window.__AO_CALC_STATE__);
    }
  };

  initProcessSync();

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const track = document.getElementById("processTrack");
  if (!track) return;

  const fill = track.querySelector(".process__line-fill");
  const line = track.querySelector(".process__line");
  const spark = track.querySelector(".process__spark");
  const items = gsap.utils.toArray(".process__item", track);

  // Подсвечивает карточку текущего (последнего достигнутого) шага
  const setCurrent = (index) => {
    items.forEach((item, idx) => item.classList.toggle("is-current", idx === index));
  };

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)",
      reduce: "(prefers-reduced-motion: reduce)",
    },
    (ctx) => {
      const { isDesktop, reduce } = ctx.conditions;

      // При prefers-reduced-motion: всё сразу видно и активно
      if (reduce) {
        gsap.set(fill, { scaleY: 1 });
        items.forEach((item) => {
          const node = item.querySelector(".process__node");
          if (node) node.classList.add("is-active");
          const content = item.querySelector(".process__content");
          if (content) gsap.set(content, { autoAlpha: 1, x: 0, y: 0 });
        });
        return;
      }

      // 1. Линия заливается синхронно со скроллом,
      //    а неоновая искра скользит по её острию
      const lineTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top 70%",
          end: "bottom 70%",
          scrub: 0.3,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (spark) {
              spark.classList.toggle("is-live", self.progress > 0.005 && self.progress < 0.995);
            }
          },
        },
      });

      lineTl.fromTo(fill, { scaleY: 0 }, { scaleY: 1 }, 0);

      if (spark && line) {
        lineTl.fromTo(spark, { y: 0 }, { y: () => line.offsetHeight }, 0);
      }

      // 2. Узлы и карточки включаются синхронно по мере продвижения заливки
      items.forEach((item, i) => {
        const node = item.querySelector(".process__node");
        const content = item.querySelector(".process__content");
        if (!node || !content) return;

        // Появление карточки: на десктопе сбоку, на мобильных снизу (без распирания по горизонтали)
        gsap.fromTo(
          content,
          {
            autoAlpha: 0,
            x: isDesktop ? (i % 2 === 0 ? -45 : 45) : 0,
            y: isDesktop ? 0 : 25,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: node,
              start: "top 70%",
              toggleActions: "play none none reverse",
              onEnter: () => {
                node.classList.add("is-active");
                setCurrent(i);
              },
              onLeaveBack: () => {
                node.classList.remove("is-active");
                setCurrent(i - 1);
              },
            },
          }
        );
      });

      return () => {
        setCurrent(-1);
        items.forEach((item) => {
          const node = item.querySelector(".process__node");
          if (node) node.classList.remove("is-active");
        });
      };
    }
  );

  // Рефреш триггеров при готовности DOM и загрузке медиа
  if (document.readyState === "complete") {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }
})();