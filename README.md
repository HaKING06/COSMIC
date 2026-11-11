<div align="center">

# 🌌 COSMIC SURVIVORS — v6.0 MEGAPONK EDITION

<img src="assets/og-banner.png" alt="Cosmic Survivors — Sektör 9 Cyberpunk Co-Op Roguelike Uzay Oyunu Banner" width="100%">

<br>

[![HEMEN OYNA — CANLI DEMO](https://img.shields.io/badge/%F0%9F%9A%80_HEMEN_OYNA-cosmic.haking.tr-00f0ff?style=for-the-badge&labelColor=06020f)](https://cosmic.haking.tr/)
[![FÜZYON AĞACI](https://img.shields.io/badge/%E2%9A%A1_F%C3%9CZYON_A%C4%9EACI-tree.html-bf00ff?style=for-the-badge&labelColor=06020f)](https://cosmic.haking.tr/tree.html)
[![BUY ME A COFFEE](https://img.shields.io/badge/%E2%98%95_DESTEK_OL-buymeacoffee.com%2Fhaking-ffd700?style=for-the-badge&labelColor=06020f)](https://buymeacoffee.com/haking)
[![İLETİŞİM](https://img.shields.io/badge/%E2%9C%89%EF%B8%8F_%C4%B0LET%C4%B0%C5%9E%C4%B0M-cosmic%40haking.tr-ff006a?style=for-the-badge&labelColor=06020f)](mailto:cosmic@haking.tr)

![Version](https://img.shields.io/badge/S%C3%BCr%C3%BCm-v6.0_Megaponk-bf00ff?style=flat-square&labelColor=0b0518)
![Engine](https://img.shields.io/badge/Motor-HTML5_Canvas_2D-ff006a?style=flat-square&labelColor=0b0518)
![JavaScript](https://img.shields.io/badge/Kod-Vanilla_JS_(ES6+)-ffd700?style=flat-square&labelColor=0b0518)
![Audio](https://img.shields.io/badge/Ses-Web_Audio_API_Synth-00ff88?style=flat-square&labelColor=0b0518)
![Players](https://img.shields.io/badge/Mod-1P_Solo_%26_2P_Yerel_Co--Op-00f0ff?style=flat-square&labelColor=0b0518)
![License](https://img.shields.io/badge/Lisans-MIT-ffffff?style=flat-square&labelColor=0b0518)

**Sektör 9'daki kozmik parazit istilasına karşı 5-Slot Megaponk Perk & Füzyon mimarisine sahip, 1 veya 2 kişilik yüksek tempolu Cyberpunk Roguelike uzay hayatta kalma oyunu.**  
*Sıfır harici kütüphane. Sıfır ses dosyası. Tamamen saf HTML5 Canvas ve prosedürel Web Audio API sentezleyicisi ile inşa edildi.*

</div>

---

## 🧭 Çok Sayfalı Web Mimarisi (Multi-Page Web App)

Cosmic Survivors v6.0, tüm sayfalarda ortak **Cyberpunk Glassmorphism Üst Navigasyon Çubuğu** ile birbirine bağlanan 4 ana modülden oluşur:

| Sayfa | Modül Adı | Açıklama |
| :--- | :--- | :--- |
| **[`index.html`](index.html)** | **Ana Komuta** | 1P/2P mod seçimi, gemi hangarı, zorluk ayarları, bulut + yerel skor tablosu ve hızlı kılavuz. |
| **[`game.html`](game.html)** | **Savaş Arenası** | 60 FPS HTML5 Canvas savaş motoru, 5-Slot Neon Perk & Füzyon Dock HUD'u, Boss savaşları ve ses sentezleyicisi. |
| **[`tree.html`](tree.html)** | **Füzyon Ağacı (Laboratuvar)** | 9 temel perkü ve 6 Gizli Efsanevi Füzyonu neon SVG bağlantı hatlarıyla görselleştiren interaktif yetenek ağacı ve **Canlı 5-Slot Reaktör Simülatörü**. |
| **[`about.html`](about.html)** | **Sektör 9 Arşivi & Künye** | Kozmik Parazit istilasının arka plan hikayesi (Lore), animasyonlu CAD Gemi Teknik Çizimleri, 12 Parazit + 5 Boss Ansiklopedisi (Bestiary), iletişim (`cosmic@haking.tr`) ve Buy Me a Coffee destek kartı. |

---

## ⚡ Megaponk 5-Slot Perk & Füzyon Sentez Sistemi

Sonsuz ve dengesiz kart birikimi kaldırılarak yerine stratejik **5-Slot Reaktör ve Füzyon Evrim Mimarisi** kurulmuştur:

- **5 Slot Sınırı (`MAX_PERK_SLOTS = 5`):** Bir pilot aynı anda en fazla **5 pasif perk/füzyon** taşıyabilir. 5 slot dolduğunda seviye atlama havuzunda yalnızca eldeki perklerin seviye yükseltmeleri veya hazır Füzyon sentezleri çıkar.
- **Seviye Sınırı (`MAKS Lv. 5`):** Her temel perk en fazla **5. seviyeye** yükselebilir.
- **Füzyon Sentezi (`2 Slot ➔ 1 Slot`):** Uyumlu iki perk **Seviye 5'e (Maks)** ulaştığında bir sonraki seviye atlamada **Füzyon Sentezi** teklif edilir. İki perk birleşerek **1 Efsanevi Füzyon Yeteneğine** dönüşür, **2 slot tek slota iner** ve pilota **+1 yeni boş slot** açılır!

### 🌌 6 Gizli Efsanevi Füzyon Yeteneği

| Füzyon Yeteneği | Sentez Formülü (Lv.5 + Lv.5) | Efsanevi Evrim Etkisi | Slot Kazancı |
| :--- | :--- | :--- | :---: |
| **🩸 Kan Hasadı** | `Vampir Lv.5` + `Hasar+ Lv.5` | Her mermi vuruşu kızıl plazma patlaması yayar (%35 alan hasarı) ve verilen hasarın **%10'unu doğrudan cana çevirir**. | `2 ➔ 1 Slot` *(+1 Boş Slot)* |
| **🌪️ Gatling Fırtınası** | `Ateş Hızı+ Lv.5` + `Çoklu Atış Lv.5` | Mermiler hiper-hızla (`x2.15`) yağar ve isabet ettiği düşmanlar arasında otomatik olarak **3 kez seker (Ricochet)**. | `2 ➔ 1 Slot` *(+1 Boş Slot)* |
| **💠 Aegis Rezonansı** | `Kalkan+ Lv.5` + `Hız+ Lv.5` | Hareket ettikçe kinetik enerjiyle kalkan hızla dolar; **kalkan kırıldığında tüm ekranı temizleyen EMP şok dalgası** patlar. | `2 ➔ 1 Slot` *(+1 Boş Slot)* |
| **🌌 Kozmik Süpernova** | `Kritik+ Lv.5` + `Menzil+ Lv.5` | Kritik vuruşlar **%100 ihtimalle alansal kara delik (Black Hole)** açar ve çevredeki tüm parazitleri içine çekip ezer. | `2 ➔ 1 Slot` *(+1 Boş Slot)* |
| **☀️ Titan Çekirdeği** | `Can+ Lv.5` + `Hasar+ Lv.5` | `+140 Maks HP` ve `%25 Zırh` sağlar; her 3 saniyede bir Maks Canın **%25'i kadar yakıcı termal şok dalgası** yayar. | `2 ➔ 1 Slot` *(+1 Boş Slot)* |
| **🔱 Kuantum Yargıç** | `Can+ Lv.5` + `Çoklu Atış Lv.5` | Mermiler düşmanları delen kuantum mızrağına dönüşür; deldiği her hedefte **+%25 hasar kazanır** ve düşmanları yavaşlatır. | `2 ➔ 1 Slot` *(+1 Boş Slot)* |

### 🧩 9 Temel Reaktör Perkü (Lv.1 ➔ Lv.5)

| İkon | Perk Adı | Seviye Başına Etki | Lv.5 Maksimum Değer |
| :---: | :--- | :--- | :--- |
| ⚔ | **Hasar+** (`atkUp`) | `+%25` Mermi Hasarı | **+%205 Hasar (x3.05)** |
| ⚡ | **Hız+** (`spdUp`) | `+%15` İtici Hızı | **+%101 Hız (x2.01)** |
| 🔥 | **Ateş Hızı+** (`fireUp`) | `+%20` Atış Frekansı | **+%148 Ateş Hızı** |
| ♥ | **Can+** (`hpUp`) | `+35` Maksimum Can | **+175 Maks HP** |
| ◆ | **Kalkan+** (`shieldUp`) | `+30` Maksimum Kalkan | **+150 Maks SH** |
| ◎ | **Menzil+** (`rangeUp`) | `+55` Çekim Alanı & `+%18` Menzil | **+275 Çekim / +%90 Menzil** |
| ⋮ | **Çoklu Atış** (`multiUp`) | `+2` Ekstra Yan Mermi | **+10 Yan Mermi (11 Namlu)** |
| 🩸 | **Vampir** (`vampUp`) | `+2.5` HP / İmha | **+12.5 HP / İmha** |
| 💥 | **Kritik+** (`critUp`) | `+%10` Kritik Şans (`2.5x` Hasar) | **+%50 Kritik Şans** |

---

## ☢️ Oyun Sonu (Endgame) Dengelemesi & Yeni Bosslar

Dalga 30'da oyuncunun ölümsüzleştiği can/kalkan döngüsü matematiksel olarak kapatılmış ve gerçek bir oyun sonu (Endgame) meydan okuması tasarlanmıştır:

1. **Kozmik Çürüme / Radyasyon (Dalga 25+):**
   - Dalga 25'ten itibaren her yeni dalgada pasif can yenilenmesi, vampir biyo-onarımı ve kalkan dolum hızı **%4 zayıflar** (`HUD` üzerinde `☢ KOZMİK ÇÜRÜME` uyarısıyla gösterilir).
   - Can çalma (Lifesteal) saniyelik maksimum canın `%18 * KozmikÇürüme` tavanıyla sınırlandırılmıştır ve hasar alındığında kalkan dolumu `1.8 sn` gecikmeye girer.
2. **Elit Gerçek % Hasar (`True % Max HP Damage`):**
   - Dalga 15+ altın halkalı Elit parazitler ve oyun sonu Boss mermileri, pilotun **Maksimum Canına oranla (%5 – %14)** doğrudan gövde hasarı verir.
3. **2 Yeni Gelişmiş Oyun Sonu Bossu:**
   - **⏳ CHRONOS WEAVER (Dalga 20):** Uzay-zamanı bükerek arenada **Ters Çekim Yarıkları** açar. Yarığa giren pilotların hareket vektörünü tersine çevirir ve dışarı iter.
   - **🛡️ OBLIVION BEHEMOTH (Dalga 30):** Ön gövdesinde mermi geçirmeyen **200° dönen zırh plakaları** taşır. Önden gelen tüm mermileri sektirir; pilotlar hasar vermek için **arkasındaki açık reaktör çekirdeğine (%175 Zayıf Nokta Hasarı)** manevra yapmak zorundadır!

---

## 🚀 Gemi Sınıfları ve Aktif Yetenekler

| Sınıf | Rol | Can / Kalkan | Hız | Özel Silah / Pasif | Aktif Yetenek (`SPACE` / `ENTER`) |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **⚡ Avcı (Interceptor)** | Çevik Taarruz | `80 HP` / `40 SH` | `335` | **+%15 Kritik Şans**, yüksek mermi hızı | **Warp Dash (7sn):** 1.2sn dokunulmaz takla atar, arkasında yakıcı lazer hattı bırakır. |
| **🛡️ Kruvazör (Dreadnought)** | Ağır Zırhlı Tank | `160 HP` / `80 SH` | `215` | **Çift Namlulu Plazma Topu** | **Mikro Füze Salvosu (11sn):** 3sn boyunca 360° her yöne mikro füze yağdırır. |
| **🌀 Destek (Aegis)** | Sinerji & Kalkan | `100 HP` / `110 SH` | `270` | **+%75 Sinerji Menzili**, `1.5x` kalkan dolumu | **EMP Şok Dalgası (13sn):** Ekrandaki tüm düşman mermilerini silip kalkan enerjisine dönüştürür. |

---

## 📂 Proje Dizin Yapısı

```text
COSMIC/
├── index.html               # Ana Komuta: Gemi/Mod seçimi, Skor Tablosu ve Hızlı Kılavuz
├── game.html                # Savaş Arenası: Cyberpunk HUD, 5-Slot Perk Dock ve Oyun Ekranı
├── tree.html                # Füzyon Ağacı: İnteraktif 9 Perk + 6 Füzyon Laboratuvarı & Simülatör
├── about.html               # Sektör 9 Arşivi: Lore, CAD Gemi Şemaları, Bestiary, İletişim & Destek
├── intro.html               # Sinematik Sektör 9 Başlangıç Sekansı
├── game.js                  # Çekirdek Oyun Motoru (Megaponk 5-Slot Füzyon, Endgame Bosslar, Ses)
├── leaderboard.js           # Firebase Realtime DB + LocalStorage Hibrit Liderlik Tablosu
├── manifest.webmanifest     # PWA Tam Ekran Web Uygulaması Manifestosu
├── robots.txt               # Arama Motoru Tarama Kuralları
├── sitemap.xml              # Çok Sayfalı XML Site Haritası (index, game, tree, about, intro)
├── _headers                 # Cloudflare Pages Güvenlik ve Önbellek Başlıkları
├── LICENSE                  # MIT Açık Kaynak Lisansı
├── README.md                # Vitrin Dokümantasyonu
└── assets/
    ├── logo.svg             # Vektörel Cyberpunk Cosmic Survivors Logosu
    ├── favicon.svg          # Vektörel Neon Uzay Gemisi Faviconu
    ├── og-banner.svg        # 1200x630 Vektörel Sosyal Medya / GitHub Afişi
    ├── og-banner.png        # 1200x630 Yüksek Çözünürlüklü Open Graph PNG Afişi
    ├── icon-192.png         # PWA Mobil Uygulama İkonu (192x192)
    └── icon-512.png         # PWA Mobil Uygulama İkonu (512x512)
```

---

## 🛠️ Yerel Kurulum ve Çalıştırma

Proje hiçbir derleme adımına (`npm build`, `webpack` vb.) ihtiyaç duymaz:

```bash
# 1. Depoyu klonlayın
git clone https://github.com/HaKING06/COSMIC.git
cd COSMIC

# 2. Yerel HTTP sunucusunu başlatın
python -m http.server 8080
```

Tarayıcınızda **`http://localhost:8080`** adresini açarak tüm modülleri (`index.html`, `game.html`, `tree.html`, `about.html`) deneyimleyebilirsiniz.

---

## ☕ Destek, İletişim ve Lisans

- **Canlı Oyun:** [https://cosmic.haking.tr/](https://cosmic.haking.tr/)
- **Geliştiriciye Destek Ol:** [https://buymeacoffee.com/haking](https://buymeacoffee.com/haking)
- **Resmi İletişim:** [cosmic@haking.tr](mailto:cosmic@haking.tr)
- **Geliştirici:** **Halit Güneş (HaKING)** — [GitHub (@HaKING06)](https://github.com/HaKING06)
- **Lisans:** Bu proje **[MIT Lisansı](LICENSE)** altında açık kaynak olarak sunulmaktadır.
