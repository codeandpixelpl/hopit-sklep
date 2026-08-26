/* HOPit — galeria produktu: miniatura przełącza duże zdjęcie i sama pokazuje,
   że jest wybrana. Stan trzyma `aria-current`, nie klasa, żeby czytnik ekranu
   mówił to samo, co widać. */
(function () {
  document.querySelectorAll('[data-galeria]').forEach(function (galeria) {
    var duze = galeria.querySelector('.galeria-p__glowne img');
    var minis = galeria.querySelectorAll('.galeria-p__minis button');
    if (!duze || !minis.length) return;

    minis.forEach(function (mini) {
      mini.addEventListener('click', function () {
        if (mini.getAttribute('aria-current') === 'true') return;
        duze.src = mini.dataset.duze;
        duze.alt = mini.dataset.opis || '';
        minis.forEach(function (m) { m.removeAttribute('aria-current'); });
        mini.setAttribute('aria-current', 'true');
        mini.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      });
    });
  });
})();
