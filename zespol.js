/* HOPit: opis osoby w sekcji zespołu.
   Na myszy opis wysuwa się po najechaniu (CSS, @media (hover:hover)).
   Na dotyku hover nie istnieje, więc stuknięcie w zdjęcie przełącza aria-expanded;
   otwarcie jednej karty zamyka pozostałe, Escape zamyka wszystkie. */
(function () {
  var przyciski = document.querySelectorAll('.kolo-osoba__odkryj');
  if (!przyciski.length) return;
  function zamknij(wyjatek) {
    przyciski.forEach(function (p) { if (p !== wyjatek) p.setAttribute('aria-expanded', 'false'); });
  }
  przyciski.forEach(function (p) {
    p.addEventListener('click', function () {
      var otwarty = p.getAttribute('aria-expanded') === 'true';
      zamknij(p);
      p.setAttribute('aria-expanded', otwarty ? 'false' : 'true');
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(null); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.kolo-osoba')) zamknij(null); });
})();
