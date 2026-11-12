'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// COSMIC SURVIVORS v8.0 — MERKEZİ VERİ TABANI & KALICI META-PROGRESSION MOTORU
// (8 Gemi, 14 Silah, 14 Alet, 15 Çapraz Evrim, 8 Mega Evrim, 4 Harita, Atölye & Başarımlar)
// ═══════════════════════════════════════════════════════════════════════════

const COSMIC_DATA = {
  version: '8.0.0',
  brandTitle: 'COSMIC SURVIVORS — Kozmik Arena & Hiper-Evrim Roguelike',

  // ── 8 ÖZGÜN YILDIZ GEMİSİ (KARAKTER SINIFLARI) ──
  ships: [
    {
      id: 'interceptor',
      code: 'NX-01 INTERCEPTOR',
      name: 'Avcı (Interceptor)',
      role: 'Hızlı Taarruz & Kritik',
      tier: 'S',
      faction: 'Vanguard Filosu',
      color: '#00f0ff',
      accent: '#0099ff',
      asset: 'assets/ships/interceptor.svg',
      pngAsset: 'assets/ships/interceptor.png',
      unlockCost: 0,
      starterWeapon: 'dualLaser',
      starterWeaponName: 'Çift Lazer (Dual Laser)',
      sigWeapon: 'photonLance',
      sigWeaponName: 'Foton Mızrağı',
      sigTrinket: 'hyperDrive',
      sigTrinketName: 'Hiper-Sürücü',
      sigEvo: 'valkyrieSpear',
      sigEvoName: 'Valkyrie Mızrağı',
      sigMega: 'valkyrieHyperstorm',
      sigMegaName: 'Valkyrie Hiper-Fırtınası',
      hp: 105,
      sh: 55,
      sp: 354,
      crit: 0.20,
      armor: 0.05,
      cdr: 0.08,
      stats: { speed: 95, firepower: 86, defense: 45, utility: 78, complexity: 40 },
      passiveName: 'Hiper-Refleks İticileri',
      passiveDesc: '+%20 Hareket Hızı, +%15 Kritik Vuruş Şansı ve +%8 Ateş Hızı.',
      abilityName: 'WARP DASH',
      abilityCd: 7.0,
      abilityDesc: '1.2 sn boyunca dokunulmaz ışık hızı taklası atar ve arkasında düşmanları eriten foton lazer izi bırakır.',
      bestMaps: ['nebula', 'sector9'],
      lore: 'Sektör 9 devriye filosunun en çevik önleme avcısı. İkiz foton reaktörü sayesinde mermi yağmurlarının arasından sıyrılıp ölümcül kritik darbeler indirir.'
    },
    {
      id: 'dreadnought',
      code: 'TITAN-04 DREADNOUGHT',
      name: 'Kruvazör (Dreadnought)',
      role: 'Ağır Zırhlı Kuşatma',
      tier: 'S',
      faction: 'Demir Lejyon',
      color: '#ffaa00',
      accent: '#ff5500',
      asset: 'assets/ships/dreadnought.svg',
      pngAsset: 'assets/ships/dreadnought.png',
      unlockCost: 0,
      starterWeapon: 'heavyPlasma',
      starterWeaponName: 'Ağır Plazma Topu',
      sigWeapon: 'siegeMortar',
      sigWeaponName: 'Kuşatma Havanı',
      sigTrinket: 'reactivePlate',
      sigTrinketName: 'Reaktif Zırh Plakası',
      sigEvo: 'doomsdayBattery',
      sigEvoName: 'Kıyamet Bataryası',
      sigMega: 'doomsdayFortress',
      sigMegaName: 'Kıyamet Kalesi',
      hp: 185,
      sh: 90,
      sp: 240,
      crit: 0.08,
      armor: 0.32,
      cdr: 0.0,
      stats: { speed: 48, firepower: 92, defense: 98, utility: 65, complexity: 35 },
      passiveName: 'Titanyum Reaktif Gövde',
      passiveDesc: '+%32 Hasar Azaltma (Zırh), +85 Gövde Puanı ve çarpan düşmanlara karşı sarsıntı direnci.',
      abilityName: '360° FÜZE SALVOSU',
      abilityCd: 10.0,
      abilityDesc: '3 saniye boyunca 360 derece her yöne güdümsüz yüksek patlayıcılı mikro füze barajı ateşler.',
      bestMaps: ['sector9', 'blackhole'],
      lore: 'Karanlık filo istilasında cephe hattını tek başına tutmak için tasarlanan yörüngesel kuşatma kruvazörü.'
    },
    {
      id: 'aegis',
      code: 'AEG-07 GUARDIAN',
      name: 'Aegis (Kalkan Muhafızı)',
      role: 'Yörünge Savunma & EMP',
      tier: 'A+',
      faction: 'Aegis Konseyi',
      color: '#00ff88',
      accent: '#00c8ff',
      asset: 'assets/ships/aegis.svg',
      pngAsset: 'assets/ships/aegis.png',
      unlockCost: 0,
      starterWeapon: 'energyDisc',
      starterWeaponName: 'Dönen Enerji Diski',
      sigWeapon: 'prismOrb',
      sigWeaponName: 'Prizma Küresi',
      sigTrinket: 'capacitorCore',
      sigTrinketName: 'Kapasitör Çekirdeği',
      sigEvo: 'seraphimMatrix',
      sigEvoName: 'Seraphim Matrisi',
      sigMega: 'eventHorizon',
      sigMegaName: 'Olay Ufku',
      hp: 130,
      sh: 120,
      sp: 280,
      crit: 0.10,
      armor: 0.18,
      cdr: 0.05,
      stats: { speed: 70, firepower: 76, defense: 94, utility: 95, complexity: 50 },
      passiveName: 'Rezonans Kalkan Darbesi',
      passiveDesc: 'Her 8 saniyede bir otomatik Kalkan Şok Halkası yayar; kalkan kapasitesi +%60 daha yüksektir.',
      abilityName: 'EMP ŞOK DALGASI',
      abilityCd: 9.0,
      abilityDesc: 'Ekrandaki tüm düşman mermilerini anında siler, düşmanları sersemletir ve silinen mermi başına kalkan doldurur.',
      bestMaps: ['sector9', 'dyson'],
      lore: 'Deneysel prizmatik kalkan jeneratörleriyle donatılmış koruma fırkateyni. Düşman ateşini kendi silahına dönüştürür.'
    },
    {
      id: 'phantom',
      code: 'VP-09 VOID PHANTOM',
      name: 'Gölge (Void Phantom)',
      role: 'Kuantum Suikastçı',
      tier: 'S',
      faction: 'Hiçlik Tarikatı',
      color: '#d24dff',
      accent: '#7a00ff',
      asset: 'assets/ships/phantom.svg',
      pngAsset: 'assets/ships/phantom.png',
      unlockCost: 0,
      starterWeapon: 'quantumDagger',
      starterWeaponName: 'Kuantum Hançeri',
      sigWeapon: 'phaseScythe',
      sigWeaponName: 'Hiper-Faz Tırpanı',
      sigTrinket: 'cloakModule',
      sigTrinketName: 'Hiper-Pelerin Modülü',
      sigEvo: 'voidReaper',
      sigEvoName: 'Hiçlik Biçici',
      sigMega: 'voidOverlord',
      sigMegaName: 'Hiçlik Efendisi',
      hp: 95,
      sh: 50,
      sp: 335,
      crit: 0.25,
      armor: 0.05,
      cdr: 0.10,
      stats: { speed: 92, firepower: 96, defense: 42, utility: 85, complexity: 80 },
      passiveName: 'Boyutsal Görünmezlik & Suikast',
      passiveDesc: 'Her 10 sn\'de 1.5 sn görünmez olur; görünmezlikte ve boss arkası vuruşlarda +%65 Kritik Suikast Hasarı verir.',
      abilityName: 'GÖLGE SIÇRAMASI',
      abilityCd: 6.5,
      abilityDesc: 'Hareket yönüne boyutsal sıçrama yapar ve varış noktasında 8 adet zırh delici kuantum hançeri fırlatır.',
      bestMaps: ['nebula', 'dyson'],
      lore: 'Kara delik ufkunda dövülmüş faz-kaydırma teknolojisiyle düşman hatlarının arkasına sızan hayalet suikast gemisi.'
    },
    {
      id: 'solarflare',
      code: 'SF-12 SUNSTORM',
      name: 'Solar Flare (Güneş Fırtınası)',
      role: 'Termal Alan Yıkımı (AoE)',
      tier: 'S',
      faction: 'Helios Sendikası',
      color: '#ff5500',
      accent: '#ffcc00',
      asset: 'assets/ships/solarflare.svg',
      pngAsset: 'assets/ships/solarflare.png',
      unlockCost: 0,
      starterWeapon: 'flameLine',
      starterWeaponName: 'Alev Hattı',
      sigWeapon: 'solarFlareGun',
      sigWeaponName: 'Güneş Havanı',
      sigTrinket: 'coronaCore',
      sigTrinketName: 'Korona Çekirdeği',
      sigEvo: 'supernovaBurst',
      sigEvoName: 'Süpernova Patlaması',
      sigMega: 'omegaJudgement',
      sigMegaName: 'Omega Hükmü',
      hp: 125,
      sh: 65,
      sp: 295,
      crit: 0.14,
      armor: 0.12,
      cdr: 0.06,
      stats: { speed: 75, firepower: 98, defense: 62, utility: 80, complexity: 55 },
      passiveName: 'Radyasyon Korona Aurası',
      passiveDesc: 'Gemi çevresindeki 135px yarıçapındaki tüm düşmanları sürekli yakar ve saniyede termal plazma hasarı verir.',
      abilityName: 'KORONA SÜPERNOVASI',
      abilityCd: 9.5,
      abilityDesc: 'Ekran çapında güneş patlaması yayarak tüm düşmanları ateşe verir ve arkada korona lav havuzları bırakır.',
      bestMaps: ['blackhole', 'sector9'],
      lore: 'Çekirdeğinde minyatür bir yıldız barındıran deneysel kruvazör. Sürüleri saniyeler içinde küle çevirir.'
    },
    {
      id: 'tempest',
      code: 'CRYO-15 TEMPEST',
      name: 'Tempest (Kriyo-Fırtına)',
      role: 'Kriyo-Kontrol & Zincir Yıldırım',
      tier: 'S',
      faction: 'Kuzey Kutbu Tersanesi',
      color: '#00d4ff',
      accent: '#88ffff',
      asset: 'assets/ships/tempest.svg',
      pngAsset: 'assets/ships/tempest.png',
      unlockCost: 0,
      starterWeapon: 'arcLightning',
      starterWeaponName: 'Tesla Ark Projektörü',
      sigWeapon: 'cryoNova',
      sigWeaponName: 'Kriyo-Buzul Küresi',
      sigTrinket: 'teslaCoil',
      sigTrinketName: 'Süper-İletken Bobin',
      sigEvo: 'absoluteZero',
      sigEvoName: 'Mutlak Sıfır Fırtınası',
      sigMega: 'stormSingularity',
      sigMegaName: 'Kozmik Fırtına Tekilliği',
      hp: 115,
      sh: 85,
      sp: 310,
      crit: 0.16,
      armor: 0.14,
      cdr: 0.12,
      stats: { speed: 82, firepower: 89, defense: 74, utility: 98, complexity: 60 },
      passiveName: 'Mutlak Sıfır İyonizasyonu',
      passiveDesc: 'Tüm saldırılar düşmanları %30 yavaşlatır; yavaşlamış hedeflere karşı +%25 ekstra kritik hasar verir.',
      abilityName: 'KRİYO-TESLA FIRTINASI',
      abilityCd: 8.5,
      abilityDesc: 'Arena genelinde 12 adet zincirleme yıldırım düşürür ve tüm düşmanları 2.5 saniyeliğine dondurur.',
      bestMaps: ['dyson', 'nebula'],
      lore: 'Sıvı helyum soğutmalı süper-iletken bobinleriyle uzay boşluğunda şimşek ve buzul fırtınaları koparan ileri teknoloji korvet.'
    },
    {
      id: 'valkyrie',
      code: 'VK-22 CARRIER',
      name: 'Valkyrie (Drone Taşıyıcı)',
      role: 'Otonom Drone Filosu & Railgun',
      tier: 'S+',
      faction: 'Aegis Konseyi',
      color: '#ffd700',
      accent: '#00f0ff',
      asset: 'assets/ships/valkyrie.svg',
      pngAsset: 'assets/ships/valkyrie.png',
      unlockCost: 0,
      starterWeapon: 'swarmMissiles',
      starterWeaponName: 'Güdümlü Füze Sürüsü',
      sigWeapon: 'droneSwarm',
      sigWeaponName: 'Otonom Savaş Droneları',
      sigTrinket: 'neuralLink',
      sigTrinketName: 'Nöral Komuta Ağı',
      sigEvo: 'seraphFleet',
      sigEvoName: 'Seraphim Drone Filosu',
      sigMega: 'armadaProtocol',
      sigMegaName: 'Yörüngesel Armada Protokolü',
      hp: 145,
      sh: 95,
      sp: 275,
      crit: 0.15,
      armor: 0.22,
      cdr: 0.08,
      stats: { speed: 68, firepower: 95, defense: 84, utility: 92, complexity: 65 },
      passiveName: 'Otonom Muhafız Eskortu',
      passiveDesc: 'Savaşa otomatik ateş eden 2 adet Yörünge Savaş Drone\'u ile başlar; her 5 seviyede +1 ek mermi çarpanı kazanır.',
      abilityName: 'RAILGUN OVERDRIVE',
      abilityCd: 9.0,
      abilityDesc: 'Tüm droneları aşırı yükler ve gemi önünden ekranı boydan boya delen dev bir Elektromanyetik Railgun ışını ateşler.',
      bestMaps: ['sector9', 'dyson'],
      lore: 'Yapay zeka destekli mikro-avcı filolarını komuta eden yeni nesil cephe taşıyıcı gemisi.'
    },
    {
      id: 'chronos',
      code: 'CH-99 SINGULARITY',
      name: 'Chronos (Zaman Dokuyucu)',
      role: 'Zaman & Yerçekimi Manipülasyonu',
      tier: 'S+',
      faction: 'Ufuk Gözlemcileri',
      color: '#00ffcc',
      accent: '#ff006a',
      asset: 'assets/ships/chronos.svg',
      pngAsset: 'assets/ships/chronos.png',
      unlockCost: 0,
      starterWeapon: 'gravityWell',
      starterWeaponName: 'Graviton Küresi',
      sigWeapon: 'chronoRift',
      sigWeaponName: 'Zaman Yarığı Projektörü',
      sigTrinket: 'fluxCapacitor',
      sigTrinketName: 'Zaman Akı Çekirdeği',
      sigEvo: 'eternityLoop',
      sigEvoName: 'Sonsuzluk Döngüsü',
      sigMega: 'bigBangSingularity',
      sigMegaName: 'Büyük Patlama Tekilliği',
      hp: 110,
      sh: 105,
      sp: 305,
      crit: 0.18,
      armor: 0.15,
      cdr: 0.18,
      stats: { speed: 84, firepower: 94, defense: 72, utility: 100, complexity: 90 },
      passiveName: 'Relativistik Zaman Genleşmesi',
      passiveDesc: '+%18 Yetenek ve Silah Dolum Hızı (Cooldown Reduction); yakınındaki düşman mermileri %25 daha yavaş ilerler.',
      abilityName: 'ZAMAN DURDURMA (STASIS)',
      abilityCd: 11.0,
      abilityDesc: '3 saniye boyunca uzay-zamanı büker: tüm düşmanları ve mermileri yavaşlatır, geminin ateş hızını 2 katına çıkarır.',
      bestMaps: ['blackhole', 'nebula'],
      lore: 'Yasaklanmış kuantum kronometre teknolojisiyle inşa edilen, zamanın akışını silah olarak kullanan deneysel amiral gemisi.'
    }
  ],

  // ── 4 SEKTÖR HARİTASI ──
  maps: [
    {
      id: 'sector9',
      name: 'Sektör 9 Enkazı',
      subtitle: 'Taktiksel Hurda & Kuşatma Arenası',
      difficulty: 'NORMAL (x1.0 Kredi)',
      creditMult: 1.0,
      color: '#00f0ff',
      asset: 'assets/maps/sector9.svg',
      hazards: 'Dönen Titanyum Enkaz Parçaları & Uydu Kalkanları',
      enemyFocus: 'Dengeli Sürü, Okçu ve Kraliçe Filoları',
      recommendedShips: ['dreadnought', 'valkyrie', 'aegis'],
      desc: 'İmha edilmiş yıldız istasyonlarının dev enkazlarıyla dolu merkez sektör. Dönen enkaz blokları siper olarak kullanılabilir.'
    },
    {
      id: 'nebula',
      name: 'Kuantum Nebulası',
      subtitle: 'İyonize Gaz Bulutları & Hız Koridoru',
      difficulty: 'ZORLU (x1.25 Kredi)',
      creditMult: 1.25,
      color: '#bf00ff',
      asset: 'assets/maps/nebula.svg',
      hazards: 'Mavi Hızlandırıcı İyon Bulutları (+%45 Hız) & Mor Stasis Gazı (-%35 Hız)',
      enemyFocus: 'Hayalet (Phantom) ve Işınlanan Sıçrayıcı (Blinker) Sürüleri',
      recommendedShips: ['interceptor', 'phantom', 'tempest'],
      desc: 'Yüksek enerjili plazma fırtınalarının hüküm sürdüğü nebula. Doğru gaz koridorlarını kullanan pilotlar ışık hızında manevra yapar.'
    },
    {
      id: 'blackhole',
      name: 'Kara Delik Çevresi',
      subtitle: 'Olay Ufku Çekimi & Lav Asteroidleri',
      difficulty: 'KABUS (x1.50 Kredi)',
      creditMult: 1.5,
      color: '#ff5500',
      asset: 'assets/maps/blackhole.svg',
      hazards: 'Merkez Tekillik Çekim Alanı & Şarapnel Saçan Lav Asteroidleri',
      enemyFocus: 'Ağır Zırhlı Titanlar ve Bölünen (Splitter) Parazitler',
      recommendedShips: ['solarflare', 'chronos', 'dreadnought'],
      desc: 'Merkezdeki süper-kütleli kara delik hem gemileri hem de parazit sürülerini merkeze doğru çeker. Alan hasarı (AoE) silahları burada yıkıcıdır.'
    },
    {
      id: 'dyson',
      name: 'Dyson Mega-Küre Reaktörü',
      subtitle: 'Yörüngesel Lazer Izgarası & Aşırı Yük Sütunları',
      difficulty: 'EFSANEVİ (x1.75 Kredi)',
      creditMult: 1.75,
      color: '#00ff88',
      asset: 'assets/maps/dyson.svg',
      hazards: 'Periyodik Termal Lazer Koridorları & Enerji Şarj Pilonları (+%30 Hasar)',
      enemyFocus: 'Siber-Seraphim Muhafızları, Keskin Nişancılar ve Kamikaze Droneları',
      recommendedShips: ['valkyrie', 'aegis', 'tempest'],
      desc: 'Antik bir yıldızı çevreleyen mega-yapı reaktörü. Aktif enerji pilonlarının yakınında savaşmak silahlarınızı aşırı yükler!'
    }
  ],

  // ── TÜM SİLAHLAR, ALETLER, EVRİMLER VE MEGA EVRİMLER TABLOSU (KATALOG & WİKİ İÇİN) ──
  catalog: [
    // Evrensel Silahlar
    { id: 'dualLaser', name: 'Çift Lazer', category: 'weapon', ship: 'all', tier: 'A', icon: '⚡', color: '#00f0ff', baseDmg: 24, cd: '0.22s', pair: 'coolant / targetMatrix', evo: 'Gatling Fırtınası / Prizmatik Kırıcı', desc: 'Yüksek hızlı ikiz foton atışı; her seviyede mermi sayısı ve delme gücü artar.' },
    { id: 'heavyPlasma', name: 'Ağır Plazma Topu', category: 'weapon', ship: 'all', tier: 'A', icon: '💥', color: '#ff006a', baseDmg: 52, cd: '0.75s', pair: 'bioreactor / thruster', evo: 'Kan Hasadı / Kinetik Yıkıcı', desc: 'Çarpma anında patlayan yüksek kalibreli plazma küresi.' },
    { id: 'energyDisc', name: 'Dönen Enerji Diski', category: 'weapon', ship: 'all', tier: 'A', icon: '💿', color: '#00ff88', baseDmg: 34, cd: 'Yörünge', pair: 'thruster / shieldMatrix', evo: 'Aegis Rezonansı / Ayna Kalkanı', desc: 'Gemi etrafında sürekli dönerek yaklaşan sürüleri biçen enerji testereleri.' },
    { id: 'quantumDagger', name: 'Kuantum Hançeri', category: 'weapon', ship: 'all', tier: 'S', icon: '🗡️', color: '#bf00ff', baseDmg: 42, cd: '0.40s', pair: 'magnet / targetMatrix', evo: 'Kozmik Süpernova / Suikastçının Gölgesi', desc: 'En yakın hedefe kilitlenen, yüksek kritik çarpanlı zırh delici kuantum bıçakları.' },
    { id: 'flameLine', name: 'Alev Hattı', category: 'weapon', ship: 'all', tier: 'A', icon: '🔥', color: '#ff6600', baseDmg: 30, cd: '0.28s', pair: 'shieldMatrix / bioreactor', evo: 'Titan Koronası / Cehennem Nebulası', desc: 'Gemi arkasında ve önünde sürekli yanan termal plazma koridoru oluşturur.' },
    { id: 'swarmMissiles', name: 'Füze Sürüsü', category: 'weapon', ship: 'all', tier: 'S', icon: '🚀', color: '#ffd700', baseDmg: 38, cd: '0.65s', pair: 'targetMatrix / coolant', evo: 'Kuantum Yargıç / Halı Bombardımanı', desc: 'Çoklu hedeflere kilitlenen güdümlü mikro füze bataryası.' },
    { id: 'arcLightning', name: 'Tesla Ark Projektörü', category: 'weapon', ship: 'all', tier: 'S', icon: '🌩️', color: '#00d4ff', baseDmg: 36, cd: '0.48s', pair: 'coolant / magnet', evo: 'Mutlak Sıfır Fırtınası', desc: 'Düşmandan düşmana 4 kez sıçrayan yüksek voltajlı elektro-şok arkı.' },
    { id: 'gravityWell', name: 'Graviton Küresi', category: 'weapon', ship: 'all', tier: 'S', icon: '🌀', color: '#00ffcc', baseDmg: 44, cd: '0.85s', pair: 'magnet / shieldMatrix', evo: 'Sonsuzluk Döngüsü', desc: 'Düşmanları birbirine çeken ve patlayan mikro-yerçekimi anomalisi fırlatır.' },

    // Karakter Özel Kök Silahları (Signature Weapons)
    { id: 'photonLance', name: 'Foton Mızrağı', category: 'sig-weapon', ship: 'interceptor', tier: 'S+', icon: '💠', color: '#00f0ff', baseDmg: 68, cd: '0.50s', pair: 'Hiper-Sürücü (hyperDrive)', evo: 'Valkyrie Mızrağı', desc: '[Avcı Özel] Tüm hattı boydan boya delen ışık hızı foton mızrağı.' },
    { id: 'siegeMortar', name: 'Kuşatma Havanı', category: 'sig-weapon', ship: 'dreadnought', tier: 'S+', icon: '💣', color: '#ffaa00', baseDmg: 95, cd: '0.95s', pair: 'Reaktif Zırh (reactivePlate)', evo: 'Kıyamet Bataryası', desc: '[Kruvazör Özel] Geniş alanda şok dalgası yaratan ağır yörünge havanı.' },
    { id: 'prismOrb', name: 'Prizma Küresi', category: 'sig-weapon', ship: 'aegis', tier: 'S+', icon: '🔮', color: '#00ff88', baseDmg: 54, cd: '0.55s', pair: 'Kapasitör Çekirdeği (capacitorCore)', evo: 'Seraphim Matrisi', desc: '[Aegis Özel] Kalkan enerjisiyle güçlenen ve lazer kırınımı yayan prizmatik küre.' },
    { id: 'phaseScythe', name: 'Hiper-Faz Tırpanı', category: 'sig-weapon', ship: 'phantom', tier: 'S+', icon: '🌙', color: '#d24dff', baseDmg: 78, cd: '0.60s', pair: 'Hiper-Pelerin (cloakModule)', evo: 'Hiçlik Biçici', desc: '[Gölge Özel] Boyutlararası yay çizerek geri dönen bumerang suikast tırpanı.' },
    { id: 'solarFlareGun', name: 'Güneş Havanı', category: 'sig-weapon', ship: 'solarflare', tier: 'S+', icon: '☄️', color: '#ff5500', baseDmg: 82, cd: '0.80s', pair: 'Korona Çekirdeği (coronaCore)', evo: 'Süpernova Patlaması', desc: '[Solar Flare Özel] Düştüğü yerde kalıcı güneş lavı bırakan termonükleer küre.' },
    { id: 'cryoNova', name: 'Kriyo-Buzul Küresi', category: 'sig-weapon', ship: 'tempest', tier: 'S+', icon: '❄️', color: '#00d4ff', baseDmg: 64, cd: '0.62s', pair: 'Süper-İletken Bobin (teslaCoil)', evo: 'Mutlak Sıfır Fırtınası', desc: '[Tempest Özel] Patladığında düşmanları donduran ve buz şarapnelleri saçan küre.' },
    { id: 'droneSwarm', name: 'Otonom Savaş Droneları', category: 'sig-weapon', ship: 'valkyrie', tier: 'S+', icon: '🛸', color: '#ffd700', baseDmg: 58, cd: '0.30s', pair: 'Nöral Komuta Ağı (neuralLink)', evo: 'Seraphim Drone Filosu', desc: '[Valkyrie Özel] Hedefleri bağımsız kovalayan ve lazer yağdıran otonom drone filosu.' },
    { id: 'chronoRift', name: 'Zaman Yarığı Projektörü', category: 'sig-weapon', ship: 'chronos', tier: 'S+', icon: '⏳', color: '#00ffcc', baseDmg: 74, cd: '0.70s', pair: 'Zaman Akı Çekirdeği (fluxCapacitor)', evo: 'Sonsuzluk Döngüsü', desc: '[Chronos Özel] Uzay-zamanı yırtarak içindeki düşmanları yaşlandırıp patlatan yarık.' },

    // Pasif Aletler (Trinkets)
    { id: 'coolant', name: 'Kriyo Soğutucu', category: 'trinket', ship: 'all', tier: 'S', icon: '❄️', color: '#00f0ff', baseDmg: 0, cd: 'Pasif', pair: 'Çift Lazer / Füze Sürüsü', evo: 'Gatling Fırtınası / Halı Bombardımanı', desc: 'Tüm silahların ateş hızını (Cooldown) seviye başına +%12 artırır.' },
    { id: 'bioreactor', name: 'Biyo-Reaktör', category: 'trinket', ship: 'all', tier: 'S', icon: '🧪', color: '#ff006a', baseDmg: 0, cd: 'Pasif', pair: 'Ağır Plazma / Alev Hattı', evo: 'Kan Hasadı / Cehennem Nebulası', desc: '+%18/Lv Maks Can, +2.5 HP/sn Can Yenileme ve Can Çalma (Leech) sağlar.' },
    { id: 'thruster', name: 'Kinetik İtici', category: 'trinket', ship: 'all', tier: 'A', icon: '🚀', color: '#00ff88', baseDmg: 0, cd: 'Pasif', pair: 'Enerji Diski / Ağır Plazma', evo: 'Aegis Rezonansı / Kinetik Yıkıcı', desc: '+%9/Lv Hareket Hızı ve +%8/Lv Zırh Koruması kazandırır.' },
    { id: 'magnet', name: 'Mıknatıs Çekirdeği', category: 'trinket', ship: 'all', tier: 'A', icon: '🧲', color: '#bf00ff', baseDmg: 0, cd: 'Pasif', pair: 'Kuantum Hançeri / Graviton', evo: 'Kozmik Süpernova', desc: 'XP ve Ganimet çekim yarıçapını +%35/Lv, kazanılan XP\'yi +%8/Lv artırır.' },
    { id: 'shieldMatrix', name: 'Deflektör Matrisi', category: 'trinket', ship: 'all', tier: 'A', icon: '🛡️', color: '#ff8800', baseDmg: 0, cd: 'Pasif', pair: 'Alev Hattı / Enerji Diski', evo: 'Titan Koronası / Ayna Kalkanı', desc: '+35/Lv Maks Kalkan ve +%20 daha hızlı kalkan yenilenmesi sağlar.' },
    { id: 'targetMatrix', name: 'Kuantum Nişangah', category: 'trinket', ship: 'all', tier: 'S', icon: '🎯', color: '#ffd700', baseDmg: 0, cd: 'Pasif', pair: 'Füze Sürüsü / Çift Lazer', evo: 'Kuantum Yargıç / Prizmatik Kırıcı', desc: '+%9/Lv Kritik Şansı ve tüm silahlara +%15/Lv Hasar Çarpanı verir.' },

    // Çapraz Evrimler (X + Y = Z)
    { id: 'gatlingStorm', name: 'Gatling Fırtınası', category: 'evolution', ship: 'all', tier: 'S', icon: '🌪️', color: '#00f0ff', baseDmg: 145, cd: '0.09s', pair: 'Çift Lazer Lv.5 + Soğutucu Lv.5', evo: 'Cehennem Gatling\'i', desc: 'Hiper-hızlı lazer yağmuru; mermiler hedefler arasında 3 kez seker (Ricochet).' },
    { id: 'bloodHarvest', name: 'Kan Hasadı', category: 'evolution', ship: 'all', tier: 'S', icon: '🩸', color: '#ff0055', baseDmg: 210, cd: '0.45s', pair: 'Ağır Plazma Lv.5 + Biyo-Reaktör Lv.5', evo: 'Cehennem Gatling\'i', desc: 'Kızıl plazma küreleri alan patlaması yaratır ve verilen hasarın %10\'unu cana dönüştürür.' },
    { id: 'aegisResonance', name: 'Aegis Rezonansı', category: 'evolution', ship: 'all', tier: 'S', icon: '💠', color: '#00ff88', baseDmg: 160, cd: 'Yörünge', pair: 'Enerji Diski Lv.5 + Kinetik İtici Lv.5', evo: 'Olay Ufku', desc: '6 adet rezonans diski döner; gemi hareket ettikçe kalkan doldurur ve EMP saçar.' },
    { id: 'cosmicSupernova', name: 'Kozmik Süpernova', category: 'evolution', ship: 'all', tier: 'S+', icon: '🌌', color: '#bf00ff', baseDmg: 195, cd: '0.26s', pair: 'Kuantum Hançeri Lv.5 + Mıknatıs Lv.5', evo: 'Olay Ufku', desc: 'Kritik hançer vuruşları düşmanları içine çekip ezen alansal Kara Delik açar.' },
    { id: 'titanCorona', name: 'Titan Koronası', category: 'evolution', ship: 'all', tier: 'S', icon: '☀️', color: '#ff8800', baseDmg: 175, cd: '0.18s', pair: 'Alev Hattı Lv.5 + Deflektör Lv.5', evo: 'Omega Hükmü', desc: 'Gemi etrafında dev güneş halkası oluşturur ve her 2.5 sn\'de Termal Nova patlatır.' },
    { id: 'quantumArbiter', name: 'Kuantum Yargıç', category: 'evolution', ship: 'all', tier: 'S+', icon: '🔱', color: '#ffd700', baseDmg: 220, cd: '0.35s', pair: 'Füze Sürüsü Lv.5 + Nişangah Lv.5', evo: 'Omega Hükmü', desc: 'Füzeler zırh delici kuantum mızraklarına dönüşür; her delmede +%25 güçlenir.' },

    // Kozmik Mega Evrimler (Z1 + Z2 = MEGA)
    { id: 'hellfireGatling', name: 'Cehennem Gatling\'i', category: 'mega', ship: 'all', tier: 'MEGA', icon: '👑', color: '#ff2a85', baseDmg: 480, cd: '0.07s', pair: 'Kan Hasadı + Gatling Fırtınası', evo: '+1 Silah Slotu Açar', desc: '4 kez seken patlayıcı kızıl-altın plazma yağmuru, yakıcı iz ve sınırsız can çalma!' },
    { id: 'eventHorizon', name: 'Olay Ufku', category: 'mega', ship: 'all', tier: 'MEGA', icon: '🌀', color: '#00f0ff', baseDmg: 450, cd: 'Yörünge+Tekillik', pair: 'Kozmik Süpernova + Aegis Rezonansı', evo: '+1 Silah Slotu Açar', desc: '6 kara delik diski döner; kritik vuruşlar tekillik açar ve periyodik EMP yayar!' },
    { id: 'omegaJudgement', name: 'Omega Hükmü', category: 'mega', ship: 'all', tier: 'MEGA', icon: '⚡', color: '#ffd700', baseDmg: 520, cd: '0.22s', pair: 'Titan Koronası + Kuantum Yargıç', evo: '+1 Silah Slotu Açar', desc: 'Yörüngesel kıyamet protokolü: Dev plazma küreleri ve 7 hedefe sıçrayan kuantum yıldırımları!' },
    { id: 'valkyrieHyperstorm', name: 'Valkyrie Hiper-Fırtınası', category: 'mega', ship: 'interceptor', tier: 'MEGA', icon: '🌟', color: '#00f0ff', baseDmg: 540, cd: '0.14s', pair: 'Valkyrie Mızrağı + Gatling Fırtınası', evo: '+1 Silah Slotu Açar', desc: '[Avcı Mega] Ekranı boydan boya yaran altın foton mızrakları ve seken lazer fırtınası!' },
    { id: 'doomsdayFortress', name: 'Kıyamet Kalesi', category: 'mega', ship: 'dreadnought', tier: 'MEGA', icon: '🏰', color: '#ffaa00', baseDmg: 590, cd: '0.40s', pair: 'Kıyamet Bataryası + Kan Hasadı', evo: '+1 Silah Slotu Açar', desc: '[Kruvazör Mega] Yörüngesel nükleer havan bombardımanı ve ölümsüz zırh/can çalma kalesi!' },
    { id: 'voidOverlord', name: 'Hiçlik Efendisi', category: 'mega', ship: 'phantom', tier: 'MEGA', icon: '👁️', color: '#d24dff', baseDmg: 560, cd: '0.20s', pair: 'Hiçlik Biçici + Kozmik Süpernova', evo: '+1 Silah Slotu Açar', desc: '[Gölge Mega] Boyutlararası tırpan darbeleri ve zincirleme tekillik patlamaları!' }
  ],

  // ── KALICI REAKTÖR ATÖLYESİ (META-PROGRESSION UPGRADES) ──
  workshopUpgrades: [
    { id: 'meta_dmg', name: 'Foton Çekirdek Aşırı Yüklemesi', icon: '⚔️', color: '#ff006a', maxLevel: 10, baseCost: 120, costMult: 1.45, bonusPerLv: '+%5 Tüm Silah Hasarı', statKey: 'dmgBonus', step: 0.05, desc: 'Tüm gemilerin başlangıç ve evrim silah hasarını kalıcı olarak artırır.' },
    { id: 'meta_hp', name: 'Nanit Titanyum Alaşım', icon: '🛡️', color: '#00ff88', maxLevel: 10, baseCost: 100, costMult: 1.40, bonusPerLv: '+%6 Maksimum Gövde & Kalkan', statKey: 'hpBonus', step: 0.06, desc: 'Maksimum HP ve Kalkan kapasitesini kalıcı olarak güçlendirir.' },
    { id: 'meta_speed', name: 'Kuantum İyon İticileri', icon: '🚀', color: '#00f0ff', maxLevel: 8, baseCost: 110, costMult: 1.45, bonusPerLv: '+%4 Hareket Hızı', statKey: 'spdBonus', step: 0.04, desc: 'Gemilerin manevra ve azami hızını kalıcı olarak yükseltir.' },
    { id: 'meta_crit', name: 'Nöral Hedefleme Matrisi', icon: '🎯', color: '#ffd700', maxLevel: 8, baseCost: 140, costMult: 1.50, bonusPerLv: '+%3 Kritik Vuruş Şansı', statKey: 'critBonus', step: 0.03, desc: 'Kritik vuruş olasılığını tüm gemilerde kalıcı olarak artırır.' },
    { id: 'meta_cdr', name: 'Kriyo-Akı Soğutma Sistemi', icon: '❄️', color: '#00d4ff', maxLevel: 8, baseCost: 150, costMult: 1.55, bonusPerLv: '+%3.5 Ateş & Yetenek Hızı', statKey: 'cdrBonus', step: 0.035, desc: 'Silah ve aktif gemi yeteneklerinin bekleme süresini kalıcı olarak düşürür.' },
    { id: 'meta_reroll', name: 'Kuantum Zar Manipülatörü', icon: '🎲', color: '#bf00ff', maxLevel: 4, baseCost: 220, costMult: 1.80, bonusPerLv: '+1 Ekstra Reroll & Skip Hakkı', statKey: 'rerollBonus', step: 1, desc: 'Her oyuna fazladan Zar Atma (Reroll) ve Pas Geçme (Skip) hakkı ile başlarsınız.' },
    { id: 'meta_magnet', name: 'Graviton Toplayıcı Dizi', icon: '🧲', color: '#00ffcc', maxLevel: 8, baseCost: 95, costMult: 1.38, bonusPerLv: '+%12 Çekim Çapı & +%5 XP', statKey: 'xpBonus', step: 0.05, desc: 'XP kristallerini ve Kozmik Sandıkları çok daha uzaktan çeker, seviye atlamayı hızlandırır.' },
    { id: 'meta_credits', name: 'Karanlık Madde Rafinerisi', icon: '💎', color: '#ffd700', maxLevel: 10, baseCost: 160, costMult: 1.50, bonusPerLv: '+%10 Kozmik Kredi Kazanımı', statKey: 'creditBonus', step: 0.10, desc: 'Düşmanlardan, bosslardan ve dalga sonlarından kazanılan Kozmik Kredi miktarını artırır.' }
  ],

  // ── KOZMİK BAŞARIMLAR (ACHIEVEMENTS) ──
  achievements: [
    { id: 'ach_wave10', name: 'Sektör 9 Gazisi', icon: '🎖️', reward: 250, desc: 'Herhangi bir gemiyle Dalga 10\'a ulaş.', check: s => s.maxWave >= 10 },
    { id: 'ach_wave25', name: 'Hiper-Uzay Amirali', icon: '👑', reward: 600, desc: 'Dalga 25\'e ulaşarak Kozmik Çürüme bölgesine gir.', check: s => s.maxWave >= 25 },
    { id: 'ach_kills1000', name: 'Parazit Avcısı', icon: '💀', reward: 300, desc: 'Toplam 1,000 Kozmik Parazit imha et.', check: s => s.totalKills >= 1000 },
    { id: 'ach_kills5000', name: 'Kıyamet Biçicisi', icon: '🔥', reward: 750, desc: 'Toplam 5,000 Kozmik Parazit imha et.', check: s => s.totalKills >= 5000 },
    { id: 'ach_first_evo', name: 'Evrim Mimarı', icon: '⚡', reward: 200, desc: 'İlk Çapraz Silah Evrimini (X+Y=Z) sentezle.', check: s => s.totalEvos >= 1 },
    { id: 'ach_first_mega', name: 'Kozmik Yarı-Tanrı', icon: '🌌', reward: 500, desc: 'Bir Kozmik Mega Evrim (Z1+Z2=MEGA) sentezle.', check: s => s.totalMegas >= 1 },
    { id: 'ach_boss_slayer', name: 'Behemoth Katili', icon: '🐉', reward: 350, desc: 'Toplam 10 Boss veya Elit Mini-Boss yok et.', check: s => s.bossKills >= 10 },
    { id: 'ach_workshop5', name: 'Baş Mühendis', icon: '🔧', reward: 300, desc: 'Reaktör Atölyesinde toplam 5 kalıcı geliştirme satın al.', check: s => s.totalUpgrades >= 5 }
  ]
};

// ── KALICI KAYIT & KREDİ YÖNETİCİSİ (CosmicPersistence) ──
const CosmicPersistence = {
  STORAGE_KEY: 'cosmic_v8_profile',

  getDefaultProfile() {
    return {
      credits: 750, // Oyuncunun hemen test edebilmesi için başlangıç Hoşgeldin Kredisi!
      totalKills: 0,
      maxWave: 1,
      highScore: 0,
      gamesPlayed: 0,
      totalEvos: 0,
      totalMegas: 0,
      bossKills: 0,
      upgrades: {
        meta_dmg: 0,
        meta_hp: 0,
        meta_speed: 0,
        meta_crit: 0,
        meta_cdr: 0,
        meta_reroll: 0,
        meta_magnet: 0,
        meta_credits: 0
      },
      claimedAchievements: {}
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.getDefaultProfile();
      const parsed = JSON.parse(raw);
      const def = this.getDefaultProfile();
      return {
        ...def,
        ...parsed,
        upgrades: { ...def.upgrades, ...(parsed.upgrades || {}) },
        claimedAchievements: { ...(parsed.claimedAchievements || {}) }
      };
    } catch (e) {
      return this.getDefaultProfile();
    }
  },

  save(profile) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {}
  },

  getUpgradeCost(upgId) {
    const cfg = COSMIC_DATA.workshopUpgrades.find(u => u.id === upgId);
    if (!cfg) return 999999;
    const p = this.load();
    const lv = p.upgrades[upgId] || 0;
    if (lv >= cfg.maxLevel) return null;
    return Math.round(cfg.baseCost * Math.pow(cfg.costMult, lv));
  },

  buyUpgrade(upgId) {
    const cfg = COSMIC_DATA.workshopUpgrades.find(u => u.id === upgId);
    if (!cfg) return { ok: false, msg: 'Bilinmeyen geliştirme.' };
    const p = this.load();
    const lv = p.upgrades[upgId] || 0;
    if (lv >= cfg.maxLevel) return { ok: false, msg: 'Maksimum seviyeye ulaşıldı!' };
    const cost = Math.round(cfg.baseCost * Math.pow(cfg.costMult, lv));
    if (p.credits < cost) return { ok: false, msg: 'Yetersiz Kozmik Kredi!' };
    p.credits -= cost;
    p.upgrades[upgId] = lv + 1;
    this.save(p);
    return { ok: true, level: lv + 1, credits: p.credits };
  },

  resetUpgrades() {
    const p = this.load();
    let refunded = 0;
    for (const cfg of COSMIC_DATA.workshopUpgrades) {
      const lv = p.upgrades[cfg.id] || 0;
      for (let i = 0; i < lv; i++) {
        refunded += Math.round(cfg.baseCost * Math.pow(cfg.costMult, i));
      }
      p.upgrades[cfg.id] = 0;
    }
    p.credits += refunded;
    this.save(p);
    return { refunded, credits: p.credits };
  },

  getBonuses() {
    const p = this.load();
    const u = p.upgrades || {};
    return {
      dmgMult: 1 + (u.meta_dmg || 0) * 0.05,
      hpMult: 1 + (u.meta_hp || 0) * 0.06,
      spdMult: 1 + (u.meta_speed || 0) * 0.04,
      critAdd: (u.meta_crit || 0) * 0.03,
      cdrAdd: (u.meta_cdr || 0) * 0.035,
      extraRerolls: (u.meta_reroll || 0),
      magnetMult: 1 + (u.meta_magnet || 0) * 0.12,
      xpMult: 1 + (u.meta_magnet || 0) * 0.05,
      creditMult: 1 + (u.meta_credits || 0) * 0.10
    };
  },

  recordMatchResult({ score, wave, kills, evos, megas, bosses, mapId }) {
    const p = this.load();
    const bonuses = this.getBonuses();
    const mapCfg = COSMIC_DATA.maps.find(m => m.id === mapId) || COSMIC_DATA.maps[0];
    const baseEarned = Math.round((wave * 22 + kills * 0.65 + (bosses || 0) * 45 + Math.floor(score / 400)) * mapCfg.creditMult * bonuses.creditMult);
    p.credits += baseEarned;
    p.totalKills += (kills || 0);
    p.maxWave = Math.max(p.maxWave || 1, wave || 1);
    p.highScore = Math.max(p.highScore || 0, Math.floor(score || 0));
    p.gamesPlayed = (p.gamesPlayed || 0) + 1;
    p.totalEvos = (p.totalEvos || 0) + (evos || 0);
    p.totalMegas = (p.totalMegas || 0) + (megas || 0);
    p.bossKills = (p.bossKills || 0) + (bosses || 0);
    this.save(p);
    return { earnedCredits: baseEarned, totalCredits: p.credits };
  }
};

window.COSMIC_DATA = COSMIC_DATA;
window.CosmicPersistence = CosmicPersistence;

