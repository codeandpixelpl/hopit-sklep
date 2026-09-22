/* HOPit — belka nieruchoma, wyszukiwarka na całej stronie, szukanie po aromacie.
   Uwagi klienta z 16.09.2026. Dane odmian: dane/odmiany.json (zrzut ze sklepu
   klienta, 153 pozycje), więc podpowiedzi są prawdziwe, nie przykładowe. */
(() => {
  'use strict';

  /* ---------- 1. belka przykleja się i po zejściu z hero dostaje tło --------- */
  const belka = document.querySelector('.belka');
  if (belka) {
    // czujnik stoi tuż pod belką: gdy wyjedzie nad górną krawędź okna,
    // belka leży już na treści i musi mieć własne tło
    const czujnik = document.createElement('div');
    czujnik.className = 'belka__czujnik';
    czujnik.setAttribute('aria-hidden', 'true');
    belka.after(czujnik);
    new IntersectionObserver(
      ([w]) => belka.classList.toggle('belka--przypieta', !w.isIntersecting),
      { threshold: 0 }
    ).observe(czujnik);
  }

  /* ---------- 2. nakładka wyszukiwania na telefonie -------------------------- */
  const szukajka = document.querySelector('.szukajka');
  const otworz = () => {
    if (!szukajka) return;
    szukajka.hidden = false;
    document.body.classList.add('bez-przewijania');
    szukajka.querySelector('.szukaj__pole').focus();
  };
  const zamknij = () => {
    if (!szukajka) return;
    szukajka.hidden = true;
    document.body.classList.remove('bez-przewijania');
  };
  document.querySelectorAll('[data-szukaj-otworz]').forEach(b => b.addEventListener('click', otworz));
  document.querySelectorAll('[data-szukaj-zamknij]').forEach(b => b.addEventListener('click', zamknij));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') zamknij(); });
  // klawiatura ekranowa zabiera dół okna; panel szukajki ma stać nad nią
  if (window.visualViewport && szukajka) {
    const podnies = () => {
      const zakryte = window.innerHeight - visualViewport.height - visualViewport.offsetTop;
      szukajka.style.setProperty('--klawiatura', Math.max(0, zakryte) + 'px');
    };
    visualViewport.addEventListener('resize', podnies);
    visualViewport.addEventListener('scroll', podnies);
  }

  /* ---------- 3. dane odmian, wczytywane raz i tylko gdy trzeba -------------- */
  let dane = null, wczytywanie = null;
  const wczytaj = () => wczytywanie || (wczytywanie = fetch('dane/odmiany.json')
    .then(r => r.json())
    .then(d => (dane = d.odmiany.map(o => ({
      ...o,
      szukajka: bezOgonkow([o.tytul, o.typ, o.kraj, o.aromat, o.zamienniki, o.rocznik].join(' '))
    }))))
    .catch(() => (dane = [])));

  function bezOgonkow(s) {
    return (s || '').toLowerCase()
      .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
      .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/[żź]/g, 'z');
  }

  function znajdz(fraza, limit) {
    const slowa = bezOgonkow(fraza).split(/\s+/).filter(Boolean);
    if (!slowa.length || !dane) return [];
    const trafione = dane.filter(o => slowa.every(s => o.szukajka.includes(s)));
    // nazwa odmiany bije dopasowanie w opisie aromatu
    trafione.sort((a, b) => {
      const wa = bezOgonkow(a.tytul).startsWith(slowa[0]) ? 0 : 1;
      const wb = bezOgonkow(b.tytul).startsWith(slowa[0]) ? 0 : 1;
      return wa - wb || a.tytul.localeCompare(b.tytul, 'pl');
    });
    return limit ? trafione.slice(0, limit) : trafione;
  }

  /* Rodziny aromatów. Liczba na chipie musi zgadzać się z liczbą wyników po
     kliknięciu, więc jedno i drugie liczy się z TYCH SAMYCH rdzeni. Opisy
     w katalogu klienta są odmienione („cytrusy", „cytrusowy", „nuty cytrusów"),
     dlatego dopasowanie idzie po rdzeniu, nie po całym słowie. */
  const RODZINY = {
    'cytrusowy':             ['cytrus', 'cytryn', 'limon', 'grejpfrut', 'pomarancz', 'mandarynk'],
    'tropikalny':            ['tropik', 'mango', 'marakuj', 'ananas', 'papaj', 'guawa', 'liczi', 'kokos'],
    'ziołowy i trawiasty':   ['ziol', 'traw', 'siano', 'miet', 'herbat', 'eukalipt'],
    'kwiatowy':              ['kwiat', 'kwiec', 'roz', 'lawend', 'fiolk'],
    'żywiczny i sosnowy':    ['zywicz', 'sosn', 'igliw', 'cedr'],
    'korzenny':              ['korzen', 'przypraw', 'pieprz', 'imbir', 'gozdzik', 'anyz', 'lukrec'],
    'owoce pestkowe':        ['brzoskwin', 'morel', 'sliw', 'nektaryn', 'wisni', 'czeresn'],
    'melonowy':              ['melon', 'arbuz'],
    'jabłkowy i gruszkowy':  ['jablk', 'jablo', 'grusz'],
    'jagodowy':              ['jagod', 'truskaw', 'malin', 'porzecz', 'borowk', 'jezyn'],
    'ziemisty':              ['ziemist', 'drzewn', 'tyton', 'grzyb'],
    'słodki i karmelowy':    ['karmel', 'miod', 'wanili', 'toffi', 'czekolad'],
    'cebulowo-czosnkowy':    ['cebul', 'czosn', 'dank']
  };

  function znajdzRodzine(nazwa) {
    const rdzenie = RODZINY[nazwa];
    if (!rdzenie || !dane) return [];
    return dane
      .filter(o => rdzenie.some(r => bezOgonkow(o.aromat).includes(r)))
      .sort((a, b) => a.tytul.localeCompare(b.tytul, 'pl'));
  }

  const ETYKIETY = { chmiel: 'Granulat chmielu', hopzoil: 'Hopzoil' };
  const opis = o => [ETYKIETY[o.typ] || o.typ, o.kraj, o.rocznik].filter(Boolean).join(' · ');

  /* ---------- 4. podpowiedzi pod polem --------------------------------------- */
  document.querySelectorAll('.szukaj').forEach(form => {
    const pole = form.querySelector('.szukaj__pole');
    const lista = form.querySelector('.szukaj__wyniki');
    if (!pole || !lista) return;

    const rysuj = () => {
      const fraza = pole.value.trim();
      if (fraza.length < 2) { lista.hidden = true; lista.innerHTML = ''; return; }
      const trafione = znajdz(fraza, 7);
      const ile = znajdz(fraza).length;
      if (!trafione.length) {
        lista.innerHTML = '<p class="szukaj__pusto">Nic nie pasuje do „' + fraza.replace(/[<&]/g, '') + '”.</p>';
      } else {
        lista.innerHTML = trafione.map(o =>
          '<a class="szukaj__wynik" href="produkt.html" role="option">' +
          '<span class="szukaj__nazwa">' + o.tytul + '</span>' +
          '<span class="szukaj__meta">' + opis(o) + '</span>' +
          (o.aromat ? '<span class="szukaj__aromat">' + o.aromat + '</span>' : '') +
          '</a>').join('') +
          (ile > trafione.length
            ? '<a class="szukaj__wiecej" href="sklep.html?q=' + encodeURIComponent(fraza) + '">Pokaż wszystkie ' + ile + ' dopasowań →</a>'
            : '');
      }
      lista.hidden = false;
    };

    pole.addEventListener('input', () => wczytaj().then(rysuj));
    pole.addEventListener('focus', () => wczytaj());
    document.addEventListener('click', e => { if (!form.contains(e.target)) lista.hidden = true; });
  });

  /* ---------- 5. wyniki na listingu: ?q= oraz chipy aromatów ---------------- */
  const listing = document.querySelector('.listing');
  if (!listing) return;

  const panel = document.createElement('section');
  panel.className = 'wyniki';
  panel.hidden = true;
  listing.before(panel);

  function pokazWyniki(fraza, zrodlo) {
    if (!fraza.trim()) { panel.hidden = true; listing.hidden = false; return; }
    const wszystkie = zrodlo === 'rodzina' ? znajdzRodzine(fraza) : znajdz(fraza);
    const trafione = wszystkie.slice(0, 24);
    const ile = wszystkie.length;
    panel.innerHTML =
      '<div class="wyniki__head">' +
        '<h2 class="tytul wyniki__tytul">' + (zrodlo === 'fraza' ? 'Szukane: ' : 'Aromat: ') + fraza + '</h2>' +
        '<p class="wyniki__licznik mono">' + ile + ' z 153 pozycji w&nbsp;magazynie</p>' +
        '<button class="wyniki__wyczysc" type="button">Wyczyść wyszukiwanie</button>' +
      '</div>' +
      (trafione.length
        ? '<ul class="wyniki__lista">' + trafione.map(o =>
            '<li class="wynik">' +
              '<a class="wynik__nazwa tytul" href="produkt.html">' + o.tytul + '</a>' +
              '<span class="wynik__meta mono">' + opis(o) + '</span>' +
              '<span class="wynik__alfa mono">' + (o.alfa || '—') + '</span>' +
              '<span class="wynik__aromat">' + (o.aromat || 'aromat nieopisany w katalogu') + '</span>' +
            '</li>').join('') + '</ul>' +
          (ile > trafione.length ? '<p class="wyniki__reszta mono">Pokazane pierwsze 24 z ' + ile + '.</p>' : '')
        : '<p class="wyniki__pusto">Żadna odmiana w&nbsp;magazynie nie pasuje do tej frazy.</p>');
    panel.hidden = false;
    listing.hidden = true;
    panel.querySelector('.wyniki__wyczysc').addEventListener('click', () => {
      panel.hidden = true; listing.hidden = false;
      document.querySelectorAll('input[name="aromat"]').forEach(c => { c.checked = false; });
      const f = document.querySelector('input[name="aromat-fraza"]'); if (f) f.value = '';
      history.replaceState(null, '', location.pathname);
    });
  }

  const q = new URLSearchParams(location.search).get('q');
  if (q) wczytaj().then(() => pokazWyniki(q, 'fraza'));

  // chipy aromatów: zaznaczenie rodziny szuka po jej nazwie w opisach odmian
  document.querySelectorAll('input[name="aromat"]').forEach(chip => {
    chip.addEventListener('change', () => {
      document.querySelectorAll('input[name="aromat"]').forEach(c => { if (c !== chip) c.checked = false; });
      wczytaj().then(() => pokazWyniki(chip.checked ? chip.value : '', 'rodzina'));
    });
  });

  const fraza = document.querySelector('input[name="aromat-fraza"]');
  if (fraza) {
    let t;
    fraza.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => wczytaj().then(() => pokazWyniki(fraza.value, 'aromat')), 220);
    });
  }
})();
