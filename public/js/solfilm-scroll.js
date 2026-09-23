(function () {
  'use strict';

  var container = document.getElementById('tintScroll');
  if (!container) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // CSS viser det statiske rutenettet i stedet

  var tintRect = container.querySelector('.tint-scroll__tint');
  var percentEl = document.getElementById('tintPercent');
  var labelEl = document.getElementById('tintLabel');
  var progressBar = document.getElementById('tintProgressBar');

  // Lysgjennomgang (VLT %) fra lyst til mørkt, jevnt fordelt over scrollelengden
  var STOPS = [
    { p: 0, value: 70, label: 'Lett' },
    { p: 1 / 3, value: 35, label: 'Medium' },
    { p: 2 / 3, value: 20, label: 'Mørk' },
    { p: 1, value: 5, label: 'Limo' }
  ];

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  // Toningen når 5 % allerede før scrollen er ferdig, slik at bilen blir stående
  // "låst" på det mørkeste trinnet en liten stund før siden slipper videre.
  var HOLD_AT_END = 0.6;

  function getProgress() {
    var rect = container.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return rect.top <= 0 ? 1 : 0;
    var raw = clamp(-rect.top / total, 0, 1);
    return clamp(raw / HOLD_AT_END, 0, 1);
  }

  function update() {
    var progress = getProgress();

    var seg = STOPS.length - 2;
    for (var i = 0; i < STOPS.length - 1; i++) {
      if (progress >= STOPS[i].p && progress <= STOPS[i + 1].p) {
        seg = i;
        break;
      }
    }

    var from = STOPS[seg];
    var to = STOPS[seg + 1];
    var span = to.p - from.p;
    var t = span > 0 ? (progress - from.p) / span : 0;

    var value = lerp(from.value, to.value, t);
    var label = t > 0.5 ? to.label : from.label;
    var opacity = 1 - value / 100;

    if (tintRect) tintRect.style.opacity = opacity.toFixed(3);
    if (percentEl) percentEl.textContent = Math.round(value) + ' %';
    if (labelEl) labelEl.textContent = label;
    if (progressBar) progressBar.style.width = (progress * 100).toFixed(1) + '%';
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
