# HOPit: sklep internetowy, prototyp

Statyczny prototyp sklepu dla HOPit S.C. (chmiel, drożdże i oleje chmielowe
dla browarów). Sześć stron, bez frameworka i bez procesu budowania: HTML, jeden
arkusz CSS i kilka niewielkich plików JavaScript.

## Podgląd lokalny

```bash
python3 -m http.server 8000
```

Potem `http://localhost:8000/index.html`.

## Mapa stron

| Plik | Co pokazuje |
|---|---|
| `index.html` | strona główna: hero z wideo, polecane produkty, opinie browarów, kategorie, strefa B2B, zespół |
| `sklep.html` | listing kategorii z filtrami i paginacją |
| `produkt.html` | karta produktu (przykład: Nectaron) |
| `b2b.html` | strefa B2B: kontrakt, przebieg współpracy, formularz |
| `koszyk.html` | koszyk |
| `kontakt.html` | dane kontaktowe i formularz |

## Struktura katalogów

```
assets/        zdjęcia produktowe i tła
media/         wideo hero, portrety zespołu, ikony, wycięte szyszki do animacji
styleguide/    tokeny, komponenty i fonty (design.css importuje stąd wartości)
design.css     jedyny arkusz stron
fizyka.js      animacja opadających szyszek w sekcji B2B
slajdy.js      przełączanie slajdów w sekcji kategorii
opinie.js      karuzela opinii
produkt.js     obsługa karty produktu
koszyk.js      obsługa koszyka
```

**Wartości kolorów, typografii i rytmu żyją w `styleguide/tokens.css`.**
Poprawka wchodzi tam, nie w `design.css` i nie w pojedynczej sekcji.

## Uwagi do wdrożenia

Prototyp jest wierny wizualnie, ale nie jest sklepem: nie ma backendu, koszyk
i formularze nie wysyłają danych, paginacja i filtry nie filtrują.

**Dwa odnośniki prowadzą do stron, których jeszcze nie ma.** W pierwszym ekranie
stoją „O nas” i „Nasi Dostawcy”, zamówione przez klienta w rundzie uwag z 29.08.2026.
Strony nie zostały jeszcze zaprojektowane, więc odnośniki kończą się błędem 404.

**Czego brakuje ze strony klienta.** Miejsca oznaczone przerywaną ramką czekają
na treść i są widoczne wprost na stronach:

- `b2b.html`: opisy trzech kroków współpracy oraz warunki B2B: progi ilościowe,
  rabaty, terminy płatności i dostaw
- `koszyk.html`: cennik dostaw
- `sklep.html`: kraj pochodzenia przy każdej odmianie (potrzebny do flag na kartach)
- liczba odmian w magazynie
- parametry odmian: alfa-kwasy, olejki i profile aromatyczne ma na razie tylko
  Nectaron; katalog PDF od klienta jest skanem bez warstwy tekstowej
- zdjęcie granulatu osobno dla każdej odmiany; teraz krąży kilka ujęć, więc
  zdjęcia się powtarzają

**Zdjęcia.** Fotografie produktowe i reportażowe są wygenerowane i wymagają
akceptacji klienta przed publikacją. Portrety zespołu pochodzą z obecnej strony
klienta i są prywatnymi zdjęciami trzech osób.

**Ceny i nazwy odmian** pochodzą z listy sklepowej klienta.

**Dostępność.** Kontrasty kolorów są mierzone i opisane w `styleguide/`.
Animacje respektują `prefers-reduced-motion`.
