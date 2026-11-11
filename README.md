<div align="center">

<img src="assets/og-banner.png" alt="Cosmic Survivors — v7.0 Vampire Survivors Edition Banner" width="100%" />

<br />

# 🌌 COSMIC SURVIVORS
### **v7.0 VAMPIRE SURVIVORS EDITION — 1P Space Bullet-Heaven & Mega Evolution Roguelike**

[![Canlı Oyna](https://img.shields.io/badge/🎮_HEMEN_OYNA-cosmic.haking.tr-00f0ff?style=for-the-badge&logo=rocket&logoColor=03030a)](https://cosmic.haking.tr/)
[![Füzyon & Evrim Ağacı](https://img.shields.io/badge/⚡_EVRİM_AĞACI-tree.html-ffcc00?style=for-the-badge)](https://cosmic.haking.tr/tree.html)
[![Sektör 9 Arşivi](https://img.shields.io/badge/📖_SEKTÖR_9_ARŞİVİ-about.html-b537f2?style=for-the-badge)](https://cosmic.haking.tr/about.html)
[![Sürüm](https://img.shields.io/badge/Sürüm-v7.0_Vampire_Survivors_Edition-ff2a85?style=for-the-badge)](#)
[![Buy Me A Coffee](https://img.shields.io/badge/☕_DESTEK_OL-buymeacoffee.com%2Fhaking-ffcc00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/haking)
[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-00ff88?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Sıfır Bağımlılık • Saf HTML5 Canvas & Web Audio API • 5 Özgün Gemi • 3 Dinamik Harita • 4 Silah + 4 Alet Slotu • 6 Evrim & 3 Kozmik Süper Evrim • Elit Mini-Boss & Kozmik Sandık</strong>
</p>

---

### 🚀 **[⚡ CANLI SİMÜLASYONU BAŞLAT — https://cosmic.haking.tr/](https://cosmic.haking.tr/)**
### ☕ **[💛 PROJEYİ DESTEKLE — https://buymeacoffee.com/haking](https://buymeacoffee.com/haking)**
### 📩 **Resmi İletişim: [cosmic@haking.tr](mailto:cosmic@haking.tr)**

</div>

---

## 📖 Genel Bakış

**Cosmic Survivors (v7.0 Vampire Survivors Edition)**, herhangi bir harici oyun motoru, kütüphane veya ses/görsel dosyası kullanmadan; tamamen **Vanilla JavaScript (ES6+)**, **HTML5 Canvas 2D** ve **Prosedürel Web Audio API** ile sıfırdan inşa edilmiş tek oyunculu (**1P**) bir **Uzay Bullet-Heaven / Action Roguelike** oyunudur.

Yıl **2384**. **Sektör 9**'da açılan hiper-uzay yarığından akan biyomekanik **Kozmik Parazit** sürülerine karşı 5 farklı yıldız gemisinden birini seçin, **3 farklı çevresel tehlike haritasında** hayatta kalın, **4 Silah Slotu** ve **4 Alet (Trinket) Slotu**nu stratejik olarak doldurun, **6 Evrimleşmiş Silah** ve **3 Kozmik Süper Evrim (Mega Fusion)** sentezleyerek karanlık uzayda mermi cehennemi yaratın!

---

## ✨ v7.0 Vampire Survivors Edition Yenilikleri

- 🛡️ **Kritik Race Condition & Çoklu Kart Açığı Onarımı:** Seviye atlama ekranında 3 tuşa (`A + W + D`) aynı anda basarak veya aynı karede çoklu tıklama yaparak 3 kartı birden alma açığı (`isLevelingUp` senkron atomik kilidi, `pointer-events: none` zırhı ve çoklu tuş basılı tutma engelleyicisi ile) tamamen kapatıldı.
- 🚀 **Saf 1P Odak & 5 Özgün Gemi Sınıfı:** 2P ekran kalabalığı kaldırılarak tüm motor performansı ve kamera odağı tek pilota (1P) adandı. Her biri benzersiz **Başlangıç Silahı**, **Pasif Gövde Bonusu** ve **Aktif Yeteneğe (`SPACE`)** sahip 5 gemi eklendi.
- 🗺️ **3 Gerçek Sınırlı Harita & Çevresel Anomaliler:** Dönen hurda enkazları (**Sektör 9 Enkazı**), hızlandıran/yavaşlatan iyonize gaz bulutları (**Kuantum Nebulası**) ve merkeze çeken yerçekimi tekilliği ile patlayan lav asteroidleri (**Kara Delik Çevresi**).
- ⚔️ **4 Silah + 4 Alet (Trinket) Slotu & Mega Evrim Sistemi:** Doğrudan ateş eden 6 aktif silah ve pasif çarpan sağlayan 6 alet (Mıknatıs, Soğutucu, İtici, Biyo-Reaktör, Kuantum Nişangah, Deflektör Matrisi).
- ⚡ **6 Standart Evrim + 3 Kozmik Süper Evrim:** `Silah Lv.5 + Alet Lv.5` birleşimiyle **Evrimleşmiş Silah**; iki Evrimleşmiş Silahın birleşimiyle **Kozmik Süper Evrim** (Mega Fusion) ve **+1 Boş Silah Slotu**!
- 🎲 **Reroll (2x) & Skip (1x) + Elit Mini-Boss & Kozmik Sandık:** Her oyunda 2 kez kart yenileme (**Reroll**) ve 1 kez XP telafili pas geçme (**Skip**) hakkı. Her 3 dalgada bir beliren **Elit Mini-Boss** ve %50 ihtimalle düşürdüğü altın **Kozmik Sandık (Loot Box)**.
- 🖥️ **Minimalist HUD & Gelişmiş ESC Duraklatma Terminali:** Oyun ekranını kapatan alt bar kaldırıldı; sol üstte kompakt durum/slot göstergesi, sağ üstte dalga/harita telemetrisi ve `ESC` tuşuyla açılan **Canlı DPS & Evrim Rehberi Terminali** eklendi.

---

## 🛸 5 Özgün Yıldız Gemisi (Karakter Sınıfları)

| Gemi Sınıfı | Kod Adı | Başlangıç Silahı | Pasif Gövde Avantajı | Aktif Yetenek (`SPACE`) |
| :--- | :--- | :--- | :--- | :--- |
| **⚡ Avcı** | `Interceptor` | **Çift Lazer** (`dualLaser`) | **+%20 Hareket Hızı, +%15 Kritik Şansı** | **Warp Dash:** 1.2 sn dokunulmazlık taklası ve arkasında yakıcı lazer izi |
| **🛡️ Kruvazör** | `Dreadnought` | **Ağır Plazma Topu** (`heavyPlasma`) | **+%30 Zırh Koruması, -%10 Hız** | **Mikro Füze Salvosu:** 3 sn boyunca 360° güdümsüz mikro füze yağmuru |
| **💠 Aegis** | `Shield Guardian` | **Dönen Enerji Diski** (`energyDisc`) | **Otomatik Kalkan Patlaması** (8 sn'de bir şok halkası) | **EMP Şok Dalgası:** Tüm düşman mermilerini siler ve kalkana dönüştürür |
| **👻 Gölge** | `Void Phantom` | **Kuantum Hançeri** (`quantumDagger`) | **10 sn'de bir 1.5 sn Görünmezlik + %65 Suikast Hasarı** | **Gölge Sıçraması:** İmleç yönüne ışınlanır ve 8'li kuantum hançeri fırlatır |
| **☀️ Solar Flare** | `Sunstorm` | **Alev Hattı** (`flameLine`) | **Termal Radyasyon Aurası** (Yakındaki düşmanları sürekli yakar) | **Güneş Patlaması:** Ekran çapında korona patlaması ve ağır yanık etkisi |

---

## 🗺️ 3 Gerçek Savaş Haritası & Çevresel Tehlikeler

| Harita | Boyut | Çevresel Mekanik & Anomaliler | Özgün Parazit Filosu |
| :--- | :---: | :--- | :--- |
| **1. Sektör 9 Enkazı** *(Standart Arena)* | `3200 × 2200` | Dönen dev **Titanyum Hurda Enkazları**; mermileri ve gemiyi fiziksel olarak saptırır. | Dengeli Sürü, Okçu ve Sürü Kraliçesi |
| **2. Kuantum Nebulası** *(Hız & Tehlike)* | `3400 × 2400` | **Mavi İyonize Bulutlar** gemiyi **+%45 hızlandırır**, **Mor Yoğun Gazlar** **-%35 yavaşlatır**. | Işınlanan **Hayalet (Phantom)** ve **Sıçrayıcı (Blinker)** parazitler |
| **3. Kara Delik Çevresi** *(Zorlu Çekim)* | `3000 × 2200` | Merkezdeki **Tekillik (Singularity)** gemiyi ve düşmanları merkeze çeker; **Lav Asteroidleri** vurulunca şarapnel saçar. | Yüksek zırhlı **Titan**, **Bölünen (Splitter)** ve **Elit** parazitler |

---

## 🧬 Megabonk / Vampire Survivors Evrim & Süper Evrim Sistemi

Bir pilot aynı anda en fazla **4 Silah Slotu** ve **4 Alet (Trinket) Slotu** taşıyabilir.

### 1️⃣ Silahlar (4 Slot) & Aletler (4 Slot)

| 🔫 Aktif Silahlar (Maks Lv.5) | 🧲 Pasif Aletler / Trinkets (Maks Lv.5) |
| :--- | :--- |
| **⚡ Çift Lazer (`dualLaser`):** Yüksek hızlı ikiz foton atışı | **🧲 Mıknatıs (`magnet`):** XP/Sandık çekim çapı (+%35/Lv) ve +%8 XP |
| **💥 Ağır Plazma Topu (`heavyPlasma`):** Alan patlamalı plazma küresi | **❄️ Soğutucu (`coolant`):** Tüm silahlarda +%12/Lv Ateş Hızı (Cooldown azaltma) |
| **💿 Dönen Enerji Diski (`energyDisc`):** Gemi etrafında dönen kesici diskler | **🚀 Kinetik İtici (`thruster`):** +%9/Lv Hareket Hızı ve +%8/Lv Zırh |
| **🗡️ Kuantum Hançeri (`quantumDagger`):** En yakın hedefe güdümlü zırh delici hançer | **🧪 Biyo-Reaktör (`bioreactor`):** +%18/Lv Maks Can, +2.5 HP/sn Can Yenileme ve Can Çalma |
| **🔥 Alev Hattı (`flameLine`):** Sürekli yanan plazma koridoru | **🎯 Kuantum Nişangah (`targetMatrix`):** +%9/Lv Kritik Şansı ve +%15/Lv Mermi Hasarı |
| **🚀 Füze Sürüsü (`swarmMissiles`):** En yakın hedeflere kilitlenen güdümlü mikro füzeler | **🛡️ Deflektör Matrisi (`shieldMatrix`):** +35/Lv Maks Kalkan ve +%20 Kalkan Dolumu |

---

### 2️⃣ 6 Standart Evrim (Silah Lv.5 + Alet Lv.5)

Bir silah ve eşleştiği alet **Seviye 5 (MAX)** olduğunda, seviye atlama ekranında veya **Kozmik Sandıkta** **EVRİM SENTEZİ** açılır:

| Evrimleşmiş Silah | Sentez Formülü (Lv.5 + Lv.5) | Evrim Etkisi |
| :--- | :---: | :--- |
| **🌪️ Gatling Fırtınası** | `Çift Lazer Lv.5` + `Kriyo Soğutucu Lv.5` | Hiper-hızlı lazer yağmuru; mermiler düşmanlar arasında **3 kez seker (Ricochet)**. |
| **🩸 Kan Hasadı** | `Ağır Plazma Topu Lv.5` + `Biyo-Reaktör Lv.5` | Kızıl plazma cehennemi; her vuruş alan patlaması yayar ve **hasarın %10'unu cana çevirir**. |
| **💠 Aegis Rezonansı** | `Dönen Enerji Diski Lv.5` + `Kinetik İtici Lv.5` | 6 adet kesici rezonans diski; hareket ettikçe kalkan dolar, kalkan kırılınca **EMP patlar**. |
| **🌌 Kozmik Süpernova** | `Kuantum Hançeri Lv.5` + `Mıknatıs Çekirdeği Lv.5` | Kritik hançer vuruşları düşmanları içine çekip ezen alansal **Kara Delik** açar. |
| **☀️ Titan Koronası** | `Alev Hattı Lv.5` + `Deflektör Matrisi Lv.5` | Alev koridoru dev güneş halkasına dönüşür ve her 2.5 sn'de bir **Termal Nova** yayar. |
| **🔱 Kuantum Yargıç** | `Füze Sürüsü Lv.5` + `Kuantum Nişangah Lv.5` | Füzeler düşmanları delip geçen kuantum mızraklarına dönüşür; her delmede **+%25 güçlenir**. |

---

### 3️⃣ 3 Kozmik Süper Evrim (Evrim + Evrim = Mega Fusion)

İki uyumlu **Evrimleşmiş Silah** aynı anda envanterdeyken birleşerek tek bir **KOZMİK SÜPER EVRİM** oluşturur ve **1 Silah Slotunu Boşaltır (+1 Boş Slot)**:

| Kozmik Süper Evrim | Mega Füzyon Formülü | Kozmik Yıkım Etkisi |
| :--- | :---: | :--- |
| **👑 CEHENNEM GATLİNG'İ** *(Inferno Gatling)* | `Kan Hasadı` + `Gatling Fırtınası` | Ekranı yırtan kızıl-altın mermi fırtınası: 4 kez seken patlayıcı plazma mermileri, yakıcı iz ve yüksek can çalma! |
| **🌀 OLAY UFKU** *(Event Horizon)* | `Kozmik Süpernova` + `Aegis Rezonansı` | Gemi etrafında 6 kara delik diski döner; kritik vuruşlar tekillik açar ve periyodik EMP şok dalgaları yayar! |
| **🔱 OMEGA HÜKMÜ** *(Omega Judgement)* | `Titan Koronası` + `Kuantum Yargıç` | Yörüngesel kıyamet protokolü: Dev plazma küreleri ve 7 hedefe sıçrayan kuantum yıldırımları tüm haritayı temizler! |

---

## 📦 Elit Mini-Boss, Kozmik Sandık & Reroll/Skip

- **👑 Elit Mini-Boss (Her 3 Dalgada Bir):** Dalga 3, 6, 9, 12... başladığında altın zırhlı bir **Elit Parazit Komutanı** arenaya iner.
- **📦 Kozmik Sandık (Loot Box):** Elit Mini-Boss yok edildiğinde **%50 ihtimalle** altın neon parıltılı **Kozmik Sandık** düşürür. Sandığı almak oyunu duraklatır ve hazır bir **Evrim/Süper Evrim** varsa anında sentezler, yoksa mevcut bir silah/aleti ücretsiz yükseltir!
- **🎲 Reroll (2 Hak) & ⏭️ Skip (1 Hak):** Seviye atlama ekranında gelen 3 kartı beğenmezseniz **2 kez Zar Atabilir (Reroll)** veya **1 kez Pas Geçerek (Skip)** anında **+%35 XP telafisi** alabilirsiniz.

---

## 🗂️ Çok Sayfalı Mimari & Dosya Yapısı

```text
COSMIC/
├── index.html              # [ANA KOMUTA] 5 Gemi & 3 Harita Seçim Hangarı, Canlı Önizleme, Skor Tablosu
├── game.html               # [SAVAŞ ARENASI] Minimalist HUD, ESC DPS Terminali, Evrim & Kozmik Sandık Modalları
├── game.js                 # [OYUN MOTORU] v7.0 1P Vampire Survivors Motoru, 5 Gemi, 3 Harita, 4+4 Slot, Evrim/Süper Evrim
├── tree.html               # [EVRİM AĞACI] 4 Katmanlı İnteraktif Silah, Alet, Evrim ve Süper Evrim Laboratuvarı
├── about.html              # [SEKTÖR 9 ARŞİVİ] 3 Harita, 5 Gemi CAD Çizimi, Bestiary, İletişim & Destek
├── manifest.json           # PWA Web App Manifest
├── LICENSE                 # MIT Açık Kaynak Lisansı (Halit Güneş / HaKING)
├── README.md               # v7.0 Vampire Survivors Edition Teknik Dokümantasyon
└── assets/
    ├── logo.svg            # Vektörel Cyberpunk Arma & Favicon
    ├── og-banner.svg       # 1200x630 Vektörel v7.0 Tanıtım Afişi
    └── og-banner.png       # 1200x630 Yüksek Çözünürlüklü Sosyal Medya (OG/Twitter) Banner
```

---

## 🛠️ Kurulum ve Yerel Çalıştırma

Proje hiçbir derleme (build) adımı veya `node_modules` bağımlılığı gerektirmez:

```bash
# 1. Depoyu klonlayın
git clone https://github.com/haking/COSMIC.git
cd COSMIC

# 2. Yerel bir HTTP sunucusu başlatın (Python örneği)
python -m http.server 8080

# 3. Tarayıcınızda açın
# Ana Komuta & Gemi/Harita Seçimi : http://localhost:8080/index.html
# Savaş Arenası                   : http://localhost:8080/game.html
# Evrim & Süper Evrim Ağacı       : http://localhost:8080/tree.html
# Sektör 9 Arşivi & Künye         : http://localhost:8080/about.html
```

---

## 💖 Destek & İletişim

**Cosmic Survivors**, açık kaynaklı ve bağımsız bir web oyun projesidir. Geliştirmeyi desteklemek ve yeni gemiler/haritalar eklenmesine katkıda bulunmak için:

- ☕ **Buy Me a Coffee:** [**https://buymeacoffee.com/haking**](https://buymeacoffee.com/haking)
- 🌐 **Canlı Web Oyunu:** [**https://cosmic.haking.tr/**](https://cosmic.haking.tr/)
- 📩 **E-Posta:** [**cosmic@haking.tr**](mailto:cosmic@haking.tr)

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır — detaylar için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.

**Telif Hakkı © 2026 Halit Güneş (HaKING). Tüm hakları saklıdır.**
