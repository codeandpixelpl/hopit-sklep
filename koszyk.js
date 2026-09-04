/* HOPit — koszyk w prototypie liczy na żywo: ilość, suma pozycji, netto, VAT,
   brutto. Ceny jednostkowe siedzą w `data-cena` przy pozycji, żeby nie parsować
   napisów z ekranu. Dostawy nie liczymy, bo cennika jeszcze nie mamy. */
(function () {
  var lista = document.querySelector('.koszyk-lista');
  if (!lista) return;

  var VAT = 0.23;
  var zl = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function kwota(v) { return zl.format(v) + ' zł'; }

  function przelicz() {
    var netto = 0;
    lista.querySelectorAll('.koszyk-poz').forEach(function (poz) {
      var cena = parseFloat(poz.dataset.cena);
      var pole = poz.querySelector('.licznik input');
      var ile = Math.max(1, parseInt(pole.value, 10) || 1);
      pole.value = ile;
      var suma = cena * ile;
      poz.querySelector('.koszyk-poz__suma').textContent = kwota(suma);
      netto += suma;
    });

    var vat = netto * VAT;
    document.querySelector('[data-suma="netto"]').textContent = kwota(netto);
    document.querySelector('[data-suma="vat"]').textContent = kwota(vat);
    document.querySelector('[data-suma="brutto"]').textContent = kwota(netto + vat);

    var ile = lista.querySelectorAll('.koszyk-poz').length;
    document.querySelectorAll('.koszyk__plakietka').forEach(function (p) { p.textContent = ile; });
    if (!ile) pusty();
  }

  function pusty() {
    var puste = document.querySelector('[data-pusty]');
    if (puste) puste.hidden = false;
    var pods = document.querySelector('.podsumowanie');
    if (pods) pods.hidden = true;
  }

  lista.addEventListener('click', function (e) {
    var poz = e.target.closest('.koszyk-poz');
    if (!poz) return;
    var pole = poz.querySelector('.licznik input');

    if (e.target.closest('.koszyk-poz__usun')) { poz.remove(); przelicz(); return; }
    if (e.target.matches('.licznik button')) {
      var krok = e.target.textContent.trim() === '+' ? 1 : -1;
      pole.value = Math.max(1, (parseInt(pole.value, 10) || 1) + krok);
      przelicz();
    }
  });

  lista.addEventListener('change', function (e) {
    if (e.target.matches('.licznik input')) przelicz();
  });

  przelicz();
})();
