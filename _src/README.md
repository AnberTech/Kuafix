# Kuafix sitesi: kaynak dosyalar

Site `python3 _src/build.py` ile üretilir (depo kökünden). Üretilen HTML dosyaları elle düzenlenmez; değişiklik buradaki kaynaklarda yapılıp script yeniden çalıştırılır.

| Dosya | Ne işe yarar |
|---|---|
| `build.py` | Her dil için ana sayfa, 3 rehber sayfası, 4 yasal sayfa, `sitemap.xml` ve `llms.txt` üretir; çevirileri denetler |
| `home.html` | Ana sayfanın gövdesi (eski tek sayfalık neon tasarım), `{{{anahtar}}}` yer tutucularıyla |
| `i18n/<dil>.json` | Sayfa metinleri. Kaynak `en.json`; diğer diller onunla aynı anahtar ve liste yapısında olmalı |
| `legal/<dil>.json` | Gizlilik, kullanım koşulları, hesap silme, destek. **Bağlayıcı metin `tr.json`**; çeviriler aynı HTML etiketlerini korur ve "bağlayıcı metin Türkçedir" notunu taşır |
| `og.html` | Paylaşım görseli `assets/img/og.jpg` (Chrome ile 1200x630 ekran görüntüsü alınıp JPEG'e çevrilir) |

Stil ve kod: `assets/site.css`, `assets/site.js` (bütün sayfalarda ortak).

## Kurallar
- Uygulama yalnızca Türkçedir. Türkçe dışındaki her sayfada `lang_note` bunu açıkça söyler; kaldırılmamalı.
- Türkçe sayfaların adresleri (`index.html`, `privacy.html`, `terms.html`, `delete.html`, `support.html`) App Store ve Google Play'de kayıtlı; değiştirilmez.
- Fiyatlar kullanım koşullarındaki fiyatlardır (`legal/tr.json` > terms_body). Fiyat değişirse önce orası, sonra `i18n/*.json` içindeki `price_items`, `faq_home`, `*_faq` ve `build.py` içindeki `app_ld` / `build_llms` güncellenir.
- Yeni dil: `i18n/<dil>.json` ve `legal/<dil>.json` ekleyip `build.py` içindeki `LANGS` listesine satır ekleyin.
- Jekyll `_` ile başlayan klasörleri yayınlamaz; `_src` sitede görünmez.
