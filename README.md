<div align="center">

<a href="https://cosmic.haking.tr/"><img src="assets/og-banner.png" alt="Cosmic Survivors — Ücretsiz 2 Kişilik Uzay Roguelike Arena Oyunu" width="100%"></a>

<br>

<a href="https://cosmic.haking.tr/"><img src="https://img.shields.io/badge/%E2%96%B6%20CANLI%20DEMO-cosmic.haking.tr-00f0ff?style=for-the-badge&logo=rocket&logoColor=black" alt="Canlı Demo"></a>

[![Version](https://img.shields.io/badge/s%C3%BCr%C3%BCm-v5.5_Pro-ffd700?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-00f0ff?style=flat-square)](LICENSE)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-e34f26?style=flat-square&logo=html5&logoColor=white)](#-teknik-mimari)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla_ES6+-f7df1e?style=flat-square&logo=javascript&logoColor=black)](#-teknik-mimari)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural_Synth-bf00ff?style=flat-square)](#-teknik-mimari)
[![Co-op](https://img.shields.io/badge/mod-1P_%7C_2P_Co--Op-ff006a?style=flat-square)](#-s%C4%B1n%C4%B1flar-ve-aktif-yetenekler)
[![Platform](https://img.shields.io/badge/platform-PC_%7C_Mobil-44ff44?style=flat-square)](#-kontroller)
[![Deploy](https://img.shields.io/badge/deploy-Cloudflare_Pages-f38020?style=flat-square&logo=cloudflare&logoColor=white)](#-cloudflare-pages-ile-yay%C4%B1nlama)
[![No dependencies](https://img.shields.io/badge/ba%C4%9F%C4%B1ml%C4%B1l%C4%B1k-0-success?style=flat-square)](#-kurulum)

**İndirme yok, kurulum yok — tarayıcını aç ve Sektör 9'u savun.**

</div>

---

## 🌌 Cosmic Survivors Nedir?

**Cosmic Survivors**, tamamen **HTML5 Canvas + Vanilla JavaScript + Web Audio API** ile yazılmış, harici motor, kütüphane ya da ses dosyası kullanmayan yüksek tempolu bir **uzay roguelike / bullet-heaven arena** oyunudur. Tek başına ya da aynı klavyede **2 kişilik co-op** olarak dalga dalga gelen parazit filolarını yok eder, seviye atladıkça hologram kartlarla gemini geliştirir, **aktif yeteneğini** doğru anda tetikler ve her 5 dalgada bir ortaya çıkan devasa **boss'ları** devirirsin.

> *"Yıl 2284. Kozmik parazit istilası altındaki Sektör 9 hayatta kalma simülasyonuna bağlantı kuruluyor. Dönüşü olmayan bir hata yolundayız..."*

## ✨ v5.5 Pro ile Gelenler

| | Yenilik |
| :-: | :-- |
| ✦ | **Aktif yetenek sistemi** — Avcı: *Warp Dash*, Kruvazör: *Mikro Füze Salvosu*, Destek: *EMP Şok Dalgası* |
| 🎆 | **Görsel efekt paketi** — neon motor itki partikülleri, yanıp sönen gövde ışıkları, kalkan darbe halkaları, mermi kıvılcımları, parçalanan düşman kıymıkları |
| 💥 | Neon **`CRIT!`** vuruş yazıları, geliştirilmiş ekran sarsıntısı ve düşman çekirdek/yörünge ışıkları |
| 🧊 | **Glassmorphism** menü ve HUD, neon kenarlıklar, **hologram efektli** seviye atlama kartları |
| 📱 | Mobil **yetenek butonu** (dolum halkalı) ve tam ekran PWA tanımları |
| 🔎 | Tam **SEO paketi**: Open Graph, Twitter Card, JSON-LD (`VideoGame`), manifest, sitemap, robots |

## 🛸 Sınıflar ve Aktif Yetenekler

| Sınıf | Can | Kalkan | Hız | Pasif | Aktif Yetenek | Bekleme |
| :-- | :-: | :-: | :-: | :-- | :-- | :-: |
| ⚡ **Avcı** *(Interceptor)* | 85 | 30 | 300 | %15 kritik şansı, en çevik gemi | **Warp Dash** — 1.2 sn dokunulmaz taklayla ileri fırlar, arkasında hasar veren lazer hattı bırakır | 8 sn |
| 🛡️ **Kruvazör** *(Dreadnought)* | 145 | 45 | 210 | Gelen hasarı %15 azaltır, çift namlu | **Mikro Füze Salvosu** — 3 sn boyunca her yöne (360°) güdümsüz mikro füze yağdırır | 11 sn |
| 🌀 **Destek** *(Aegis)* | 100 | 60 | 255 | Kalkan yenilenmesi +%50, 2P lazer bağı menzili ×1.8 | **EMP Şok Dalgası** — ekrandaki tüm düşman mermilerini siler ve kalkan enerjisine çevirir | 12 sn |

Silahlar en yakın düşmana **otomatik nişan alır ve ateş eder**; sen hareket ve yetenek zamanlamasına odaklanırsın.

## 🎮 Kontroller

| Eylem | Pilot 1 | Pilot 2 |
| :-- | :-: | :-: |
| Hareket | `W` `A` `S` `D` | `↑` `←` `↓` `→` |
| **Aktif yetenek** | `SPACE` | `ENTER` |
| Seviye kartı seç *(2 sn basılı tut)* | `A` / `W` / `D` | `←` / `↑` / `→` |
| Duraklat / Terminal | `ESC` | `ESC` |

**Mobil:** ekrana dokun → sanal joystick belirir · sağ alttaki halka buton → aktif yetenek · sağ üst `⏸` → duraklat.

## 🔗 2P Sinerjik Lazer Bağı

İki pilot yakın uçtuğunda aralarında plazma bağı kurulur: bağın içinden geçen düşmanlar sürekli hasar alır (mesafe azaldıkça **1×→3×**), kalkan yenilenmesi **+%40** artar. Bağı bir boss'a **1.2 sn** değdirmek **Aşırı Yüklenme Detonasyonu** tetikler (120 kritik hasar + şok dalgası). Destek (Aegis) sınıfı bağ menzilini **500 → 900 px** yapar.

## 🃏 Roguelike Kart Sistemi

Her seviye atlayışta oyun durur ve **3 hologram kart** sunulur — fareyle tıkla ya da atanmış tuşu 2 sn basılı tut.

- **9 yetenek:** Hasar+, Hız+, Ateş Hızı+, Can+, Kalkan+, Menzil+, Çoklu Atış, Vampir, Kritik+
- **Nadirlik:** Sıradan %50 · Seçkin %30 (+%30) · Destansı %15 (+%70) · **Efsanevi %5 (+%150)**
- Her **5. seviyede** garanti efsanevi kart; **boss ödüllerinde** 2 garanti efsanevi kart + tam can/kalkan.

## 👾 Düşmanlar ve Boss'lar

**12 düşman türü** dalgalara göre açılır: Drone, Speeder (1) · Tank (3) · Orbiter (4) · Shooter (5) · Kamikaze (6) · Splitter (7) · **Kan Sifonu / Healer (8)** · Shielder (10) · Void Phantom (11) · Sniper (12) · Sweeper Lazer (14).

Her **5 dalgada** bir boss gelir ve oyuncu gücüne göre ölçeklenir:

| Boss | Mekanik |
| :-- | :-- |
| 🔴 **Void Phantom** | Hedefe kilitlenip 4.5× hızla hücum eder, yanlara mermi bırakır |
| 🟣 **Nova Blaster** | Sonsuzluk (∞) yörüngesinde spiral mermi fırtınası ve halka salvoları |
| 🔵 **Entropy Star** | Yerçekimiyle oyuncuları çeker, patlayan `DANGER` bölgeleri bırakır |

Canı %35'in altına düşünce **Faz 2 (Enrage)** başlar. Dalga 15+ ve 25+'te aynı anda 2–3 boss gelir.

## ⚖️ Zorluk

| | 🟢 Kolay | 🟡 Orta | 🔴 Zor |
| :-- | :-: | :-: | :-: |
| Düşman can / hız / hasar | 0.75× / 0.75× / 0.65× | 1.05× / 1× / 1× | 1.85× / 1.45× / 1.85× |
| Skor çarpanı | 0.8× | 1× | 1.7× |
| 2P yeniden doğuş | 5 sn, ceza yok | 7 sn, −2 seviye ve 2 kart kaybı | 10 sn, tam sıfırlama |

## 🛠️ Teknik Mimari

- **Sıfır bağımlılık:** derleme adımı yok; yalnızca statik dosyalar.
- **Prosedürel ses:** müzik ve tüm SFX, Web Audio API osilatörleri + `BiquadFilter` ile gerçek zamanlı üretilir.
- **Yerçekimsel ızgara bükülmesi:** arka plan ızgarası gemi, boss ve şok dalgalarına göre bükülür.
- **Performans:** AABB + karesel mesafe çarpışma, `lighter` bileşimli mermi glow'u, DOM önbellekli boss barları, **60 FPS modu** (parçacık/gradyan azaltma).
- **Liderlik tablosu:** `localStorage` + Dreamlo bulut API (`leaderboard.js`).
- **PWA tanımları:** `manifest.webmanifest`, tema rengi, tam ekran/yatay yönelim.

```
COSMIC/
├── index.html            # Menü, gemi/zorluk seçimi, liderlik tablosu, bilgi bankası
├── intro.html            # Hangar biniş protokolü (warp sekansı)
├── game.html             # Arena arayüzü (HUD, kartlar, duraklatma terminali)
├── game.js               # Oyun motoru (fizik, AI, yetenekler, ses, efektler)
├── leaderboard.js        # Yerel + küresel skor servisi
├── manifest.webmanifest  # PWA manifest
├── robots.txt · sitemap.xml · _headers
└── assets/               # logo.svg · favicon.svg · og-banner.svg/png · icon-192/512.png
```

## 🚀 Kurulum

```bash
git clone https://github.com/HaKING06/COSMIC.git
cd COSMIC

# Herhangi bir statik sunucu yeterli:
python -m http.server 8080      # veya: npx serve .
```

Ardından tarayıcıda `http://localhost:8080` adresini aç. (`index.html`'e çift tıklamak da çalışır; küresel skor tablosu için sunucu önerilir.)

## ☁️ Cloudflare Pages ile Yayınlama

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** ve bu depoyu seç.
2. **Build command:** *(boş)* · **Build output directory:** `/`
3. Deploy sonrası **Custom domains** bölümünden `cosmic.haking.tr` alan adını bağla.

`_headers`, `robots.txt` ve `sitemap.xml` otomatik olarak yayınlanır.

## 📄 Lisans

[MIT License](LICENSE) © 2026 **Halit Güneş (HaKING)**

<div align="center">

**Sektör 9'da iyi avlar, pilot!** 🛸

[▶ Hemen Oyna — cosmic.haking.tr](https://cosmic.haking.tr/)

</div>
