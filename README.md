<div align="center">

<img src="assets/og-banner.png" alt="COSMIC SURVIVORS — Kozmik Arena & Hiper-Evrim Roguelike" width="100%" />

<br />

# COSMIC SURVIVORS
### **Kozmik Arena, Dinamik Hareketli Sektörler & Hiper-Evrim Roguelike (v9.0)**

[![Hemen Oyna](https://img.shields.io/badge/HEMEN_OYNA-cosmic.haking.tr-38bdf8?style=for-the-badge)](https://cosmic.haking.tr/)
[![Evrim Ağacı](https://img.shields.io/badge/EVRIM_AGACI-tree.html-f59e0b?style=for-the-badge)](https://cosmic.haking.tr/tree.html)
[![Kozmik Wiki](https://img.shields.io/badge/KOZMIK_WIKI-wiki.html-34d399?style=for-the-badge)](https://cosmic.haking.tr/wiki.html)
[![Buy Me A Coffee](https://img.shields.io/badge/DESTEK_OL-buymeacoffee.com%2Fhaking-f59e0b?style=for-the-badge)](https://buymeacoffee.com/haking)
[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-34d399?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>PixiJS v8 WebGL Motoru • Göz Dostu Obsidian-Slate Arayüz • 8 Yıldız Gemisi • 4 Dinamik Hareketli Sektör • 19 Çapraz Evrim &amp; 6 Mega Evrim • Kalıcı Reaktör Atölyesi</strong>
</p>

</div>

---

## Genel Bakış

**COSMIC SURVIVORS (v9.0)**; web üzerinde sıfır kurulumla çalışan, WebGL2 hızlandırmalı (**PixiJS v8** + otomatik Canvas2D yedek modlu), tek oyunculu (1P) bir uzay roguelike hayatta kalma ve evrim sentez oyunudur. Göz yormayan **Obsidian-Slate** arayüz mimarisi, net telegraphed boss saldırıları ve hareketli uzay sektörleriyle uzun soluklu taktiksel oynanış sunar.

- **Donanım Hızlandırmalı Görsel Motor (`js/renderer.js`):** PixiJS v8 sprite havuzu, kesintisiz paralaks uzay arka planları (`assets/backdrops/*.jpg`), yüksek kontrastlı düşman mermileri, keskin 11px iç vuruş çekirdeği ve ayarlar menüsünden açılabilen **Göz Dostu Sakin VFX Modu**.
- **Çift Kontrol Nişan Sistemi (`[Q]` Geçişi):** Varsayılan olarak fare imlecine göre anlık yönlenen **Twin-Stick Nişan** veya tek tuşla aktifleşen **Otomatik Hedef Kilidi** (mobil cihazlarda sanal kumanda destekli).
- **Dinamik Hareketli Sektör Olayları (`js/mapEvents.js`):** Sabit arenalar yerine sürekli akan enkaz şeritleri, hız/EMP plazma akıntıları, önceden uyarı halkalı meteor yağmurları, 2 saniye lazer işaretli Dyson süpürme ışınları ve ele geçirilebilir **Overdrive Röleleri &amp; Kargo Kapsülleri**.
- **Çok Katmanlı Evrim Sentezi ($X + Y = Z \rightarrow \text{MEGA}$):** 6 evrensel + 8 gemiye özel silah (**14 Silah**), **14 Pasif Alet**, **19 Çapraz/İmza Evrimi** ve iki evrimi birleştirip fazladan silah yuvası açan **6 Kozmik Mega Evrim**.
- **Atomik Seviye Seçim Kilidi:** Seviye atlama ekranında aynı karede birden fazla tuşa basarak birden çok kart alma açığını tamamen engelleyen senkron seçim kilidi.

---

## 8 Özgün Yıldız Gemisi

| Gemi Sınıfı | Rol | Başlangıç Silahı | Özel İmza Evrimi (`X + Y = Z`) | Aktif Yetenek (`SPACE`) |
| :--- | :--- | :--- | :--- | :--- |
| **Avcı (`Interceptor`)** | Hızlı Taarruz | Çift Lazer | **Takyon Mızrağı** *(Foton Raylı Top + Hiper-İvme)* | **Warp Dash** |
| **Kruvazör (`Dreadnought`)** | Ağır Kuşatma | Ağır Plazma Topu | **Kıyamet Bataryası** *(Balistik Flak + Reaktif Zırh)* | **360° Füze Salvosu** |
| **Aegis (`Guardian`)** | Kalkan &amp; EMP | Dönen Enerji Diski | **Kutsal İyon Fırtınası** *(Tesla Prizması + Kondansatör)* | **EMP Şok Dalgası** |
| **Gölge (`Void Phantom`)** | Suikast &amp; Kritik | Kuantum Hançeri | **Hiçlik Biçicisi** *(Hiper-Uzay Tırpanı + Gölge Pelerini)* | **Gölge Sıçraması** |
| **Solar Flare (`Sunstorm`)** | Termal AoE | Alev Hattı | **Helios Güneş Kıyameti** *(Plazma Havanı + Termonükleer Kalp)* | **Güneş Patlaması** |
| **Tempest (`Cryo-Storm`)** | Kriyo-Kontrol | Çift Lazer | **Mutlak Sıfır Fırtınası** *(Kriyo-Buzul Küresi + Bobin)* | **Kriyo-Tesla Fırtınası** |
| **Valkyrie (`Carrier`)** | Drone Filosu | Füze Sürüsü | **Seraphim Drone Filosu** *(Otonom Dronelar + Nöral Ağ)* | **Railgun Overdrive** |
| **Chronos (`Weaver`)** | Zaman Bükücü | Enerji Diski | **Sonsuzluk Döngüsü** *(Zaman Yarığı + Akı Çekirdeği)* | **Zaman Durdurma** |

---

## 4 Dinamik Sektör Haritası

1. **Sektör 9 Enkazı (`sector9`):** Diyagonal sürüklenen istasyon enkaz şeritleri, parçalanabilir asteroidler ve yüksek puanlı Overdrive Röleleri.
2. **Kuantum Nebulası (`nebula`):** Gemileri hızlandıran mavi iyon akıntıları ve alan daraltan göçebe EMP fırtına hücreleri.
3. **Kara Delik Çevresi (`blackhole`):** Yörüngede dolaşan olay ufku çekim merkezi ve küçülen kırmızı halkalarla uyarı veren lav meteor yağmurları.
4. **Dyson Mega-Küre Reaktörü (`dyson`):** 2.1 saniye önceden kırmızı lazer hattıyla uyarı veren süpürme ışınları ve yoğun elit dalgaları.

---

## Modüler Proje Yapısı

```text
COSMIC/
├── index.html                  # Komuta Hangarı (Gemi Seçimi, Chart.js Telemetri, Atölye, Liderlik)
├── game.html                   # Savaş Arenası (PixiJS v8 Tuval, Çevreleyici HUD, Ayarlar, Maç Raporu)
├── tree.html                   # Evrim Laboratuvarı (Panzoom Yakınlaştırma & İnteraktif SVG Ağaç)
├── wiki.html                   # Kozmik Wiki (Filtrelenebilir Veritabanı, DPS Grafiği, Sentez Simülatörü)
├── about.html                  # Mimari, İletişim, Destek & Lisans Bilgileri
├── css/
│   ├── core.css                # Obsidian-Slate Tasarım Sistemi, Inter/Space Grotesk/JetBrains Mono
│   ├── lobby.css               # Hangar & Atölye Düzeni
│   ├── game.css                # Savaş HUD, Kart Modalları, Ayar Çekmecesi & Chart.js Raporu
│   ├── tree.css                # Evrim Laboratuvarı Stilleri
│   └── wiki.css                # Ansiklopedi & Sentez Hesaplayıcı Stilleri
├── js/
│   ├── data.js                 # Merkezi Veri & CosmicPersistence (localStorage)
│   ├── models3d.js             # PNG Tabanlı Hangar Turntable & Önizleme Motoru
│   ├── lobby.js                # Hangar, Atölye & Chart.js Gemi Radarı
│   ├── tree.js                 # Evrim Ağacı Bağlantı & Panzoom Kontrolcüsü
│   ├── wiki.js                 # Arama/Sıralama Veritabanı, DPS Grafiği & Sentez Simülatörü
│   ├── audio.js                # Howler.js Çok Kanallı SFX + Web Audio Uzay Ambiyansı
│   ├── mapEvents.js            # Dinamik Hareketli Sektör & Görev Yöneticisi
│   └── renderer.js             # PixiJS v8 WebGL + Otomatik Canvas2D Çizim Motoru
├── game.js                     # Ana Roguelike Savaş Döngüsü & Çok Fazlı Boss Yapay Zekâsı
├── leaderboard.js              # Yerel & Uzak Skor Tablosu Yöneticisi
├── vendor/                     # Çevrimdışı Çalışan Kütüphaneler (PixiJS, GSAP, Howler, Chart.js, Lucide, Panzoom)
└── assets/                     # Derlenmiş CC0 PNG Gemi/Düşman/Boss/Efekt Sprite'ları, Backdrops & OGG Sesler
```

---

## Yerelde Çalıştırma & Dağıtım

Statik dosyalar herhangi bir modern HTTP sunucusuyla doğrudan servis edilebilir (örn. `npx http-server`, `python -m http.server` veya Node statik sunucu):

```bash
git clone https://github.com/HaKING06/COSMIC.git
cd COSMIC
npx http-server -p 8080
```

Tarayıcıda `http://127.0.0.1:8080` adresini açarak doğrudan Hangar'a girebilirsiniz. Paketlenmiş tüm ön yüz kütüphaneleri `vendor/` dizininde yer aldığı için harici CDN kesintilerinden etkilenmez.

---

## Kontroller

| Giriş | Aksiyon |
| :--- | :--- |
| `W A S D` / Yön Tuşları | Gemi Yönlendirme |
| **Fare İmleci** / `[Q]` | Twin-Stick Manuel Nişan ⇄ Otomatik Hedef Kilidi |
| `SPACE` | Gemiye Özel Aktif Yetenek |
| `1` / `2` / `3` | Seviye Atlama Kartını Seçme (Atomik Tek Seçim) |
| `ESC` | Duraklatma, VFX Göz Dostu Modu & Ses Ayarları |

---

## İletişim, Destek & Lisans

- **Canlı Portal:** [cosmic.haking.tr](https://cosmic.haking.tr/)
- **Geliştirici:** Halit Güneş (`HaKING`)
- **Resmi E-Posta:** [cosmic@haking.tr](mailto:cosmic@haking.tr)
- **GitHub Deposu:** [github.com/HaKING06/COSMIC](https://github.com/HaKING06/COSMIC)
- **Projeyi Destekle:** [buymeacoffee.com/haking](https://buymeacoffee.com/haking)
- **Varlık Teşekkürü:** Uzay gemisi/efekt sprite'ları ve ses efektleri **Kenney.nl (CC0 1.0)** paketlerinden derlenmiştir.
- **Lisans:** [MIT License](LICENSE)
