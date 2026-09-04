/* HOPit — kategorie jako slajdy: lewa kolumna przewija się, prawy kadr stoi
   i przenika między zdjęciami. Aktywny jest ten blok, który stoi najbliżej
   środka ekranu. Bez biblioteki, bez nasłuchu na scroll. */
(function () {
  var kadr = document.querySelector('.kategorie--slajdy .kadr');
  if (!kadr) return;

  var bloki = [].slice.call(document.querySelectorAll('.kategorie--slajdy .slajd'));
  var warstwy = [].slice.call(kadr.querySelectorAll('.kadr__warstwa'));
  if (!bloki.length) return;

  var teraz = -1;
  function pokaz(nr) {
    if (nr === teraz) return;
    teraz = nr;
    bloki.forEach(function (b, i) { b.classList.toggle('tu', i === nr); });
    warstwy.forEach(function (w, i) { w.classList.toggle('tu', i === nr); });
    var w = warstwy[nr];
    if (w && w.dataset.kolor) kadr.style.setProperty('--kolor', w.dataset.kolor);
  }

  if (!('IntersectionObserver' in window)) { pokaz(0); return; }

  // pas obserwacji to wąski pasek w połowie ekranu: blok, który go przecina, jest aktywny
  var obs = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) {
      if (w.isIntersecting) pokaz(bloki.indexOf(w.target));
    });
  }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });

  bloki.forEach(function (b) { obs.observe(b); });
  pokaz(0);
})();
