// === PCB Loader ===
(function () {
  var loader = document.getElementById('pcb-loader');
  if (!loader) return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ANIM_TOTAL = 3000; // total animation duration in ms — edit this to control speed
  var _S = ANIM_TOTAL / 2300; // scale factor relative to original baseline
  var POST_ANIM_HOLD = 0;
  var FADE_MS = 700;
  var MAX_WAIT = 6000;
  var started = false;
  var done = false;
  var pageReady = false;
  var loadingDotsTimer = null;
  var allowForceFinish = false;
  var finishing = false;

  function startLoadingDots(scope) {
    var labels = scope.querySelectorAll('.pcb-loading-text');
    if (!labels.length) return;

    var frame = 1;
    function tickDots() {
      labels.forEach(function (el) {
        var dotChars = el.querySelectorAll('.pcb-loading-dot-char');
        if (dotChars.length) {
          dotChars.forEach(function (dotEl, index) {
            dotEl.style.opacity = index < frame ? '1' : '0.18';
          });
          return;
        }

        // Fallback for old markup (single text node without dot tspans)
        if (!el.dataset.base) {
          el.dataset.base = (el.textContent || '').replace(/\.+\s*$/, '').trim();
        }
        el.textContent = el.dataset.base + '.'.repeat(frame);
      });
      frame = frame % 3 + 1;
    }

    tickDots();
    loadingDotsTimer = setInterval(tickDots, 360);
  }

  function finishIfReady() {
    if (finishing || !done) return;
    if (!pageReady && !allowForceFinish) return;
    finishing = true;
    if (loadingDotsTimer) {
      clearInterval(loadingDotsTimer);
      loadingDotsTimer = null;
    }
    loader.style.transition = 'opacity ' + (FADE_MS / 1000) + 's ease';
    loader.style.opacity = 0;
    setTimeout(function () {
      loader.remove();
      document.body.classList.remove('pcb-loading');
    }, FADE_MS);
  }

  function startAnimation() {
    if (started) return;
    started = true;

    var isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
    var scope = loader.querySelector(isMobile ? '.pcb-svg--mobile' : '.pcb-svg--desktop');
    if (!scope) scope = loader;
    startLoadingDots(scope);

    // Animate traces using stroke-dashoffset draw technique
    scope.querySelectorAll('.pcb-trace').forEach(function (el) {
      var len = el.getTotalLength ? el.getTotalLength() : 400;
      var delay = parseFloat(el.dataset.delay || 0) * 1000 * _S;
      // Duration scales with length: short stubs fast, long traces slower
      var dur = Math.max(0.25, Math.min(0.85, len / 500)) * _S;
      el.style.strokeDasharray = len + ' ' + len;
      el.style.strokeDashoffset = len;
      setTimeout(function () {
        el.style.transition = 'stroke-dashoffset ' + dur + 's cubic-bezier(0.4,0,0.2,1)';
        el.style.opacity = '1';
        el.style.strokeDashoffset = 0;
      }, delay);
    });

    // Fade in component bodies, vias, and labels
    scope.querySelectorAll('.pcb-reveal').forEach(function (el) {
      var delay = parseFloat(el.dataset.delay || 0) * 1000 * _S;
      setTimeout(function () {
        el.style.opacity = parseFloat(el.dataset.opacity || '1');
      }, delay);
    });

    setTimeout(function () {
      done = true;
      finishIfReady();
      setTimeout(function () {
        allowForceFinish = true;
        finishIfReady();
      }, POST_ANIM_HOLD);
    }, ANIM_TOTAL);
  }

  if (prefersReduced) {
    pageReady = true;
    done = true;
    finishIfReady();
    return;
  }

  // Wait for a paint before starting timers so the user sees the full animation.
  requestAnimationFrame(function () {
    requestAnimationFrame(startAnimation);
  });

  if (document.readyState === 'complete') {
    pageReady = true;
    finishIfReady();
  } else {
    window.addEventListener('load', function () {
      pageReady = true;
      finishIfReady();
    }, { once: true });
  }

  // Safety net: don't keep the loader forever if "load" never fires.
  setTimeout(function () {
    pageReady = true;
    finishIfReady();
  }, MAX_WAIT);
}());
