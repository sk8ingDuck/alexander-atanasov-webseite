// === PCB Loader ===
(function () {
  var loader = document.getElementById('pcb-loader');
  if (!loader) return;

  // Animate traces using stroke-dashoffset draw technique
  loader.querySelectorAll('.pcb-trace').forEach(function (el) {
    var len = el.getTotalLength ? el.getTotalLength() : 400;
    var delay = parseFloat(el.dataset.delay || 0) * 1000;
    // Duration scales with length: short stubs fast, long traces slower
    var dur = Math.max(0.25, Math.min(0.85, len / 500));
    el.style.strokeDasharray = len + ' ' + len;
    el.style.strokeDashoffset = len;
    setTimeout(function () {
      el.style.transition = 'stroke-dashoffset ' + dur + 's cubic-bezier(0.4,0,0.2,1)';
      el.style.strokeDashoffset = 0;
    }, delay);
  });

  // Fade in component bodies, vias, and labels
  loader.querySelectorAll('.pcb-reveal').forEach(function (el) {
    var delay = parseFloat(el.dataset.delay || 0) * 1000;
    setTimeout(function () {
      el.style.opacity = parseFloat(el.dataset.opacity || '1');
    }, delay);
  });

  // After 2.3s start fade-out; page fully revealed at 3.0s
  setTimeout(function () {
    loader.style.transition = 'opacity 0.7s ease';
    loader.style.opacity = 0;
    setTimeout(function () {
      loader.remove();
      document.body.classList.remove('pcb-loading');
    }, 700);
  }, 2300);
}());
