/* ============================================================================
   COSMIC SURVIVORS v8.0 — KOZMİK VERİ TABANI, REHBER & HESAPLAYICI (js/wiki.js)
   Powers wiki.html (5 Interactive Tabs) and about.html (Credits & IBAN Copy).
   Zero inline scripts or styles required.
   ============================================================================ */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. COMPLETE v8.0 ITEM DATABASE (40 ITEMS: 12 WEAPONS, 12 TRINKETS, 12 EVOS, 4 MEGAS)
    // -------------------------------------------------------------------------
    var WIKI_DB_ITEMS = [
        // --- 8 SHIP SIGNATURE WEAPONS ---
        {
            id: 'plasma',
            name: 'Plazma Topu (Plasma Cannon)',
            icon: '🔫',
            category: 'sig-weapon',
            categoryLabel: 'İmza Silahı (Vortex)',
            ship: 'Vortex Interceptor',
            tier: 'S',
            tierRank: 4,
            baseDmg: 28,
            maxDmg: 68,
            cooldown: 0.55,
            dpsScore: 420,
            recipe: '+ Kuantum Hızlandırıcı → ★ Hiper Plazma Taret',
            desc: 'En yakın hedefe yüksek hızlı, delici iyonize plazma çekirdekleri ateşler. Seviye 5\'te üçlü namlu yayılımı kazanır.'
        },
        {
            id: 'railgun',
            name: 'Manyetik Railgun',
            icon: '⚡',
            category: 'sig-weapon',
            categoryLabel: 'İmza Silahı (Dreadnought)',
            ship: 'Titan Dreadnought',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 75,
            maxDmg: 185,
            cooldown: 1.45,
            dpsScore: 510,
            recipe: '+ Zırh Delici Çekirdek → ★ Gauss Kıyamet Topu',
            desc: 'Sıradaki tüm düşmanları boydan boya delen süper-hızlı elektromanyetik mermi ateşler. Boss zırhlarını parçalar.'
        },
        {
            id: 'tesla',
            name: 'Tesla Bobini (Ark Ağı)',
            icon: '🌩️',
            category: 'sig-weapon',
            categoryLabel: 'İmza Silahı (Aegis)',
            ship: 'Aegis Sentinel',
            tier: 'S',
            tierRank: 4,
            baseDmg: 24,
            maxDmg: 60,
            cooldown: 0.70,
            dpsScore: 440,
            recipe: '+ Paratoner Çekirdeği → ★ Fırtına Hükümdarı',
            desc: 'Yakındaki düşmanlar arasında 6 hedefe kadar sekerek zıplayan yüksek voltajlı yıldırım arkları oluşturur.'
        },
        {
            id: 'scythe',
            name: 'Hiper Tırpan (Void Scythe)',
            icon: '🌙',
            category: 'sig-weapon',
            categoryLabel: 'İmza Silahı (Phantom)',
            ship: 'Phantom Eclipse',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 42,
            maxDmg: 105,
            cooldown: 0.85,
            dpsScore: 530,
            recipe: '+ Karanlık Madde Merceği → ★ Ölüm Hasatçısı',
            desc: 'Gemi etrafında bumerang gibi dönen ve kritik vuruşlarda kanama/zırh kırma uygulayan karanlık enerji tırpanı.'
        },
        {
            id: 'sunbeam',
            name: 'Güneş Mızrağı (Solar Lance)',
            icon: '☀️',
            category: 'sig-weapon',
            categoryLabel: 'İmza Silahı (Solaris)',
            ship: 'Solaris Prime',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 36,
            maxDmg: 92,
            cooldown: 0.65,
            dpsScore: 545,
            recipe: '+ Füzyon Kalbi → ★ Süpernova Yargıcı',
            desc: 'Temas ettiği hedefleri ateşe veren ve zeminde güneş plazması izi bırakan odaklanmış termal mızrak.'
        },
        {
            id: 'ionstorm',
            name: 'İyon Fırtınası Toplar',
            icon: '🌀',
            category: 'sig-weapon',
            categoryLabel: 'İmza Silahı (Tempest)',
            ship: 'Tempest Cruiser',
            tier: 'S',
            tierRank: 4,
            baseDmg: 30,
            maxDmg: 76,
            cooldown: 0.75,
            dpsScore: 465,
            recipe: '+ Alt-Uzay İticisi → ★ Kasırga Matrisi',
            desc: 'Çarpışma noktasında statik girdaplar oluşturan ve sürüleri yavaşlatan iyon küreleri fırlatır.'
        },
        {
            id: 'valk_cannon',
            name: 'Sürü Füze Bataryası',
            icon: '🚀',
            category: 'sig-weapon',
            categoryLabel: 'İmza Silahı (Valkyrie)',
            ship: 'Valkyrie Striker',
            tier: 'S',
            tierRank: 4,
            baseDmg: 34,
            maxDmg: 88,
            cooldown: 0.80,
            dpsScore: 490,
            recipe: '+ Balistik Bilgisayar → ★ Semavi Bombardımancı',
            desc: 'Güdümlü mikro-füze salvosu ateşler; zayıf noktalara otomatik kilitlenme eğilimi gösterir.'
        },
        {
            id: 'chrono_beam',
            name: 'Zaman Yarığı Işını',
            icon: '⏳',
            category: 'sig-weapon',
            categoryLabel: 'İmza Silahı (Chronos)',
            ship: 'Chronos Weaver',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 32,
            maxDmg: 84,
            cooldown: 0.60,
            dpsScore: 525,
            recipe: '+ Takyon Kristali → ★ Sonsuzluk Paradoksu',
            desc: 'İsabet alan düşmanların hareket ve saldırı hızını %40 yavaşlatan, zaman gecikmeli patlama bırakan krono-ışın.'
        },

        // --- 4 GENERAL ACTIVE WEAPONS ---
        {
            id: 'orb',
            name: 'Kuantum Küreleri (Orbitals)',
            icon: '🔮',
            category: 'weapon',
            categoryLabel: 'Aktif Silah',
            ship: 'Tüm Gemiler',
            tier: 'A',
            tierRank: 3,
            baseDmg: 22,
            maxDmg: 55,
            cooldown: 0.40,
            dpsScore: 390,
            recipe: '+ Manyetik Çekim Alanı → ★ Nötron Yıldızı Halkası',
            desc: 'Geminin yörüngesinde sürekli dönerek yaklaşan kamikaze sürülerini doğrayan koruyucu enerji küreleri.'
        },
        {
            id: 'nova',
            name: 'Nova Halkası (Shockwave)',
            icon: '💥',
            category: 'weapon',
            categoryLabel: 'Aktif Silah',
            ship: 'Tüm Gemiler',
            tier: 'A',
            tierRank: 3,
            baseDmg: 45,
            maxDmg: 110,
            cooldown: 1.60,
            dpsScore: 375,
            recipe: '+ Rezonans Amplifikatörü → ★ Kozmik Deprem Dalgaları',
            desc: 'Gemiden dışarıya 360 derece yayılan, mermileri silen ve düşmanları geri savuran ağır şok halkası.'
        },
        {
            id: 'drones',
            name: 'Otonom Avcı Dronlar',
            icon: '🛸',
            category: 'weapon',
            categoryLabel: 'Aktif Silah',
            ship: 'Tüm Gemiler',
            tier: 'S',
            tierRank: 4,
            baseDmg: 20,
            maxDmg: 52,
            cooldown: 0.35,
            dpsScore: 455,
            recipe: '+ Nöral Komuta Çipi → ★ Omega Sürü Filosu',
            desc: 'Bağımsız uçarak elit hedefleri ve boss zayıf noktalarını tarayan lazer donanımlı destek dronları.'
        },
        {
            id: 'flak',
            name: 'Şarapnel Flak Topu',
            icon: '🧨',
            category: 'weapon',
            categoryLabel: 'Aktif Silah',
            ship: 'Tüm Gemiler',
            tier: 'A',
            tierRank: 3,
            baseDmg: 38,
            maxDmg: 95,
            cooldown: 0.95,
            dpsScore: 405,
            recipe: '+ Yüksek Patlayıcı Şarjör → ★ Cehennem Barajı',
            desc: 'Kısa menzilde konik şarapnel bulutu saçar; parçalanan düşmanlardan ikincil patlamalar üretir.'
        },

        // --- 12 PASSIVE TRINKETS ---
        {
            id: 't_haste',
            name: 'Kuantum Hızlandırıcı',
            icon: '⏩',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Vortex İmzası',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 320,
            recipe: 'Plazma Topu ile Sentezlenir',
            desc: 'Tüm silahların dolum süresini (Cooldown) seviye başına %7 azaltır (Maks %35 CDR).'
        },
        {
            id: 't_pierce',
            name: 'Zırh Delici Çekirdek',
            icon: '🗡️',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Dreadnought İmzası',
            tier: 'S',
            tierRank: 4,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 300,
            recipe: 'Manyetik Railgun ile Sentezlenir',
            desc: 'Temel silah hasarını seviye başına +%12 artırır ve mermilere +1 ekstra delme (Pierce) kazandırır.'
        },
        {
            id: 't_arc',
            name: 'Paratoner Çekirdeği',
            icon: '🔋',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Aegis İmzası',
            tier: 'A',
            tierRank: 3,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 270,
            recipe: 'Tesla Bobini ile Sentezlenir',
            desc: 'Elektrik/Alan hasarı yarıçapını +%25 büyütür ve kalkan yenilenme hızını artırır.'
        },
        {
            id: 't_crit',
            name: 'Karanlık Madde Merceği',
            icon: '🎯',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Phantom İmzası',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 340,
            recipe: 'Hiper Tırpan ile Sentezlenir',
            desc: 'Kritik vuruş şansını seviye başına +%6 (Maks +%30) ve kritik hasar çarpanını +0.4x yükseltir.'
        },
        {
            id: 't_burn',
            name: 'Füzyon Kalbi',
            icon: '🔥',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Solaris İmzası',
            tier: 'S',
            tierRank: 4,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 310,
            recipe: 'Güneş Mızrağı ile Sentezlenir',
            desc: 'Termal yanma (DoT) hasarını +%45 güçlendirir ve maksimum gövde canını +60 artırır.'
        },
        {
            id: 't_thruster',
            name: 'Alt-Uzay İticisi',
            icon: '💨',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Tempest İmzası',
            tier: 'A',
            tierRank: 3,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 265,
            recipe: 'İyon Fırtınası ile Sentezlenir',
            desc: 'Gemi hareket hızını +%30 artırır ve Dash (Atılma) bekleme süresini %35 kısaltır.'
        },
        {
            id: 't_ballistic',
            name: 'Balistik Bilgisayar',
            icon: '📡',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Valkyrie İmzası',
            tier: 'S',
            tierRank: 4,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 315,
            recipe: 'Sürü Füze Bataryası ile Sentezlenir',
            desc: 'Tüm silah serilerine +1 ekstra mermi/füze (Multishot) ve +%25 mermi uçuş hızı ekler.'
        },
        {
            id: 't_tachyon',
            name: 'Takyon Kristali',
            icon: '💎',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Chronos İmzası',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 335,
            recipe: 'Zaman Yarığı Işını ile Sentezlenir',
            desc: 'Yavaşlatılmış veya sersemletilmiş hedeflere verilen tüm hasarı +%35 katlar, etki süresini uzatır.'
        },
        {
            id: 't_magnet',
            name: 'Manyetik Çekim Alanı',
            icon: '🧲',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Genel',
            tier: 'A',
            tierRank: 3,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 250,
            recipe: 'Kuantum Küreleri ile Sentezlenir',
            desc: 'XP kristali ve kredi toplama yarıçapını +%120 genişletir, kazanılan XP\'yi +%20 artırır.'
        },
        {
            id: 't_amp',
            name: 'Rezonans Amplifikatörü',
            icon: '📢',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Genel',
            tier: 'A',
            tierRank: 3,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 260,
            recipe: 'Nova Halkası ile Sentezlenir',
            desc: 'Patlama ve şok dalgası alanlarını +%40 büyütür, geri itme (Knockback) gücünü ikiye katlar.'
        },
        {
            id: 't_neural',
            name: 'Nöral Komuta Çipi',
            icon: '🧠',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Genel',
            tier: 'S',
            tierRank: 4,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 295,
            recipe: 'Otonom Avcı Dronlar ile Sentezlenir',
            desc: 'Yardımcı dron ve yörünge birimlerinin saldırı hızını +%40, zayıf nokta isabetini +%25 artırır.'
        },
        {
            id: 't_mag',
            name: 'Yüksek Patlayıcı Şarjör',
            icon: '🧰',
            category: 'trinket',
            categoryLabel: 'Pasif Alet',
            ship: 'Genel',
            tier: 'A',
            tierRank: 3,
            baseDmg: 0,
            maxDmg: 0,
            cooldown: 0,
            dpsScore: 275,
            recipe: 'Şarapnel Flak Topu ile Sentezlenir',
            desc: 'Ölen düşmanların %35 ihtimalle zincirleme plazma patlaması yaratmasını sağlar.'
        },

        // --- 12 STAGE-3 EVOLVED WEAPONS ---
        {
            id: 'evo_plasma',
            name: '★ Hiper Plazma Taret',
            icon: '🌟',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Vortex Dalı',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 115,
            maxDmg: 240,
            cooldown: 0.24,
            dpsScore: 860,
            recipe: 'Plazma Topu (Sv.5) + Kuantum Hızlandırıcı',
            desc: 'Kesintisiz mavi-mor plazma sağanağı ateşler; her 5. atışta hedefi içe çökerten mini-tekillik bırakır.'
        },
        {
            id: 'evo_railgun',
            name: '★ Gauss Kıyamet Topu',
            icon: '⚡',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Dreadnought Dalı',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 310,
            maxDmg: 580,
            cooldown: 0.85,
            dpsScore: 920,
            recipe: 'Manyetik Railgun (Sv.5) + Zırh Delici Çekirdek',
            desc: 'Ekranı boydan boya yaran altın elektromanyetik iz bırakır; izde kalan düşmanlar saniyede 3 kez şok hasarı alır.'
        },
        {
            id: 'evo_tesla',
            name: '★ Fırtına Hükümdarı',
            icon: '🌩️',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Aegis Dalı',
            tier: 'S',
            tierRank: 4,
            baseDmg: 96,
            maxDmg: 210,
            cooldown: 0.38,
            dpsScore: 810,
            recipe: 'Tesla Bobini (Sv.5) + Paratoner Çekirdeği',
            desc: '14 hedefe kadar seken zincirleme yıldırım ağı kurar ve verilen hasarın %5\'ini enerji kalkanına dönüştürür.'
        },
        {
            id: 'evo_scythe',
            name: '★ Ölüm Hasatçısı (Soul Reaper)',
            icon: '🩸',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Phantom Dalı',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 165,
            maxDmg: 340,
            cooldown: 0.45,
            dpsScore: 950,
            recipe: 'Hiper Tırpan (Sv.5) + Karanlık Madde Merceği',
            desc: '%100 kritik vuruş garantili devasa kızıl tırpanlar fırlatır; boss arka reaktörlerine x2.0 ekstra infaz hasarı vurur.'
        },
        {
            id: 'evo_sunbeam',
            name: '★ Süpernova Yargıcı',
            icon: '☀️',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Solaris Dalı',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 145,
            maxDmg: 310,
            cooldown: 0.35,
            dpsScore: 940,
            recipe: 'Güneş Mızrağı (Sv.5) + Füzyon Kalbi',
            desc: 'Gökyüzünden sürekli güneş sütunları indirir ve temas eden hedeflerin zırhını saniyede %15 eritir.'
        },
        {
            id: 'evo_ionstorm',
            name: '★ Kasırga Matrisi',
            icon: '🌪️',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Tempest Dalı',
            tier: 'S',
            tierRank: 4,
            baseDmg: 120,
            maxDmg: 255,
            cooldown: 0.42,
            dpsScore: 845,
            recipe: 'İyon Fırtınası (Sv.5) + Alt-Uzay İticisi',
            desc: 'Savaş alanında dolaşan 3 kalıcı iyon hortumu oluşturur; düşmanları merkeze çekip parçalar.'
        },
        {
            id: 'evo_valk',
            name: '★ Semavi Bombardımancı',
            icon: '🚀',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Valkyrie Dalı',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 138,
            maxDmg: 290,
            cooldown: 0.40,
            dpsScore: 910,
            recipe: 'Sürü Füze Bataryası (Sv.5) + Balistik Bilgisayar',
            desc: 'Tek seferde 12 termonükleer mikro-füze ateşler; doğrudan Boss zayıf noktalarını (Arka Reaktör) takip eder.'
        },
        {
            id: 'evo_chrono',
            name: '★ Sonsuzluk Paradoksu',
            icon: '⏳',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Chronos Dalı',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 132,
            maxDmg: 280,
            cooldown: 0.32,
            dpsScore: 935,
            recipe: 'Zaman Yarığı Işını (Sv.5) + Takyon Kristali',
            desc: 'Düşmanları zamanda dondurur ve son 3 saniyede aldıkları toplam hasarın %50\'sini tek seferde yankı olarak patlatır.'
        },
        {
            id: 'evo_orb',
            name: '★ Nötron Yıldızı Halkası',
            icon: '🪐',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Genel Evrim',
            tier: 'S',
            tierRank: 4,
            baseDmg: 90,
            maxDmg: 195,
            cooldown: 0.20,
            dpsScore: 790,
            recipe: 'Kuantum Küreleri (Sv.5) + Manyetik Çekim Alanı',
            desc: 'Çift katmanlı 8 nötron küresi ışık hızında döner; tüm düşman mermilerini buharlaştırır.'
        },
        {
            id: 'evo_nova',
            name: '★ Kozmik Deprem Dalgaları',
            icon: '💫',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Genel Evrim',
            tier: 'S',
            tierRank: 4,
            baseDmg: 180,
            maxDmg: 370,
            cooldown: 0.80,
            dpsScore: 805,
            recipe: 'Nova Halkası (Sv.5) + Rezonans Amplifikatörü',
            desc: 'Her patlama 3 artçı şok dalgası üretir ve ekran üzerindeki tüm sürüyü 1.2 saniye sersemletir.'
        },
        {
            id: 'evo_drones',
            name: '★ Omega Sürü Filosu',
            icon: '🛰️',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Genel Evrim',
            tier: 'S+',
            tierRank: 5,
            baseDmg: 85,
            maxDmg: 185,
            cooldown: 0.18,
            dpsScore: 885,
            recipe: 'Otonom Avcı Dronlar (Sv.5) + Nöral Komuta Çipi',
            desc: '6 adet ağır kruvazör dronu konuşlandırır; kesişen plazma lazerleriyle hedefi eritir.'
        },
        {
            id: 'evo_flak',
            name: '★ Cehennem Barajı',
            icon: '🌋',
            category: 'evolution',
            categoryLabel: 'Aşama 3 Evrim',
            ship: 'Genel Evrim',
            tier: 'S',
            tierRank: 4,
            baseDmg: 150,
            maxDmg: 320,
            cooldown: 0.48,
            dpsScore: 830,
            recipe: 'Şarapnel Flak Topu (Sv.5) + Yüksek Patlayıcı Şarjör',
            desc: 'Her atışta 18 termit şarapneli saçar; zeminde yanan napalm kraterleri bırakır.'
        },

        // --- 4 STAGE-4 MEGA EVOLUTIONS ---
        {
            id: 'mega_singularity',
            name: '✦ OMEGA TEKİLLİK MATRİSİ',
            icon: '🌌',
            category: 'mega',
            categoryLabel: 'Aşama 4 Mega Sentez',
            ship: 'Vortex / Chronos / Genel',
            tier: 'S+',
            tierRank: 6,
            baseDmg: 420,
            maxDmg: 950,
            cooldown: 0.22,
            dpsScore: 1480,
            recipe: '★ Hiper Plazma Taret + ★ Sonsuzluk Paradoksu (veya ★ Nötron Halkası)',
            desc: 'Zamanı ve uzayı büken süper-kütleli tekillik silahı. Tüm ekranı merkeze vakumlar ve Dalga 25+ Kozmik Çürüme direncini %50 kırar.'
        },
        {
            id: 'mega_ragnarok',
            name: '✦ RAGNAROK YILDIZ YIKICISI',
            icon: '☄️',
            category: 'mega',
            categoryLabel: 'Aşama 4 Mega Sentez',
            ship: 'Dreadnought / Solaris',
            tier: 'S+',
            tierRank: 6,
            baseDmg: 540,
            maxDmg: 1200,
            cooldown: 0.45,
            dpsScore: 1550,
            recipe: '★ Gauss Kıyamet Topu + ★ Süpernova Yargıcı',
            desc: 'Yörüngesel güneş-ray bombardımanı. Boss kalkanlarını tek vuruşta aşırı yükler ve ekranda kalıcı füzyon yarıkları açar.'
        },
        {
            id: 'mega_valkyrie_storm',
            name: '✦ SEMAVİ ASTRAEA DONANMASI',
            icon: '👑',
            category: 'mega',
            categoryLabel: 'Aşama 4 Mega Sentez',
            ship: 'Aegis / Tempest / Valkyrie',
            tier: 'S+',
            tierRank: 6,
            baseDmg: 380,
            maxDmg: 860,
            cooldown: 0.20,
            dpsScore: 1460,
            recipe: '★ Semavi Bombardımancı + ★ Fırtına Hükümdarı (veya ★ Omega Sürü Filosu)',
            desc: 'Otonom yıldırım kruvazörleri ve güdümlü kuantum füzelerinin birleşimi. Her isabet enerji kalkanını yeniler.'
        },
        {
            id: 'mega_eclipse_reaper',
            name: '✦ HİÇLİK İMPARATORU (ABYSS SOVEREIGN)',
            icon: '💀',
            category: 'mega',
            categoryLabel: 'Aşama 4 Mega Sentez',
            ship: 'Phantom / Suikast Dalı',
            tier: 'S+',
            tierRank: 6,
            baseDmg: 490,
            maxDmg: 1120,
            cooldown: 0.30,
            dpsScore: 1600,
            recipe: '★ Ölüm Hasatçısı + ★ Cehennem Barajı',
            desc: 'Arka reaktör zayıf noktalarına otomatik ışınlanan boyutlar-arası infaz tırpanları. Canı %20 altındaki elitleri anında biçer.'
        }
    ];

    // -------------------------------------------------------------------------
    // 2. 4 MAPS × 8 SHIPS TACTICAL SYNERGY MATRIX DATA
    // -------------------------------------------------------------------------
    var SECTOR_MAPS = [
        {
            id: 'sector9',
            name: 'Sektör 9 Enkazı',
            mult: 'x1.00 Zorluk // x1.00 Kredi',
            color: '#00f3ff',
            img: 'assets/maps/sector9.svg',
            hazard: 'Sürüklenen Asteroit Kuşağı & Kargo Konteynerleri',
            desc: 'Geniş manevra koridorları ve zengin ganimet sandıkları içerir. Yeni gemi sınıflarını ve evrim tariflerini test etmek için ideal başlangıç sektörü.'
        },
        {
            id: 'nebula',
            name: 'Kuantum Nebulası',
            mult: 'x1.25 Zorluk // x1.35 Kredi',
            color: '#a855f7',
            img: 'assets/maps/nebula.svg',
            hazard: 'İyonize Plazma Bulutları (Kalkan Yenileme -%25, CDR +%15)',
            desc: 'Yüksek yoğunluklu iyon bulutları enerji kalkanlarını zorlarken silah dolum hızlarını aşırı yükler. Yüksek hareketli ve kritik odaklı gemiler parlar.'
        },
        {
            id: 'blackhole',
            name: 'Kara Delik Çevresi',
            mult: 'x1.50 Zorluk // x1.75 Kredi',
            color: '#ff2a5f',
            img: 'assets/maps/blackhole.svg',
            hazard: 'Kütleçekim Tekilliği (Merkeze Çekim Kuvveti & Sıkışık Sürüler)',
            desc: 'Olay ufku hem geminizi hem de düşman sürülerini merkeze doğru çeker. Delici (Pierce) ve alan etkili (AoE) silahlar burada devasa hasar üretir.'
        },
        {
            id: 'dyson',
            name: 'Dyson Mega-Küre Reaktörü',
            mult: 'x1.75 Zorluk // x2.25 Kredi',
            color: '#f1c40f',
            img: 'assets/maps/dyson.svg',
            hazard: 'Güneş Patlaması Lazer Izgaraları & Aşırı Termal Radyasyon',
            desc: 'Oyundaki en yüksek kredi çarpanına sahip son-oyun (Endgame) sektörü. Periyodik termal lazer duvarları arasında zırh, kalkan veya zaman bükme şarttır.'
        }
    ];

    var SHIP_SYNERGY_ROWS = [
        {
            id: 'interceptor',
            name: 'Vortex Interceptor',
            role: 'dengeli',
            roleLabel: 'Dengeli Avcı',
            img: 'assets/ships/interceptor.svg',
            rootPerk: '+%15 Atış Hızı & Dengeli İtici',
            sector9: { grade: 'S+', cls: 's-plus', note: 'Açık alanda maksimum manevra; hızlı XP toplama ile 4. dakikada ilk evrimi açar.' },
            nebula: { grade: 'S', cls: 's-tier', note: 'Nebula\'nın +%15 CDR bonusu Hiper Plazma Taret\'i makineli tüfeğe çevirir.' },
            blackhole: { grade: 'A', cls: 'a-tier', note: 'İyi itici gücüyle çekimden kaçar ancak tekil hedefli silahı alan desteği ister.' },
            dyson: { grade: 'S', cls: 's-tier', note: 'Dengeli hızı sayesinde Dyson lazer ızgaralarından rahat sıyrılır.' }
        },
        {
            id: 'dreadnought',
            name: 'Titan Dreadnought',
            role: 'tank',
            roleLabel: 'Ağır Zırhlı Kale',
            img: 'assets/ships/dreadnought.svg',
            rootPerk: '+35 Zırh & Delici Railgun',
            sector9: { grade: 'A', cls: 'a-tier', note: 'Düşük hızı erken XP toplamayı yavaşlatsa da hiç hasar almadan ilerler.' },
            nebula: { grade: 'A', cls: 'a-tier', note: 'Kalkan yerine gövde zırhına güvendiği için Nebula debuff\'ından etkilenmez.' },
            blackhole: { grade: 'S+', cls: 's-plus', note: 'Kara deliğin tek çizgide topladığı yüzlerce düşmanı Gauss Railgun ile tek atışta biçer!' },
            dyson: { grade: 'S+', cls: 's-plus', note: 'Yüksek zırhı sayesinde Dyson termal radyasyonuna en dayanıklı gemidir.' }
        },
        {
            id: 'aegis',
            name: 'Aegis Sentinel',
            role: 'kontrol',
            roleLabel: 'Kalkan & Ark Kontrol',
            img: 'assets/ships/aegis.svg',
            rootPerk: 'Oto-Rejenerasyon Kalkanı & Tesla',
            sector9: { grade: 'S', cls: 's-tier', note: 'Sürüleri zincirleme yıldırımla temizler, güvenli koridor açar.' },
            nebula: { grade: 'B', cls: 'b-tier', note: 'Nebula kalkan yenilenmesini yavaşlattığı için Paratoner Evrimi önceliklidir.' },
            blackhole: { grade: 'S+', cls: 's-plus', note: 'Sıkışık sürüler arasında Tesla arkları 14 hedefe sekerek ekranı anında temizler.' },
            dyson: { grade: 'S', cls: 's-tier', note: 'Yıldırım kalkanı Dyson elitlerinin mermi yağmurunu absorbe eder.' }
        },
        {
            id: 'phantom',
            name: 'Phantom Eclipse',
            role: 'suikast',
            roleLabel: 'Kritik & Boss Avcısı',
            img: 'assets/ships/phantom.svg',
            rootPerk: '+%25 Kritik Şans & Faz Atılması',
            sector9: { grade: 'S', cls: 's-tier', note: 'İlk Boss\'u (Dalga 5) arka reaktör kritik vuruşlarıyla 6 saniyede eritir.' },
            nebula: { grade: 'S+', cls: 's-plus', note: 'Faz geçişi ve yüksek hızıyla Nebula\'da en yüksek skor potansiyeline ulaşır.' },
            blackhole: { grade: 'S', cls: 's-tier', note: 'Dönen Ölüm Hasatçısı tırpanları çekim merkezindeki tüm elitleri doğrar.' },
            dyson: { grade: 'A', cls: 'a-tier', note: 'Düşük gövde canı nedeniyle Dyson lazerlerinde hataya yer bırakmaz; yüksek beceri ister.' }
        },
        {
            id: 'solarflare',
            name: 'Solaris Prime',
            role: 'alan',
            roleLabel: 'Termal AoE Yıkıcı',
            img: 'assets/ships/solarflare.svg',
            rootPerk: '+%30 Termal Yanma & Güneş Mızrağı',
            sector9: { grade: 'S', cls: 's-tier', note: 'Geniş alanları ateş çemberine çevirerek pasif XP hasadı yapar.' },
            nebula: { grade: 'S+', cls: 's-plus', note: 'İyonize gaz bulutlarını tutuşturarak ekstra alan patlamaları tetikler.' },
            blackhole: { grade: 'S+', cls: 's-plus', note: 'Merkezde toplanan sürünün tamamına kalıcı zırh eritme (Melt) uygular.' },
            dyson: { grade: 'S', cls: 's-tier', note: 'Dyson reaktörünün termal enerjisiyle rezonansa girip +%20 bonus hasar kazanır.' }
        },
        {
            id: 'tempest',
            name: 'Tempest Cruiser',
            role: 'hiz',
            roleLabel: 'Hiper-Mobil Kruvazör',
            img: 'assets/ships/tempest.svg',
            rootPerk: '+%30 Hız & İyon Girdabı',
            sector9: { grade: 'S+', cls: 's-plus', note: 'Haritadaki tüm kredi sandıklarını ve cevherleri en hızlı toplayan ekonomi gemisidir.' },
            nebula: { grade: 'S', cls: 's-tier', note: 'İyon fırtınaları Nebula içinde %25 daha geniş yarıçapa ulaşır.' },
            blackhole: { grade: 'S', cls: 's-tier', note: 'Yüksek itici gücü sayesinde kara delik çekiminden etkilenmeyen tek kruvazördür.' },
            dyson: { grade: 'A', cls: 'a-tier', note: 'Dönen lazer duvarlarından hızıyla kaçar, vur-kaç (Kiting) taktiği için idealdir.' }
        },
        {
            id: 'valkyrie',
            name: 'Valkyrie Striker',
            role: 'suikast',
            roleLabel: 'Güdümlü Salvo & Boss Yıkıcı',
            img: 'assets/ships/valkyrie.svg',
            rootPerk: '+1 Multishot & Güdümlü Füzeler',
            sector9: { grade: 'S', cls: 's-tier', note: 'Nişan alma gerektirmeden tüm ekrandaki hedefleri füzelerle temizler.' },
            nebula: { grade: 'S', cls: 's-tier', note: 'Azalan görüş alanında güdümlü füzeler görünmez Phantom düşmanlarını bile bulur.' },
            blackhole: { grade: 'A', cls: 'a-tier', note: 'Sürü yoğunluğunda füzeler ön saflara çarpar; patlayıcı şarjör desteği önerilir.' },
            dyson: { grade: 'S+', cls: 's-plus', note: 'Dyson Seraphim Boss\'unun arka reaktörünü lazerlerden kaçarken uzaktan imha eder.' }
        },
        {
            id: 'chronos',
            name: 'Chronos Weaver',
            role: 'kontrol',
            roleLabel: 'Zaman Bükücü Taktisyen',
            img: 'assets/ships/chronos.svg',
            rootPerk: 'Zaman Yavaşlatma & CDR Aura',
            sector9: { grade: 'S', cls: 's-tier', note: 'Güvenli ve kontrollü oyun stili; öğrenme aşaması için kusursuzdur.' },
            nebula: { grade: 'S+', cls: 's-plus', note: 'Kendi CDR aurası Nebula bonusuyla birleşince yetenekleri neredeyse beklemesiz çalışır.' },
            blackhole: { grade: 'S+', cls: 's-plus', note: 'Kara delik çekimi + Zaman Dondurma birleşimiyle düşmanlar size asla ulaşamaz.' },
            dyson: { grade: 'S+', cls: 's-plus', note: 'Dalga 25+ Kozmik Çürüme safhasında en yüksek hayatta kalma oranına sahip S+ gemi.' }
        }
    ];

    // -------------------------------------------------------------------------
    // 3. 5 BOSSES & 8 SWARM ENEMIES ENCYCLOPEDIA DATA
    // -------------------------------------------------------------------------
    var BOSS_DOSSIERS = [
        {
            id: 'behemoth',
            name: 'OBLIVION BEHEMOTH',
            wave: 'Dalga 5 & Dalga 20 Kuşatma Boss\'u',
            img: 'assets/bosses/behemoth.svg',
            color: '#ff2a5f',
            hpBase: '18,500 HP',
            armor: '35 Zırh',
            weakSpot: 'Arka İtici Füzyon Çekirdeği (x1.50 Hasar & Zırh İhmali)',
            attacks: 'Üçlü Ağır Plazma Havanı, Yarıçaplı Şok Dalgası ve Kızgın Boğa Hücumu (Charge).',
            counter: 'Hücum (Charge) animasyonu bittiği anda 2.2 saniye boyunca hareketsiz kalır; Dash ile arkasına geçip reaktörüne odaklanın. En iyi karşıtlar: Phantom Eclipse, Valkyrie Striker.'
        },
        {
            id: 'leviathan',
            name: 'VOID LEVIATHAN',
            wave: 'Dalga 10 Derin Uzay Boss\'u',
            img: 'assets/bosses/leviathan.svg',
            color: '#a855f7',
            hpBase: '42,000 HP',
            armor: '25 Zırh',
            weakSpot: 'Kuyruk Boğumu Biyo-Reaktörü (x1.50 Hasar)',
            attacks: 'Karanlık Madde Solucan Deliği, Spiral Asit Mermi Perdesi ve Kuyruk Kamçısı.',
            counter: 'Segmentli gövdesi delici (Pierce) silahlardan çoklu isabet alır! Manyetik Railgun ve Güneş Mızrağı tek atışta tüm boğumlarına hasar vurur. En iyi karşıtlar: Titan Dreadnought, Solaris Prime.'
        },
        {
            id: 'hivemind',
            name: 'NEXUS HIVE-QUEEN',
            wave: 'Dalga 15 Sürü İmparatoriçesi',
            img: 'assets/bosses/hivemind.svg',
            color: '#2ecc71',
            hpBase: '75,000 HP',
            armor: '30 Zırh',
            weakSpot: 'Arka Kuluçka Kesesi (x1.65 Hasar & Üretim Durdurma)',
            attacks: 'Saniyede 6 Kamikaze Larvası Üretimi, Biyo-Plazma Ağ Atışı ve Kraliçe Kalkan Rezonansı.',
            counter: 'Ürettiği yavruları temizlemezseniz kalkanını yeniler. Tesla Bobini veya Nova Halkası ile yavruları anında silip arka kuluçka kesesini patlatın. En iyi karşıtlar: Aegis Sentinel, Tempest Cruiser.'
        },
        {
            id: 'chronovore',
            name: 'CHRONOVORE (ZAMAN YİYİCİ)',
            wave: 'Dalga 20 Boyutlar-Arası Boss',
            img: 'assets/bosses/chronovore.svg',
            color: '#00f3ff',
            hpBase: '130,000 HP',
            armor: '40 Zırh',
            weakSpot: 'Merkez Takyon Sarkacı (Zaman Sıçraması Sonrası x1.75 Hasar)',
            attacks: 'Zaman Geri Sarma (Teleport), Yavaşlatıcı Krono-Mayınlar ve 360° Lazer Saat İbresi.',
            counter: 'Saat yönünde dönen lazer ibresiyle birlikte hareket edin. Işınlandıktan hemen sonra arka sarkacı 3 saniye açıkta kalır. En iyi karşıtlar: Chronos Weaver, Vortex Interceptor.'
        },
        {
            id: 'seraphim',
            name: 'CORRUPTED DYSON SERAPH',
            wave: 'Dalga 25+ Kozmik Kıyamet Boss\'u',
            img: 'assets/bosses/seraphim.svg',
            color: '#f1c40f',
            hpBase: '260,000+ HP',
            armor: '55 Zırh',
            weakSpot: 'Altı Kanat Arası Korona Çekirdeği (Kanatlar Açıldığında x2.00 Hasar)',
            attacks: 'Yörüngesel Güneş Mızrağı Yağmuru, Altılı Kanat Lazer Kafesi ve Süpernova Çöküşü.',
            counter: 'Dalga 25\'te ortaya çıkar. Aşama 4 Mega Sentez silahınız hazır olmalıdır. Kanatlarını açıp Süpernova şarj ederken arkasına geçip tüm cephaneyi boşaltın.'
        }
    ];

    var SWARM_ENEMIES = [
        {
            id: 'swarmer',
            name: 'Kızıl Sürücü (Swarmer)',
            type: 'swarm',
            typeLabel: 'Sürü Birimi',
            img: 'assets/enemies/swarmer.svg',
            hp: '45 HP',
            spd: 'Yüksek',
            desc: 'Sürüler halinde geminize doğru akan temel biyomekanik avcı. Erken dalgalarda ana XP kaynağınızdır.'
        },
        {
            id: 'kamikaze',
            name: 'Voltaj Kamikaze',
            type: 'swarm',
            typeLabel: 'Patlayıcı Birim',
            img: 'assets/enemies/kamikaze.svg',
            hp: '35 HP',
            spd: 'Çok Yüksek',
            desc: 'Yaklaştığında aşırı yüklenip patlar. Kuantum Küreleri veya Nova Halkası ile gemiye değmeden imha edilmelidir.'
        },
        {
            id: 'splitter',
            name: 'Mitotik Bölünücü (Splitter)',
            type: 'swarm',
            typeLabel: 'Bölünen Birim',
            img: 'assets/enemies/splitter.svg',
            hp: '110 HP',
            spd: 'Orta',
            desc: 'Yok edildiğinde 2 adet hızlı mini-çekirdeğe bölünür. Zincirleme patlama (Şarapnel Flak) ile tek seferde temizlenir.'
        },
        {
            id: 'shooter',
            name: 'Plazma Korveti (Shooter)',
            type: 'swarm',
            typeLabel: 'Menzilli Birim',
            img: 'assets/enemies/shooter.svg',
            hp: '95 HP',
            spd: 'Orta',
            desc: 'Mesafesini koruyarak üçlü enerji mermisi ateşler. Sabit durmak yerine dairesel strafe (yanlama) ile mermilerinden kaçının.'
        },
        {
            id: 'tank',
            name: 'Golyat Zırhlısı (Heavy Tank)',
            type: 'elite',
            typeLabel: 'Ağır Elit',
            img: 'assets/enemies/tank.svg',
            hp: '620 HP',
            spd: 'Düşük',
            desc: 'Ön kalkanı mermileri sönümler ve geri itmeye dirençlidir. Delici Railgun veya Termal Yanma ile zırhını eritin.'
        },
        {
            id: 'sniper',
            name: 'Hiper-Nişancı (Void Sniper)',
            type: 'elite',
            typeLabel: 'Uzun Menzil Elit',
            img: 'assets/enemies/sniper.svg',
            hp: '210 HP',
            spd: 'Düşük',
            desc: 'Ateş etmeden önce kırmızı lazer hedefleme çizgisi çıkarır. Çizgi sabitlendiği an Dash atarak yüksek hasarlı atıştan sıyrılın.'
        },
        {
            id: 'phantom',
            name: 'Hayalet Sızmacı (Phase Wraith)',
            type: 'elite',
            typeLabel: 'Faz Geçişli Elit',
            img: 'assets/enemies/phantom.svg',
            hp: '340 HP',
            spd: 'Yüksek',
            desc: 'Yarı-saydam fazdayken doğrudan mermilerden %50 az hasar alır; alan etkili (Tesla, Nova, Güneş Mızrağı) silahlara karşı savunmasızdır.'
        },
        {
            id: 'queen',
            name: 'Sektör Kuluçka Anası (Brood Queen)',
            type: 'elite',
            typeLabel: 'Mini-Boss Elit',
            img: 'assets/enemies/queen.svg',
            hp: '1,450 HP',
            spd: 'Düşük',
            desc: 'Sürekli Swarmer doğuran mini-boss. Yok edildiğinde kesin olarak 1 adet Kozmik Evrim Sandığı veya yüksek kredi düşürür.'
        }
    ];

    // -------------------------------------------------------------------------
    // 4. STATE & INITIALIZATION
    // -------------------------------------------------------------------------
    var dbState = {
        search: '',
        category: 'all',
        sort: 'tier-desc',
        viewMode: 'table' // 'table' | 'grid'
    };

    var synergyFilterRole = 'all';
    var bestiaryState = {
        search: '',
        filter: 'all'
    };

    function syncTopbarCredits() {
        var credits = 0;
        try {
            if (typeof window.loadSaveData === 'function') {
                var save = window.loadSaveData();
                if (save && typeof save.credits === 'number') credits = save.credits;
            } else {
                var raw = localStorage.getItem('cosmic_save_v6');
                if (raw) {
                    var parsed = JSON.parse(raw);
                    if (parsed && typeof parsed.credits === 'number') credits = parsed.credits;
                }
            }
        } catch (e) {
            credits = 0;
        }
        var el1 = document.getElementById('topCreditAmount');
        if (el1) el1.textContent = credits.toLocaleString('tr-TR');
        var el2 = document.getElementById('navCredits');
        if (el2) el2.textContent = credits.toLocaleString('tr-TR');
    }

    // -------------------------------------------------------------------------
    // 5. TAB NAVIGATION LOGIC
    // -------------------------------------------------------------------------
    function initWikiTabs() {
        var tabBtns = document.querySelectorAll('.wiki-tab-btn');
        var tabPanes = document.querySelectorAll('.wiki-tab-pane');
        if (!tabBtns.length) return;

        tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetId = btn.getAttribute('data-tab');
                tabBtns.forEach(function (b) { b.classList.remove('active'); });
                tabPanes.forEach(function (p) { p.classList.remove('active'); });
                btn.classList.add('active');
                var pane = document.getElementById(targetId);
                if (pane) pane.classList.add('active');
            });
        });
    }

    // -------------------------------------------------------------------------
    // 6. TAB 1: SEARCHABLE, FILTERABLE, SORTABLE DATABASE
    // -------------------------------------------------------------------------
    function getBadgeClass(cat) {
        if (cat === 'mega') return 'mega';
        if (cat === 'evolution') return 'evo';
        if (cat === 'trinket') return 'trinket';
        if (cat === 'sig-weapon') return 'ship-sig';
        return 'weapon';
    }

    function getTierBadgeClass(tier) {
        if (tier === 'S+' || tier === 'S') return 'tier-s';
        return 'tier-a';
    }

    function renderWikiDatabase() {
        var tableBody = document.getElementById('wikiDbTableBody');
        var gridContainer = document.getElementById('wikiDbGridContainer');
        var tableWrap = document.getElementById('wikiDbTableWrap');
        var countLabel = document.getElementById('wikiDbResultCount');
        if (!tableBody || !gridContainer) return;

        var q = dbState.search.trim().toLowerCase();
        var filtered = WIKI_DB_ITEMS.filter(function (item) {
            if (dbState.category !== 'all' && item.category !== dbState.category) {
                return false;
            }
            if (!q) return true;
            var hay = (item.name + ' ' + item.categoryLabel + ' ' + item.ship + ' ' + item.recipe + ' ' + item.desc).toLowerCase();
            return hay.indexOf(q) !== -1;
        });

        filtered.sort(function (a, b) {
            if (dbState.sort === 'tier-desc') {
                if (b.tierRank !== a.tierRank) return b.tierRank - a.tierRank;
                return b.dpsScore - a.dpsScore;
            }
            if (dbState.sort === 'dps-desc') {
                return b.dpsScore - a.dpsScore;
            }
            if (dbState.sort === 'cd-asc') {
                var ca = a.cooldown > 0 ? a.cooldown : 99;
                var cb = b.cooldown > 0 ? b.cooldown : 99;
                return ca - cb;
            }
            if (dbState.sort === 'name-asc') {
                return a.name.localeCompare(b.name, 'tr');
            }
            return 0;
        });

        if (countLabel) {
            countLabel.textContent = filtered.length + ' / ' + WIKI_DB_ITEMS.length + ' KAYIT LİSTELENİYOR';
        }

        if (dbState.viewMode === 'table') {
            if (tableWrap) tableWrap.style.display = 'block';
            gridContainer.style.display = 'none';

            if (!filtered.length) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:28px; color:var(--text-muted);">Arama kriterlerinize uygun silah, alet veya evrim bulunamadı.</td></tr>';
                return;
            }

            var rowsHtml = '';
            filtered.forEach(function (item) {
                var dpsPct = Math.min(100, Math.round((item.dpsScore / 1600) * 100));
                var dmgText = item.baseDmg > 0 ? (item.baseDmg + ' → ' + item.maxDmg) : 'Pasif Bonus';
                var cdText = item.cooldown > 0 ? (item.cooldown.toFixed(2) + ' sn') : 'Sürekli (Aura)';
                var calcBtn = item.baseDmg > 0
                    ? '<button type="button" class="table-action-btn js-load-calc" data-id="' + item.id + '">🧮 Hesapla</button>'
                    : '<span class="text-muted" style="font-family:var(--font-mono);font-size:0.75rem;">Pasif Slot</span>';

                rowsHtml += '<tr>' +
                    '<td>' +
                    '<div class="db-item-cell">' +
                    '<div class="db-item-icon">' + item.icon + '</div>' +
                    '<div>' +
                    '<div class="db-item-title">' + item.name + '</div>' +
                    '<div class="db-item-sub">' + item.ship + '</div>' +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '<td><span class="badge ' + getBadgeClass(item.category) + '">' + item.categoryLabel + '</span></td>' +
                    '<td><span class="badge ' + getTierBadgeClass(item.tier) + '">' + item.tier + ' TIER</span></td>' +
                    '<td>' +
                    '<div class="db-dps-bar-wrap">' +
                    '<span class="db-dps-val">' + item.dpsScore + ' Puan (' + dmgText + ')</span>' +
                    '<div class="db-dps-track"><div class="db-dps-fill" style="width:' + dpsPct + '%;"></div></div>' +
                    '</div>' +
                    '</td>' +
                    '<td style="font-family:var(--font-mono); color:var(--cyan);">' + cdText + '</td>' +
                    '<td>' +
                    '<div class="db-recipe-pill">' + item.recipe + '</div>' +
                    '<div style="font-size:0.84rem; color:var(--text-secondary); margin-top:4px;">' + item.desc + '</div>' +
                    '</td>' +
                    '<td>' + calcBtn + '</td>' +
                    '</tr>';
            });
            tableBody.innerHTML = rowsHtml;
        } else {
            if (tableWrap) tableWrap.style.display = 'none';
            gridContainer.style.display = 'grid';

            if (!filtered.length) {
                gridContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:32px; color:var(--text-muted);">Arama kriterlerinize uygun kayıt bulunamadı.</div>';
                return;
            }

            var cardsHtml = '';
            filtered.forEach(function (item) {
                var dpsPct = Math.min(100, Math.round((item.dpsScore / 1600) * 100));
                var dmgText = item.baseDmg > 0 ? (item.baseDmg + ' → ' + item.maxDmg) : 'Pasif';
                var cdText = item.cooldown > 0 ? (item.cooldown.toFixed(2) + 's') : 'Pasif';
                cardsHtml += '<article class="pro-card">' +
                    '<div class="pro-card-header">' +
                    '<div class="pro-card-title-group">' +
                    '<div class="pro-card-icon">' + item.icon + '</div>' +
                    '<div>' +
                    '<div class="pro-card-title">' + item.name + '</div>' +
                    '<div class="pro-card-subtitle">' + item.ship + '</div>' +
                    '</div>' +
                    '</div>' +
                    '<span class="badge ' + getTierBadgeClass(item.tier) + '">' + item.tier + '</span>' +
                    '</div>' +
                    '<div class="pro-card-body">' + item.desc + '</div>' +
                    '<div class="db-recipe-pill">' + item.recipe + '</div>' +
                    '<div class="pro-card-stats">' +
                    '<div class="stat-bar-row">' +
                    '<span class="stat-bar-label">GÜÇ ENDEKSİ</span>' +
                    '<div class="stat-bar-track"><div class="stat-bar-fill" style="width:' + dpsPct + '%;"></div></div>' +
                    '<span class="stat-bar-val">' + item.dpsScore + '</span>' +
                    '</div>' +
                    '</div>' +
                    '<div class="pro-card-footer">' +
                    '<span class="badge ' + getBadgeClass(item.category) + '">' + item.categoryLabel + '</span>' +
                    '<span style="font-family:var(--font-mono); font-size:0.78rem; color:var(--cyan);">Hasar: ' + dmgText + ' | CD: ' + cdText + '</span>' +
                    '</div>' +
                    '</article>';
            });
            gridContainer.innerHTML = cardsHtml;
        }

        // Bind "Hesapla" buttons to jump to Tab 5 and load preset
        var calcBtns = document.querySelectorAll('.js-load-calc');
        calcBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var itemId = btn.getAttribute('data-id');
                loadItemIntoCalculator(itemId);
            });
        });
    }

    function initTab1Controls() {
        var searchInput = document.getElementById('wikiDbSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                dbState.search = searchInput.value;
                renderWikiDatabase();
            });
        }

        var filterPills = document.querySelectorAll('#wikiDbFilterPills .filter-pill');
        filterPills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                filterPills.forEach(function (p) { p.classList.remove('active'); });
                pill.classList.add('active');
                dbState.category = pill.getAttribute('data-cat') || 'all';
                renderWikiDatabase();
            });
        });

        var sortSelect = document.getElementById('wikiDbSortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                dbState.sort = sortSelect.value;
                renderWikiDatabase();
            });
        }

        var btnTable = document.getElementById('btnWikiViewTable');
        var btnGrid = document.getElementById('btnWikiViewGrid');
        if (btnTable && btnGrid) {
            btnTable.addEventListener('click', function () {
                dbState.viewMode = 'table';
                btnTable.classList.add('active');
                btnGrid.classList.remove('active');
                renderWikiDatabase();
            });
            btnGrid.addEventListener('click', function () {
                dbState.viewMode = 'grid';
                btnGrid.classList.add('active');
                btnTable.classList.remove('active');
                renderWikiDatabase();
            });
        }

        renderWikiDatabase();
    }

    // -------------------------------------------------------------------------
    // 7. TAB 2: 4 MAPS × 8 SHIPS SYNERGY MATRIX
    // -------------------------------------------------------------------------
    function renderSynergyMatrix() {
        var sectorGrid = document.getElementById('wikiSectorCardsGrid');
        if (sectorGrid && !sectorGrid.innerHTML.trim()) {
            var sHtml = '';
            SECTOR_MAPS.forEach(function (m) {
                sHtml += '<div class="sector-overview-card" style="--sector-color:' + m.color + ';">' +
                    '<div class="sector-card-top">' +
                    '<img src="' + m.img + '" alt="' + m.name + '" class="sector-card-thumb">' +
                    '<div>' +
                    '<div class="sector-card-name">' + m.name + '</div>' +
                    '<div class="sector-card-mult">' + m.mult + '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="font-family:var(--font-mono); font-size:0.76rem; color:var(--cyan);">⚠️ ' + m.hazard + '</div>' +
                    '<p class="sector-card-desc">' + m.desc + '</p>' +
                    '</div>';
            });
            sectorGrid.innerHTML = sHtml;
        }

        var matrixBody = document.getElementById('synergyMatrixBody');
        if (!matrixBody) return;

        var rows = SHIP_SYNERGY_ROWS.filter(function (row) {
            if (synergyFilterRole === 'all') return true;
            return row.role === synergyFilterRole;
        });

        var html = '';
        rows.forEach(function (r) {
            html += '<tr>' +
                '<td>' +
                '<div class="synergy-ship-col">' +
                '<img src="' + r.img + '" alt="' + r.name + '" class="synergy-ship-avatar">' +
                '<div>' +
                '<div class="db-item-title">' + r.name + '</div>' +
                '<div class="db-item-sub">' + r.roleLabel + ' // ' + r.rootPerk + '</div>' +
                '</div>' +
                '</div>' +
                '</td>' +
                '<td><div class="synergy-cell-box"><span class="synergy-grade ' + r.sector9.cls + '">' + r.sector9.grade + ' UYUM</span><span class="synergy-note">' + r.sector9.note + '</span></div></td>' +
                '<td><div class="synergy-cell-box"><span class="synergy-grade ' + r.nebula.cls + '">' + r.nebula.grade + ' UYUM</span><span class="synergy-note">' + r.nebula.note + '</span></div></td>' +
                '<td><div class="synergy-cell-box"><span class="synergy-grade ' + r.blackhole.cls + '">' + r.blackhole.grade + ' UYUM</span><span class="synergy-note">' + r.blackhole.note + '</span></div></td>' +
                '<td><div class="synergy-cell-box"><span class="synergy-grade ' + r.dyson.cls + '">' + r.dyson.grade + ' UYUM</span><span class="synergy-note">' + r.dyson.note + '</span></div></td>' +
                '</tr>';
        });
        matrixBody.innerHTML = html;
    }

    function initTab2Synergy() {
        var roleBtns = document.querySelectorAll('#synergyRolePills .filter-pill');
        roleBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                roleBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                synergyFilterRole = btn.getAttribute('data-role') || 'all';
                renderSynergyMatrix();
            });
        });
        renderSynergyMatrix();
    }

    // -------------------------------------------------------------------------
    // 8. TAB 4: ENEMY & 5 BOSS WEAK-SPOT ENCYCLOPEDIA
    // -------------------------------------------------------------------------
    function renderBestiary() {
        var bossGrid = document.getElementById('bestiaryBossGrid');
        var enemyGrid = document.getElementById('bestiaryEnemyGrid');
        var bossSection = document.getElementById('bestiaryBossSection');
        var enemySection = document.getElementById('bestiaryEnemySection');
        if (!bossGrid || !enemyGrid) return;

        var q = bestiaryState.search.trim().toLowerCase();
        var f = bestiaryState.filter;

        var showBosses = (f === 'all' || f === 'boss');
        var showEnemies = (f === 'all' || f === 'swarm' || f === 'elite');

        if (bossSection) bossSection.style.display = showBosses ? 'block' : 'none';
        if (enemySection) enemySection.style.display = showEnemies ? 'block' : 'none';

        if (showBosses) {
            var filteredBosses = BOSS_DOSSIERS.filter(function (b) {
                if (!q) return true;
                var hay = (b.name + ' ' + b.wave + ' ' + b.weakSpot + ' ' + b.attacks + ' ' + b.counter).toLowerCase();
                return hay.indexOf(q) !== -1;
            });

            var bHtml = '';
            filteredBosses.forEach(function (b) {
                bHtml += '<article class="boss-dossier-card" style="--boss-color:' + b.color + ';">' +
                    '<div class="boss-dossier-top">' +
                    '<img src="' + b.img + '" alt="' + b.name + '" class="boss-svg-preview">' +
                    '<div>' +
                    '<div class="boss-dossier-wave">' + b.wave + '</div>' +
                    '<h3 class="boss-dossier-name">' + b.name + '</h3>' +
                    '<div style="display:flex; gap:8px; margin-top:4px;">' +
                    '<span class="badge tier-s">' + b.hpBase + '</span>' +
                    '<span class="badge weapon">' + b.armor + '</span>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="boss-weakspot-box">' +
                    '<strong>🎯 ZAYIF NOKTA (WEAK SPOT):</strong>' +
                    b.weakSpot +
                    '</div>' +
                    '<div style="font-size:0.88rem; color:var(--text-secondary);">' +
                    '<strong style="color:#fff;">Saldırı Kalıpları:</strong> ' + b.attacks +
                    '</div>' +
                    '<div style="font-size:0.88rem; color:var(--cyan); border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">' +
                    '<strong>💡 Taktiksel İmha Rehberi:</strong> ' + b.counter +
                    '</div>' +
                    '</article>';
            });
            bossGrid.innerHTML = bHtml || '<div style="color:var(--text-muted); padding:16px;">Aranan kriterde Boss kaydı bulunamadı.</div>';
        }

        if (showEnemies) {
            var filteredEnemies = SWARM_ENEMIES.filter(function (e) {
                if (f === 'swarm' && e.type !== 'swarm') return false;
                if (f === 'elite' && e.type !== 'elite') return false;
                if (!q) return true;
                var hay = (e.name + ' ' + e.typeLabel + ' ' + e.desc).toLowerCase();
                return hay.indexOf(q) !== -1;
            });

            var eHtml = '';
            filteredEnemies.forEach(function (e) {
                var badgeCls = e.type === 'elite' ? 'evo' : 'weapon';
                eHtml += '<article class="enemy-unit-card">' +
                    '<div class="enemy-unit-top">' +
                    '<img src="' + e.img + '" alt="' + e.name + '" class="enemy-svg-preview">' +
                    '<div>' +
                    '<span class="badge ' + badgeCls + '">' + e.typeLabel + '</span>' +
                    '<h4 class="db-item-title" style="margin-top:4px;">' + e.name + '</h4>' +
                    '<div class="db-item-sub">Can: ' + e.hp + ' // Hız: ' + e.spd + '</div>' +
                    '</div>' +
                    '</div>' +
                    '<p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.45;">' + e.desc + '</p>' +
                    '</article>';
            });
            enemyGrid.innerHTML = eHtml || '<div style="color:var(--text-muted); padding:16px;">Aranan kriterde düşman birimi bulunamadı.</div>';
        }
    }

    function initTab4Bestiary() {
        var searchInput = document.getElementById('bestiarySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                bestiaryState.search = searchInput.value;
                renderBestiary();
            });
        }

        var pills = document.querySelectorAll('#bestiaryFilterPills .filter-pill');
        pills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                pills.forEach(function (p) { p.classList.remove('active'); });
                pill.classList.add('active');
                bestiaryState.filter = pill.getAttribute('data-filter') || 'all';
                renderBestiary();
            });
        });

        renderBestiary();
    }

    // -------------------------------------------------------------------------
    // 9. TAB 5: INTERACTIVE DAMAGE, ARMOR & COSMIC DECAY MATH CALCULATOR
    // -------------------------------------------------------------------------
    function populateCalcPresets() {
        var presetSel = document.getElementById('calcPresetSelect');
        if (!presetSel) return;

        var html = '<option value="custom">-- Özel Parametre / Manuel Ayar --</option>';
        WIKI_DB_ITEMS.forEach(function (item) {
            if (item.baseDmg > 0) {
                html += '<option value="' + item.id + '">' + item.icon + ' ' + item.name + ' (Baz: ' + item.baseDmg + ' | CD: ' + item.cooldown + 's)</option>';
            }
        });
        presetSel.innerHTML = html;

        presetSel.addEventListener('change', function () {
            var val = presetSel.value;
            if (val !== 'custom') {
                applyItemToSliders(val);
            }
        });
    }

    function applyItemToSliders(itemId) {
        var found = null;
        for (var i = 0; i < WIKI_DB_ITEMS.length; i++) {
            if (WIKI_DB_ITEMS[i].id === itemId) {
                found = WIKI_DB_ITEMS[i];
                break;
            }
        }
        if (!found) return;

        var sBaseDmg = document.getElementById('sliderBaseDmg');
        var sStageMult = document.getElementById('sliderStageMult');
        var sBaseCd = document.getElementById('sliderBaseCd');

        if (sBaseDmg) sBaseDmg.value = found.baseDmg;
        if (sBaseCd && found.cooldown > 0) sBaseCd.value = found.cooldown;
        if (sStageMult) {
            if (found.category === 'mega') sStageMult.value = 3.2;
            else if (found.category === 'evolution') sStageMult.value = 2.2;
            else sStageMult.value = 1.6;
        }
        updateMathCalculator();
    }

    function loadItemIntoCalculator(itemId) {
        var tabBtns = document.querySelectorAll('.wiki-tab-btn');
        var tabPanes = document.querySelectorAll('.wiki-tab-pane');
        tabBtns.forEach(function (b) {
            if (b.getAttribute('data-tab') === 'tab-calculator') b.classList.add('active');
            else b.classList.remove('active');
        });
        tabPanes.forEach(function (p) {
            if (p.id === 'tab-calculator') p.classList.add('active');
            else p.classList.remove('active');
        });

        var presetSel = document.getElementById('calcPresetSelect');
        if (presetSel) presetSel.value = itemId;
        applyItemToSliders(itemId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateMathCalculator() {
        var sBaseDmg = document.getElementById('sliderBaseDmg');
        if (!sBaseDmg) return;

        var baseDmg = parseFloat(sBaseDmg.value) || 40;
        var stageMult = parseFloat(document.getElementById('sliderStageMult').value) || 1.0;
        var baseCd = parseFloat(document.getElementById('sliderBaseCd').value) || 0.60;
        var cdrPct = parseFloat(document.getElementById('sliderCdr').value) || 0;
        var critChancePct = parseFloat(document.getElementById('sliderCritChance').value) || 20;
        var critMult = parseFloat(document.getElementById('sliderCritMult').value) || 2.0;
        var playerArmor = parseFloat(document.getElementById('sliderPlayerArmor').value) || 20;
        var waveNum = parseInt(document.getElementById('sliderWaveNum').value, 10) || 15;

        var isWeakSpot = document.getElementById('chkWeakSpot') && document.getElementById('chkWeakSpot').checked;
        var isChronosRift = document.getElementById('chkChronosRift') && document.getElementById('chkChronosRift').checked;

        // Update slider value labels
        document.getElementById('valBaseDmg').textContent = baseDmg.toFixed(0);
        document.getElementById('valStageMult').textContent = 'x' + stageMult.toFixed(2);
        document.getElementById('valBaseCd').textContent = baseCd.toFixed(2) + ' sn';
        document.getElementById('valCdr').textContent = '%' + cdrPct.toFixed(0);
        document.getElementById('valCritChance').textContent = '%' + critChancePct.toFixed(0);
        document.getElementById('valCritMult').textContent = 'x' + critMult.toFixed(2);
        document.getElementById('valPlayerArmor').textContent = playerArmor.toFixed(0) + ' Zırh';
        document.getElementById('valWaveNum').textContent = 'Dalga ' + waveNum;

        // Math Calculations
        var weakSpotMult = isWeakSpot ? 1.50 : 1.00;
        var riftMult = isChronosRift ? 1.25 : 1.00;

        var rawHit = baseDmg * stageMult * weakSpotMult * riftMult;
        var critChance = Math.min(1, Math.max(0, critChancePct / 100));
        var expectedCritFactor = 1 + (critChance * (critMult - 1));
        var avgHit = rawHit * expectedCritFactor;
        var critHit = rawHit * critMult;

        var effectiveCd = Math.max(0.08, baseCd * (1 - (cdrPct / 100)));
        var attacksPerSec = 1 / effectiveCd;
        var rawDps = avgHit * attacksPerSec;

        // Cosmic Decay for Wave > 24: 0.96^(Wave - 24)
        var decayFactor = waveNum > 24 ? Math.pow(0.96, waveNum - 24) : 1.0;
        var postDecayDps = rawDps * decayFactor;

        // Armor Reduction Formula: Armor / (Armor + 40)
        var armorReduction = playerArmor / (playerArmor + 40);
        var ehpMultiplier = 1 / (1 - armorReduction);

        // Update KPI Output Boxes
        document.getElementById('kpiAvgHit').textContent = Math.round(avgHit).toLocaleString('tr-TR');
        document.getElementById('kpiCritHitSub').textContent = 'Kritik Vuruşta: ' + Math.round(critHit).toLocaleString('tr-TR') + ' Hasar';

        document.getElementById('kpiRawDps').textContent = Math.round(rawDps).toLocaleString('tr-TR') + ' /sn';
        document.getElementById('kpiFireRateSub').textContent = attacksPerSec.toFixed(2) + ' Atış/sn (CD: ' + effectiveCd.toFixed(2) + 's)';

        document.getElementById('kpiDecayDps').textContent = Math.round(postDecayDps).toLocaleString('tr-TR') + ' /sn';
        var decayPct = Math.round(decayFactor * 100);
        document.getElementById('kpiDecaySub').textContent = waveNum > 24
            ? ('Kozmik Çürüme Aktif: %' + decayPct + ' Etkinlik (0.96^' + (waveNum - 24) + ')')
            : 'Dalga ≤ 24: Kozmik Çürüme Yok (%100 Etkinlik)';

        document.getElementById('kpiArmorMit').textContent = '%' + (armorReduction * 100).toFixed(1) + ' Azaltma';
        document.getElementById('kpiEhpSub').textContent = 'Efektif Gövde Dayanıklılığı: x' + ehpMultiplier.toFixed(2) + ' EHP';

        // Live Formula Breakdown
        var formulaEl = document.getElementById('liveFormulaBreakdown');
        if (formulaEl) {
            formulaEl.innerHTML =
                '<div><strong>1. Tekil Vuruş:</strong> ' + baseDmg + ' (Baz) × ' + stageMult.toFixed(2) + ' (Evrim) × ' + weakSpotMult.toFixed(2) + ' (Zayıf Nokta) × ' + riftMult.toFixed(2) + ' (Takyon) = <span style="color:var(--cyan);">' + rawHit.toFixed(1) + '</span></div>' +
                '<div><strong>2. Kritik Beklenti Çarpanı:</strong> 1 + (' + critChance.toFixed(2) + ' × (' + critMult.toFixed(2) + ' - 1)) = <span style="color:var(--gold);">x' + expectedCritFactor.toFixed(2) + '</span> → Ortalama Vuruş: <strong>' + avgHit.toFixed(1) + '</strong></div>' +
                '<div><strong>3. Efektif Atış Hızı:</strong> 1 / (' + baseCd.toFixed(2) + 's × (1 - ' + (cdrPct / 100).toFixed(2) + ')) = <span style="color:var(--cyan);">' + attacksPerSec.toFixed(2) + ' saldırı/sn</span></div>' +
                '<div><strong>4. Dalga ' + waveNum + ' Kozmik Çürüme:</strong> ' + Math.round(rawDps) + ' DPS × ' + decayFactor.toFixed(3) + ' = <span style="color:var(--magenta); font-weight:700;">' + Math.round(postDecayDps) + ' Net DPS</span></div>';
        }
    }

    function initTab5Calculator() {
        populateCalcPresets();
        var sliderIds = [
            'sliderBaseDmg', 'sliderStageMult', 'sliderBaseCd',
            'sliderCdr', 'sliderCritChance', 'sliderCritMult',
            'sliderPlayerArmor', 'sliderWaveNum'
        ];
        sliderIds.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', updateMathCalculator);
            }
        });

        var chk1 = document.getElementById('chkWeakSpot');
        var chk2 = document.getElementById('chkChronosRift');
        if (chk1) chk1.addEventListener('change', updateMathCalculator);
        if (chk2) chk2.addEventListener('change', updateMathCalculator);

        updateMathCalculator();
    }

    // -------------------------------------------------------------------------
    // BOOTSTRAP ON DOM READY
    // -------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        syncTopbarCredits();
        initWikiTabs();
        initTab1Controls();
        initTab2Synergy();
        initTab4Bestiary();
        initTab5Calculator();
    });
})();
