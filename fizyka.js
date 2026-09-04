/* HOPit — sypiące się szyszki chmielu w sekcji kontraktu.
   Bez biblioteki: grawitacja, podłoga, zderzenia par, łapanie kursorem.
   Startuje, gdy sekcja wejdzie w kadr. */
(function () {
  var plotno = document.querySelector('.fizyka');
  if (!plotno) return;

  var sekcja = plotno.closest('section') || plotno.parentElement;
  var mniej = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = plotno.getContext('2d');
  var szyszki = [];
  var MAKS = 92;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var szer = 0, wys = 0;
  var ODBICIE = 0.22;      // sprężystość zderzenia szyszka o szyszkę
  var MAKS_V = 22;         // górna granica prędkości, inaczej stos się rozpędza

  // szyszki wycięte ze zdjęcia; dopóki się nie wczytają, rysujemy kształt zastępczy
  var obrazki = [];
  for (var g = 1; g <= 7; g++) {
    (function (n) {
      var img = new Image();
      img.onload = function () { obrazki.push(img); };
      img.src = 'media/szyszki/szyszka-0' + n + '.png';
    })(g);
  }

  function wymiary() {
    var r = plotno.getBoundingClientRect();
    szer = r.width; wys = r.height;
    plotno.width = Math.round(szer * dpr);
    plotno.height = Math.round(wys * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function nowa(odGory) {
    var p = 14 + Math.random() * 7;
    return {
      x: 20 + Math.random() * Math.max(szer - 40, 10),
      y: odGory ? -40 - Math.random() * 300 : wys - 60 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 0.6,
      vy: Math.random() * 0.5,
      p: p,
      dl: p * (1.9 + Math.random() * 1.1),
      obrot: Math.random() * Math.PI,
      vobrot: (Math.random() - 0.5) * 0.05,
      naDole: false,
      spokoj: 0,
      spi: false,
      nr: Math.random()
    };
  }

  var trzymana = null, myszX = 0, myszY = 0, poprzX = 0, poprzY = 0;

  function krok() {
    for (var i = 0; i < szyszki.length; i++) {
      var a = szyszki[i];
      if (a === trzymana) {
        a.vx = Math.max(-MAKS_V, Math.min(MAKS_V, myszX - poprzX));
        a.vy = Math.max(-MAKS_V, Math.min(MAKS_V, myszY - poprzY));
        a.x = myszX; a.y = myszY;
        a.obrot += a.vx * 0.01;
        continue;
      }
      if (a.spi) continue;                    // wygaszona, nie liczymy jej ruchu

      a.vy += 0.26;
      a.x += a.vx; a.y += a.vy;
      a.obrot += a.vobrot;
      a.vx *= 0.995;
      a.vobrot *= 0.94;                       // sam z siebie wytraca obrót

      if (a.y + a.p > wys) {
        a.y = wys - a.p; a.vy *= -0.12; a.vx *= 0.66;
        // na podłodze szyszka się toczy, a nie kręci w miejscu
        a.vobrot = a.vobrot * 0.3 + (a.vx / a.p) * 0.45;
        a.naDole = true;
      } else if (a.y + a.p < wys - 2) {
        a.naDole = false;
      }
      if (a.x - a.p < 0) { a.x = a.p; a.vx *= -0.4; }
      if (a.x + a.p > szer) { a.x = szer - a.p; a.vx *= -0.4; }

      // gdy przestaje się ruszać, kładzie się płasko zamiast stać na sztorc
      if (a.naDole && Math.abs(a.vx) < 0.35 && Math.abs(a.vy) < 0.6) {
        var pol = Math.PI;
        var docel = Math.round(a.obrot / pol) * pol;
        a.vobrot += (docel - a.obrot) * 0.035;
        a.vobrot *= 0.72;
      }
      if (a.vobrot > 0.12) a.vobrot = 0.12;
      if (a.vobrot < -0.12) a.vobrot = -0.12;

      // wygaszanie: po chwili bez ruchu szyszka zasypia i przestaje drgać
      if (Math.abs(a.vx) < 0.22 && Math.abs(a.vy) < 0.42 && Math.abs(a.vobrot) < 0.02) {
        if (++a.spokoj > 34) { a.spi = true; a.vx = a.vy = a.vobrot = 0; }
      } else {
        a.spokoj = 0;
      }
    }

    // zderzenia par: rozepchnięcie plus wymiana pędu wzdłuż normalnej
    for (var przebieg = 0; przebieg < 2; przebieg++) {
      for (var m = 0; m < szyszki.length; m++) {
        for (var n = m + 1; n < szyszki.length; n++) {
          var b = szyszki[m], c = szyszki[n];
          var dx = c.x - b.x, dy = c.y - b.y;
          var d2 = dx * dx + dy * dy;
          var min = (b.p + c.p) * 1.02;
          if (d2 <= 0 || d2 >= min * min) continue;

          var d = Math.sqrt(d2);
          var nx = dx / d, ny = dy / d;
          var wolneB = b !== trzymana, wolneC = c !== trzymana;
          var zach = (min - d) * 0.55 / (wolneB && wolneC ? 2 : 1);
          if (wolneB) { b.x -= nx * zach; b.y -= ny * zach; }
          if (wolneC) { c.x += nx * zach; c.y += ny * zach; }
          // głębokie wejście w siebie budzi obie; samo muśnięcie nie
          if (min - d > 1.6) {
            if (wolneB) { b.spi = false; b.spokoj = 0; }
            if (wolneC) { c.spi = false; c.spokoj = 0; }
          }

          // impuls tylko w pierwszym przebiegu; liczony dwa razy dokładałby energii
          if (przebieg === 0) {
            var wzgl = (c.vx - b.vx) * nx + (c.vy - b.vy) * ny;
            if (wzgl < 0) {
              var imp = -(1 + ODBICIE) * wzgl / 2;
              if (wolneB) { b.vx -= imp * nx; b.vy -= imp * ny; }
              if (wolneC) { c.vx += imp * nx; c.vy += imp * ny; }
            }
          }
        }
      }
    }
    // hamulec: bez niego stos rozpycha się w nieskończoność i szyszki dostają turbo
    for (var t = 0; t < szyszki.length; t++) {
      var z = szyszki[t];
      if (z === trzymana) continue;
      var v2 = z.vx * z.vx + z.vy * z.vy;
      if (v2 > MAKS_V * MAKS_V) {
        var sk = MAKS_V / Math.sqrt(v2);
        z.vx *= sk; z.vy *= sk;
      }
    }
    poprzX = myszX; poprzY = myszY;
  }

  function rysuj() {
    ctx.clearRect(0, 0, szer, wys);
    for (var i = 0; i < szyszki.length; i++) {
      var a = szyszki[i];
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.obrot);
      if (obrazki.length) {
        var img = obrazki[(a.nr * obrazki.length) | 0];
        var bok = a.p * 3.4;
        var wys2 = bok * (img.height / img.width);
        ctx.drawImage(img, -bok / 2, -wys2 / 2, bok, wys2);
      } else {
        ctx.fillStyle = '#8E9445';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-a.p, -a.dl / 2, a.p * 2, a.dl, a.p);
        else ctx.ellipse(0, 0, a.p, a.dl / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* Łapanie kursorem. Kanwa ma pointer-events:none, żeby nie zasłaniać przycisków,
     więc nasłuchujemy na sekcji i sami sprawdzamy, czy kursor trafił w szyszkę. */
  function wzgledem(e) {
    var r = plotno.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function trafiona(x, y) {
    for (var i = szyszki.length - 1; i >= 0; i--) {
      var a = szyszki[i], dx = x - a.x, dy = y - a.y;
      if (dx * dx + dy * dy < (a.p * 1.7) * (a.p * 1.7)) return a;
    }
    return null;
  }
  sekcja.addEventListener('pointerdown', function (e) {
    if (!szyszki.length) return;
    var pkt = wzgledem(e);
    if (pkt.x < 0 || pkt.y < 0 || pkt.x > szer || pkt.y > wys) return;
    var a = trafiona(pkt.x, pkt.y);
    if (!a) return;
    trzymana = a;
    a.spi = false; a.spokoj = 0;
    myszX = poprzX = pkt.x; myszY = poprzY = pkt.y;
    plotno.style.cursor = 'grabbing';
    e.preventDefault();
  });
  addEventListener('pointermove', function (e) {
    if (!trzymana) return;
    var pkt = wzgledem(e);
    myszX = Math.max(trzymana.p, Math.min(szer - trzymana.p, pkt.x));
    myszY = Math.min(wys - trzymana.p, pkt.y);
  }, { passive: true });
  function pusc() {
    if (!trzymana) return;
    trzymana.vx *= 1.15; trzymana.vy *= 1.15;
    trzymana = null;
    plotno.style.cursor = '';
  }
  addEventListener('pointerup', pusc);
  addEventListener('pointercancel', pusc);

  var dziala = false, odKlatki = 0;
  function petla() {
    if (szyszki.length < MAKS && ++odKlatki % 4 === 0) szyszki.push(nowa(true));
    krok(); rysuj();
    if (dziala) requestAnimationFrame(petla);
  }

  function start() {
    if (dziala) return;
    wymiary();
    dziala = true;
    if (mniej) {
      for (var i = 0; i < 80; i++) szyszki.push(nowa(false));
      for (var k = 0; k < 240; k++) krok();
      rysuj();
      dziala = false;
      return;
    }
    requestAnimationFrame(petla);
  }

  wymiary();
  addEventListener('load', wymiary);
  addEventListener('resize', wymiary, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(wymiary).observe(plotno);

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { if (w.isIntersecting) { start(); obs.disconnect(); } });
    }, { threshold: 0.25 });
    obs.observe(plotno);
  } else {
    start();
  }
})();
