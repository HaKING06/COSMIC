'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// COSMIC SURVIVORS v8.0 — 8-SHIP INTERACTIVE SKILL TREE & BUILD CALCULATOR
// Supports 8 Ships, 4-Stage SVG Graph, Pan/Zoom, Search Filter & Synthesis Lab
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  const SHIP_TREES = {
    interceptor: {
      id: 'interceptor',
      name: 'AVCI (INTERCEPTOR)',
      shortName: 'AVCI',
      role: 'Hızlı Taarruz & Kritik',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.38)',
      starterWeapon: 'dualLaser',
      sigWeapon: 'photonRailgun',
      sigTrinket: 'overdriveCore',
      sigEvo: 'tachyonLance',
      sigMega: 'hyperionApex',
      passive: '+%20 Hareket Hızı & +%15 Kritik Şans',
      svg: `<svg viewBox="0 0 64 64"><polygon points="32,6 8,52 24,44 32,56 40,44 56,52" fill="#062232" stroke="#00f0ff" stroke-width="4"/><polygon points="32,18 22,40 32,34 42,40" fill="#00f0ff"/></svg>`
    },
    dreadnought: {
      id: 'dreadnought',
      name: 'KRUVAZÖR (DREADNOUGHT)',
      shortName: 'KRUVAZÖR',
      role: 'Ağır Zırhlı Kuşatma',
      color: '#ffaa00',
      glow: 'rgba(255, 170, 0, 0.38)',
      starterWeapon: 'heavyPlasma',
      sigWeapon: 'flakArtillery',
      sigTrinket: 'reactiveArmor',
      sigEvo: 'siegeBehemoth',
      sigMega: 'ironDreadnought',
      passive: '+%32 Zırh Koruması & Sarsıntı Direnci',
      svg: `<svg viewBox="0 0 64 64"><polygon points="20,8 44,8 56,24 50,54 14,54 8,24" fill="#281604" stroke="#ffaa00" stroke-width="4"/><rect x="22" y="20" width="20" height="22" rx="3" fill="#ffaa00"/></svg>`
    },
    aegis: {
      id: 'aegis',
      name: 'AEGIS (MUHAFIZ)',
      shortName: 'AEGIS',
      role: 'Yörünge Savunma & EMP',
      color: '#00ff88',
      glow: 'rgba(0, 255, 136, 0.38)',
      starterWeapon: 'energyDisc',
      sigWeapon: 'teslaPrism',
      sigTrinket: 'harmonicCapacitor',
      sigEvo: 'sanctuaryMaelstrom',
      sigMega: 'eventHorizon',
      passive: 'Otomatik Kalkan Şok Halkası (8 sn)',
      svg: `<svg viewBox="0 0 64 64"><polygon points="32,6 54,20 48,50 32,58 16,50 10,20" fill="#06281e" stroke="#00ff88" stroke-width="4"/><circle cx="32" cy="32" r="10" fill="#00f0ff"/></svg>`
    },
    phantom: {
      id: 'phantom',
      name: 'GÖLGE (VOID PHANTOM)',
      shortName: 'GÖLGE',
      role: 'Kuantum Suikastçı',
      color: '#d24dff',
      glow: 'rgba(210, 77, 255, 0.38)',
      starterWeapon: 'quantumDagger',
      sigWeapon: 'voidScythe',
      sigTrinket: 'phaseCloak',
      sigEvo: 'abyssalReaper',
      sigMega: 'eclipseSingularity',
      passive: '10 sn\'de 1.5 sn Görünmezlik & +%65 Suikast Kritiği',
      svg: `<svg viewBox="0 0 64 64"><polygon points="32,6 6,52 24,38 32,54 40,38 58,52" fill="#240632" stroke="#d24dff" stroke-width="4"/><polygon points="32,16 20,38 32,30 44,38" fill="#d24dff"/></svg>`
    },
    solarflare: {
      id: 'solarflare',
      name: 'SOLAR FLARE (GÜNEŞ)',
      shortName: 'SOLAR FLARE',
      role: 'Termal Alan Yıkımı',
      color: '#ff6600',
      glow: 'rgba(255, 102, 0, 0.38)',
      starterWeapon: 'flameLine',
      sigWeapon: 'solarMortar',
      sigTrinket: 'fusionHeart',
      sigEvo: 'heliosCataclysm',
      sigMega: 'infernoGatling',
      passive: 'Yakındaki Düşmanları Yakan Korona Aurası',
      svg: `<svg viewBox="0 0 64 64"><polygon points="32,6 4,34 18,54 32,42 46,54 60,34" fill="#2b0c02" stroke="#ff6600" stroke-width="4"/><circle cx="32" cy="30" r="10" fill="#ffd700"/></svg>`
    },
    tempest: {
      id: 'tempest',
      name: 'TEMPEST (KRİYO-FIRTINA)',
      shortName: 'TEMPEST',
      role: 'Kriyo-Kontrol & Yıldırım',
      color: '#00d4ff',
      glow: 'rgba(0, 212, 255, 0.38)',
      starterWeapon: 'dualLaser',
      sigWeapon: 'cryoNova',
      sigTrinket: 'teslaCoil',
      sigEvo: 'absoluteZero',
      sigMega: 'stormSingularity',
      passive: 'Mutlak Sıfır İyonizasyonu (%30 Yavaşlatma)',
      svg: `<svg viewBox="0 0 64 64"><polygon points="32,4 56,28 42,56 22,56 8,28" fill="#041e2e" stroke="#00d4ff" stroke-width="4"/><polygon points="32,14 44,32 32,48 20,32" fill="#88ffff"/></svg>`
    },
    valkyrie: {
      id: 'valkyrie',
      name: 'VALKYRIE (TAŞIYICI)',
      shortName: 'VALKYRIE',
      role: 'Otonom Drone Filosu',
      color: '#ffd700',
      glow: 'rgba(255, 215, 0, 0.38)',
      starterWeapon: 'swarmMissiles',
      sigWeapon: 'droneSwarm',
      sigTrinket: 'neuralLink',
      sigEvo: 'seraphFleet',
      sigMega: 'armadaProtocol',
      passive: '2 Otonom Savaş Drone\'u & Railgun Overdrive',
      svg: `<svg viewBox="0 0 64 64"><polygon points="32,6 58,22 50,54 38,44 26,44 14,54 6,22" fill="#292004" stroke="#ffd700" stroke-width="4"/><rect x="27" y="18" width="10" height="24" rx="3" fill="#00f0ff"/></svg>`
    },
    chronos: {
      id: 'chronos',
      name: 'CHRONOS (ZAMAN DOKUYUCU)',
      shortName: 'CHRONOS',
      role: 'Zaman & Tekillik Kontrolü',
      color: '#00ffcc',
      glow: 'rgba(0, 255, 204, 0.38)',
      starterWeapon: 'energyDisc',
      sigWeapon: 'chronoRift',
      sigTrinket: 'fluxCapacitor',
      sigEvo: 'eternityLoop',
      sigMega: 'bigBangSingularity',
      passive: '+%18 Dolum Hızı & Mermi Yavaşlatma Alanı',
      svg: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#042622" stroke="#00ffcc" stroke-width="3.5"/><polygon points="32,8 50,32 32,56 14,32" fill="none" stroke="#ff006a" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="#00ffcc"/></svg>`
    }
  };

  const NODES = {
    // ── 8 KARAKTERE ÖZEL KÖK SİLAHLAR (SIGNATURE WEAPONS) ──
    photonRailgun: {
      id: 'photonRailgun', kind: 'sigWeapon', ship: 'interceptor',
      name: 'Foton Raylı Top', icon: '🚄', color: '#00f0ff', baseDmg: 68, cd: '0.50s',
      formula: 'Avcı Özel Kök Silahı (Lv.1 ➔ Lv.5)',
      simType: 'laser',
      desc: 'Sadece Avcı (Interceptor) gemisinde açılan yüksek hızlı delici elektromanyetik foton rayı.',
      levels: [
        ['Lv.1', '45 Hasar • 1 Hedef Deler', 'Baz Raylı Top'],
        ['Lv.3', '85 Hasar • 3 Hedef Deler', '+%20 Kritik Hızı'],
        ['Lv.5 (MAKS)', '140 Hasar • 5 Hedef Deler', 'Takyon Mızrağı Evrimine Hazır']
      ]
    },
    flakArtillery: {
      id: 'flakArtillery', kind: 'sigWeapon', ship: 'dreadnought',
      name: 'Balistik Flak Topu', icon: '💣', color: '#ffaa00', baseDmg: 95, cd: '0.95s',
      formula: 'Kruvazör Özel Kök Silahı (Lv.1 ➔ Lv.5)',
      simType: 'plasma',
      desc: 'Sadece Kruvazör (Dreadnought) gemisinde açılan, çarpışma anında 8 şarapnele bölünen ağır balistik batarya.',
      levels: [
        ['Lv.1', '55 Alan Hasarı • 4 Şarapnel', 'Zırh Kırıcı Gülle'],
        ['Lv.3', '95 Alan Hasarı • 6 Şarapnel', 'Geri İtme Dalgası'],
        ['Lv.5 (MAKS)', '160 Alan Hasarı • 10 Şarapnel', 'Kıyamet Bataryası Evrimine Hazır']
      ]
    },
    teslaPrism: {
      id: 'teslaPrism', kind: 'sigWeapon', ship: 'aegis',
      name: 'Tesla Kalkan Prizması', icon: '⚡', color: '#00ff88', baseDmg: 54, cd: '0.55s',
      formula: 'Aegis Özel Kök Silahı (Lv.1 ➔ Lv.5)',
      simType: 'disc',
      desc: 'Sadece Aegis gemisinde açılan, mevcut kalkan enerjisine oranla zincirleme yıldırım arkları çakan prizma.',
      levels: [
        ['Lv.1', '32 Ark Hasarı • 2 Sıçrama', 'Kalkan Bonusu +%15'],
        ['Lv.3', '60 Ark Hasarı • 4 Sıçrama', 'Mermi Silici Şok'],
        ['Lv.5 (MAKS)', '110 Ark Hasarı • 6 Sıçrama', 'Kutsal İyon Fırtınası Evrimine Hazır']
      ]
    },
    voidScythe: {
      id: 'voidScythe', kind: 'sigWeapon', ship: 'phantom',
      name: 'Hiper-Uzay Tırpanı', icon: '🌙', color: '#d24dff', baseDmg: 78, cd: '0.60s',
      formula: 'Void Phantom Özel Kök Silahı (Lv.1 ➔ Lv.5)',
      simType: 'dagger',
      desc: 'Sadece Void Phantom gemisinde açılan, uzay-zamanı yararak arkadan vuruşlarda infaz hasarı veren karanlık tırpan.',
      levels: [
        ['Lv.1', '50 Biçme Hasarı • +%40 Kritik', 'Geniş Hilal Darbesi'],
        ['Lv.3', '90 Biçme Hasarı • +%75 Kritik', 'Gölge Yarığı Bırakır'],
        ['Lv.5 (MAKS)', '155 Biçme Hasarı • +%120 Kritik', 'Hiçlik Biçicisi Evrimine Hazır']
      ]
    },
    solarMortar: {
      id: 'solarMortar', kind: 'sigWeapon', ship: 'solarflare',
      name: 'Plazma Havanı', icon: '☄️', color: '#ff6600', baseDmg: 82, cd: '0.80s',
      formula: 'Solar Flare Özel Kök Silahı (Lv.1 ➔ Lv.5)',
      simType: 'flame',
      desc: 'Sadece Solar Flare gemisinde açılan, düştüğü yerde 4 saniye boyunca yanan güneş krateri oluşturan termal havan.',
      levels: [
        ['Lv.1', '40 Patlama + 20/sn Yanık', '1 Güneş Krateri'],
        ['Lv.3', '75 Patlama + 40/sn Yanık', '2 Güneş Krateri'],
        ['Lv.5 (MAKS)', '130 Patlama + 75/sn Yanık', 'Helios Kıyameti Evrimine Hazır']
      ]
    },
    cryoNova: {
      id: 'cryoNova', kind: 'sigWeapon', ship: 'tempest',
      name: 'Kriyo-Buzul Küresi', icon: '❄️', color: '#00d4ff', baseDmg: 64, cd: '0.62s',
      formula: 'Tempest Özel Kök Silahı (Lv.1 ➔ Lv.5)',
      simType: 'disc',
      desc: 'Sadece Tempest gemisinde açılan, patladığında hedefleri donduran ve 8 yöne buz kristali saçan kriyo-küre.',
      levels: [
        ['Lv.1', '42 Buz Hasarı • %30 Yavaşlatma', '4 Buzul Şarapneli'],
        ['Lv.3', '78 Buz Hasarı • %45 Yavaşlatma', '6 Buzul Şarapneli'],
        ['Lv.5 (MAKS)', '135 Buz Hasarı • 1.5sn Dondurma', 'Mutlak Sıfır Fırtınasına Hazır']
      ]
    },
    droneSwarm: {
      id: 'droneSwarm', kind: 'sigWeapon', ship: 'valkyrie',
      name: 'Otonom Savaş Droneları', icon: '🛸', color: '#ffd700', baseDmg: 58, cd: '0.30s',
      formula: 'Valkyrie Özel Kök Silahı (Lv.1 ➔ Lv.5)',
      simType: 'missile',
      desc: 'Sadece Valkyrie gemisinde açılan, düşmanları bağımsız olarak kovalayıp odaklanmış plazma yağdıran mikro-avcı filosu.',
      levels: [
        ['Lv.1', '2 Drone • 24 Hasar/Atış', 'Otonom Hedefleme'],
        ['Lv.3', '4 Drone • 42 Hasar/Atış', 'Zırh Delici İyon Mermisi'],
        ['Lv.5 (MAKS)', '6 Drone • 68 Hasar/Atış', 'Seraphim Drone Filosuna Hazır']
      ]
    },
    chronoRift: {
      id: 'chronoRift', kind: 'sigWeapon', ship: 'chronos',
      name: 'Zaman Yarığı Projektörü', icon: '⏳', color: '#00ffcc', baseDmg: 74, cd: '0.70s',
      formula: 'Chronos Özel Kök Silahı (Lv.1 ➔ Lv.5)',
      simType: 'blackhole',
      desc: 'Sadece Chronos gemisinde açılan, uzay-zaman dokusunu yırtarak içindeki düşmanları dondurup patlatan krono-anomali.',
      levels: [
        ['Lv.1', '48 Krono Hasarı • 90px Yarık', 'Zaman Yavaşlatma'],
        ['Lv.3', '86 Krono Hasarı • 125px Yarık', 'Çifte Krono Çöküşü'],
        ['Lv.5 (MAKS)', '148 Krono Hasarı • 160px Yarık', 'Sonsuzluk Döngüsüne Hazır']
      ]
    },

    // ── 8 KARAKTERE ÖZEL KÖK ALETLER (SIGNATURE TRINKETS) ──
    overdriveCore: {
      id: 'overdriveCore', kind: 'sigTrinket', ship: 'interceptor',
      name: 'Hiper-İvme Çekirdeği', icon: '⚡', color: '#00f0ff',
      formula: 'Avcı Özel Kök Aleti (Lv.1 ➔ Lv.5)',
      simType: 'laser',
      desc: 'Gemi hareket ettikçe ateş hızını +%18 ve kritik vuruş çarpanını +%25 artırır. Takyon Mızrağı katalizörüdür.',
      levels: [
        ['Lv.1', '+%12 Ateş Hızı • +%10 Kritik Gücü', 'Hareket İvmesi'],
        ['Lv.3', '+%24 Ateş Hızı • +%22 Kritik Gücü', 'Warp İzi Hasarı'],
        ['Lv.5 (MAKS)', '+%40 Ateş Hızı • +%35 Kritik Gücü', 'Takyon Mızrağı Sentezini Açar']
      ]
    },
    reactiveArmor: {
      id: 'reactiveArmor', kind: 'sigTrinket', ship: 'dreadnought',
      name: 'Reaktif Zırh Plakası', icon: '🛡️', color: '#ffaa00',
      formula: 'Kruvazör Özel Kök Aleti (Lv.1 ➔ Lv.5)',
      simType: 'plasma',
      desc: 'Zırhı +%8/Lv artırır ve alınan her darbede çevredeki düşmanlara karşı-şok dalgası patlatır.',
      levels: [
        ['Lv.1', '+%8 Zırh • 45 Karşı-Şok Hasarı', 'Titanyum Kaplama'],
        ['Lv.3', '+%18 Zırh • 95 Karşı-Şok Hasarı', 'Sarsıntı Koruması'],
        ['Lv.5 (MAKS)', '+%30 Zırh • 180 Karşı-Şok Hasarı', 'Kıyamet Bataryası Sentezini Açar']
      ]
    },
    harmonicCapacitor: {
      id: 'harmonicCapacitor', kind: 'sigTrinket', ship: 'aegis',
      name: 'Harmonik Kondansatör', icon: '🔋', color: '#00ff88',
      formula: 'Aegis Özel Kök Aleti (Lv.1 ➔ Lv.5)',
      simType: 'disc',
      desc: 'Maksimum kalkanı +45/Lv büyütür ve kalkan doluyken tüm silahların alan çapını +%30 genişletir.',
      levels: [
        ['Lv.1', '+45 Kalkan • +%10 Alan Çapı', 'Rezonans Akımı'],
        ['Lv.3', '+110 Kalkan • +%20 Alan Çapı', 'EMP Yarıçapı +%35'],
        ['Lv.5 (MAKS)', '+200 Kalkan • +%35 Alan Çapı', 'Kutsal İyon Fırtınası Sentezini Açar']
      ]
    },
    phaseCloak: {
      id: 'phaseCloak', kind: 'sigTrinket', ship: 'phantom',
      name: 'Kuantum Gölge Pelerini', icon: '👻', color: '#d24dff',
      formula: 'Void Phantom Özel Kök Aleti (Lv.1 ➔ Lv.5)',
      simType: 'dagger',
      desc: 'Görünmezlik süresini uzatır ve görünmezlikten çıkarken yapılan ilk saldırının hasarını %250 katlar.',
      levels: [
        ['Lv.1', '+0.4s Görünmezlik • +%50 Pusu Hasarı', 'Faz Kayması'],
        ['Lv.3', '+0.9s Görünmezlik • +%120 Pusu Hasarı', 'Gölge Klonu'],
        ['Lv.5 (MAKS)', '+1.5s Görünmezlik • +%250 Pusu Hasarı', 'Hiçlik Biçicisi Sentezini Açar']
      ]
    },
    fusionHeart: {
      id: 'fusionHeart', kind: 'sigTrinket', ship: 'solarflare',
      name: 'Termonükleer Kalp', icon: '☀️', color: '#ff6600',
      formula: 'Solar Flare Özel Kök Aleti (Lv.1 ➔ Lv.5)',
      simType: 'flame',
      desc: 'Radyasyon aurası çapını büyütür ve yanarak ölen her düşmanın termal bir patlama yaymasını sağlar.',
      levels: [
        ['Lv.1', '+%25 Yanık Hasarı • +%15 Aura Çapı', 'Zincirleme Tutuşturma'],
        ['Lv.3', '+%55 Yanık Hasarı • +%30 Aura Çapı', 'Ölümde Lav Patlaması'],
        ['Lv.5 (MAKS)', '+%100 Yanık Hasarı • +%50 Aura Çapı', 'Helios Kıyameti Sentezini Açar']
      ]
    },
    teslaCoil: {
      id: 'teslaCoil', kind: 'sigTrinket', ship: 'tempest',
      name: 'Süper-İletken Bobin', icon: '🌩️', color: '#00d4ff',
      formula: 'Tempest Özel Kök Aleti (Lv.1 ➔ Lv.5)',
      simType: 'laser',
      desc: 'Ateş hızını +%14/Lv artırır ve yavaşlatılmış/dondurulmuş düşmanlara +%35 ekstra elektro-şok hasarı vurur.',
      levels: [
        ['Lv.1', '+%14 Ateş Hızı • +%12 Buz Hasarı', 'Süper-İletken Akım'],
        ['Lv.3', '+%28 Ateş Hızı • +%24 Buz Hasarı', 'Zincirleme Ark'],
        ['Lv.5 (MAKS)', '+%45 Ateş Hızı • +%40 Buz Hasarı', 'Mutlak Sıfır Sentezini Açar']
      ]
    },
    neuralLink: {
      id: 'neuralLink', kind: 'sigTrinket', ship: 'valkyrie',
      name: 'Nöral Komuta Ağı', icon: '🧠', color: '#ffd700',
      formula: 'Valkyrie Özel Kök Aleti (Lv.1 ➔ Lv.5)',
      simType: 'missile',
      desc: 'Otonom droneların ve güdümlü füzelerin atış sayısını ve kritik isabet oranını artırır.',
      levels: [
        ['Lv.1', '+%20 Drone/Füze Hasarı', 'Senkronize Hedefleme'],
        ['Lv.3', '+%45 Drone/Füze Hasarı • +1 Drone', 'Sürü Zekası'],
        ['Lv.5 (MAKS)', '+%75 Drone/Füze Hasarı • +2 Drone', 'Seraphim Filosu Sentezini Açar']
      ]
    },
    fluxCapacitor: {
      id: 'fluxCapacitor', kind: 'sigTrinket', ship: 'chronos',
      name: 'Zaman Akı Çekirdeği', icon: '⌛', color: '#00ffcc',
      formula: 'Chronos Özel Kök Aleti (Lv.1 ➔ Lv.5)',
      simType: 'blackhole',
      desc: 'Tüm silah ve yetenek bekleme sürelerini -%15/Lv düşürür, anomali sürelerini uzatır.',
      levels: [
        ['Lv.1', '-%12 Bekleme Süresi • +%15 Süre', 'Krono Rezonans'],
        ['Lv.3', '-%26 Bekleme Süresi • +%30 Süre', 'Zaman Bükümü'],
        ['Lv.5 (MAKS)', '-%42 Bekleme Süresi • +%50 Süre', 'Sonsuzluk Döngüsü Sentezini Açar']
      ]
    },

    // ── EVRENSEL SİLAHLAR (ÇAPRAZ EVRİM DESTEKLİ) ──
    dualLaser: {
      id: 'dualLaser', kind: 'weapon',
      name: 'Çift Lazer', icon: '⚡', color: '#00f0ff', baseDmg: 34, cd: '0.18s',
      formula: 'Çapraz Dallar: +Soğutucu ➔ Gatling Fırtınası | +Nişangah ➔ Prizma Kırılması',
      simType: 'laser',
      desc: 'Paralel foton namlularından yüksek hızlı lazerler ateşler. Seçtiğiniz alete göre 2 farklı evrime dallanır!',
      levels: [
        ['Lv.1', '14 Hasar x2 Namlu', '0.18s Ateş Hızı'],
        ['Lv.3', '23 Hasar x3 Namlu', '0.15s Ateş Hızı'],
        ['Lv.5 (MAKS)', '34 Hasar x4 Namlu', '2 Farklı Çapraz Evrime Hazır']
      ]
    },
    heavyPlasma: {
      id: 'heavyPlasma', kind: 'weapon',
      name: 'Ağır Plazma Topu', icon: '☄️', color: '#ff5500', baseDmg: 88, cd: '0.75s',
      formula: 'Çapraz Dallar: +Biyo-Reaktör ➔ Kan Hasadı | +Mıknatıs ➔ Graviton Çökertici',
      simType: 'plasma',
      desc: 'Çarpışma anında alansal patlama yaratan plazma küresi. Biyo-Reaktör veya Mıknatıs ile iki ayrı evrime gider.',
      levels: [
        ['Lv.1', '36 Hasar • 65px Patlama', 'Alansal Şok'],
        ['Lv.3', '60 Hasar • 85px Patlama', 'Zırh Eritme'],
        ['Lv.5 (MAKS)', '88 Hasar • 110px Patlama', '2 Farklı Çapraz Evrime Hazır']
      ]
    },
    energyDisc: {
      id: 'energyDisc', kind: 'weapon',
      name: 'Dönen Enerji Diski', icon: '💿', color: '#bf00ff', baseDmg: 42, cd: 'Yörünge',
      formula: 'Çapraz Dallar: +Kinetik İtici ➔ Aegis Rezonansı | +Soğutucu ➔ Kriyo Kasırgası',
      simType: 'disc',
      desc: 'Gemi yörüngesinde dönerek yaklaşan sürüleri biçen kesici plazma diskleri.',
      levels: [
        ['Lv.1', '2 Disk • 16 Hasar/tik', '75px Yörünge'],
        ['Lv.3', '3 Disk • 28 Hasar/tik', '85px Yörünge'],
        ['Lv.5 (MAKS)', '5 Disk • 42 Hasar/tik', '2 Farklı Çapraz Evrime Hazır']
      ]
    },
    quantumDagger: {
      id: 'quantumDagger', kind: 'weapon',
      name: 'Kuantum Hançeri', icon: '🗡️', color: '#ff006a', baseDmg: 68, cd: '0.40s',
      formula: 'Çapraz Dallar: +Mıknatıs ➔ Kozmik Süpernova | +Nişangah ➔ Hayalet İnfazcı',
      simType: 'dagger',
      desc: 'En yüksek cana sahip elit hedeflere kilitlenen, yüksek kritik şanslı zırh delici faz hançerleri.',
      levels: [
        ['Lv.1', '28 Hasar • 1 Hançer', '+%20 Kritik Bonusu'],
        ['Lv.3', '46 Hasar • 2 Hançer', '1 Hedef Deler'],
        ['Lv.5 (MAKS)', '68 Hasar • 3 Hançer', '2 Farklı Çapraz Evrime Hazır']
      ]
    },
    flameLine: {
      id: 'flameLine', kind: 'weapon',
      name: 'Alev Hattı', icon: '🔥', color: '#ff8800', baseDmg: 68, cd: '0.28s',
      formula: 'Çapraz Dallar: +Deflektör ➔ Titan Koronası | +Biyo-Reaktör ➔ Biyo-Napalm Seli',
      simType: 'flame',
      desc: 'Geminin önünde ve arkasında sürekli yanan termal plazma koridoru oluşturur.',
      levels: [
        ['Lv.1', '22/sn Termal Hasar', 'İkili Alev İzi'],
        ['Lv.3', '42/sn Termal Hasar', 'Geniş Plazma Koridoru'],
        ['Lv.5 (MAKS)', '68/sn Termal Hasar', '2 Farklı Çapraz Evrime Hazır']
      ]
    },
    swarmMissiles: {
      id: 'swarmMissiles', kind: 'weapon',
      name: 'Füze Sürüsü', icon: '🚀', color: '#00ff88', baseDmg: 46, cd: '0.65s',
      formula: 'Çapraz Dallar: +Nişangah ➔ Kuantum Yargıç | +Nöral Ağ ➔ Seraphim Filosu',
      simType: 'missile',
      desc: 'En yakın hedeflere kilitlenen güdümlü mikro füze bataryası.',
      levels: [
        ['Lv.1', '23 Hasar x2 Füze', 'Güdümlü Kilit'],
        ['Lv.3', '35 Hasar x3 Füze', 'Hızlı Ateşleme'],
        ['Lv.5 (MAKS)', '46 Hasar x4 Füze', 'Çapraz Evrime Hazır']
      ]
    },

    // ── 6 EVRENSEL ALET (TRINKETS) ──
    coolant: {
      id: 'coolant', kind: 'trinket',
      name: 'Kriyo Soğutucu', icon: '❄️', color: '#00ccff',
      formula: 'Katalizör: Çift Lazer (Gatling Fırtınası) & Enerji Diski (Kriyo Kasırgası)',
      simType: 'laser',
      desc: 'Tüm silahların ateşleme süresini ve aktif yetenek Cooldown süresini -%14/Lv azaltır.',
      levels: [
        ['Lv.1', '-%14 Cooldown', 'Hızlı Ateşleme'],
        ['Lv.3', '-%36 Cooldown', 'Aşırı Soğutma'],
        ['Lv.5 (MAKS)', '-%55 Cooldown', '2 Evrim Dalını Açar']
      ]
    },
    bioreactor: {
      id: 'bioreactor', kind: 'trinket',
      name: 'Biyo-Reaktör', icon: '🩸', color: '#ff2255',
      formula: 'Katalizör: Ağır Plazma (Kan Hasadı) & Alev Hattı (Biyo-Napalm Seli)',
      simType: 'plasma',
      desc: 'Maksimum canı +30 HP/Lv artırır ve saniyede +2.5 HP/Lv pasif biyo-onarım sağlar.',
      levels: [
        ['Lv.1', '+30 HP • +2.5 HP/sn', 'Biyo-Onarım'],
        ['Lv.3', '+90 HP • +7.5 HP/sn', 'Öldürmede Can Çalma'],
        ['Lv.5 (MAKS)', '+150 HP • +12.5 HP/sn', '2 Evrim Dalını Açar']
      ]
    },
    thruster: {
      id: 'thruster', kind: 'trinket',
      name: 'Kinetik İtici', icon: '🛡️', color: '#aa66ff',
      formula: 'Katalizör: Enerji Diski (Aegis Rezonansı)',
      simType: 'disc',
      desc: 'Gemi hareket hızını +%12/Lv ve zırh korumasını +%6/Lv artırır.',
      levels: [
        ['Lv.1', '+%12 Hız • +%6 Zırh', 'Kinetik İtki'],
        ['Lv.3', '+%36 Hız • +%18 Zırh', 'Çarpışma Direnci'],
        ['Lv.5 (MAKS)', '+%60 Hız • +%30 Zırh', 'Aegis Rezonansı Dalını Açar']
      ]
    },
    magnet: {
      id: 'magnet', kind: 'trinket',
      name: 'Mıknatıs Çekirdeği', icon: '🧲', color: '#44ffaa',
      formula: 'Katalizör: Kuantum Hançeri (Kozmik Süpernova) & Ağır Plazma (Graviton Çökertici)',
      simType: 'blackhole',
      desc: 'XP/Ganimet çekim çapını +%35/Lv ve silah menzilini +%15/Lv artırır.',
      levels: [
        ['Lv.1', '+%35 Çekim • +%15 Menzil', 'Manyetik Alan'],
        ['Lv.3', '+%105 Çekim • +%45 Menzil', 'XP Bonusu +%15'],
        ['Lv.5 (MAKS)', '+%175 Çekim • +%75 Menzil', '2 Evrim Dalını Açar']
      ]
    },
    targetMatrix: {
      id: 'targetMatrix', kind: 'trinket',
      name: 'Kuantum Nişangah', icon: '🎯', color: '#ffd700',
      formula: 'Katalizör: Füze Sürüsü, Çift Lazer & Kuantum Hançeri Çapraz Evrimleri',
      simType: 'missile',
      desc: 'Kritik vuruş şansını +%9/Lv ve tüm silahların mermi hasarını +%15/Lv artırır.',
      levels: [
        ['Lv.1', '+%9 Kritik • +%15 Hasar', 'Lazer Güdüm'],
        ['Lv.3', '+%27 Kritik • +%45 Hasar', 'Zayıf Nokta Analizi'],
        ['Lv.5 (MAKS)', '+%45 Kritik • +%75 Hasar', '3 Evrim Dalını Açar']
      ]
    },
    shieldMatrix: {
      id: 'shieldMatrix', kind: 'trinket',
      name: 'Deflektör Matrisi', icon: '◆', color: '#00f0ff',
      formula: 'Katalizör: Alev Hattı (Titan Koronası)',
      simType: 'flame',
      desc: 'Maksimum kalkanı +35 SH/Lv ve kalkan dolum hızını +%20/Lv artırır.',
      levels: [
        ['Lv.1', '+35 Kalkan • +%20 Dolum', 'Yansıtıcı Faz'],
        ['Lv.3', '+105 Kalkan • +%60 Dolum', 'Kalkan Darbe Direnci'],
        ['Lv.5 (MAKS)', '+175 Kalkan • +%100 Dolum', 'Titan Koronası Evrimini Açar']
      ]
    },

    // ── KATMAN 2: 8 KARAKTERE ÖZEL EVRİMLER + 11 ÇAPRAZ EVRİM (X + Y = Z) ──
    tachyonLance: {
      id: 'tachyonLance', kind: 'sigEvolution', ship: 'interceptor',
      name: 'Takyon Mızrağı', icon: '🔱', color: '#00f0ff', dmg: 280,
      reqs: ['photonRailgun', 'overdriveCore', 'dualLaser'],
      formula: 'Foton Raylı Top (veya Çift Lazer) Lv.5 + Hiper-İvme Çekirdeği Lv.5',
      simType: 'laser',
      desc: '[AVCI ÖZEL EVRİMİ] Ekranı boydan boya delen sonsuz hızlı takyon ışını; geçtiği yerde patlayan foton izi bırakır.',
      levels: [['EVRİM (Z)', '280 Delici Hasar • %100 Kritik İzi', 'Avcı İmza Evrimi']]
    },
    siegeBehemoth: {
      id: 'siegeBehemoth', kind: 'sigEvolution', ship: 'dreadnought',
      name: 'Kıyamet Bataryası', icon: '🌋', color: '#ffaa00', dmg: 310,
      reqs: ['flakArtillery', 'reactiveArmor', 'heavyPlasma'],
      formula: 'Balistik Flak Topu (veya Ağır Plazma) Lv.5 + Reaktif Zırh Plakası Lv.5',
      simType: 'plasma',
      desc: '[KRUVAZÖR ÖZEL EVRİMİ] Zırh delici nükleer havan yaylımı; her patlama 12 parça tesirli şarapnel ve sarsıntı dalgası yayar.',
      levels: [['EVRİM (Z)', '310 Alan Hasarı • +%25 Ek Zırh', 'Kruvazör İmza Evrimi']]
    },
    sanctuaryMaelstrom: {
      id: 'sanctuaryMaelstrom', kind: 'sigEvolution', ship: 'aegis',
      name: 'Kutsal İyon Fırtınası', icon: '🌀', color: '#00ff88', dmg: 195,
      reqs: ['teslaPrism', 'harmonicCapacitor', 'energyDisc'],
      formula: 'Tesla Kalkan Prizması (veya Enerji Diski) Lv.5 + Harmonik Kondansatör Lv.5',
      simType: 'disc',
      desc: '[AEGIS ÖZEL EVRİMİ] Yörüngedeki diskler birbirine yıldırım ağlarıyla bağlanır; ağa değen düşman mermileri anında kalkana dönüşür.',
      levels: [['EVRİM (Z)', '195/sn İyon Ağı • Mermi Yutucu', 'Aegis İmza Evrimi']]
    },
    abyssalReaper: {
      id: 'abyssalReaper', kind: 'sigEvolution', ship: 'phantom',
      name: 'Hiçlik Biçicisi', icon: '💀', color: '#d24dff', dmg: 340,
      reqs: ['voidScythe', 'phaseCloak', 'quantumDagger'],
      formula: 'Hiper-Uzay Tırpanı (veya Kuantum Hançeri) Lv.5 + Kuantum Gölge Pelerini Lv.5',
      simType: 'dagger',
      desc: '[VOID PHANTOM ÖZEL EVRİMİ] Her saldırıda gölge klonları fırlatan boyutsal tırpan; canı %30 altındaki düşmanları anında biçer.',
      levels: [['EVRİM (Z)', '340 Suikast Hasarı • %30 İnfaz Eşiği', 'Void Phantom İmza Evrimi']]
    },
    heliosCataclysm: {
      id: 'heliosCataclysm', kind: 'sigEvolution', ship: 'solarflare',
      name: 'Helios Güneş Kıyameti', icon: '🌞', color: '#ff6600', dmg: 260,
      reqs: ['solarMortar', 'fusionHeart', 'flameLine'],
      formula: 'Plazma Havanı (veya Alev Hattı) Lv.5 + Termonükleer Kalp Lv.5',
      simType: 'flame',
      desc: '[SOLAR FLARE ÖZEL EVRİMİ] Haritada dev güneş kraterleri açar ve yanan her düşmanı zincirleme süpernova gibi patlatır.',
      levels: [['EVRİM (Z)', '260/sn Güneş Alevi • Zincirleme Nova', 'Solar Flare İmza Evrimi']]
    },
    absoluteZero: {
      id: 'absoluteZero', kind: 'sigEvolution', ship: 'tempest',
      name: 'Mutlak Sıfır Fırtınası', icon: '🌨️', color: '#00d4ff', dmg: 250,
      reqs: ['cryoNova', 'teslaCoil', 'dualLaser'],
      formula: 'Kriyo-Buzul Küresi (veya Çift Lazer) Lv.5 + Süper-İletken Bobin Lv.5',
      simType: 'disc',
      desc: '[TEMPEST ÖZEL EVRİMİ] Ekran çapında dondurucu buzul fırtınası ve 8 hedefe sıçrayan süper-iletken yıldırım arkları koparır.',
      levels: [['EVRİM (Z)', '250 Kriyo-Ark Hasarı • 2.5sn Dondurma', 'Tempest İmza Evrimi']]
    },
    seraphFleet: {
      id: 'seraphFleet', kind: 'sigEvolution', ship: 'valkyrie',
      name: 'Seraphim Drone Filosu', icon: '🛸', color: '#ffd700', dmg: 275,
      reqs: ['droneSwarm', 'neuralLink', 'swarmMissiles'],
      formula: 'Otonom Savaş Droneları (veya Füze Sürüsü) Lv.5 + Nöral Komuta Ağı Lv.5',
      simType: 'missile',
      desc: '[VALKYRIE ÖZEL EVRİMİ] 6 adet altın Seraphim drone\'u yörüngede döner ve hedeflere odaklanmış mini-railgun ışınları yağdırır.',
      levels: [['EVRİM (Z)', '6 Seraphim Drone • 275 Filo DPS', 'Valkyrie İmza Evrimi']]
    },
    eternityLoop: {
      id: 'eternityLoop', kind: 'sigEvolution', ship: 'chronos',
      name: 'Sonsuzluk Döngüsü', icon: '♾️', color: '#00ffcc', dmg: 290,
      reqs: ['chronoRift', 'fluxCapacitor', 'energyDisc'],
      formula: 'Zaman Yarığı Projektörü (veya Enerji Diski) Lv.5 + Zaman Akı Çekirdeği Lv.5',
      simType: 'blackhole',
      desc: '[CHRONOS ÖZEL EVRİMİ] Düşmanları zaman döngüsüne hapseden çifte tekillik halkaları açar ve patlama hasarını iki kez uygular.',
      levels: [['EVRİM (Z)', '290 Krono Hasarı • Çifte Zaman Yankısı', 'Chronos İmza Evrimi']]
    },

    // Evrensel Çapraz Evrimler
    gatlingStorm: {
      id: 'gatlingStorm', kind: 'evolution',
      name: 'Gatling Fırtınası', icon: '🌪️', color: '#00ff88', dmg: 195,
      reqs: ['dualLaser', 'coolant'],
      formula: 'Çift Lazer Lv.5 + Kriyo Soğutucu Lv.5 (Dal A)',
      simType: 'laser',
      desc: 'Lazerler hiper-hızla yağar ve isabet ettiği düşmanlar arasında otomatik olarak 3 kez seker (Ricochet).',
      levels: [['EVRİM (Z1)', '55 Hasar x3 Namlu • 3 Sekme', '0.07s Hiper Ateş Hızı']]
    },
    prismOverload: {
      id: 'prismOverload', kind: 'evolution',
      name: 'Prizma Kırılması', icon: '🌈', color: '#00f0ff', dmg: 210,
      reqs: ['dualLaser', 'targetMatrix'],
      formula: 'Çift Lazer Lv.5 + Kuantum Nişangah Lv.5 (Dal B)',
      simType: 'laser',
      desc: 'Çift Lazerin 2. çapraz evrimi! Her kritik lazer isabetinde ışın 5 farklı yöne kırılan gökkuşağı fotonlarına bölünür.',
      levels: [['EVRİM (Z2)', '72 Kritik Hasar • 5 Yöne Kırılma', 'Çapraz Dal Evrimi']]
    },
    bloodHarvest: {
      id: 'bloodHarvest', kind: 'evolution',
      name: 'Kan Hasadı', icon: '🩸', color: '#ff1744', dmg: 215,
      reqs: ['heavyPlasma', 'bioreactor'],
      formula: 'Ağır Plazma Topu Lv.5 + Biyo-Reaktör Lv.5 (Dal A)',
      simType: 'plasma',
      desc: 'Her vuruş kızıl plazma patlaması yayar ve verilen hasarın %10\'unu doğrudan cana çevirir.',
      levels: [['EVRİM (Z1)', '145 Alan Hasarı • %10 Can Çalma', '130px Kızıl Nova']]
    },
    gravitonImploder: {
      id: 'gravitonImploder', kind: 'evolution',
      name: 'Graviton Çökertici', icon: '🪐', color: '#ff8800', dmg: 225,
      reqs: ['heavyPlasma', 'magnet'],
      formula: 'Ağır Plazma Topu Lv.5 + Mıknatıs Çekirdeği Lv.5 (Dal B)',
      simType: 'blackhole',
      desc: 'Ağır Plazmanın 2. çapraz evrimi! Patladığı noktada ters yerçekimi şoku yaratarak tüm düşmanları merkeze çarpıştırır.',
      levels: [['EVRİM (Z2)', '160 Çökertme Hasarı • Girdap Çekimi', 'Çapraz Dal Evrimi']]
    },
    aegisResonance: {
      id: 'aegisResonance', kind: 'evolution',
      name: 'Aegis Rezonansı', icon: '💠', color: '#00f0ff', dmg: 205,
      reqs: ['energyDisc', 'thruster'],
      formula: 'Dönen Enerji Diski Lv.5 + Kinetik İtici Lv.5 (Dal A)',
      simType: 'disc',
      desc: '5 adet dev kesici disk döner; hareket ettikçe kalkan hızla dolar, kalkan kırılınca tüm ekranı temizleyen EMP patlar.',
      levels: [['EVRİM (Z1)', '5 Disk • 65 Hasar/tik • Otomatik EMP', 'Kalkan Rezonansı']]
    },
    cryoVortex: {
      id: 'cryoVortex', kind: 'evolution',
      name: 'Kriyo Kasırgası', icon: '❄️', color: '#80e5ff', dmg: 200,
      reqs: ['energyDisc', 'coolant'],
      formula: 'Dönen Enerji Diski Lv.5 + Kriyo Soğutucu Lv.5 (Dal B)',
      simType: 'disc',
      desc: 'Enerji Diskinin 2. çapraz evrimi! Sıfır-altı buz testereleri temas ettiği tüm düşmanları %60 yavaşlatır ve dondurur.',
      levels: [['EVRİM (Z2)', '6 Buz Diski • %60 Dondurma', 'Çapraz Dal Evrimi']]
    },
    cosmicSupernova: {
      id: 'cosmicSupernova', kind: 'evolution',
      name: 'Kozmik Süpernova', icon: '🌌', color: '#bf00ff', dmg: 235,
      reqs: ['quantumDagger', 'magnet'],
      formula: 'Kuantum Hançeri Lv.5 + Mıknatıs Çekirdeği Lv.5 (Dal A)',
      simType: 'blackhole',
      desc: 'Kritik hançer vuruşları alansal bir Kara Delik açar ve çevredeki tüm parazitleri içine çekip ezer.',
      levels: [['EVRİM (Z1)', '120 Kritik + Kara Delik Tekilliği', '155px Çekim Alanı']]
    },
    phantomExecutioner: {
      id: 'phantomExecutioner', kind: 'evolution',
      name: 'Hayalet İnfazcı', icon: '⚔️', color: '#ff006a', dmg: 245,
      reqs: ['quantumDagger', 'targetMatrix'],
      formula: 'Kuantum Hançeri Lv.5 + Kuantum Nişangah Lv.5 (Dal B)',
      simType: 'dagger',
      desc: 'Kuantum Hançerinin 2. çapraz evrimi! Hedefler arasında ışınlanan bıçaklar yaralı düşmanları anında infaz eder.',
      levels: [['EVRİM (Z2)', '4 Güdümlü Bıçak • %25 İnfaz', 'Çapraz Dal Evrimi']]
    },
    titanCore: {
      id: 'titanCore', kind: 'evolution',
      name: 'Titan Koronası', icon: '☀️', color: '#ff8800', dmg: 220,
      reqs: ['flameLine', 'shieldMatrix'],
      formula: 'Alev Hattı Lv.5 + Deflektör Matrisi Lv.5 (Dal A)',
      simType: 'flame',
      desc: 'Alev koridoru devasa güneş halkasına dönüşür ve her 2.5 saniyede bir ekran çapında yakıcı Termal Nova yayar.',
      levels: [['EVRİM (Z1)', '210px Termal Nova • +%25 Maks HP Hasarı', 'Korona Halkası']]
    },
    necroticNapalm: {
      id: 'necroticNapalm', kind: 'evolution',
      name: 'Biyo-Napalm Seli', icon: '🧪', color: '#00ff88', dmg: 215,
      reqs: ['flameLine', 'bioreactor'],
      formula: 'Alev Hattı Lv.5 + Biyo-Reaktör Lv.5 (Dal B)',
      simType: 'flame',
      desc: 'Alev Hattının 2. çapraz evrimi! Yanan düşmanlar eriyerek pilota can veren asidik plazma havuzları bırakır.',
      levels: [['EVRİM (Z2)', 'Asit Yanığı + Saniyede +15 HP Onarım', 'Çapraz Dal Evrimi']]
    },
    quantumArbiter: {
      id: 'quantumArbiter', kind: 'evolution',
      name: 'Kuantum Yargıç', icon: '🔱', color: '#ffd700', dmg: 240,
      reqs: ['swarmMissiles', 'targetMatrix'],
      formula: 'Füze Sürüsü Lv.5 + Kuantum Nişangah Lv.5 (Dal A)',
      simType: 'missile',
      desc: 'Füzeler düşmanları delip geçen kuantum mızraklarına dönüşür; her delmede +%25 güçlenir.',
      levels: [['EVRİM (Z1)', '4 Mızrak • 4 Hedef Deler • +%25 Güçlenme', 'Kuantum Güdüm']]
    },

    // ── KATMAN 3: KOZMİK MEGA EVRİMLER (Z1 + Z2 = MEGA) ──
    infernoGatling: {
      id: 'infernoGatling', kind: 'mega', ship: 'solarflare',
      name: 'Cehennem Gatling\'i', icon: '👑', color: '#ff0055', dmg: 520,
      reqs: ['gatlingStorm', 'bloodHarvest', 'heliosCataclysm', 'necroticNapalm'],
      formula: 'Gatling Fırtınası + Kan Hasadı (veya Helios Kıyameti) ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'flame',
      desc: '[KOZMİK MEGA EVRİM] Haritayı yakan, 4 kez seken kızıl cehennem mermileri yağdırır; her sekmede plazma patlatır ve pilotu sürekli iyileştirir! İki silahı birleştirerek +1 Boş Silah Slotu açar.',
      levels: [['MEGA EVRİM', '4 Sekmeli Kızıl Plazma Fırtınası + %15 Can Çalma', '+1 SİLAH SLOTU AÇAR']]
    },
    eventHorizon: {
      id: 'eventHorizon', kind: 'mega', ship: 'aegis',
      name: 'Olay Ufku Tekilliği', icon: '🌀', color: '#00f0ff', dmg: 495,
      reqs: ['cosmicSupernova', 'aegisResonance', 'sanctuaryMaelstrom', 'cryoVortex'],
      formula: 'Kozmik Süpernova + Aegis Rezonansı (veya Kutsal İyon Fırtınası) ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'blackhole',
      desc: '[KOZMİK MEGA EVRİM] Gemi etrafında 6 adet Kara Delik Diski döner; mermileri yutar, düşmanları merkeze çeker ve EMP şokları yayar!',
      levels: [['MEGA EVRİM', '6 Kara Delik Diski + Otomatik EMP Tekilliği', '+1 SİLAH SLOTU AÇAR']]
    },
    omegaJudgement: {
      id: 'omegaJudgement', kind: 'mega',
      name: 'Omega Kıyamet Reaktörü', icon: '⚡', color: '#ffd700', dmg: 550,
      reqs: ['titanCore', 'quantumArbiter', 'prismOverload'],
      formula: 'Titan Koronası + Kuantum Yargıç (veya Prizma Kırılması) ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'missile',
      desc: '[KOZMİK MEGA EVRİM] Her 1.8 sn\'de güneş patlaması yayarken tüm ekrana zırh delici altın kuantum mızrakları yağdırır!',
      levels: [['MEGA EVRİM', '5 Altın Mızrak + 280px Omega Güneş Novası', '+1 SİLAH SLOTU AÇAR']]
    },
    hyperionApex: {
      id: 'hyperionApex', kind: 'mega', ship: 'interceptor',
      name: 'Hyperion Işık Hükümdarı', icon: '🌟', color: '#00f0ff', dmg: 560,
      reqs: ['tachyonLance', 'gatlingStorm', 'prismOverload'],
      formula: 'Takyon Mızrağı + Gatling Fırtınası (veya Prizma Kırılması) ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'laser',
      desc: '[AVCI MEGA EVRİMİ] Ekranı 8 yönde kesen yörüngesel takyon lazer ağı ve sınırsız sekme kapasiteli ışık fırtınası!',
      levels: [['MEGA EVRİM', '8 Yönlü Takyon Ağı + %100 Kritik Sekme', '+1 SİLAH SLOTU AÇAR']]
    },
    ironDreadnought: {
      id: 'ironDreadnought', kind: 'mega', ship: 'dreadnought',
      name: 'Zırhlı Kıyamet Kalesi', icon: '🏰', color: '#ffaa00', dmg: 610,
      reqs: ['siegeBehemoth', 'titanCore', 'gravitonImploder'],
      formula: 'Kıyamet Bataryası + Titan Koronası (veya Graviton Çökertici) ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'plasma',
      desc: '[KRUVAZÖR MEGA EVRİMİ] %60 hasar azaltmalı reaktif kale zırhı ve 360° kesintisiz nükleer-graviton bombardımanı!',
      levels: [['MEGA EVRİM', '360° Nükleer Havan + %60 Reaktif Zırh', '+1 SİLAH SLOTU AÇAR']]
    },
    eclipseSingularity: {
      id: 'eclipseSingularity', kind: 'mega', ship: 'phantom',
      name: 'Tutulma Tanrısı', icon: '🌑', color: '#d24dff', dmg: 585,
      reqs: ['abyssalReaper', 'cosmicSupernova', 'phantomExecutioner'],
      formula: 'Hiçlik Biçicisi + Kozmik Süpernova (veya Hayalet İnfazcı) ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'dagger',
      desc: '[GÖLGE MEGA EVRİMİ] Karanlık madde klonları ve boyutsal kara delik tırpanlarıyla ekran çapında mutlak suikast yıkımı!',
      levels: [['MEGA EVRİM', 'Boyutsal Tırpan Fırtınası + %35 Anında İnfaz', '+1 SİLAH SLOTU AÇAR']]
    },
    stormSingularity: {
      id: 'stormSingularity', kind: 'mega', ship: 'tempest',
      name: 'Kozmik Fırtına Tekilliği', icon: '🌩️', color: '#00d4ff', dmg: 545,
      reqs: ['absoluteZero', 'cryoVortex', 'gatlingStorm'],
      formula: 'Mutlak Sıfır Fırtınası + Kriyo Kasırgası (veya Gatling Fırtınası) ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'disc',
      desc: '[TEMPEST MEGA EVRİMİ] Tüm arenayı mutlak sıfırda donduran kriyo-kasırga ve 12 hedefe sıçrayan plazma yıldırımı!',
      levels: [['MEGA EVRİM', '12 Sıçramalı Kriyo-Yıldırım + Kalıcı Buzul Alanı', '+1 SİLAH SLOTU AÇAR']]
    },
    armadaProtocol: {
      id: 'armadaProtocol', kind: 'mega', ship: 'valkyrie',
      name: 'Yörüngesel Armada Protokolü', icon: '🚀', color: '#ffd700', dmg: 575,
      reqs: ['seraphFleet', 'quantumArbiter', 'prismOverload'],
      formula: 'Seraphim Drone Filosu + Kuantum Yargıç ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'missile',
      desc: '[VALKYRIE MEGA EVRİMİ] 8 adet altın Seraphim muhribi ve ekranı boydan boya yaran senkronize Railgun yaylımı!',
      levels: [['MEGA EVRİM', '8 Otonom Muhrip + Yörüngesel Railgun Ağı', '+1 SİLAH SLOTU AÇAR']]
    },
    bigBangSingularity: {
      id: 'bigBangSingularity', kind: 'mega', ship: 'chronos',
      name: 'Büyük Patlama Tekilliği', icon: '🌌', color: '#00ffcc', dmg: 600,
      reqs: ['eternityLoop', 'cosmicSupernova', 'gravitonImploder'],
      formula: 'Sonsuzluk Döngüsü + Kozmik Süpernova (veya Graviton Çökertici) ➔ MEGA EVRİM (+1 Boş Slot)',
      simType: 'blackhole',
      desc: '[CHRONOS MEGA EVRİMİ] Zamanı durduran süper-kütleli tekillik açar ve tüm düşmanları merkeze çekip Büyük Patlama ile siler!',
      levels: [['MEGA EVRİM', 'Zaman Durduran Tekillik + 320px Büyük Patlama', '+1 SİLAH SLOTU AÇAR']]
    }
  };

  // State
  const urlParams = new URLSearchParams(window.location.search);
  let activeShipId = urlParams.get('ship') || sessionStorage.getItem('cosmic_ship') || 'interceptor';
  if (!SHIP_TREES[activeShipId]) activeShipId = 'interceptor';

  let selectedNodeId = SHIP_TREES[activeShipId].sigEvo;
  let activeFilter = 'ship-branch'; // 'ship-branch' | 'all' | 'weapon' | 'trinket' | 'evolution' | 'mega'
  let searchQuery = '';
  let zoomScale = 1.0;

  // Update Topbar Credits if CosmicPersistence is loaded
  function syncTopbarCredits() {
    if (window.CosmicPersistence) {
      const p = window.CosmicPersistence.load();
      const el = document.getElementById('topCreditAmount');
      if (el) el.textContent = (p.credits || 0).toLocaleString('tr-TR');
    }
  }

  // ── 1. RENDER 8 SHIP TABS ──
  function renderShipTabs() {
    const container = document.getElementById('shipTabsContainer');
    if (!container) return;
    container.innerHTML = '';

    Object.values(SHIP_TREES).forEach(st => {
      const tab = document.createElement('div');
      tab.className = `ship-tab ${st.id === activeShipId ? 'active' : ''}`;
      tab.style.setProperty('--sc', st.color);
      tab.style.setProperty('--sg', st.glow);
      tab.innerHTML = `
        <div class="ship-tab-icon">${st.svg}</div>
        <div class="ship-tab-info">
          <span class="ship-tab-name">${st.shortName}</span>
          <span class="ship-tab-sig">★ ${NODES[st.sigWeapon].name}</span>
        </div>
      `;
      tab.addEventListener('click', () => {
        activeShipId = st.id;
        sessionStorage.setItem('cosmic_ship', activeShipId);
        selectedNodeId = st.sigEvo;
        renderShipTabs();
        buildTreeDOM();
        selectNode(selectedNodeId);
        syncCalculatorToShip(st.id);
      });
      container.appendChild(tab);
    });
  }

  // ── 2. BUILD 4-STAGE TREE DOM ──
  function createNodeEl(nodeId, badgeOverride = null, isShipSig = false) {
    const n = NODES[nodeId];
    if (!n) return null;
    const el = document.createElement('div');
    el.className = `tree-node ${isShipSig ? 'ship-signature' : ''}`;
    el.id = `node-${nodeId}`;
    el.dataset.nodeId = nodeId;
    el.dataset.kind = n.kind;
    el.style.setProperty('--nc', n.color);

    const typeLabel = badgeOverride || (
      n.kind === 'sigWeapon' ? '★ ÖZEL KÖK SİLAH' :
      n.kind === 'sigTrinket' ? '★ ÖZEL KÖK ALET' :
      n.kind === 'weapon' ? '⚔ SİLAH (LV.5)' :
      n.kind === 'trinket' ? '🧲 ALET (LV.5)' :
      n.kind === 'sigEvolution' ? '🌟 ÖZEL EVRİM' :
      n.kind === 'evolution' ? '⚡ ÇAPRAZ EVRİM' : '👑 MEGA EVRİM'
    );

    el.innerHTML = `
      <div class="node-icon">${n.icon}</div>
      <div class="node-body">
        <div class="node-tag"><span>${typeLabel}</span></div>
        <div class="node-title">${n.name}</div>
        <div class="node-sub">${n.formula.split('(')[0].trim()}</div>
      </div>
    `;

    el.addEventListener('click', () => {
      selectNode(nodeId);
      // If user clicks a weapon or trinket node, also feed it into the Build Calculator!
      if (n.kind === 'weapon' || n.kind === 'sigWeapon') {
        const wSel = document.getElementById('calcWeaponSelect');
        if (wSel) {
          wSel.value = nodeId;
          evaluateBuildCalculator();
        }
      } else if (n.kind === 'trinket' || n.kind === 'sigTrinket') {
        const tSel = document.getElementById('calcTrinketSelect');
        if (tSel) {
          tSel.value = nodeId;
          evaluateBuildCalculator();
        }
      }
    });
    return el;
  }

  function buildTreeDOM() {
    const st = SHIP_TREES[activeShipId];
    const col0 = document.getElementById('colRootAndTrinkets');
    const col1 = document.getElementById('colWeapons');
    const col2 = document.getElementById('colEvolutions');
    const col3 = document.getElementById('colMegaEvolutions');
    if (!col0 || !col1 || !col2 || !col3) return;

    col0.innerHTML = `<div class="col-header" style="color:${st.color};border-color:${st.color}">1. GEMİ ÖZEL KÖKÜ &amp; ALETLER (Y)</div>`;
    col1.innerHTML = `<div class="col-header" style="color:#00f0ff">2. AKTİF SİLAH HAVUZU (X)</div>`;
    col2.innerHTML = `<div class="col-header" style="color:#bf00ff">3. ÇAPRAZ EVRİM MATRİSİ (X+Y=Z)</div>`;
    col3.innerHTML = `<div class="col-header" style="color:#ffd700">4. KOZMİK MEGA EVRİM (Z1+Z2=MEGA)</div>`;

    // Col 0: Selected Ship's Signature Trinket + Universal Trinkets
    col0.appendChild(createNodeEl(st.sigTrinket, '★ GEMİ ÖZEL KÖK ALETİ', true));
    ['coolant', 'bioreactor', 'thruster', 'magnet', 'targetMatrix', 'shieldMatrix'].forEach(tid => {
      col0.appendChild(createNodeEl(tid));
    });

    // Col 1: Selected Ship's Signature Weapon + Universal Weapons
    col1.appendChild(createNodeEl(st.sigWeapon, '★ GEMİ ÖZEL KÖK SİLAHI', true));
    ['dualLaser', 'heavyPlasma', 'energyDisc', 'quantumDagger', 'flameLine', 'swarmMissiles'].forEach(wid => {
      const isStarter = wid === st.starterWeapon;
      col1.appendChild(createNodeEl(wid, isStarter ? '🚀 BAŞLANGIÇ SİLAHI' : null, isStarter));
    });

    // Col 2: Selected Ship's Signature Evolution + Cross-Branching Evolutions
    col2.appendChild(createNodeEl(st.sigEvo, '🌟 KARAKTER ÖZEL EVRİMİ', true));
    [
      'gatlingStorm', 'prismOverload',
      'bloodHarvest', 'gravitonImploder',
      'aegisResonance', 'cryoVortex',
      'cosmicSupernova', 'phantomExecutioner',
      'titanCore', 'necroticNapalm',
      'quantumArbiter'
    ].forEach(eid => {
      col2.appendChild(createNodeEl(eid));
    });

    // Col 3: Selected Ship's Mega Evolution first + Universal & Other Mega Evolutions
    const allMegas = [
      st.sigMega,
      ...['infernoGatling', 'eventHorizon', 'omegaJudgement', 'hyperionApex', 'ironDreadnought', 'eclipseSingularity', 'stormSingularity', 'armadaProtocol', 'bigBangSingularity']
        .filter(m => m !== st.sigMega)
    ];
    allMegas.forEach((mid, idx) => {
      col3.appendChild(createNodeEl(mid, idx === 0 ? '👑 GEMİ MEGA EVRİMİ' : '👑 KOZMİK MEGA EVRİM', idx === 0));
    });

    applySearchAndFilter();
    requestAnimationFrame(drawAllConnections);
  }

  // ── 3. SVG BEZIER CONNECTION LINES ──
  function getEdges() {
    const edges = [];
    Object.values(NODES).forEach(node => {
      if (node.reqs) {
        node.reqs.forEach(reqId => {
          const fromEl = document.getElementById(`node-${reqId}`);
          const toEl = document.getElementById(`node-${node.id}`);
          if (fromEl && toEl && !fromEl.classList.contains('search-hidden') && !toEl.classList.contains('search-hidden')) {
            edges.push({ from: reqId, to: node.id, color: node.color });
          }
        });
      }
    });
    return edges;
  }

  function getConnectedSet(targetId) {
    const edges = getEdges();
    const related = new Set([targetId]);
    edges.forEach(e => {
      if (e.from === targetId || e.to === targetId) {
        related.add(e.from);
        related.add(e.to);
      }
    });
    edges.forEach(e => {
      if (related.has(e.from) && NODES[e.to] && NODES[e.to].kind === 'mega') {
        related.add(e.to);
      }
      if (related.has(e.to) && NODES[e.from]) {
        related.add(e.from);
      }
    });
    return related;
  }

  function drawAllConnections() {
    const svg = document.getElementById('svgConnections');
    const stage = document.getElementById('treeZoomStage');
    const cols = document.getElementById('treeColumns');
    if (!svg || !stage || !cols) return;

    svg.setAttribute('width', cols.scrollWidth + 40);
    svg.setAttribute('height', cols.scrollHeight + 40);
    svg.innerHTML = '';

    const stageRect = stage.getBoundingClientRect();
    const edges = getEdges();
    const connectedSet = getConnectedSet(selectedNodeId);
    const showAll = activeFilter !== 'ship-branch';

    edges.forEach(edge => {
      const fromEl = document.getElementById(`node-${edge.from}`);
      const toEl = document.getElementById(`node-${edge.to}`);
      if (!fromEl || !toEl) return;

      const r1 = fromEl.getBoundingClientRect();
      const r2 = toEl.getBoundingClientRect();

      const x1 = (r1.right - stageRect.left) / zoomScale;
      const y1 = (r1.top + r1.height / 2 - stageRect.top) / zoomScale;
      const x2 = (r2.left - stageRect.left) / zoomScale;
      const y2 = (r2.top + r2.height / 2 - stageRect.top) / zoomScale;

      const dx = Math.abs(x2 - x1) * 0.48;
      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', edge.color);

      const isHighlighted = showAll ||
        edge.from === selectedNodeId ||
        edge.to === selectedNodeId ||
        (connectedSet.has(edge.from) && connectedSet.has(edge.to));

      path.setAttribute('class', `conn-path ${isHighlighted ? 'highlighted' : 'dimmed'}`);
      svg.appendChild(path);
    });
  }

  // ── 4. SEARCH & CATEGORY FILTER ──
  function applySearchAndFilter() {
    const q = searchQuery.trim().toLowerCase();
    const connectedSet = getConnectedSet(selectedNodeId);

    document.querySelectorAll('.tree-node').forEach(el => {
      const id = el.dataset.nodeId;
      const n = NODES[id];
      if (!n) return;

      // Search match
      const hay = `${n.name} ${n.formula} ${n.desc}`.toLowerCase();
      const matchesSearch = !q || hay.includes(q);
      el.classList.toggle('search-hidden', !matchesSearch);

      // Filter dimming
      let matchesCategory = true;
      if (activeFilter === 'weapon') {
        matchesCategory = (n.kind === 'weapon' || n.kind === 'sigWeapon');
      } else if (activeFilter === 'trinket') {
        matchesCategory = (n.kind === 'trinket' || n.kind === 'sigTrinket');
      } else if (activeFilter === 'evolution') {
        matchesCategory = (n.kind === 'evolution' || n.kind === 'sigEvolution');
      } else if (activeFilter === 'mega') {
        matchesCategory = (n.kind === 'mega');
      } else if (activeFilter === 'ship-branch') {
        matchesCategory = connectedSet.has(id);
      }

      el.classList.toggle('selected', id === selectedNodeId);
      el.classList.toggle('connected', id !== selectedNodeId && connectedSet.has(id));
      el.classList.toggle('dimmed', !matchesCategory && id !== selectedNodeId);
    });

    requestAnimationFrame(drawAllConnections);
  }

  // ── 5. SELECT NODE & POPULATE RIGHT INSPECTOR ──
  function selectNode(nodeId) {
    const n = NODES[nodeId];
    if (!n) return;
    selectedNodeId = nodeId;

    applySearchAndFilter();

    const typeBadge = document.getElementById('inspTypeBadge');
    if (typeBadge) {
      typeBadge.textContent =
        n.kind === 'sigWeapon' ? '★ KARAKTER ÖZEL KÖK SİLAHI' :
        n.kind === 'sigTrinket' ? '★ KARAKTER ÖZEL KÖK ALETİ' :
        n.kind === 'sigEvolution' ? '🌟 KARAKTER ÖZEL EVRİMİ (X+Y=Z)' :
        n.kind === 'evolution' ? '⚡ ÇAPRAZ EVRİM (X+Y=Z)' :
        n.kind === 'mega' ? '👑 KOZMİK MEGA EVRİM (Z1+Z2=MEGA)' :
        n.kind === 'weapon' ? '⚔ AKTİF SİLAH SLOTU' : '🧲 ALET / TRINKET SLOTU';
    }

    const titleEl = document.getElementById('inspTitle');
    if (titleEl) {
      titleEl.textContent = `${n.icon} ${n.name}`;
      titleEl.style.color = n.color;
    }

    const formulaEl = document.getElementById('inspFormula');
    if (formulaEl) formulaEl.textContent = n.formula;

    const descEl = document.getElementById('inspDesc');
    if (descEl) descEl.textContent = n.desc;

    const tbody = document.getElementById('inspStatsBody');
    if (tbody) {
      tbody.innerHTML = (n.levels || []).map(row =>
        `<tr><td style="color:#ffd700;font-weight:700;">${row[0]}</td><td>${row[1]}</td><td style="color:#00f0ff">${row[2]}</td></tr>`
      ).join('');
    }

    const connectedSet = getConnectedSet(nodeId);
    const branchesBox = document.getElementById('inspBranchesBox');
    if (branchesBox) {
      branchesBox.innerHTML = '';
      connectedSet.forEach(cid => {
        if (cid === nodeId || !NODES[cid]) return;
        const cn = NODES[cid];
        const chip = document.createElement('div');
        chip.className = 'branch-chip';
        chip.innerHTML = `<span>${cn.icon} <strong>${cn.name}</strong></span><span style="color:${cn.color};font-family:'Space Mono',monospace;font-size:0.62rem;">İNCELE ➔</span>`;
        chip.addEventListener('click', () => selectNode(cid));
        branchesBox.appendChild(chip);
      });
    }
  }

  // ── 6. INTERACTIVE SYNTHESIS SIMULATOR (BUILD CALCULATOR: X + Y = Z ➔ MEGA) ──
  function initBuildCalculator() {
    const wSel = document.getElementById('calcWeaponSelect');
    const tSel = document.getElementById('calcTrinketSelect');
    const btnAutoPair = document.getElementById('btnAutoPairSynergy');
    const btnHighlightEvo = document.getElementById('btnHighlightCalcEvo');
    if (!wSel || !tSel) return;

    const weaponNodes = Object.values(NODES).filter(n => n.kind === 'weapon' || n.kind === 'sigWeapon');
    const trinketNodes = Object.values(NODES).filter(n => n.kind === 'trinket' || n.kind === 'sigTrinket');

    wSel.innerHTML = weaponNodes.map(w =>
      `<option value="${w.id}">${w.icon} ${w.name} ${w.ship ? `[${SHIP_TREES[w.ship].shortName}]` : '(Evrensel)'}</option>`
    ).join('');

    tSel.innerHTML = trinketNodes.map(t =>
      `<option value="${t.id}">${t.icon} ${t.name} ${t.ship ? `[${SHIP_TREES[t.ship].shortName}]` : '(Evrensel)'}</option>`
    ).join('');

    wSel.addEventListener('change', evaluateBuildCalculator);
    tSel.addEventListener('change', evaluateBuildCalculator);

    if (btnAutoPair) {
      btnAutoPair.addEventListener('click', () => {
        const wId = wSel.value;
        // Find an evolution that uses wId
        const matchingEvo = Object.values(NODES).find(
          n => (n.kind === 'evolution' || n.kind === 'sigEvolution') && n.reqs && n.reqs.includes(wId)
        );
        if (matchingEvo) {
          const matchingTrinket = matchingEvo.reqs.find(r => NODES[r] && (NODES[r].kind === 'trinket' || NODES[r].kind === 'sigTrinket'));
          if (matchingTrinket) {
            tSel.value = matchingTrinket;
            evaluateBuildCalculator();
          }
        }
      });
    }

    if (btnHighlightEvo) {
      btnHighlightEvo.addEventListener('click', () => {
        const targetEvoId = btnHighlightEvo.dataset.targetEvo;
        if (targetEvoId && NODES[targetEvoId]) {
          selectNode(targetEvoId);
          const el = document.getElementById(`node-${targetEvoId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    syncCalculatorToShip(activeShipId);
  }

  function syncCalculatorToShip(shipId) {
    const st = SHIP_TREES[shipId];
    const wSel = document.getElementById('calcWeaponSelect');
    const tSel = document.getElementById('calcTrinketSelect');
    if (!st || !wSel || !tSel) return;
    wSel.value = st.sigWeapon;
    tSel.value = st.sigTrinket;
    evaluateBuildCalculator();
  }

  function evaluateBuildCalculator() {
    const wSel = document.getElementById('calcWeaponSelect');
    const tSel = document.getElementById('calcTrinketSelect');
    const resBox = document.getElementById('synthResultBox');
    const resName = document.getElementById('synthResName');
    const resBadge = document.getElementById('synthResBadge');
    const resDesc = document.getElementById('synthResDesc');
    const resMega = document.getElementById('synthMegaHint');
    const btnHighlight = document.getElementById('btnHighlightCalcEvo');
    if (!wSel || !tSel || !resBox) return;

    const wId = wSel.value;
    const tId = tSel.value;
    const wNode = NODES[wId];
    const tNode = NODES[tId];

    // Check if any evolution has both wId and tId in its reqs
    const matchedEvo = Object.values(NODES).find(
      n => (n.kind === 'evolution' || n.kind === 'sigEvolution') &&
           n.reqs && n.reqs.includes(wId) && n.reqs.includes(tId)
    );

    if (matchedEvo) {
      resBox.classList.remove('no-match');
      resName.textContent = `${matchedEvo.icon} ${matchedEvo.name}`;
      resName.style.color = matchedEvo.color;
      resBadge.textContent = `SENTEZ BAŞARILI (${matchedEvo.dmg || 220} DPS)`;
      resBadge.className = 'badge tier-s';
      resDesc.textContent = matchedEvo.desc;

      // Find Mega Evolutions that use matchedEvo
      const megas = Object.values(NODES).filter(
        m => m.kind === 'mega' && m.reqs && m.reqs.includes(matchedEvo.id)
      );
      if (megas.length) {
        resMega.innerHTML = `👑 <strong>Mega Evrim Yolu:</strong> ${megas.map(m => `${m.icon} ${m.name}`).join(' veya ')} <em>(+1 Boş Silah Slotu Açar!)</em>`;
      } else {
        resMega.textContent = '👑 Bu evrim bağımsız süper silah olarak çalışır.';
      }

      if (btnHighlight) {
        btnHighlight.dataset.targetEvo = matchedEvo.id;
        btnHighlight.disabled = false;
        btnHighlight.textContent = `🔍 "${matchedEvo.name}" Dalını Ağaçta Göster`;
      }
    } else {
      resBox.classList.add('no-match');
      resName.textContent = '⚠️ Doğrudan Çapraz Sentez Yok';
      resName.style.color = '#ffaa00';
      resBadge.textContent = 'KATALİZÖR UYUMSUZ';
      resBadge.className = 'badge';

      // Suggest valid trinkets for wId
      const validEvos = Object.values(NODES).filter(
        n => (n.kind === 'evolution' || n.kind === 'sigEvolution') && n.reqs && n.reqs.includes(wId)
      );
      const validTrinkets = [];
      validEvos.forEach(ev => {
        ev.reqs.forEach(r => {
          if (NODES[r] && (NODES[r].kind === 'trinket' || NODES[r].kind === 'sigTrinket')) {
            validTrinkets.push(`${NODES[r].icon} ${NODES[r].name} (➔ ${ev.name})`);
          }
        });
      });

      resDesc.innerHTML = `<strong>${wNode ? wNode.name : 'Seçili silah'}</strong> ile <strong>${tNode ? tNode.name : 'seçili alet'}</strong> doğrudan birleşmez. Bu silahı evrimleştirmek için gereken katalizör: <strong style="color:#00f0ff">${validTrinkets.join(' veya ')}</strong>.`;
      resMega.innerHTML = `💡 <em>"Önerilen Katalizörü Eşleştir"</em> butonuna basarak doğru aleti otomatik seçebilirsiniz.`;

      if (btnHighlight) {
        btnHighlight.dataset.targetEvo = wId;
        btnHighlight.disabled = false;
        btnHighlight.textContent = `🔍 "${wNode ? wNode.name : 'Silah'}" Düğümünü Göster`;
      }
    }
  }

  // ── 7. ZOOM & PAN CONTROLS ──
  function setZoom(newZoom) {
    zoomScale = Math.max(0.65, Math.min(1.4, newZoom));
    const stage = document.getElementById('treeZoomStage');
    const lbl = document.getElementById('zoomLevelLabel');
    if (stage) stage.style.transform = `scale(${zoomScale})`;
    if (lbl) lbl.textContent = `${Math.round(zoomScale * 100)}%`;
    setTimeout(drawAllConnections, 160);
  }

  function bindToolbarAndZoom() {
    const searchInput = document.getElementById('treeSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        searchQuery = e.target.value;
        applySearchAndFilter();
      });
    }

    document.querySelectorAll('#treeFilterPills .filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#treeFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        applySearchAndFilter();
      });
    });

    document.getElementById('btnZoomIn')?.addEventListener('click', () => setZoom(zoomScale + 0.1));
    document.getElementById('btnZoomOut')?.addEventListener('click', () => setZoom(zoomScale - 0.1));
    document.getElementById('btnZoomReset')?.addEventListener('click', () => setZoom(1.0));

    // Drag-to-pan on treeViewport
    const vp = document.getElementById('treeViewport');
    if (vp) {
      let isDown = false, startX = 0, startY = 0, scrollL = 0, scrollT = 0;
      vp.addEventListener('mousedown', e => {
        if (e.target.closest('.tree-node')) return;
        isDown = true;
        startX = e.pageX - vp.offsetLeft;
        startY = e.pageY - vp.offsetTop;
        scrollL = vp.scrollLeft;
        scrollT = vp.scrollTop;
      });
      window.addEventListener('mouseup', () => { isDown = false; });
      vp.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - vp.offsetLeft;
        const y = e.pageY - vp.offsetTop;
        vp.scrollLeft = scrollL - (x - startX);
        vp.scrollTop = scrollT - (y - startY);
      });
      vp.addEventListener('scroll', drawAllConnections);
    }

    window.addEventListener('resize', drawAllConnections);
  }

  // ── 8. LIVE HOLOGRAM EFFECT CANVAS SIMULATOR ──
  function initHoloCanvas() {
    const simCanvas = document.getElementById('holoEffectCanvas');
    if (!simCanvas) return;
    const sCtx = simCanvas.getContext('2d');
    let simT = 0;

    function animateHoloSim() {
      simT += 0.04;
      const w = simCanvas.width;
      const h = simCanvas.height;
      sCtx.clearRect(0, 0, w, h);

      const n = NODES[selectedNodeId] || NODES.dualLaser;
      const cx = 70;
      const cy = h / 2;

      // Mini Ship Hull
      sCtx.save();
      sCtx.translate(cx, cy);
      sCtx.strokeStyle = n.color;
      sCtx.fillStyle = '#090518';
      sCtx.lineWidth = 2;
      sCtx.beginPath();
      sCtx.moveTo(16, 0);
      sCtx.lineTo(-12, -12);
      sCtx.lineTo(-6, 0);
      sCtx.lineTo(-12, 12);
      sCtx.closePath();
      sCtx.fill();
      sCtx.stroke();
      sCtx.restore();

      if (n.simType === 'laser') {
        for (let i = -1; i <= 1; i++) {
          const yOff = i * 14;
          const bx = cx + 22 + ((simT * 180 + i * 40) % 230);
          sCtx.strokeStyle = n.color;
          sCtx.lineWidth = 3;
          sCtx.beginPath();
          sCtx.moveTo(bx, cy + yOff);
          sCtx.lineTo(bx + 32, cy + yOff + Math.sin(simT + i) * 6);
          sCtx.stroke();
        }
      } else if (n.simType === 'disc') {
        for (let d = 0; d < 4; d++) {
          const a = simT * 2.2 + (d * Math.PI) / 2;
          const dx = cx + Math.cos(a) * 42;
          const dy = cy + Math.sin(a) * 42;
          sCtx.strokeStyle = n.color;
          sCtx.lineWidth = 2.5;
          sCtx.beginPath();
          sCtx.arc(dx, dy, 8, 0, Math.PI * 2);
          sCtx.stroke();
        }
      } else if (n.simType === 'blackhole') {
        const bx = w * 0.68;
        for (let r = 10; r <= 40; r += 10) {
          sCtx.strokeStyle = n.color;
          sCtx.globalAlpha = 0.85 - r / 58;
          sCtx.lineWidth = 2;
          sCtx.beginPath();
          sCtx.arc(bx, cy, r + Math.sin(simT * 3) * 3, simT, simT + Math.PI * 1.5);
          sCtx.stroke();
        }
        sCtx.globalAlpha = 1;
      } else if (n.simType === 'flame') {
        for (let i = 0; i < 6; i++) {
          const fx = cx + 25 + i * 35;
          const rad = 9 + Math.sin(simT * 4 + i) * 4;
          sCtx.fillStyle = i % 2 === 0 ? '#ff6600' : '#ffd700';
          sCtx.globalAlpha = 0.68;
          sCtx.beginPath();
          sCtx.arc(fx, cy + Math.sin(simT * 2 + i) * 10, rad, 0, Math.PI * 2);
          sCtx.fill();
        }
        sCtx.globalAlpha = 1;
      } else {
        for (let i = 0; i < 3; i++) {
          const px = cx + 24 + ((simT * 140 + i * 75) % 230);
          const py = cy + Math.sin(simT * 3 + i * 2) * 20;
          sCtx.fillStyle = n.color;
          sCtx.beginPath();
          sCtx.arc(px, py, 6.5, 0, Math.PI * 2);
          sCtx.fill();
        }
      }

      requestAnimationFrame(animateHoloSim);
    }

    requestAnimationFrame(animateHoloSim);
  }

  // Initialize Everything
  syncTopbarCredits();
  renderShipTabs();
  buildTreeDOM();
  initBuildCalculator();
  bindToolbarAndZoom();
  selectNode(selectedNodeId);
  initHoloCanvas();
})();
