/* HOPit — taśma opinii jedzie sama w pętli.
   Grupa kart jest klonowana, więc po przewinięciu jednej szerokości grupy
   wracamy o tę szerokość i szew jest niewidoczny. Ruch idzie po scrollLeft,
   a nie po transformie, żeby palec i gładzik dalej przewijały karuzelę ręcznie. */
(function () {
  var PREDKOSC = 26;   // px na sekundę — tempo do czytania, nie do oglądania
  var POWROT   = 1600; // ile ms po ręcznym ruchu taśma rusza z powrotem

  document.querySelectorAll('[data-opinie]').forEach(function (pas) {
    var rzad = pas.querySelector('.opinie__rzad');
    var grupa = pas.querySelector('.opinie__grupa');
    if (!rzad || !grupa) return;

    var klon = grupa.cloneNode(true);
    klon.setAttribute('aria-hidden', 'true');
    klon.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
    rzad.appendChild(klon);

    var wolne = window.matchMedia('(prefers-reduced-motion: reduce)');
    var polowa = grupa.offsetWidth;
    var pozycja = 0;
    var ostatniZapis = 0;
    var wstrzymane = false;
    var widoczne = true;
    var licznik = null;
    var klatka = null;
    var czas = null;

    function zmierz() {
      polowa = grupa.offsetWidth;
      if (polowa > 0) pozycja = ((pozycja % polowa) + polowa) % polowa;
    }

    function krok(teraz) {
      klatka = requestAnimationFrame(krok);
      if (czas === null) { czas = teraz; return; }
      var dt = Math.min((teraz - czas) / 1000, 0.05); // po powrocie z innej karty bez skoku
      czas = teraz;
      if (wstrzymane || !widoczne || polowa <= 0) return;

      pozycja += PREDKOSC * dt;
      if (pozycja >= polowa) pozycja -= polowa;
      ostatniZapis = pozycja;
      rzad.scrollLeft = pozycja;
    }

    function stop() {
      wstrzymane = true;
      if (licznik) { clearTimeout(licznik); licznik = null; }
    }
    function start(opoznienie) {
      if (licznik) clearTimeout(licznik);
      licznik = setTimeout(function () { wstrzymane = false; }, opoznienie || 0);
    }

    // ręczne przewijanie: przejmij pozycję zamiast szarpać się z użytkownikiem
    rzad.addEventListener('scroll', function () {
      if (Math.abs(rzad.scrollLeft - ostatniZapis) < 2) return;
      pozycja = rzad.scrollLeft;
      if (polowa > 0) {
        if (pozycja >= polowa) pozycja -= polowa;
        if (pozycja < 0) pozycja += polowa;
        rzad.scrollLeft = pozycja;
      }
      ostatniZapis = pozycja;
      stop();
      start(POWROT);
    }, { passive: true });

    rzad.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') stop();
    });
    rzad.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') start(200);
    });
    rzad.addEventListener('pointerdown', stop);
    // samo dotknięcie karty, bez przewinięcia, nie może zostawić taśmy w pauzie:
    // pointerleave przy dotyku nie przychodzi tak jak przy myszy
    rzad.addEventListener('pointerup', function () { start(POWROT); });
    rzad.addEventListener('pointercancel', function () { start(POWROT); });
    rzad.addEventListener('focusin', stop);
    rzad.addEventListener('focusout', function () { start(POWROT); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (wpisy) {
        widoczne = wpisy[0].isIntersecting;
        czas = null;
      }, { threshold: 0 }).observe(pas);
    }

    window.addEventListener('resize', zmierz);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(zmierz);

    function wlacz() {
      if (klatka) cancelAnimationFrame(klatka);
      czas = null;
      if (wolne.matches) return;      // szanujemy „ogranicz ruch" w systemie
      klatka = requestAnimationFrame(krok);
    }
    if (wolne.addEventListener) wolne.addEventListener('change', wlacz);
    zmierz();
    wlacz();
  });
})();
