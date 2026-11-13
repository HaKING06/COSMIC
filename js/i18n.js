// =============================================================================
// COSMIC SURVIVORS v10.0 — BILINGUAL LOCALIZATION ENGINE (TR / EN)
// Standalone vanilla JS module exporting window.CosmicI18n
// =============================================================================
(function (global) {
    'use strict';

    const STORAGE_KEY = 'cosmic_lang';
    const SUPPORTED_LANGS = ['tr', 'en'];

    const DICT = {
        tr: {
            // Topbar & Navigation
            'nav.portal': 'V11.0 ÇOKLU EVREN PORTALI',
            'nav.portalLink': 'Portal',
            'nav.story': 'Hikâye',
            'nav.hangar': 'Survivors',
            'nav.tree': 'Evrim Ağacı',
            'nav.armory': 'Atölye & Kaplamalar',
            'nav.modes': 'Oyun Modları',
            'nav.wiki': 'Ansiklopedi',
            'nav.about': 'Hakkında',
            'nav.audioOn': 'Ses Açık',
            'nav.audioOff': 'Sessiz',
            'nav.credits': 'Kredi',
            'nav.play': 'Savaşa Başla',

            // Left Rail
            'rail.commandCenter': 'KOMUTA MERKEZİ',
            'rail.cockpit': 'Kokpit / Konuşlanma',
            'rail.workshop': 'Araştırma Atölyesi',
            'rail.armory': 'Cephanelik & Kaplamalar',
            'rail.modes': 'Modlar & Günlük Protokol',
            'rail.maps': 'Sektör Atlası',
            'rail.records': 'Yerel Kayıt & Rekorlar',
            'rail.achievements': 'Başarımlar',
            'rail.pilotStatus': 'PİLOT DURUMU',
            'rail.totalSorties': 'Toplam Çıkış',
            'rail.bestWave': 'En Yüksek Dalga',
            'rail.unlockedAch': 'Açılan Başarım',

            // Cockpit & Deployment
            'cockpit.title': 'Kokpit & Taktik Konuşlanma',
            'cockpit.sub': '8 yıldız gemisinden birini seçin, oyun modunu ve kaplamayı ayarlayın, ardından sektöre çıkın.',
            'cockpit.callsign': 'Pilot Çağrı Kodu',
            'cockpit.callsignPlaceholder': 'PİLOT-01',
            'cockpit.fleetHangar': 'FİLO HANGARI (8 GEMİ)',
            'cockpit.ready': 'HAZIR',
            'cockpit.inspectTree': 'Ağacı İncele',
            'cockpit.sectorSelect': 'SEKTÖR SEÇİMİ (4 ARENA)',
            'cockpit.modeSelect': 'OPERASYON MODU (5 MOD)',
            'cockpit.difficultySelect': 'ZORLUK PROTOKOLÜ',
            'cockpit.skinSelect': 'FİLO KAPLAMASI',
            'cockpit.launch': 'GÖREVE ÇIK',
            'cockpit.shipTelemetry': 'GEMİ TELEMETRİSİ',
            'cockpit.hp': 'Gövde (HP)',
            'cockpit.shield': 'Kalkan (SH)',
            'cockpit.speedArmor': 'Hız / Zırh',
            'cockpit.crit': 'Kritik Şans',
            'cockpit.passive': 'PASİF SİSTEM',
            'cockpit.ability': 'AKTİF YETENEK',
            'cockpit.signatureChain': 'İMZA EVRİM ZİNCİRİ',
            'cockpit.megaPathBadge': 'MEGA YOL',
            'cockpit.radarTitle': 'PERFORMANS RADARI',
            'cockpit.starter': 'Başlangıç',
            'cockpit.coreCombo': 'Kök Sentez',
            'cockpit.sigEvo': 'İmza Evrim',
            'cockpit.targetMega': 'Hedef Mega',

            // Game Modes & Daily Protocol
            'modes.title': 'Operasyon Modları & Günlük Protokol',
            'modes.sub': 'Klasik seferden zaman yarışına, Boss Rush arenasından günlük tohumlu protokollere kadar 5 farklı mücadele.',
            'modes.survival': 'Klasik Sefer',
            'modes.endless': 'Sonsuz Overdrive',
            'modes.bossrush': 'Boss Akını',
            'modes.timeattack': 'Zamana Karşı',
            'modes.daily': 'Günlük Protokol',
            'modes.mutators': 'Aktif Mutatörler',
            'modes.dailySeed': 'Günlük Tohum',
            'modes.xpMult': 'XP Çarpanı',
            'modes.scoreMult': 'Skor Çarpanı',
            'modes.creditMult': 'CRD Çarpanı',
            'modes.waveCap': 'Dalga Sınırı',
            'modes.unlimited': 'Sınırsız',
            'modes.selectMode': 'Modu Seç',
            'modes.selected': 'SEÇİLİ MOD',
            'modes.dailyRefresh': 'Her gün UTC/Yerel takvimle deterministik olarak yenilenir.',

            // Armory & Research Workshop
            'workshop.title': 'Araştırma Atölyesi',
            'workshop.sub': 'Kalıcı gemi modülleri geliştirin. İstediğiniz zaman tüm kredinizi tam iade ile sıfırlayabilirsiniz.',
            'workshop.reset': 'Tümünü Sıfırla (Tam İade)',
            'workshop.maxed': 'MAKSİMUM',
            'workshop.buy': 'Geliştir',
            'workshop.level': 'Seviye',
            'armory.title': 'Cephanelik & Filo Kaplamaları',
            'armory.sub': 'Kalıcı atölye sistemlerini yükseltin ve tüm gemilerde kullanılabilen filo kaplamalarının kilidini açın.',
            'armory.skinsTitle': 'FİLO GÖVDE KAPLAMALARI (SKINS)',
            'armory.skinsSub': 'Satın alınan kaplamalar hangardaki tüm 8 yıldız gemisine anında uygulanabilir.',
            'armory.equipSkin': 'Kuşan',
            'armory.equipped': 'KUŞANILDI',
            'armory.unlockSkin': 'Kilidi Aç',
            'armory.unlocked': 'AÇIK',
            'armory.upgradesTitle': 'KALICI SİSTEM YÜKSELTMELERİ',
            'armory.cost': 'Maliyet',
            'armory.credits': 'Kredi',

            // Maps
            'maps.title': 'Sektör Atlası & Tehlike Analizi',
            'maps.sub': 'Her sektörün dinamik çevre olaylarını, önerilen gemilerini ve skor çarpanlarını inceleyin.',
            'maps.events': 'Arena Olayları',
            'maps.tactics': 'Taktik Not',
            'maps.recommended': 'Önerilen Gemiler',
            'maps.hazard': 'Tehlike Seviyesi',

            // Local Records (Zero Global Leaderboard)
            'records.title': 'Yerel Kayıtlar & Kişisel Rekorlar',
            'records.sub': 'Tüm uçuş verileri yalnızca bu cihazda çevrimdışı olarak saklanır. Sektör ve mod bazlı en iyi derecelerinizi takip edin.',
            'records.bestBySector': 'Sektöre Göre En İyi Skorlar',
            'records.bestByMode': 'Moda Göre En İyi Skorlar',
            'records.dailyBest': 'Bugünün Günlük Protokol Rekoru',
            'records.recentRuns': 'Son Uçuş Geçmişi & Yerel Sıralama',
            'records.totalRuns': 'Toplam Uçuş',
            'records.bestScore': 'En Yüksek Skor',
            'records.bestWave': 'En Yüksek Dalga',
            'records.totalKills': 'Toplam İmha',
            'records.evosMegas': 'Evrim / Mega',
            'records.rank': 'Sıra',
            'records.pilot': 'Pilot',
            'records.ship': 'Gemi',
            'records.sector': 'Sektör',
            'records.mode': 'Mod',
            'records.difficulty': 'Zorluk',
            'records.wave': 'Dalga',
            'records.score': 'Skor',
            'records.time': 'Süre',
            'records.date': 'Tarih',
            'records.empty': 'Henüz yerel uçuş kaydı yok. İlk görevinizle kişisel rekorunuzu başlatın.',
            'records.clear': 'Yerel Kayıtları Temizle',
            'records.clearConfirm': 'Tüm yerel uçuş kayıtları silinsin mi?',
            'records.filterAll': 'Tümü',
            'records.localBadge': '100% YEREL DEPOLAMA',

            // Achievements
            'achievements.title': 'Kariyer Başarımları',
            'achievements.sub': 'Savaş kilometre taşlarını tamamlayın ve Araştırma Atölyesi için bonus kredi toplayın.',
            'achievements.locked': 'KİLİTLİ',
            'achievements.unlocked': 'AÇILDI',
            'achievements.claim': 'Ödülü Al',
            'achievements.claimed': 'ALINDI',
            'achievements.reward': 'Ödül',

            // Game HUD, Modals & Overlays
            'hud.overdrive': 'OVERDRIVE',
            'hud.overdriveReady': 'OVERDRIVE HAZIR [E]',
            'hud.minimap': 'Taktik Radar',
            'hud.aimManual': '[Q] Fare Nişanı',
            'hud.aimAuto': '[Q] Otomatik Nişan',
            'hud.mode': 'Mod',
            'hud.sector': 'Sektör',
            'hud.wave': 'Dalga',
            'hud.time': 'Süre',
            'hud.kills': 'İmha',
            'hud.credits': 'Kredi',
            'hud.score': 'Skor',
            'hud.ability': 'Yetenek',
            'hud.level': 'SV',
            'hud.bossPhase': 'FAZ',
            'hud.mutators': 'Mutatörler',
            'hud.revivals': 'Yeniden Doğuş',
            'hud.levelUpEyebrow': 'SEVİYE ATLAMA · SENTEZ MODÜLÜ',
            'hud.levelUpTitle': 'Gemi Yükseltmesini Seç',
            'hud.levelUpSub': '1, 2 veya 3 tuşuna bas ya da karta tıkla. Evrim şartları oluştuğunda altın modül açılır.',
            'hud.reroll': 'Yenile',
            'hud.skip': 'Pas Geç',
            'hud.lootTitle': 'KOZMİK GANİMET KASASI',
            'hud.lootDecoding': 'Kasa Şifresi Çözülüyor...',
            'hud.lootCollect': 'Modülü Al ve Devam Et',
            'hud.pauseTitle': 'Operasyon Duraklatıldı',
            'hud.resume': 'Savaşa Devam Et',
            'hud.restart': 'Yeniden Başlat',
            'hud.hangarReturn': 'Komuta Hangarına Dön',
            'hud.gameOverEyebrow': 'OPERASYON RAPORU',
            'hud.gameOverVictory': 'Görev Başarıyla Tamamlandı',
            'hud.gameOverDefeat': 'Sektör Görevi Sona Erdi',
            'hud.damageBreakdown': 'Silah Hasar Dağılımı',
            'hud.dailyTimer': 'Tahliye Sayacı',

            // Wiki
            'wiki.title': 'Kozmik Taktik Ansiklopedisi',
            'wiki.sub': 'Tüm gemiler, silahlar, modüller, çapraz/imza evrimler, Mega sentezler, düşmanlar ve Boss mekanikleri.',
            'wiki.searchPlaceholder': 'Silah, modül, evrim veya düşman ara...',
            'wiki.weapons': 'Silahlar',
            'wiki.trinkets': 'Destek Modülleri',
            'wiki.evolutions': 'Evrimler',
            'wiki.megas': 'Mega Evrimler',
            'wiki.enemies': 'Düşman Sürüleri',
            'wiki.bosses': 'Dreadnought Bosslar',
            'wiki.simulator': 'Hayatta Kalma Simülatörü',
            'wiki.all': 'Tümü',

            // Tree
            'tree.title': 'İnteraktif Evrim Ağacı',
            'tree.sub': 'Silah ve destek modülü birleşimlerinden doğan 19 Evrim ve 6 Mega Evrim rotasını keşfedin.',
            'tree.filterShip': 'Gemiye Göre Filtrele',
            'tree.zoomIn': 'Yakınlaştır',
            'tree.zoomOut': 'Uzaklaştır',
            'tree.resetView': 'Görünümü Sıfırla',
            'tree.legend': 'Sentez Rehberi',
            'tree.formula': 'Formül',

            // About
            'about.title': 'COSMIC UNIVERSE v11.0 — 50 Oyun & Hikâye Portali',
            'about.sub': 'Yüksek tempolu uzay arena hayatta kalma oyunu. Sıfır sunucu bağımlılığı ile tamamen tarayıcınızda çalışır.',
            'about.architecture': 'Teknik Mimari',
            'about.controls': 'Uçuş & Savaş Kontrolleri',
            'about.credits': 'Sürüm Notları',
            'about.offlineNotice': 'Tüm ilerleme, başarımlar ve skor kayıtları yerel tarayıcı belleğinizde tutulur.',

            // Common
            'common.tr': 'Türkçe',
            'common.en': 'English',
            'common.back': 'Geri',
            'common.close': 'Kapat',
            'common.confirm': 'Onayla',
            'common.cancel': 'İptal',
            'common.yes': 'Evet',
            'common.no': 'Hayır',
            'common.loading': 'Yükleniyor...'
        },
        en: {
            // Topbar & Navigation
            'nav.portal': 'V11.0 MULTIVERSE PORTAL',
            'nav.portalLink': 'Portal',
            'nav.story': 'Story Saga',
            'nav.hangar': 'Survivors',
            'nav.tree': 'Evolution Tree',
            'nav.armory': 'Armory & Skins',
            'nav.modes': 'Game Modes',
            'nav.wiki': 'Encyclopedia',
            'nav.about': 'About',
            'nav.audioOn': 'Audio On',
            'nav.audioOff': 'Muted',
            'nav.credits': 'Credits',
            'nav.play': 'Launch Sortie',

            // Left Rail
            'rail.commandCenter': 'COMMAND CENTER',
            'rail.cockpit': 'Cockpit / Deployment',
            'rail.workshop': 'Research Workshop',
            'rail.armory': 'Armory & Liveries',
            'rail.modes': 'Modes & Daily Protocol',
            'rail.maps': 'Sector Atlas',
            'rail.records': 'Local Records & Bests',
            'rail.achievements': 'Achievements',
            'rail.pilotStatus': 'PILOT STATUS',
            'rail.totalSorties': 'Total Sorties',
            'rail.bestWave': 'Highest Wave',
            'rail.unlockedAch': 'Achievements',

            // Cockpit & Deployment
            'cockpit.title': 'Cockpit & Tactical Deployment',
            'cockpit.sub': 'Select one of 8 starships, configure your operation mode and hull livery, and deploy to the sector.',
            'cockpit.callsign': 'Pilot Callsign',
            'cockpit.callsignPlaceholder': 'PILOT-01',
            'cockpit.fleetHangar': 'FLEET HANGAR (8 SHIPS)',
            'cockpit.ready': 'READY',
            'cockpit.inspectTree': 'Inspect Tree',
            'cockpit.sectorSelect': 'SECTOR SELECTION (4 ARENAS)',
            'cockpit.modeSelect': 'OPERATION MODE (5 MODES)',
            'cockpit.difficultySelect': 'DIFFICULTY PROTOCOL',
            'cockpit.skinSelect': 'FLEET LIVERY',
            'cockpit.launch': 'DEPLOY SORTIE',
            'cockpit.shipTelemetry': 'SHIP TELEMETRY',
            'cockpit.hp': 'Hull (HP)',
            'cockpit.shield': 'Shield (SH)',
            'cockpit.speedArmor': 'Speed / Armor',
            'cockpit.crit': 'Crit Chance',
            'cockpit.passive': 'PASSIVE SYSTEM',
            'cockpit.ability': 'ACTIVE ABILITY',
            'cockpit.signatureChain': 'SIGNATURE EVOLUTION CHAIN',
            'cockpit.megaPathBadge': 'MEGA PATH',
            'cockpit.radarTitle': 'PERFORMANCE RADAR',
            'cockpit.starter': 'Starter',
            'cockpit.coreCombo': 'Core Synthesis',
            'cockpit.sigEvo': 'Signature Evo',
            'cockpit.targetMega': 'Target Mega',

            // Game Modes & Daily Protocol
            'modes.title': 'Operation Modes & Daily Protocol',
            'modes.sub': 'Choose from 5 distinct combat protocols ranging from classic campaign to seeded daily challenges.',
            'modes.survival': 'Classic Campaign',
            'modes.endless': 'Endless Overdrive',
            'modes.bossrush': 'Boss Rush',
            'modes.timeattack': 'Time Attack',
            'modes.daily': 'Daily Seeded Protocol',
            'modes.mutators': 'Active Mutators',
            'modes.dailySeed': 'Daily Seed',
            'modes.xpMult': 'XP Multiplier',
            'modes.scoreMult': 'Score Multiplier',
            'modes.creditMult': 'CRD Multiplier',
            'modes.waveCap': 'Wave Cap',
            'modes.unlimited': 'Unlimited',
            'modes.selectMode': 'Select Mode',
            'modes.selected': 'SELECTED MODE',
            'modes.dailyRefresh': 'Deterministically generated daily from your calendar date.',

            // Armory & Research Workshop
            'workshop.title': 'Research Workshop',
            'workshop.sub': 'Upgrade permanent ship systems. Reset all workshop nodes anytime for a 100% credit refund.',
            'workshop.reset': 'Reset All (Full Refund)',
            'workshop.maxed': 'MAXED',
            'workshop.buy': 'Upgrade',
            'workshop.level': 'Level',
            'armory.title': 'Armory & Fleet Liveries',
            'armory.sub': 'Upgrade permanent workshop modules and unlock cosmetic hull liveries usable across all starships.',
            'armory.skinsTitle': 'FLEET HULL LIVERIES (SKINS)',
            'armory.skinsSub': 'Unlocked liveries can be equipped on any of the 8 starships in the hangar.',
            'armory.equipSkin': 'Equip',
            'armory.equipped': 'EQUIPPED',
            'armory.unlockSkin': 'Unlock',
            'armory.unlocked': 'UNLOCKED',
            'armory.upgradesTitle': 'PERMANENT SYSTEM UPGRADES',
            'armory.cost': 'Cost',
            'armory.credits': 'Credits',

            // Maps
            'maps.title': 'Sector Atlas & Hazard Intel',
            'maps.sub': 'Inspect dynamic environmental hazards, recommended starships, and score multipliers per sector.',
            'maps.events': 'Arena Events',
            'maps.tactics': 'Tactical Note',
            'maps.recommended': 'Recommended Ships',
            'maps.hazard': 'Hazard Rating',

            // Local Records (Zero Global Leaderboard)
            'records.title': 'Local Records & Personal Bests',
            'records.sub': 'All flight logs are stored strictly offline on this device. Track your best runs across sectors and modes.',
            'records.bestBySector': 'Personal Bests by Sector',
            'records.bestByMode': 'Personal Bests by Mode',
            'records.dailyBest': "Today's Daily Protocol Best",
            'records.recentRuns': 'Recent Runs & Local Standings',
            'records.totalRuns': 'Total Sorties',
            'records.bestScore': 'Best Score',
            'records.bestWave': 'Highest Wave',
            'records.totalKills': 'Total Kills',
            'records.evosMegas': 'Evos / Megas',
            'records.rank': 'Rank',
            'records.pilot': 'Pilot',
            'records.ship': 'Ship',
            'records.sector': 'Sector',
            'records.mode': 'Mode',
            'records.difficulty': 'Difficulty',
            'records.wave': 'Wave',
            'records.score': 'Score',
            'records.time': 'Time',
            'records.date': 'Date',
            'records.empty': 'No local flight records yet. Complete your first sortie to set a personal best.',
            'records.clear': 'Clear Local Records',
            'records.clearConfirm': 'Delete all local flight records?',
            'records.filterAll': 'All',
            'records.localBadge': '100% LOCAL STORAGE',

            // Achievements
            'achievements.title': 'Career Achievements',
            'achievements.sub': 'Complete combat milestones and claim bonus credits for the Research Workshop.',
            'achievements.locked': 'LOCKED',
            'achievements.unlocked': 'UNLOCKED',
            'achievements.claim': 'Claim Reward',
            'achievements.claimed': 'CLAIMED',
            'achievements.reward': 'Reward',

            // Game HUD, Modals & Overlays
            'hud.overdrive': 'OVERDRIVE',
            'hud.overdriveReady': 'OVERDRIVE READY [E]',
            'hud.minimap': 'Tactical Radar',
            'hud.aimManual': '[Q] Mouse Aim',
            'hud.aimAuto': '[Q] Auto Aim',
            'hud.mode': 'Mode',
            'hud.sector': 'Sector',
            'hud.wave': 'Wave',
            'hud.time': 'Time',
            'hud.kills': 'Kills',
            'hud.credits': 'Credits',
            'hud.score': 'Score',
            'hud.ability': 'Ability',
            'hud.level': 'LV',
            'hud.bossPhase': 'PHASE',
            'hud.mutators': 'Mutators',
            'hud.revivals': 'Revivals',
            'hud.levelUpEyebrow': 'LEVEL UP · SYNTHESIS MODULE',
            'hud.levelUpTitle': 'Choose Ship Upgrade',
            'hud.levelUpSub': 'Press 1, 2, or 3 or click a card. Gold modules unlock when evolution requirements are met.',
            'hud.reroll': 'Reroll',
            'hud.skip': 'Skip',
            'hud.lootTitle': 'COSMIC SUPPLY CACHE',
            'hud.lootDecoding': 'Decoding Supply Cache...',
            'hud.lootCollect': 'Collect Module & Continue',
            'hud.pauseTitle': 'Sortie Paused',
            'hud.resume': 'Resume Combat',
            'hud.restart': 'Restart Sortie',
            'hud.hangarReturn': 'Return to Hangar',
            'hud.gameOverEyebrow': 'AFTER-ACTION REPORT',
            'hud.gameOverVictory': 'Mission Objective Completed',
            'hud.gameOverDefeat': 'Sector Sortie Ended',
            'hud.damageBreakdown': 'Weapon Damage Breakdown',
            'hud.dailyTimer': 'Extraction Timer',

            // Wiki
            'wiki.title': 'Cosmic Tactical Encyclopedia',
            'wiki.sub': 'Complete database of starships, weapons, trinkets, cross/signature evolutions, Mega syntheses, enemies, and bosses.',
            'wiki.searchPlaceholder': 'Search weapons, modules, evolutions, or enemies...',
            'wiki.weapons': 'Weapons',
            'wiki.trinkets': 'Support Modules',
            'wiki.evolutions': 'Evolutions',
            'wiki.megas': 'Mega Evolutions',
            'wiki.enemies': 'Enemy Swarms',
            'wiki.bosses': 'Dreadnought Bosses',
            'wiki.simulator': 'Survival Simulator',
            'wiki.all': 'All',

            // Tree
            'tree.title': 'Interactive Evolution Tree',
            'tree.sub': 'Explore all 19 Evolutions and 6 Mega Evolutions forged from weapon and trinket combinations.',
            'tree.filterShip': 'Filter by Ship',
            'tree.zoomIn': 'Zoom In',
            'tree.zoomOut': 'Zoom Out',
            'tree.resetView': 'Reset View',
            'tree.legend': 'Synthesis Legend',
            'tree.formula': 'Formula',

            // About
            'about.title': 'COSMIC UNIVERSE v11.0 — 50-Game Portal & Story Saga',
            'about.sub': 'High-tempo cosmic arena survival game running 100% locally in your browser with zero external server dependency.',
            'about.architecture': 'Technical Architecture',
            'about.controls': 'Flight & Combat Controls',
            'about.credits': 'Release Notes',
            'about.offlineNotice': 'All progression, achievements, and flight records remain strictly in local browser storage.',

            // Common
            'common.tr': 'Türkçe',
            'common.en': 'English',
            'common.back': 'Back',
            'common.close': 'Close',
            'common.confirm': 'Confirm',
            'common.cancel': 'Cancel',
            'common.yes': 'Yes',
            'common.no': 'No',
            'common.loading': 'Loading...'
        }
    };

    let explicitLangSet = false;
    let memoryLang = null;
    let listenersBound = false;

    function normalizeLang(raw) {
        if (typeof raw !== 'string') return null;
        const lower = raw.trim().toLowerCase();
        if (lower === 'tr' || lower.startsWith('tr-') || lower.startsWith('tr_')) return 'tr';
        if (lower === 'en' || lower.startsWith('en-') || lower.startsWith('en_')) return 'en';
        return null;
    }

    function readUrlLang() {
        try {
            if (typeof location !== 'undefined' && location && typeof location.search === 'string') {
                const params = new URLSearchParams(location.search);
                return normalizeLang(params.get('lang'));
            }
        } catch (err) {
            // Ignore URL parsing issues in restricted contexts
        }
        return null;
    }

    function readStorageLang() {
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                return normalizeLang(localStorage.getItem(STORAGE_KEY));
            }
        } catch (err) {
            // Ignore storage access errors
        }
        return null;
    }

    function readNavigatorLang() {
        try {
            if (typeof navigator !== 'undefined' && navigator && typeof navigator.language === 'string') {
                return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
            }
        } catch (err) {
            // Ignore navigator read errors
        }
        return 'en';
    }

    function getLang() {
        if (!explicitLangSet) {
            const urlLang = readUrlLang();
            if (urlLang) return urlLang;
        }
        const stored = readStorageLang();
        if (stored) return stored;
        if (memoryLang) return memoryLang;
        return readNavigatorLang();
    }

    function interpolate(template, params) {
        if (!params || typeof params !== 'object') return template;
        return String(template).replace(/\{\{?(\w+)\}?\}/g, function (match, key) {
            return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match;
        });
    }

    function t(key, params) {
        if (!key) return '';
        const lang = getLang();
        const table = DICT[lang] || DICT.en;
        let text = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : null;
        if (text === null && lang !== 'en' && Object.prototype.hasOwnProperty.call(DICT.en, key)) {
            text = DICT.en[key];
        }
        if (text === null && lang !== 'tr' && Object.prototype.hasOwnProperty.call(DICT.tr, key)) {
            text = DICT.tr[key];
        }
        if (text === null) return String(key);
        return interpolate(text, params);
    }

    function hasKey(key) {
        const lang = getLang();
        return Boolean(
            (DICT[lang] && Object.prototype.hasOwnProperty.call(DICT[lang], key)) ||
            Object.prototype.hasOwnProperty.call(DICT.en, key) ||
            Object.prototype.hasOwnProperty.call(DICT.tr, key)
        );
    }

    function parseElementParams(el) {
        if (!el || !el.getAttribute) return undefined;
        const raw = el.getAttribute('data-i18n-params');
        if (!raw) return undefined;
        try {
            return JSON.parse(raw);
        } catch (err) {
            return undefined;
        }
    }

    function updateToggleButtonUI(el, lang) {
        if (!el) return;
        const code = lang.toUpperCase();
        const other = lang === 'tr' ? 'EN' : 'TR';
        const mode = el.getAttribute('data-lang-toggle') || '';
        const label = mode === 'next' ? other : (mode === 'full' ? (lang === 'tr' ? 'Türkçe' : 'English') : code);

        el.setAttribute('data-lang', lang);
        el.setAttribute('title', lang === 'tr' ? 'Dil: Türkçe (İngilizceye geç)' : 'Language: English (Switch to Turkish)');
        el.setAttribute('aria-label', lang === 'tr' ? 'Dili değiştir (TR/EN)' : 'Switch language (EN/TR)');

        const segs = el.querySelectorAll('.lang-seg, .lang-pill-opt');
        if (segs && segs.length > 0) {
            for (let i = 0; i < segs.length; i++) {
                const seg = segs[i];
                const segLang = normalizeLang(seg.getAttribute('data-lang'));
                const isActive = segLang === lang;
                seg.classList.toggle('active', isActive);
                if (seg.hasAttribute('aria-pressed')) {
                    seg.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                }
            }
        }

        const targetSpan = el.querySelector('[data-lang-label], .lang-label, .lang-code');
        if (targetSpan) {
            targetSpan.textContent = label;
        } else if (el.children && el.children.length === 0) {
            el.textContent = label;
        }
    }

    function applyTranslations(root) {
        if (typeof document === 'undefined' || !document) return;
        const scope = root && typeof root.querySelectorAll === 'function' ? root : document;
        const lang = getLang();

        if (document.documentElement) {
            document.documentElement.lang = lang;
        }

        const textEls = scope.querySelectorAll('[data-i18n]');
        for (let i = 0; i < textEls.length; i++) {
            const el = textEls[i];
            const key = el.getAttribute('data-i18n');
            if (key) {
                el.textContent = t(key, parseElementParams(el));
            }
        }

        const placeholderEls = scope.querySelectorAll('[data-i18n-placeholder]');
        for (let i = 0; i < placeholderEls.length; i++) {
            const el = placeholderEls[i];
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) {
                el.setAttribute('placeholder', t(key, parseElementParams(el)));
            }
        }

        const titleEls = scope.querySelectorAll('[data-i18n-title]');
        for (let i = 0; i < titleEls.length; i++) {
            const el = titleEls[i];
            const key = el.getAttribute('data-i18n-title');
            if (key) {
                el.setAttribute('title', t(key, parseElementParams(el)));
            }
        }

        const ariaEls = scope.querySelectorAll('[data-i18n-aria]');
        for (let i = 0; i < ariaEls.length; i++) {
            const el = ariaEls[i];
            const key = el.getAttribute('data-i18n-aria');
            if (key) {
                el.setAttribute('aria-label', t(key, parseElementParams(el)));
            }
        }

        const toggleEls = scope.querySelectorAll('[data-lang-toggle], .lang-toggle-btn');
        for (let i = 0; i < toggleEls.length; i++) {
            updateToggleButtonUI(toggleEls[i], lang);
        }

        const switchEls = scope.querySelectorAll('[data-lang-switch]');
        for (let i = 0; i < switchEls.length; i++) {
            const el = switchEls[i];
            const target = normalizeLang(el.getAttribute('data-lang-switch'));
            if (target) {
                const isActive = target === lang;
                el.classList.toggle('active', isActive);
                el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            } else {
                updateToggleButtonUI(el, lang);
            }
        }
    }

    function setLang(lang) {
        const normalized = normalizeLang(lang) || 'en';
        explicitLangSet = true;
        memoryLang = normalized;

        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                localStorage.setItem(STORAGE_KEY, normalized);
            }
        } catch (err) {
            // Ignore storage errors
        }

        // Sync URL query param if ?lang= was already explicitly present
        try {
            if (typeof location !== 'undefined' && typeof history !== 'undefined' && history && typeof history.replaceState === 'function') {
                const url = new URL(location.href);
                if (url.searchParams.has('lang')) {
                    url.searchParams.set('lang', normalized);
                    history.replaceState(null, '', url.toString());
                }
            }
        } catch (err) {
            // Ignore URL sync issues
        }

        applyTranslations();

        try {
            if (typeof global.dispatchEvent === 'function') {
                const evt = typeof CustomEvent === 'function'
                    ? new CustomEvent('cosmic:langchange', { detail: normalized })
                    : { type: 'cosmic:langchange', detail: normalized };
                global.dispatchEvent(evt);
            }
        } catch (err) {
            // Ignore event dispatch errors in restricted environments
        }

        return normalized;
    }

    function toggleLang() {
        return setLang(getLang() === 'tr' ? 'en' : 'tr');
    }

    function bindLanguageToggles(root) {
        if (typeof document === 'undefined' || !document) return;
        const scope = root && typeof root.querySelectorAll === 'function' ? root : document;

        if (!listenersBound) {
            listenersBound = true;
            document.addEventListener('click', function (evt) {
                const btn = evt.target && evt.target.closest
                    ? evt.target.closest('.lang-toggle-btn, [data-lang-toggle], [data-lang-switch]')
                    : null;
                if (!btn) return;
                const explicit = normalizeLang(btn.getAttribute('data-lang-switch'));
                if (explicit) {
                    setLang(explicit);
                } else {
                    toggleLang();
                }
            });
        }

        applyTranslations(scope);
    }

    function init() {
        const initial = getLang();
        memoryLang = initial;
        if (typeof document !== 'undefined' && document && document.documentElement) {
            document.documentElement.lang = initial;
        }
        bindLanguageToggles();
    }

    if (typeof document !== 'undefined' && document) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    global.CosmicI18n = {
        STORAGE_KEY,
        SUPPORTED_LANGS: SUPPORTED_LANGS.slice(),
        getLang,
        setLang,
        toggleLang,
        t,
        hasKey,
        applyTranslations,
        bindLanguageToggles,
        dict: DICT
    };
})(typeof window !== 'undefined' ? window : globalThis);
