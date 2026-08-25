# Hotel Basana — poznámky k nasazení (Phase 2)

## Co je hotové
- Vanilla HTML/CSS/JS, žádný framework, žádný build krok — nahrát na hosting tak, jak je.
- Zamčeno na finální "Ivory" theme (dev přepínač variant odstraněn).
- Funkční přepínač jazyků AL/EN (`js/i18n.js` + `js/script.js`) — texty se mění bez reloadu, `<html lang>` se aktualizuje, volba se pamatuje v localStorage. Albánský překlad je strojový (z EN) — doporučuji nechat před spuštěním zkontrolovat rodilým mluvčím.
- Kontaktní formulář (`send-request.php`) — server-side validace, honeypot proti spamu, odesílá e-mail na `info@hotelbesana.al` přes PHP `mail()`. Frontend posílá AJAX (fetch) a zobrazuje přeložený stavový text.
- WhatsApp float tlačítko a odkazy na `+355 69 552 0312`.
- Google Maps embed (souřadnice 41.095605430808845, 19.458825603533537, zoom 19) + odkaz "Get Directions".
- SEO: meta description, Open Graph, Twitter Card, JSON-LD `Hotel` schema, `robots.txt`, `sitemap.xml`.
- Accessibility: skip-to-content odkaz, `aria-current` na aktivní sekci v menu, viditelný focus-ring, `aria-live` stavová hláška formuláře, honeypot pole skryté jen vizuálně (ne `display:none`) a vyloučené z tab-order.

## Co musíš doplnit/ověřit před spuštěním
1. **Doména** — v `index.html` je canonical/OG/JSON-LD URL nastavena na `https://www.hotelbesana.al/` jako odhad podle e-mailové domény. Uprav na skutečnou doménu, jakmile ji budeš mít.
2. **PHP mail()** — na sdíleném hostingu obvykle funguje rovnou. Pokud e-maily nechodí (časté u některých hostingů kvůli SPF/DKIM), buď nastav `sendmail_path` v php.ini, nebo v `send-request.php` nahraď `mail()` za SMTP (např. PHPMailer) — dej vědět, můžu to doplnit.
3. **Albánský překlad** — zkontroluj `js/i18n.js`, klíč `al`, ideálně s rodilým mluvčím.
4. **GPS/adresa** — ověř souřadnice na mapě, než půjde web ostro.
5. Zbylé "placeholder" poznámky v textu (velikosti pokojů, vzdálenosti k atrakcím v sekci Destination) — vlastní tvůj text, nevymýšlel jsem fakta, uprav až budeš mít čísla.

## Struktura
```
index.html
send-request.php
robots.txt
sitemap.xml
css/style.css
js/script.js       — nav, scroll-reveal, mobilní menu, AJAX formulář
js/i18n.js          — AL/EN slovníky
images/...
```
