document.addEventListener("DOMContentLoaded", () => {
  /* --- Mobile Navigation Menu Handler --- */
  const burgerBtn = document.getElementById("burger-btn");
  const mobileOverlay = document.getElementById("mobile-overlay");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link, .mobile-signin");

  function openMenu() {
    if (!burgerBtn || !mobileMenu || !mobileOverlay) return;
    burgerBtn.setAttribute("aria-expanded", "true");
    mobileMenu.removeAttribute("hidden");
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    
    // Trigger animations in next frame
    requestAnimationFrame(() => {
      mobileOverlay.classList.add("active");
      mobileMenu.classList.add("active");
    });
  }

  function closeMenu() {
    if (!burgerBtn || !mobileMenu || !mobileOverlay) return;
    burgerBtn.setAttribute("aria-expanded", "false");
    mobileOverlay.classList.remove("active");
    mobileMenu.classList.remove("active");
    document.body.classList.remove("menu-open");

    setTimeout(() => {
      if (burgerBtn.getAttribute("aria-expanded") === "false") {
        mobileMenu.setAttribute("hidden", "");
        mobileMenu.setAttribute("aria-hidden", "true");
        mobileOverlay.setAttribute("aria-hidden", "true");
      }
    }, 380);
  }

  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      const isExpanded = burgerBtn.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      closeMenu();
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720 && document.body.classList.contains("menu-open")) {
      closeMenu();
    }
  });


  /* --- Stat Counter Animation --- */
  const statItems = document.querySelectorAll(".stat-item");

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateStat(item, index) {
    const valueEl = item.querySelector(".stat-value");
    if (!valueEl) return;

    const target = parseFloat(item.getAttribute("data-target")) || 0;
    const suffix = item.getAttribute("data-suffix") || "";
    const decimals = parseInt(item.getAttribute("data-decimals"), 10) || 0;

    const duration = 1500 + index * 80;
    const delay = 480 + index * 90;

    setTimeout(() => {
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentVal = target * easedProgress;

        valueEl.textContent = currentVal.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          valueEl.textContent = target.toFixed(decimals) + suffix;
        }
      }

      requestAnimationFrame(step);
    }, delay);
  }

  if ("IntersectionObserver" in window && statItems.length > 0) {
    const observerOptions = {
      threshold: 0.25
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statItems.forEach((item, index) => {
            animateStat(item, index);
          });
          observer.disconnect();
        }
      });
    }, observerOptions);

    const statsFooter = document.getElementById("stats");
    if (statsFooter) {
      statsObserver.observe(statsFooter);
    } else {
      statItems.forEach((item, index) => animateStat(item, index));
    }
  } else {
    // Fallback if IntersectionObserver is not supported
    statItems.forEach((item, index) => animateStat(item, index));
  }

  /* --- Scroll Reveal (inner pages) --- */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (revealEls.length > 0) {
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-in"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  /* --- Annotated text ---------------------------------------------------
     Twelve hand-drawn emphasis variants, drawn as inline SVG over a phrase
     and animated once when it scrolls into view. Plain DOM, no dependency.
     <span class="annot" data-annot="circle" data-annot-delay="0.2">text</span>
     ---------------------------------------------------------------------- */
  const annots = document.querySelectorAll(".annot");

  // Deterministic jitter so a phrase looks hand-drawn but never re-rolls.
  function wobble(seed) {
    let t = seed * 9301 + 49297;
    return () => {
      t = (t * 9301 + 49297) % 233280;
      return t / 233280 - 0.5;
    };
  }

  function pathsFor(variant, r) {
    // Coordinate space is 0..100 wide, 0..100 tall over the padded phrase box.
    const j = (n) => n + r() * 3;
    switch (variant) {
      case "underline":
        return [`M ${j(3)} ${j(80)} Q 50 ${j(86)} ${j(97)} ${j(79)}`];
      case "doubleUnderline":
        return [
          `M ${j(3)} ${j(78)} Q 50 ${j(84)} ${j(97)} ${j(77)}`,
          `M ${j(5)} ${j(89)} Q 50 ${j(94)} ${j(95)} ${j(88)}`,
        ];
      case "dottedUnderline":
        return [`M ${j(3)} ${j(82)} L ${j(97)} ${j(82)}`];
      case "line":
        return [`M ${j(2)} ${j(84)} L ${j(98)} ${j(80)}`];
      case "wavy": {
        let d = `M ${j(3)} ${j(82)}`;
        for (let x = 3; x < 97; x += 12) {
          d += ` Q ${x + 3} ${j(72)} ${x + 6} ${j(82)} Q ${x + 9} ${j(92)} ${x + 12} ${j(82)}`;
        }
        return [d];
      }
      case "strikethrough":
        return [`M ${j(1)} ${j(50)} Q 50 ${j(46)} ${j(99)} ${j(50)}`];
      case "crossOut":
        return [
          `M ${j(2)} ${j(14)} L ${j(98)} ${j(86)}`,
          `M ${j(98)} ${j(14)} L ${j(2)} ${j(86)}`,
        ];
      case "box":
        return [
          `M ${j(2)} ${j(8)} L ${j(98)} ${j(6)} L ${j(97)} ${j(92)} L ${j(3)} ${j(94)} Z`,
        ];
      case "bracket":
        return [
          `M ${j(8)} ${j(6)} L ${j(1)} ${j(8)} L ${j(2)} ${j(92)} L ${j(9)} ${j(94)}`,
          `M ${j(92)} ${j(6)} L ${j(99)} ${j(8)} L ${j(98)} ${j(92)} L ${j(91)} ${j(94)}`,
        ];
      case "arrow":
        return [
          `M ${j(2)} ${j(88)} Q 50 ${j(104)} ${j(96)} ${j(84)}`,
          `M ${j(86)} ${j(78)} L ${j(97)} ${j(84)} L ${j(86)} ${j(93)}`,
        ];
      case "circle":
      default:
        return [
          `M ${j(50)} ${j(2)} C ${j(88)} ${j(2)} ${j(103)} ${j(24)} ${j(99)} ${j(50)}` +
            ` C ${j(96)} ${j(80)} ${j(72)} ${j(98)} ${j(48)} ${j(98)}` +
            ` C ${j(20)} ${j(98)} ${j(1)} ${j(78)} ${j(2)} ${j(48)}` +
            ` C ${j(3)} ${j(20)} ${j(24)} ${j(3)} ${j(56)} ${j(3)}`,
        ];
    }
  }

  function drawAnnot(el, index) {
    const variant = el.getAttribute("data-annot") || "underline";
    const delay = el.getAttribute("data-annot-delay");
    if (delay) el.style.setProperty("--annot-delay", delay + "s");

    if (variant === "highlight") {
      el.classList.add("annot--highlight");
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width < 2) return;

    // Draw in real pixels: a viewBox would scale the stroke with the box.
    const padX = 7;
    const padY = 6;
    const w = rect.width + padX * 2;
    const h = rect.height + padY * 2;
    const r = wobble(index + 1);
    const px = (x, y) => `${((x / 100) * w).toFixed(1)} ${((y / 100) * h).toFixed(1)}`;

    const old = el.querySelector("svg");
    if (old) old.remove();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("aria-hidden", "true");
    svg.style.left = `-${padX}px`;
    svg.style.top = `-${padY}px`;

    pathsFor(variant, r).forEach((d, i) => {
      // pathsFor emits "x y" pairs in a 0..100 space; map them into pixels.
      const scaled = d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (m, x, y) => px(parseFloat(x), parseFloat(y)));
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", scaled);
      path.style.setProperty("--stroke-i", String(i));
      if (variant === "dottedUnderline") path.setAttribute("stroke-dasharray", "1.5 7");
      svg.appendChild(path);
    });

    el.appendChild(svg);

    svg.querySelectorAll("path").forEach((path) => {
      if (variant === "dottedUnderline") return;
      let len = 200;
      try {
        len = Math.ceil(path.getTotalLength()) || 200;
      } catch (e) {
        /* getTotalLength is unavailable in some headless contexts */
      }
      path.style.setProperty("--len", String(len));
    });

    if (variant === "dottedUnderline") el.style.setProperty("--annot-w", "3");
  }

  if (annots.length > 0) {
    annots.forEach(drawAnnot);

    if (!("IntersectionObserver" in window)) {
      annots.forEach((el) => el.classList.add("is-drawn"));
    } else {
      const annotObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-drawn");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6, rootMargin: "0px 0px -6% 0px" }
      );

      annots.forEach((el) => annotObserver.observe(el));
    }

    let annotResize;
    window.addEventListener("resize", () => {
      clearTimeout(annotResize);
      annotResize = setTimeout(() => {
        annots.forEach((el, i) => {
          const wasDrawn = el.classList.contains("is-drawn");
          drawAnnot(el, i);
          if (wasDrawn) el.classList.add("is-drawn");
        });
      }, 180);
    });

    // Webfonts change the box the marks are drawn around.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        annots.forEach((el, i) => {
          const wasDrawn = el.classList.contains("is-drawn");
          drawAnnot(el, i);
          if (wasDrawn) el.classList.add("is-drawn");
        });
      });
    }
  }

  /* --- Circuit-board architecture diagrams -------------------------------
     Nodes are HTML chips placed over an SVG trace layer; each animated
     connection carries a pulse. Spec comes from an inline JSON script tag.
     ---------------------------------------------------------------------- */
  const reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  function routeTrace(a, b) {
    // Circuit-style orthogonal routing with a mid-span jog.
    if (Math.abs(a.x - b.x) < 6) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    if (Math.abs(a.y - b.y) < 6) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    const midY = (a.y + b.y) / 2;
    const dir = b.x > a.x ? 1 : -1;
    const r = 10;
    return (
      `M ${a.x} ${a.y} L ${a.x} ${midY - r}` +
      ` Q ${a.x} ${midY} ${a.x + r * dir} ${midY}` +
      ` L ${b.x - r * dir} ${midY}` +
      ` Q ${b.x} ${midY} ${b.x} ${midY + r}` +
      ` L ${b.x} ${b.y}`
    );
  }

  function buildCircuit(fig, figIndex) {
    const spec = fig.querySelector('script[type="application/json"]');
    if (!spec) return;

    let data;
    try {
      data = JSON.parse(spec.textContent);
    } catch (e) {
      return;
    }

    const w = parseFloat(fig.getAttribute("data-width")) || 960;
    const h = parseFloat(fig.getAttribute("data-height")) || 330;
    const speed = parseFloat(fig.getAttribute("data-pulse-speed")) || 2.2;
    const byId = {};
    (data.nodes || []).forEach((n) => { byId[n.id] = n; });

    const scroll = document.createElement("div");
    scroll.className = "circuit__scroll";

    const stage = document.createElement("div");
    stage.className = "circuit__stage";
    stage.style.setProperty("--ratio", `${w} / ${h}`);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "circuit__svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");

    (data.connections || []).forEach((c, i) => {
      const a = byId[c.from];
      const b = byId[c.to];
      if (!a || !b) return;

      const id = `trace-${figIndex}-${i}`;
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("id", id);
      path.setAttribute("d", routeTrace(a, b));
      path.setAttribute("class", "circuit__trace" + (c.planned ? " circuit__trace--planned" : ""));
      svg.appendChild(path);

      if (c.animated && !reduceMotion) {
        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("r", c.planned ? "2.6" : "3.1");
        dot.setAttribute("class", "circuit__pulse" + (c.planned ? " circuit__pulse--planned" : ""));
        const motion = document.createElementNS(svgNS, "animateMotion");
        motion.setAttribute("dur", `${speed + i * 0.18}s`);
        motion.setAttribute("repeatCount", "indefinite");
        motion.setAttribute("begin", `${i * 0.32}s`);
        const mpath = document.createElementNS(svgNS, "mpath");
        mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${id}`);
        mpath.setAttribute("href", `#${id}`);
        motion.appendChild(mpath);
        dot.appendChild(motion);
        svg.appendChild(dot);
      }
    });

    stage.appendChild(svg);

    (data.nodes || []).forEach((n) => {
      const chip = document.createElement(n.href ? "a" : "div");
      chip.className = "circuit__node" + (n.state ? ` circuit__node--${n.state}` : "");
      if (n.href) chip.href = n.href;
      chip.style.left = `${(n.x / w) * 100}%`;
      chip.style.top = `${(n.y / h) * 100}%`;
      chip.innerHTML =
        (n.icon ? `<i class="${n.icon}" aria-hidden="true"></i>` : "") +
        `<span class="circuit__label">${n.label}` +
        (n.note ? `<span class="circuit__note">${n.note}</span>` : "") +
        `</span>`;
      stage.appendChild(chip);
    });

    scroll.appendChild(stage);
    fig.insertBefore(scroll, fig.firstChild);
    spec.remove();
  }

  document.querySelectorAll("[data-circuit]").forEach(buildCircuit);

  /* --- Icon belt: chips riding an SVG path ------------------------------- */
  document.querySelectorAll("[data-belt]").forEach((belt) => {
    if (reduceMotion) return;

    const icons = [
      "fa-brands fa-python", "fa-solid fa-microchip", "fa-solid fa-database",
      "fa-brands fa-js", "fa-solid fa-wave-square", "fa-solid fa-lock",
    ];
    const path = "M-40 172C20 172 55 112 185.5 112C316 112 351 172 411 172";
    const duration = 22;
    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 371 258");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");

    icons.forEach((icon, i) => {
      const g = document.createElementNS(svgNS, "g");
      const motion = document.createElementNS(svgNS, "animateMotion");
      motion.setAttribute("dur", `${duration}s`);
      motion.setAttribute("begin", `${-i * (duration / icons.length)}s`);
      motion.setAttribute("repeatCount", "indefinite");
      motion.setAttribute("calcMode", "linear");
      motion.setAttribute("path", path);
      g.appendChild(motion);

      const fo = document.createElementNS(svgNS, "foreignObject");
      fo.setAttribute("x", "-23");
      fo.setAttribute("y", "-23");
      fo.setAttribute("width", "46");
      fo.setAttribute("height", "46");
      fo.innerHTML = `<span class="belt__chip" xmlns="http://www.w3.org/1999/xhtml"><i class="${icon}"></i></span>`;
      g.appendChild(fo);
      svg.appendChild(g);
    });

    belt.insertBefore(svg, belt.firstChild);
  });

  /* --- Flip stack progress ---------------------------------------------- */
  document.querySelectorAll("[data-flipstack]").forEach(function (stack) {
    var cards = Array.prototype.slice.call(stack.querySelectorAll(".flipstack__card"));
    if (cards.length < 2 || reduceMotion) return;

    var ticking = false;

    function update() {
      ticking = false;
      var vh = window.innerHeight;
      cards.forEach(function (card, i) {
        var next = cards[i + 1];
        if (!next) { card.style.setProperty("--p", "0"); return; }
        var stuckTop = card.getBoundingClientRect().top;
        var cover = (vh - next.getBoundingClientRect().top) / Math.max(1, vh - stuckTop);
        card.style.setProperty("--p", String(Math.min(1, Math.max(0, cover))));
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  });
});
