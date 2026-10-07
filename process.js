(function () {
  "use strict";
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
      desktop: "(min-width: 768px)",
      reduce: "(prefers-reduced-motion: reduce)",
    },
    (ctx) => {
      const { desktop, reduce } = ctx.conditions;

      // Без анимации: всё сразу видно и "зажжено"
      if (reduce) {
        gsap.set(fill, { scaleY: 1 });
        items.forEach((item) =>
          item.querySelector(".process__node").classList.add("is-active")
        );
        return;
      }

      // 1. Линия заливается синхронно со скроллом,
      //    а неоновая искра движется по её острию (общий timeline = общий scrub)
      const lineTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top 60%",
          end: "bottom 60%",
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // искра видна только пока линия реально заполняется
            if (spark) {
              spark.classList.toggle("is-live", self.progress > 0.002 && self.progress < 0.998);
            }
          },
        },
      });

      lineTl.fromTo(fill, { scaleY: 0 }, { scaleY: 1 }, 0);

      if (spark && line) {
        lineTl.fromTo(spark, { y: 0 }, { y: () => line.offsetHeight }, 0);
      }

      // 2. Узлы и карточки включаются, когда до них дошла заливка
      items.forEach((item, i) => {
        const node = item.querySelector(".process__node");
        const content = item.querySelector(".process__content");
        const fromX = desktop ? (i % 2 === 0 ? -50 : 50) : 32;

        gsap.fromTo(
          content,
          { autoAlpha: 0, x: fromX },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: node,
              start: "top 60%", // та же точка, что и у заливки линии
              toggleActions: "play none none reverse",
              toggleClass: { targets: node, className: "is-active" },
              // волна от узла запускается CSS-анимацией на .is-active,
              // здесь только переключаем «текущий» шаг
              onEnter: () => setCurrent(i),
              onLeaveBack: () => setCurrent(i - 1),
            },
          }
        );
      });

      return () => setCurrent(-1);
    }
  );

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();