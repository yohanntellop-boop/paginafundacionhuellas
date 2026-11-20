/* Carrusel del banner principal: rota cada 5 segundos, siempre deslizando hacia la izquierda. */
(function () {
  var track = document.getElementById('hsTrack');
  if (!track) return;
  var slider = track.closest('.hero-slider');
  var slides = Array.prototype.slice.call(track.children);
  var dots = Array.prototype.slice.call(slider.querySelectorAll('.hs-dot'));
  var total = slides.length;
  if (total < 2) return;

  var INTERVALO = 5000;
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Copia de la primera diapositiva al final para que el paso 2 -> 1 tambien se deslice a la izquierda.
  var copia = slides[0].cloneNode(true);
  copia.setAttribute('aria-hidden', 'true');
  copia.setAttribute('inert', '');
  copia.removeAttribute('aria-label');
  copia.querySelectorAll('a,button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
  track.appendChild(copia);

  var indice = 0;
  var temporizador = null;

  function marcarPuntos(i) {
    dots.forEach(function (d, n) {
      d.classList.toggle('is-active', n === i % total);
      d.setAttribute('aria-current', n === i % total ? 'true' : 'false');
    });
  }

  function mover(i, animar) {
    track.style.transition = animar ? '' : 'none';
    track.style.transform = 'translateX(' + (-100 * i) + '%)';
    if (!animar) { void track.offsetWidth; track.style.transition = ''; }
    indice = i;
    marcarPuntos(i);
  }

  track.addEventListener('transitionend', function (e) {
    if (e.target !== track) return;
    if (indice === total) mover(0, false); // llego a la copia: vuelve al inicio sin que se note
  });

  function siguiente() { mover(indice + 1, true); }

  function iniciar() {
    if (reducido || temporizador) return;
    temporizador = setInterval(siguiente, INTERVALO);
  }
  function detener() { clearInterval(temporizador); temporizador = null; }

  dots.forEach(function (d, n) {
    d.addEventListener('click', function () { detener(); mover(n, true); iniciar(); });
  });

  slider.addEventListener('mouseenter', detener);
  slider.addEventListener('mouseleave', iniciar);
  slider.addEventListener('focusin', detener);
  slider.addEventListener('focusout', iniciar);
  document.addEventListener('visibilitychange', function () { document.hidden ? detener() : iniciar(); });

  mover(0, false);
  iniciar();
})();
