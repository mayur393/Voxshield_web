(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initStarfield() {
    var canvas = document.getElementById("starfield");
    if (!canvas || reduceMotion) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var lines = [];
    var pointer = { x: -9999, y: -9999 };
    var smooth = { x: -9999, y: -9999 };
    var hasPointer = false;
    var running = true;
    var raf = 0;

    var SPACING = 52;
    var STEP = 26;
    var REACH = 210;
    var PULL = 46;
    var REACH2 = REACH * REACH;
    var SIGMA = REACH * 0.42;
    var SIGMA2 = SIGMA * SIGMA;
    var EDGE = Math.exp(-REACH2 / SIGMA2);

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var cols = Math.ceil(width / SPACING) + 2;
      var rows = Math.ceil(height / STEP) + 2;
      lines = [];
      for (var c = 0; c < cols; c++) {
        var pts = [];
        for (var r = 0; r < rows; r++) {
          pts.push({ y: r * STEP - STEP / 2, dx: 0, dy: 0 });
        }
        lines.push({ x: c * SPACING - SPACING / 2, pts: pts });
      }
    }

    function paint() {
      ctx.clearRect(0, 0, width, height);

      for (var c = 0; c < lines.length; c++) {
        var line = lines[c];
        var pts = line.pts;
        var near = 0;

        ctx.beginPath();
        for (var r = 0; r < pts.length; r++) {
          var p = pts[r];
          var vx = smooth.x - line.x;
          var vy = smooth.y - p.y;
          var d2 = vx * vx + vy * vy;

          var tx = 0;
          var ty = 0;
          var falloff = 0;
          if (d2 < REACH2) {
            falloff = Math.exp(-d2 / SIGMA2) - EDGE;
            var d = Math.sqrt(d2) || 1;
            tx = (vx / d) * falloff * PULL;
            ty = (vy / d) * falloff * PULL;
          }

          p.dx += (tx - p.dx) * 0.14;
          p.dy += (ty - p.dy) * 0.14;
          if (falloff > near) near = falloff;

          var fx = line.x + p.dx;
          var fy = p.y + p.dy;
          if (r === 0) ctx.moveTo(fx, fy);
          else ctx.lineTo(fx, fy);
        }

        /* Light traces on the dark surface, kept faint enough to read as
           texture rather than as content. */
        ctx.strokeStyle = "rgba(247, 245, 242, " + (0.03 + near * 0.13).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function draw() {
      smooth.x += (pointer.x - smooth.x) * 0.09;
      smooth.y += (pointer.y - smooth.y) * 0.09;
      paint();
      if (running) raf = window.requestAnimationFrame(draw);
    }

    function onPointerMove(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!hasPointer) {
        hasPointer = true;
        smooth.x = pointer.x;
        smooth.y = pointer.y;
      }
    }

    function onPointerLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    function start() {
      if (!running) {
        running = true;
        raf = window.requestAnimationFrame(draw);
      }
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(raf);
    }

    function onResize() {
      resize();
      paint();
    }

    resize();
    paint();
    raf = window.requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
  }

  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    }

    function close() {
      setOpen(false);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 780) close();
    });
  }

  function initHeader() {
    var header = document.getElementById("site-header");
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav__link"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      var section = document.querySelector(id);
      if (!section) return;
      map[section.id] = link;
      sections.push(section);
    });

    if (!sections.length) return;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.classList.remove("is-active"); });
        var active = map[entry.target.id];
        if (active) active.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  function initCircuit() {
    var host = document.querySelector("[data-circuit]");
    if (!host) return;

    var svg = host.querySelector(".circuit__svg");
    var grid = host.querySelector(".circuit__grid");
    var gTraces = host.querySelector("[data-traces]");
    var gNodes = host.querySelector("[data-nodes]");
    if (!svg || !gTraces || !gNodes) return;

    var NS = "http://www.w3.org/2000/svg";
    var NODE_W = 96;
    var NODE_H = 52;

    /* Matches the stylesheet tokens: bronze for live, green for the processing
       stage, neutral grey for the branch that is not built. */
    var COLORS = { live: "#e4af6c", processing: "#8ed4a6", planned: "#afaaa3" };

    var ICONS = {
      phone: "M6.6 10.8a15 15 0 0 0 6.6 6.6l2.1-2.1a1 1 0 0 1 1-.24 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1 11 11 0 0 0 .55 3.4 1 1 0 0 1-.24 1z",
      wave: "M3 12h2l2.5-6.5 3 13.5 3-10 2 4.5h5.5",
      search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.7 15.7 20 20",
      shield: "M12 3l7 3v5.4c0 4.4-2.9 8.2-7 9.6-4.1-1.4-7-5.2-7-9.6V6zM9.2 12.2l2 2 3.6-4",
      bell: "M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4",
      code: "M9 7 4.5 12 9 17M15 7l4.5 5L15 17"
    };

    var NODES = [
      { id: "capture", label: "Call audio", icon: "phone", status: "live" },
      { id: "preprocess", label: "Preprocessing", icon: "wave", status: "processing" },
      { id: "analysis", label: "Voice analysis", icon: "search", status: "live" },
      { id: "verdict", label: "On-device verdict", icon: "shield", status: "live" },
      { id: "alert", label: "User alert", icon: "bell", status: "live" },
      { id: "sdk", label: "SDK integration", icon: "code", status: "planned" }
    ];

    var LINKS = [
      { from: "capture", to: "preprocess", animated: true },
      { from: "preprocess", to: "analysis", animated: true },
      { from: "analysis", to: "verdict", animated: true },
      { from: "verdict", to: "alert", animated: true },
      { from: "verdict", to: "sdk", animated: true, planned: true }
    ];

    var LAYOUTS = {
      desktop: {
        width: 1060,
        height: 520,
        pos: {
          capture: [110, 190], preprocess: [320, 96], analysis: [530, 300],
          verdict: [740, 120], alert: [950, 286], sdk: [850, 400]
        },
        paths: { "verdict>sdk": "M 796 120 H 850 V 366" }
      },
      mobile: {
        width: 420,
        height: 760,
        pos: {
          capture: [210, 74], preprocess: [210, 190], analysis: [210, 306],
          verdict: [210, 422], alert: [210, 538], sdk: [340, 660]
        },
        paths: { "verdict>sdk": "M 266 422 H 340 V 626" }
      }
    };

    function el(name, attrs, text) {
      var node = document.createElementNS(NS, name);
      if (attrs) {
        Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
      }
      if (text != null) node.textContent = text;
      return node;
    }

    function rgba(hex, alpha) {
      var v = parseInt(hex.slice(1), 16);
      return "rgba(" + ((v >> 16) & 255) + ", " + ((v >> 8) & 255) + ", " + (v & 255) + ", " + alpha + ")";
    }

    function route(from, to) {
      var gapW = NODE_W / 2 + 8;
      var gapH = NODE_H / 2 + 8;
      var dx = to[0] - from[0];
      var dy = to[1] - from[1];
      var sx, sy, ex, ey, mid;

      if (Math.abs(dx) > Math.abs(dy)) {
        sx = from[0] + (dx >= 0 ? gapW : -gapW);
        sy = from[1];
        ex = to[0] + (dx >= 0 ? -gapW : gapW);
        ey = to[1];
        mid = from[0] + dx / 2;
        return "M " + sx + " " + sy + " H " + mid + " V " + ey + " H " + ex;
      }

      sx = from[0];
      sy = from[1] + (dy >= 0 ? gapH : -gapH);
      ex = to[0];
      ey = to[1] + (dy >= 0 ? -gapH : gapH);
      mid = from[1] + dy / 2;
      return "M " + sx + " " + sy + " V " + mid + " H " + ex + " V " + ey;
    }

    var currentKey = null;
    var observer = null;

    function render(key) {
      var layout = LAYOUTS[key];
      svg.setAttribute("viewBox", "0 0 " + layout.width + " " + layout.height);
      if (grid) {
        grid.setAttribute("width", layout.width);
        grid.setAttribute("height", layout.height);
      }

      gTraces.textContent = "";
      gNodes.textContent = "";

      var traces = [];

      LINKS.forEach(function (link, i) {
        var from = layout.pos[link.from];
        var to = layout.pos[link.to];
        if (!from || !to) return;

        var routeKey = link.from + ">" + link.to;
        var d = (layout.paths && layout.paths[routeKey]) || route(from, to);
        var color = COLORS[link.planned ? "planned" : "live"];

        var base = el("path", {
          d: d,
          stroke: link.planned ? rgba(COLORS.planned, 0.5) : "rgba(247, 245, 242, 0.18)",
          "stroke-width": 2
        });

        if (link.planned) base.setAttribute("stroke-dasharray", "7 7");

        var pulse = el("path", {
          d: d,
          stroke: color,
          "stroke-width": 4,
          filter: "url(#circuitGlow)",
          opacity: 0
        });

        gTraces.appendChild(base);
        gTraces.appendChild(pulse);
        traces.push({ base: base, pulse: pulse, dashed: !!link.planned, index: i });
      });

      var nodes = [];

      NODES.forEach(function (node, i) {
        var pos = layout.pos[node.id];
        if (!pos) return;

        var color = COLORS[node.status] || COLORS.live;
        var g = el("g", { transform: "translate(" + pos[0] + " " + pos[1] + ")" });
        var inner = el("g", { class: "cnode cnode--" + node.status });

        inner.appendChild(el("rect", {
          x: -NODE_W / 2, y: -NODE_H / 2, width: NODE_W, height: NODE_H, rx: 12,
          fill: rgba(color, 0.12), stroke: rgba(color, 0.75), "stroke-width": 1.5
        }));

        if (node.status === "planned") {
          inner.querySelector("rect").setAttribute("stroke-dasharray", "6 5");
        }

        inner.appendChild(el("path", {
          d: ICONS[node.icon],
          transform: "translate(-12 -12)",
          fill: "none",
          stroke: color,
          "stroke-width": 1.5,
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }));

        inner.appendChild(el("text", {
          class: "cnode__label",
          x: 0,
          y: NODE_H / 2 + 26,
          "text-anchor": "middle"
        }, node.label));

        g.appendChild(inner);
        gNodes.appendChild(g);
        nodes.push({ inner: inner, index: i });
      });

      play(nodes, traces);
    }

    function play(nodes, traces) {
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var canAnimate = !reduced && typeof Element.prototype.animate === "function";

      function finish() {
        nodes.forEach(function (node) {
          if (!canAnimate) {
            node.inner.style.opacity = "1";
            return;
          }
          node.inner.animate(
            [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 520, delay: 120 + node.index * 90, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }
          );
        });

        traces.forEach(function (trace) {
          var length = 0;
          try { length = trace.base.getTotalLength(); } catch (err) { length = 0; }

          if (!canAnimate || !length) {
            if (trace.pulse.style.opacity === "0") trace.pulse.style.opacity = "0.85";
            return;
          }

          if (!trace.dashed) {
            trace.base.style.strokeDasharray = length + " " + length;
            trace.base.animate(
              [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
              { duration: 900, delay: trace.index * 140, easing: "ease-in-out", fill: "both" }
            );
          }

          trace.pulse.style.strokeDasharray = (length * 0.14) + " " + (length * 0.86);
          trace.pulse.animate(
            [
              { strokeDashoffset: length, opacity: 0 },
              { opacity: 0.9, offset: 0.18 },
              { strokeDashoffset: -length, opacity: 0 }
            ],
            {
              duration: 2600 + trace.index * 160,
              delay: 700 + trace.index * 160,
              iterations: Infinity,
              easing: "linear"
            }
          );
        });
      }

      if (typeof IntersectionObserver === "function") {
        if (observer) observer.disconnect();
        observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            if (observer) observer.disconnect();
            observer = null;
            finish();
          });
        }, { threshold: 0.22 });
        observer.observe(host);
      } else {
        finish();
      }
    }

    function apply() {
      var key = window.matchMedia("(max-width: 780px)").matches ? "mobile" : "desktop";
      if (key === currentKey) return;
      currentKey = key;
      render(key);
    }

    apply();

    var mq = window.matchMedia("(max-width: 780px)");
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", apply);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(apply);
    }
  }

  function boot() {
    document.documentElement.classList.add("js-ready");

    /* Each module is isolated so one failure cannot leave the page in its
       pre-reveal state with everything invisible. */
    [initStarfield, initNav, initHeader, initReveal, initScrollSpy, initCircuit].forEach(function (init) {
      try {
        init();
      } catch (err) {
        if (window.console && window.console.error) {
          window.console.error("Voxshield: " + init.name + " failed", err);
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
