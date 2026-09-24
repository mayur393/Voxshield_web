/* ==========================================================================
   VoxShield — ASCII / dither raster renderer (Canvas2D)

   Recreation of the "Electric Gaze" style effect: sample a source image or
   video on a cell grid, then redraw every cell as a glyph or primitive.

   Usage:
     <figure class="ascii" data-ascii
             data-src="assets/logo.webp"          <!-- or "video:.bg-video" -->
             data-config='{ "renderMode": "dither", "cellSize": 9 }'>
       <canvas></canvas>
     </figure>

   Pipeline, in order: source -> background layer -> cell sampling -> cell
   shapes -> colour adjustments -> post effects -> lights -> mask reveal.
   ========================================================================== */
(function () {
  "use strict";

  var CHAR_SETS = {
    standard: " .:-=+*#%@",
    blocks: " ░▒▓█",
    minimal: " .oO@",
    binary: " 01",
    hex: " 0123456789ABCDEF",
    dots: " ·∙•●",
    shades: " ▁▂▃▄▅▆▇█"
  };

  var DEFAULTS = {
    renderMode: "dither",
    bgMode: "none",          // none | blur | color | photo
    bgColor: "#000000",
    bgBlur: 12,
    bgOpacity: 90,
    cellSize: 9,
    coverage: 100,
    invert: false,
    styleBlend: "source-over",
    charSet: "standard",
    customChars: "",
    brightness: 0,
    contrast: 158,
    edgeEmphasis: 0,
    density: 20,
    toneCurve: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    tint: "#3ca6ff",
    tintOpacity: 0,
    overlayBlend: "multiply",
    saturation: 100,
    grayscale: 0,
    blurType: "off",         // off | gaussian
    blurAmount: 35,
    pfx: {},
    animated: true,
    animStyle: "shimmer",    // wave | pulse | shimmer | ripple | flicker
    animSpeed: { enabled: true, intensity: 100 },
    animIntensity: { enabled: true, intensity: 60 },
    lights: { enabled: false, points: [] },
    mask: { enabled: false, invert: false, dataUrl: null },
    color: null              // null keeps the sampled colour; else a CSS colour
  };

  function merge(base, extra) {
    var out = {}, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) out[k] = extra[k];
    return out;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function toneMap(curve, t) {
    // Piecewise-linear lookup through the control points.
    if (!curve || curve.length < 2) return t;
    for (var i = 0; i < curve.length - 1; i++) {
      var a = curve[i], b = curve[i + 1];
      if (t >= a.x && t <= b.x) {
        var span = b.x - a.x;
        return span <= 0 ? b.y : a.y + ((t - a.x) / span) * (b.y - a.y);
      }
    }
    return t;
  }

  /* ---- cell shapes ------------------------------------------------------ */
  // Each draws one cell. l = luminance 0..1, s = cell size, (x, y) = top-left.
  var MODES = {
    characters: function (ctx, x, y, s, l, cfg, rgb, t) {
      var chars = cfg.customChars || CHAR_SETS[cfg.charSet] || CHAR_SETS.standard;
      var idx = clamp(Math.floor(l * (chars.length - 1) + 0.5), 0, chars.length - 1);
      ctx.font = (s * (0.8 + l * 0.4)).toFixed(1) + "px ui-monospace, Menlo, monospace";
      ctx.textBaseline = "top";
      ctx.fillText(chars.charAt(idx), x, y);
    },
    dither: function (ctx, x, y, s, l) {
      // Ordered 4x4 Bayer threshold, drawn as sub-cell dots.
      var bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      var q = s / 4;
      for (var i = 0; i < 16; i++) {
        if (l * 16 > bayer[i]) {
          ctx.fillRect(x + (i % 4) * q, y + Math.floor(i / 4) * q, q, q);
        }
      }
    },
    mosaic: function (ctx, x, y, s, l) { var p = s * (0.15 + l * 0.85); ctx.fillRect(x + (s - p) / 2, y + (s - p) / 2, p, p); },
    pixel: function (ctx, x, y, s) { ctx.fillRect(x, y, s, s); },
    dots: function (ctx, x, y, s, l) {
      ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, (s / 2) * l, 0, Math.PI * 2); ctx.fill();
    },
    cross: function (ctx, x, y, s, l) {
      var w = Math.max(1, s * 0.18), r = (s / 2) * l;
      ctx.fillRect(x + s / 2 - r, y + s / 2 - w / 2, r * 2, w);
      ctx.fillRect(x + s / 2 - w / 2, y + s / 2 - r, w, r * 2);
    },
    diamond: function (ctx, x, y, s, l) {
      var r = (s / 2) * l, cx = x + s / 2, cy = y + s / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath(); ctx.fill();
    },
    voxel: function (ctx, x, y, s, l) {
      var h = s * l, top = y + s - h;
      ctx.globalAlpha *= 0.85; ctx.fillRect(x, top, s, h);
      ctx.globalAlpha /= 0.85; ctx.fillRect(x, top, s, Math.max(1, s * 0.18));
    },
    lego: function (ctx, x, y, s, l) {
      ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s * 0.2 * (0.4 + l), 0, Math.PI * 2);
      ctx.globalCompositeOperation = "destination-out"; ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    },
    mixed: function (ctx, x, y, s, l, cfg, rgb, t) {
      (l > 0.66 ? MODES.pixel : l > 0.33 ? MODES.dots : MODES.characters)(ctx, x, y, s, l, cfg, rgb, t);
    },
    lines: function (ctx, x, y, s, l) { ctx.fillRect(x, y + s / 2 - Math.max(0.5, (s * l) / 2), s, Math.max(1, s * l)); },
    diagonal: function (ctx, x, y, s, l) {
      ctx.lineWidth = Math.max(0.5, s * l * 0.5); ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath(); ctx.moveTo(x, y + s); ctx.lineTo(x + s, y); ctx.stroke();
    },
    braille: function (ctx, x, y, s, l) {
      var dots = Math.round(l * 8), q = s / 2, r = Math.max(0.6, s * 0.11);
      for (var i = 0; i < dots; i++) {
        ctx.beginPath();
        ctx.arc(x + q * 0.5 + (i % 2) * q, y + (s / 4) * (Math.floor(i / 2) + 0.5), r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    halfblocks: function (ctx, x, y, s, l) {
      var half = s / 2;
      if (l > 0.5) ctx.fillRect(x, y, s, half);
      ctx.fillRect(x, y + half, s, half * clamp(l * 2, 0, 1));
    },
    disco: function (ctx, x, y, s, l, cfg, rgb, t) {
      ctx.save();
      ctx.fillStyle = "hsl(" + (((x + y) * 0.5 + t * 60) % 360) + ", 85%, " + (30 + l * 45) + "%)";
      ctx.fillRect(x, y, s * 0.92, s * 0.92);
      ctx.restore();
    },
    hexdump: function (ctx, x, y, s, l) {
      var hex = "0123456789ABCDEF";
      ctx.font = (s * 0.9).toFixed(1) + "px ui-monospace, Menlo, monospace";
      ctx.textBaseline = "top";
      ctx.fillText(hex.charAt(clamp(Math.floor(l * 15 + 0.5), 0, 15)), x, y);
    },
    matrix: function (ctx, x, y, s, l, cfg, rgb, t) {
      var chars = "01ｱｲｳｴｵｶｷｸｹｺ";
      var rain = (Math.sin((x * 0.7 + y * 0.3) * 0.05 + t * 2) + 1) / 2;
      ctx.save();
      ctx.fillStyle = "rgba(40, 255, 130, " + (0.15 + l * rain * 0.85).toFixed(3) + ")";
      ctx.font = (s * 0.95).toFixed(1) + "px ui-monospace, Menlo, monospace";
      ctx.textBaseline = "top";
      ctx.fillText(chars.charAt(Math.floor((x + y + t * 8) % chars.length)), x, y);
      ctx.restore();
    },
    rings: function (ctx, x, y, s, l) {
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.5, s * 0.12);
      ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, Math.max(0.5, (s / 2 - 1) * l), 0, Math.PI * 2); ctx.stroke();
    },
    hearts: function (ctx, x, y, s, l) {
      var r = (s / 2) * l, cx = x + s / 2, cy = y + s / 2 + r * 0.15;
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.8);
      ctx.bezierCurveTo(cx - r * 1.4, cy - r * 0.4, cx - r * 0.4, cy - r * 1.3, cx, cy - r * 0.45);
      ctx.bezierCurveTo(cx + r * 0.4, cy - r * 1.3, cx + r * 1.4, cy - r * 0.4, cx, cy + r * 0.8);
      ctx.fill();
    },
    stars: function (ctx, x, y, s, l) {
      var r = (s / 2) * l, cx = x + s / 2, cy = y + s / 2;
      ctx.beginPath();
      for (var i = 0; i < 10; i++) {
        var rad = i % 2 ? r * 0.45 : r, a = (Math.PI / 5) * i - Math.PI / 2;
        ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
      }
      ctx.closePath(); ctx.fill();
    },
    hexagons: function (ctx, x, y, s, l) {
      var r = (s / 2) * l, cx = x + s / 2, cy = y + s / 2;
      ctx.beginPath();
      for (var i = 0; i < 6; i++) {
        var a = (Math.PI / 3) * i;
        ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
    },
    triangles: function (ctx, x, y, s, l) {
      var r = s * l;
      ctx.beginPath(); ctx.moveTo(x + s / 2, y + s - r); ctx.lineTo(x + s / 2 + r / 2, y + s); ctx.lineTo(x + s / 2 - r / 2, y + s); ctx.closePath(); ctx.fill();
    },
    bubbles: function (ctx, x, y, s, l) {
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.5, s * 0.08);
      ctx.globalAlpha *= 0.85;
      ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, Math.max(0.5, (s / 2) * l), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha /= 0.85;
    },
    hatch: function (ctx, x, y, s, l) {
      var n = Math.round(l * 3);
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.4, s * 0.07);
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var o = (i + 1) * (s / (n + 1));
        ctx.moveTo(x, y + o); ctx.lineTo(x + o, y);
        if (l > 0.6) { ctx.moveTo(x + s - o, y); ctx.lineTo(x + s, y + o); }
      }
      ctx.stroke();
    },
    contour: function (ctx, x, y, s, l) {
      // Iso-lines: only draw where luminance crosses a band edge.
      var band = l * 6;
      if (Math.abs(band - Math.round(band)) > 0.12) return;
      ctx.fillRect(x, y + s / 2, s, Math.max(1, s * 0.16));
    }
  };

  /* ---- post effects ----------------------------------------------------- */
  var PFX = {
    scanLines: function (ctx, w, h, k) {
      ctx.save(); ctx.globalAlpha = 0.5 * k; ctx.fillStyle = "#000";
      for (var y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
      ctx.restore();
    },
    vignette: function (ctx, w, h, k) {
      var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0," + (0.9 * k).toFixed(3) + ")");
      ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
    },
    bloom: function (ctx, w, h, k, canvas) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.45 * k;
      ctx.filter = "blur(" + (6 * k + 2).toFixed(1) + "px)";
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    },
    chromatic: function (ctx, w, h, k, canvas) {
      var d = Math.max(1, 6 * k);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.5;
      ctx.drawImage(canvas, -d, 0);
      ctx.drawImage(canvas, d, 0);
      ctx.restore();
    },
    filmGrain: function (ctx, w, h, k) {
      ctx.save(); ctx.globalAlpha = 0.16 * k; ctx.fillStyle = "#fff";
      var n = Math.floor((w * h) / 900);
      for (var i = 0; i < n; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      ctx.restore();
    },
    glitch: function (ctx, w, h, k, canvas) {
      var slices = Math.floor(3 + k * 8);
      ctx.save();
      for (var i = 0; i < slices; i++) {
        var sy = Math.random() * h, sh = 2 + Math.random() * (h * 0.04);
        ctx.drawImage(canvas, 0, sy, w, sh, (Math.random() - 0.5) * 40 * k, sy, w, sh);
      }
      ctx.restore();
    },
    pixelate: function (ctx, w, h, k, canvas) {
      var f = Math.max(2, Math.round(2 + k * 14));
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, w, h, 0, 0, w / f, h / f);
      ctx.drawImage(canvas, 0, 0, w / f, h / f, 0, 0, w, h);
      ctx.restore();
    },
    halftone: function (ctx, w, h, k) {
      ctx.save(); ctx.globalCompositeOperation = "destination-out";
      var step = Math.max(3, Math.round(3 + k * 6));
      for (var y = 0; y < h; y += step) {
        for (var x = 0; x < w; x += step) {
          ctx.beginPath(); ctx.arc(x, y, step * 0.22, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    },
    filmDust: function (ctx, w, h, k) {
      ctx.save(); ctx.globalAlpha = 0.35 * k; ctx.fillStyle = "#fff";
      var n = Math.floor(10 + k * 60);
      for (var i = 0; i < n; i++) {
        var x = Math.random() * w, y = Math.random() * h;
        ctx.fillRect(x, y, 1, 1 + Math.random() * 3);
      }
      ctx.restore();
    }
  };

  /* ---- animation -------------------------------------------------------- */
  function animOffset(style, col, row, t, amount) {
    switch (style) {
      case "wave": return Math.sin(col * 0.25 + t * 2) * amount;
      case "pulse": return Math.sin(t * 3) * amount;
      case "ripple": return Math.sin(Math.hypot(col - 20, row - 12) * 0.35 - t * 3) * amount;
      case "flicker": return (Math.random() - 0.5) * amount * 2;
      case "shimmer":
      default: return Math.sin((col + row) * 0.45 + t * 4) * amount;
    }
  }

  /* ---- renderer --------------------------------------------------------- */
  function Renderer(fig) {
    var cfgAttr = fig.getAttribute("data-config");
    var cfg = merge(DEFAULTS, cfgAttr ? JSON.parse(cfgAttr) : {});
    cfg.pfx = cfg.pfx || {};

    var canvas = fig.querySelector("canvas") || fig.appendChild(document.createElement("canvas"));
    var ctx = canvas.getContext("2d");
    var sample = document.createElement("canvas");
    var sctx = sample.getContext("2d", { willReadFrequently: true });
    var scratch = document.createElement("canvas");
    var sourceEl = null;
    var maskImg = null;
    var running = false;
    var raf = 0;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function loadSource(done) {
      var src = fig.getAttribute("data-src") || "";
      if (src.indexOf("video:") === 0) {
        var vid = document.querySelector(src.slice(6));
        if (vid) { sourceEl = vid; done(); return; }
      }
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () { sourceEl = img; done(); };
      img.onerror = function () { fig.setAttribute("data-ascii-error", "source failed to load"); };
      img.src = src || "assets/logo.webp";
    }

    if (cfg.mask && cfg.mask.enabled && cfg.mask.dataUrl) {
      maskImg = new Image();
      maskImg.src = cfg.mask.dataUrl;
    }

    function size() {
      var rect = fig.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height || rect.width * 0.62));
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scratch.width = canvas.width; scratch.height = canvas.height;
      return { w: w, h: h };
    }

    var dims = size();

    function sourceReady() {
      if (!sourceEl) return false;
      if (sourceEl.tagName === "VIDEO") return sourceEl.readyState >= 2;
      return true;
    }

    function draw(time) {
      if (!sourceReady()) { raf = requestAnimationFrame(draw); return; }

      var w = dims.w, h = dims.h;
      var cell = Math.max(3, cfg.cellSize);
      var cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      var t = (time || 0) / 1000 * (cfg.animSpeed && cfg.animSpeed.enabled ? cfg.animSpeed.intensity / 100 : 0);
      var animAmt = cfg.animated && !reduce && cfg.animIntensity && cfg.animIntensity.enabled
        ? (cfg.animIntensity.intensity / 100) * 0.35 : 0;

      // 1. downscale the source to one pixel per cell
      sample.width = cols; sample.height = rows;
      sctx.clearRect(0, 0, cols, rows);
      sctx.drawImage(sourceEl, 0, 0, cols, rows);
      var data;
      try {
        data = sctx.getImageData(0, 0, cols, rows).data;
      } catch (e) {
        fig.setAttribute("data-ascii-error", "source is cross-origin; sampling blocked");
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // 2. background layer
      if (cfg.bgMode === "color") {
        ctx.save(); ctx.globalAlpha = cfg.bgOpacity / 100; ctx.fillStyle = cfg.bgColor;
        ctx.fillRect(0, 0, w, h); ctx.restore();
      } else if (cfg.bgMode === "blur" || cfg.bgMode === "photo") {
        ctx.save();
        ctx.globalAlpha = cfg.bgOpacity / 100;
        if (cfg.bgMode === "blur") ctx.filter = "blur(" + cfg.bgBlur + "px)";
        ctx.drawImage(sourceEl, 0, 0, w, h);
        ctx.restore();
      }

      // 3. cells
      ctx.save();
      ctx.globalCompositeOperation = cfg.styleBlend || "source-over";
      var shape = MODES[cfg.renderMode] || MODES.dither;
      var coverage = clamp(cfg.coverage, 0, 100) / 100;
      var contrast = cfg.contrast / 100;
      var bright = cfg.brightness / 100;
      var densityAlpha = clamp(0.35 + cfg.density / 100, 0.15, 1);

      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
          if (coverage < 1 && ((col * 7 + row * 13) % 100) / 100 >= coverage) continue;

          var i = (row * cols + col) * 4;
          var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3] / 255;
          if (a < 0.04) continue;

          var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

          if (cfg.edgeEmphasis > 0 && col > 0 && row > 0) {
            var pi = (row * cols + col - 1) * 4, ui = ((row - 1) * cols + col) * 4;
            var pl = (0.2126 * data[pi] + 0.7152 * data[pi + 1] + 0.0722 * data[pi + 2]) / 255;
            var ul = (0.2126 * data[ui] + 0.7152 * data[ui + 1] + 0.0722 * data[ui + 2]) / 255;
            lum += (Math.abs(lum - pl) + Math.abs(lum - ul)) * (cfg.edgeEmphasis / 100) * 2;
          }

          lum = toneMap(cfg.toneCurve, clamp(lum, 0, 1));
          lum = clamp((lum - 0.5) * contrast + 0.5 + bright, 0, 1);
          if (animAmt) lum = clamp(lum + animOffset(cfg.animStyle, col, row, t, animAmt), 0, 1);
          if (cfg.invert) lum = 1 - lum;
          if (lum <= 0.02) continue;

          ctx.globalAlpha = a * densityAlpha * (0.35 + lum * 0.65);
          ctx.fillStyle = cfg.color || "rgb(" + r + "," + g + "," + b + ")";
          shape(ctx, col * cell, row * cell, cell, lum, cfg, [r, g, b], t);
        }
      }
      ctx.restore();

      // 4. colour adjustments, as a filtered redraw of what we just built
      var filters = [];
      if (cfg.saturation !== 100) filters.push("saturate(" + cfg.saturation + "%)");
      if (cfg.grayscale > 0) filters.push("grayscale(" + cfg.grayscale + "%)");
      if (cfg.blurType && cfg.blurType !== "off") filters.push("blur(" + (cfg.blurAmount / 10).toFixed(1) + "px)");
      if (filters.length) {
        var s2 = scratch.getContext("2d");
        s2.setTransform(1, 0, 0, 1, 0, 0);
        s2.clearRect(0, 0, scratch.width, scratch.height);
        s2.drawImage(canvas, 0, 0);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = filters.join(" ");
        ctx.drawImage(scratch, 0, 0);
        ctx.restore();
      }

      if (cfg.tintOpacity > 0) {
        ctx.save();
        ctx.globalCompositeOperation = cfg.overlayBlend || "multiply";
        ctx.globalAlpha = cfg.tintOpacity / 100;
        ctx.fillStyle = cfg.tint;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // 5. post effects
      Object.keys(cfg.pfx).forEach(function (key) {
        var fx = cfg.pfx[key];
        if (!fx || !fx.enabled || !PFX[key]) return;
        PFX[key](ctx, w, h, clamp(fx.intensity, 0, 100) / 100, canvas);
      });

      // 6. lights
      if (cfg.lights && cfg.lights.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        cfg.lights.points.forEach(function (pt) {
          var gx = pt.x * w, gy = pt.y * h, gr = (pt.radius || 0.25) * Math.max(w, h);
          var grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
          var inten = ((pt.intensity == null ? 50 : pt.intensity) / 100) * 0.6;
          grad.addColorStop(0, "rgba(255,255,255," + inten.toFixed(3) + ")");
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = grad;
          ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
        });
        ctx.restore();
      }

      // 7. mask reveal back to the plain source
      if (maskImg && maskImg.complete && maskImg.naturalWidth) {
        var m = scratch.getContext("2d");
        m.setTransform(1, 0, 0, 1, 0, 0);
        m.clearRect(0, 0, scratch.width, scratch.height);
        m.drawImage(maskImg, 0, 0, scratch.width, scratch.height);
        ctx.save();
        ctx.globalCompositeOperation = cfg.mask.invert ? "destination-in" : "destination-out";
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(scratch, 0, 0);
        ctx.restore();
      }

      if (running) raf = requestAnimationFrame(draw);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    loadSource(function () {
      dims = size();
      draw(0); // always paint one frame synchronously, before any loop starts

      // Static when animation is off or the viewer asked for less motion.
      if (!cfg.animated || reduce) { /* the frame above is the whole render */ }
      else if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
        }, { threshold: 0.05 }).observe(fig);
      } else start();
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        dims = size();
        if (!running) requestAnimationFrame(draw);
      }, 160);
    });
  }

  function init() {
    document.querySelectorAll("[data-ascii]").forEach(function (fig) {
      try { new Renderer(fig); } catch (e) { fig.setAttribute("data-ascii-error", String(e && e.message)); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
