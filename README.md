<div align="center">

<img src="assets/og-banner.png" alt="COSMIC SURVIVORS — Kozmik Arena & Hiper-Evrim Roguelike Banner" width="100%" />

<br />

# 🌌 COSMIC SURVIVORS
### **KOZMİK ARENA & HİPER-EVRİM ROGUELIKE (v7.0)**

[![Canlı Oyna](https://img.shields.io/badge/🎮_HEMEN_OYNA-cosmic.haking.tr-00f0ff?style=for-the-badge&logo=rocket&logoColor=03030a)](https://cosmic.haking.tr/)
[![Evrim Ağacı](https://img.shields.io/badge/⚡_EVRİM_AĞACI-tree.html-ffcc00?style=for-the-badge)](https://cosmic.haking.tr/tree.html)
[![Kozmik Wiki](https://img.shields.io/badge/📚_KOZMİK_WİKİ-wiki.html-00ff88?style=for-the-badge)](https://cosmic.haking.tr/wiki.html)
[![Sektör 9 Arşivi](https://img.shields.io/badge/📖_SEKTÖR_9_ARŞİVİ-about.html-b537f2?style=for-the-badge)](https://cosmic.haking.tr/about.html)
[![Buy Me A Coffee](https://img.shields.io/badge/☕_DESTEK_OL-buymeacoffee.com%2Fhaking-ffcc00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/haking)
[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-00ff88?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Sıfır Bağımlılık • Saf HTML5 Canvas & Web Audio API • 5 Özgün Gemi & İmza Kök Ağaçları • 3 Dinamik Harita • 4 Silah + 4 Alet Slotu • 12 Çapraz Evrim ($X+Y=Z$) & 6 Kozmik Mega Evrim ($Z+N=\text{MEGA}$) • Elit Mini-Boss & Kozmik Sandık</strong>
</p>

---

### 🚀 **[⚡ CANLI SİMÜLASYONU BAŞLAT — https://cosmic.haking.tr/](https://cosmic.haking.tr/)**
### 📚 **[🧠 KOZMİK WİKİ & TAKTİK REHBERİ — https://cosmic.haking.tr/wiki.html](https://cosmic.haking.tr/wiki.html)**
### ☕ **[💛 PROJEYİ DESTEKLE — https://buymeacoffee.com/haking](https://buymeacoffee.com/haking)**
### 📩 **Resmi İletişim: [cosmic@haking.tr](mailto:cosmic@haking.tr)**

</div>

---

## 📖 Genel Bakış

**COSMIC SURVIVORS — Kozmik Arena & Hiper-Evrim Roguelike**, herhangi bir harici oyun motoru, kütüphane veya ses/görsel dosyası kullanmadan; tamamen **Vanilla JavaScript (ES6+)**, **HTML5 Canvas 2D** ve **Prosedürel Web Audio API** ile sıfırdan inşa edilmiş tek oyunculu (**1P**) bir **Kozmik Arena & Hiper-Evrim Roguelike** web oyunudur.

Yıl **2384**. **Sektör 9**'da açılan hiper-uzay yarığından akan biyomekanik **Kozmik Parazit** sürülerine karşı 5 farklı yıldız gemisinden birini seçin, geminize özel **2 İmza Kök Yeteneğini (Signature Nodes)** açın, **3 farklı çevresel anomali haritasında** hayatta kalın, **4 Silah Slotu** ve **4 Alet (Trinket) Slotu**nu çapraz matrisle birleştirerek **12 Çapraz Evrim ($X+Y=Z$)** ve **6 Kozmik Mega Evrim ($Z+N=\text{MEGA}$)** sentezleyin!

---

## ✨ v7.0 Mimari & Sistem Özellikleri

- 🎨 **Özgün Cosmic Survivors Marka Kimliği & %75 Ferah Ekran Ölçeği:** Tüm arayüz (`index.html`, `game.html`, `tree.html`, `wiki.html`, `about.html`) tarayıcı %100 yakınlaştırmadayken bile **%75 ölçek (`html { font-size: 75%; }` ve kompakt `clamp()` birimleri)** ferahlığında, **sıfır dikey kaydırma (`100vh`)** ile tek ekrana tam oturacak şekilde tasarlandı.
- 🛡️ **Atomik Kart Kilidi & Bellek/Ses Optimizasyonu:** Seviye atlama ekranında aynı karede çoklu tuş basımını engelleyen senkron `isLevelingUp` atomik kilidi, Web Audio API üzerinde eşzamanlı osilatör sınırlayıcısı ve Dalga 30+ için partikül/iz bellek havuzu üst limiti entegre edildi.
- 🌿 **Karaktere Özel İmza Kök Ağaçları & Çapraz Füzyon Matrisi:** Her geminin yalnızca kendi havuzunda açılan **1 Özel Kök Silahı + 1 Özel Kök Aleti** bulunur. Silahlar iki farklı aletle birleşerek farklı evrimlere ($Silah_A + Alet_B = Evrim_1$ veya $Silah_A + Alet_C = Evrim_2$) dallanabilir.
- 📚 **Kapsamlı Kozmik Wiki (`wiki.html`):** Harita × Gemi Sinerji Matrisi, En Güçlü 5 Meta Build & Dalga Zamanlama Rehberi ve *Oblivion Behemoth* arka reaktör zayıf nokta (`2.0x Hasar`) taktiklerini içeren oyun içi strateji ansiklopedisi.
- 🎲 **Reroll (2x) & Skip (1x) + Elit Mini-Boss & Kozmik Sandık:** Her 3 dalgada bir beliren **Elit Mini-Boss** ve düşürdüğü altın **Kozmik Şans Sandığı** ile hazır evrimleri anında ücretsiz sentezleme imkanı.

---

## 🛸 5 Özgün Yıldız Gemisi & İmza Kök Yetenekleri

| Gemi Sınıfı | Başlangıç Silahı | Özel Kök Silahı & Aleti (Signature Nodes) | Pasif Gövde Avantajı | Aktif Yetenek (`SPACE`) |
| :--- | :--- | :--- | :--- | :--- |
| **⚡ Avcı (`Interceptor`)** | **Çift Lazer** | **Foton Mızrağı** (`photonLance`) + **Hiper-Sürücü** (`hyperDrive`) | **+%20 Hız, +%15 Kritik** | **Warp Dash:** 1.2 sn dokunulmaz takla ve lazer izi |
| **🛡️ Kruvazör (`Dreadnought`)** | **Ağır Plazma Topu** | **Kuşatma Havanı** (`siegeMortar`) + **Reaktif Zırh** (`reactivePlate`) | **+%30 Zırh, -%10 Hız** | **Mikro Füze Salvosu:** 3 sn boyunca 360° füze yağmuru |
| **💠 Aegis (`Shield Guardian`)** | **Dönen Enerji Diski** | **Prizma Küresi** (`prismOrb`) + **Kapasitör Çekirdeği** (`capacitorCore`) | **Otomatik Kalkan Patlaması** (8 sn) | **EMP Şok Dalgası:** Tüm mermileri siler ve kalkana çevirir |
| **👻 Gölge (`Void Phantom`)** | **Kuantum Hançeri** | **Hiper-Faz Tırpanı** (`phaseScythe`) + **Hiper-Pelerin** (`cloakModule`) | **10 sn'de bir 1.5 sn Görünmezlik + %65 Suikast** | **Gölge Sıçraması:** İmlece ışınlanır ve 8'li hançer saçar |
| **☀️ Solar Flare (`Sunstorm`)** | **Alev Hattı** | **Güneş Havanı** (`solarFlareGun`) + **Korona Çekirdeği** (`coronaCore`) | **Termal Radyasyon Aurası** | **Güneş Patlaması:** Ekran çapında korona patlaması |

---

## 🗺️ 3 Gerçek Savaş Haritası & Çevresel Anomaliler

| Harita | Çevresel Mekanik & Anomaliler | En Avantajlı Gemi Sinerjileri |
| :--- | :--- | :--- |
| **1. Sektör 9 Enkazı** *(Standart Arena)* | Dönen dev **Titanyum Hurda Enkazları** mermileri ve gemiyi fiziksel olarak saptırır. | **Kruvazör (`Dreadnought`)** & **Aegis** (Engel arkası alan hasarı ve yörünge diskleri) |
| **2. Kuantum Nebulası** *(Hız & Tehlike)* | **Mavi İyonize Bulutlar** gemiyi **+%45 hızlandırır**, **Mor Yoğun Gazlar** **-%35 yavaşlatır**. | **Avcı (`Interceptor`)** & **Gölge (`Void Phantom`)** (Yüksek mobilite ve ışınlanma) |
| **3. Kara Delik Çevresi** *(Zorlu Çekim)* | Merkezdeki **Tekillik (Singularity)** gemiyi ve düşmanları merkeze çeker; **Lav Asteroidleri** şarapnel saçar. | **Solar Flare** & **Kruvazör** (Merkeze toplanan sürülere termal korona ve havan yıkımı) |

---

## 🧬 Çok Katmanlı Evrim ($X+Y=Z$) & 6 Kozmik Mega Evrim ($Z+N=\text{MEGA}$)

İki uyumlu **Evrimleşmiş Silah** aynı anda envanterdeyken birleşerek tek bir **KOZMİK MEGA EVRİM** oluşturur ve **+1 Silah Slotunu Boşaltır**:

| Kozmik Mega Evrim | Sentez Formülü ($Z_1 + Z_2 = \text{MEGA}$) | Kozmik Yıkım Etkisi |
| :--- | :---: | :--- |
| **👑 CEHENNEM GATLİNG'İ** | `Kan Hasadı` + `Gatling Fırtınası` | Ekranı yırtan kızıl-altın mermi fırtınası: 4 kez seken patlayıcı plazma mermileri ve yüksek can çalma! |
| **🌀 OLAY UFKU** | `Kozmik Süpernova` + `Aegis Rezonansı` | Gemi etrafında 6 kara delik diski döner; kritik vuruşlar tekillik açar ve periyodik EMP şok dalgaları yayar! |
| **🔱 OMEGA HÜKMÜ** | `Titan Koronası` + `Kuantum Yargıç` | Yörüngesel kıyamet protokolü: Dev plazma küreleri ve 7 hedefe sıçrayan kuantum yıldırımları! |
| **⚡ VALKYRIE HİPER-FIRTINASI** *(Avcı Özel)* | `Valkyrie Mızrağı` + `Gatling Fırtınası` | Seken lazerler ve ekranı boydan boya yaran altın foton mızrakları birleşir! |
| **🛡️ KIYAMET KALESİ** *(Kruvazör Özel)* | `Kıyamet Bataryası` + `Kan Hasadı` | Yörüngesel nükleer havan bombardımanı ve zırh/can çalma kalesi! |
| **👻 HİÇLİK EFENDİSİ** *(Gölge Özel)* | `Hiçlik Biçici` + `Kozmik Süpernova` | Boyutlararası tırpan darbeleri ve zincirleme tekillik patlamaları! |

---

## 🗂️ Çok Sayfalı Mimari & Dosya Yapısı

```text
COSMIC/
├── index.html              # [OYUN LOBİSİ] %75 Ölçekli Sıfır-Scroll Kokpit, Canlı Gemi Hologramı, Harita & Zorluk Seçimi
├── game.html               # [SAVAŞ ARENASI] Minimalist HUD, ESC DPS & Evrim Terminali, Kozmik Sandık Modalları
├── game.js                 # [OYUN MOTORU] v7.0 Kozmik Arena Motoru, 5 Gemi, 3 Harita, 4+4 Slot, Çapraz & Mega Evrimler
├── tree.html               # [EVRİM AĞACI] 5 Gemi Sekmeli İnteraktif SVG Perk & Çok Katmanlı Füzyon Laboratuvarı
├── wiki.html               # [KOZMİK WİKİ] Harita×Gemi Sinerji Matrisi, Top 5 Meta Build ve Boss Zayıf Nokta Rehberi
├── about.html              # [SEKTÖR 9 ARŞİVİ] Kurumsal Arşiv, Sektör 9 Lore, İletişim & Destek Kartı, MIT Lisansı
├── manifest.json           # PWA Web App Manifest
├── sitemap.xml             # SEO Site Haritası (index, game, tree, wiki, about)
├── LICENSE                 # MIT Açık Kaynak Lisansı (Halit Güneş / HaKING)
├── README.md               # Evrensel Teknik Dokümantasyon
└── assets/
    ├── logo.svg            # Vektörel Cyberpunk Arma & Favicon
    ├── og-banner.svg       # 1200x630 Vektörel Tanıtım Afişi
    └── og-banner.png       # 1200x630 Yüksek Çözünürlüklü Sosyal Medya (OG/Twitter) Banner
```

---

## 🛠️ Kurulum ve Yerel Çalıştırma

Proje hiçbir derleme (build) adımı veya harici paket kurulumu gerektirmez:

```bash
# 1. Depoyu klonlayın
git clone https://github.com/haking/COSMIC.git
cd COSMIC

# 2. Yerel bir HTTP sunucusu başlatın
python -m http.server 8080

# 3. Tarayıcınızda açın
# Oyun Lobisi (Kokpit)        : http://localhost:8080/index.html
# Savaş Arenası               : http://localhost:8080/game.html
# İnteraktif Evrim Ağacı      : http://localhost:8080/tree.html
# Kozmik Wiki & Taktik Rehber : http://localhost:8080/wiki.html
# Sektör 9 Arşivi & Künye     : http://localhost:8080/about.html
```

---

## 💖 Destek & İletişim

**Cosmic Survivors**, açık kaynaklı ve bağımsız bir web oyun projesidir. Geliştirmeyi desteklemek için:

- ☕ **Buy Me a Coffee:** [**https://buymeacoffee.com/haking**](https://buymeacoffee.com/haking)
- 🌐 **Canlı Web Oyunu:** [**https://cosmic.haking.tr/**](https://cosmic.haking.tr/)
- 📩 **E-Posta:** [**cosmic@haking.tr**](mailto:cosmic@haking.tr)

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır — detaylar için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.

**Telif Hakkı © 2026 Halit Güneş (HaKING). Tüm hakları saklıdır.**
