# HOPit: sklep internetowy, prototyp

Statyczny prototyp sklepu dla HOPit S.C. (chmiel, drożdże i oleje chmielowe
dla browarów). Osiem stron, bez frameworka i bez procesu budowania: HTML, jeden
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
| `o-nas.html` | filary marki, liczby, odnośnik do zespołu |
| `dostawcy.html` | dziewięciu producentów i siedem krajów pochodzenia |
| `sklep.html` | listing z filtrami, sortowaniem i paginacją |
| `produkt.html` | karta produktu (przykład: Nectaron) |
| `b2b.html` | strefa B2B: kontrakt, przebieg współpracy, formularz |
| `koszyk.html` | koszyk |
| `kontakt.html` | dane kontaktowe i formularz |

## Struktura katalogów

```
assets/        zdjęcia produktowe i tła
assets/klient/ zdjęcia produktów pobrane ze sklepu klienta
media/         wideo hero, logotyp, portrety zespołu, ikony, szyszki do animacji
styleguide/    tokeny, komponenty i fonty (design.css importuje stąd wartości)
dane/          odmiany.json: parametry odmian zebrane z obecnego sklepu klienta
design.css     jedyny arkusz stron
fizyka.js      animacja opadających szyszek w sekcji B2B
slajdy.js      przełączanie slajdów w sekcji kategorii
opinie.js      karuzela opinii
produkt.js     obsługa karty produktu
koszyk.js      obsługa koszyka
```

**Wartości kolorów, typografii i rytmu żyją w `styleguide/tokens.css`.**
Poprawka wchodzi tam, nie w `design.css` i nie w pojedynczej sekcji.

## Dane odmian

`dane/odmiany.json` zawiera rekordy zebrane z obecnego sklepu hopit.pl: nazwę, kraj
pochodzenia, alfa-kwasy, beta-kwasy, kohumulon, olejki, zastosowanie, aromat, rocznik
i adres zdjęcia. To źródło dla flag na listingu, liczników w filtrach i tabeli na
karcie produktu. Przy wdrożeniu należy je zastąpić importem z systemu sklepu.

## Uwagi do wdrożenia

Prototyp jest wierny wizualnie, ale nie jest sklepem: nie ma backendu, koszyk
i formularze nie wysyłają danych, filtry i sortowanie są interfejsem bez logiki.

**Czego brakuje ze strony klienta.** Miejsca oznaczone przerywaną ramką czekają
na treść i są widoczne wprost na stronach:

- `o-nas.html`: treść z ulotki, w tym zdanie o stażu firmy
- `dostawcy.html`: logo i opis współpracy dla każdego z dziewięciu producentów
- `b2b.html`: opisy trzech kroków współpracy oraz warunki B2B: progi ilościowe,
  rabaty, terminy płatności i dostaw
- `koszyk.html`: cennik dostaw
- zdjęcie granulatu osobno dla każdej odmiany; obecny sklep klienta używa
  kilkunastu zdjęć dla stu kilkudziesięciu odmian, więc też ich nie ma

**Zdjęcia.** Fotografie reportażowe są wygenerowane i wymagają akceptacji klienta
przed publikacją. Portrety zespołu pochodzą z obecnej strony klienta i są
prywatnymi zdjęciami. Zdjęcia produktów w `assets/klient/` pochodzą ze sklepu klienta.

**Ceny i nazwy** pochodzą ze sklepu klienta.

**Dostępność.** Kontrasty kolorów są mierzone i opisane w `styleguide/`.
Animacje respektują `prefers-reduced-motion`.
