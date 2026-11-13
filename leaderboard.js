// =============================================================================
// COSMIC SURVIVORS v10.0 — 100% Local Offline Records & Personal Bests
// Zero remote syncing, zero external endpoints — strictly localStorage.
// =============================================================================
(function (global) {
    'use strict';

    const STORAGE_KEY = 'cosmic_local_records_v10';
    const LEGACY_STORAGE_KEY = 'cosmic_leaderboard';
    const MAX_ENTRIES = 60;

    function getStorage() {
        try {
            return typeof localStorage !== 'undefined' ? localStorage : null;
        } catch (err) {
            return null;
        }
    }

    function formatDuration(secondsOrStr) {
        if (typeof secondsOrStr === 'string' && secondsOrStr.indexOf(':') !== -1) {
            return secondsOrStr.trim();
        }
        const total = Math.max(0, Math.floor(Number(secondsOrStr) || 0));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function normalizeGameMode(modeVal) {
        if (!modeVal || typeof modeVal !== 'string') return 'survival';
        const clean = modeVal.trim().toLowerCase();
        if (clean === '1p' || clean === '2p' || clean === 'classic') return 'survival';
        return clean;
    }

    function normalizeDateMs(dateVal) {
        if (typeof dateVal === 'number' && Number.isFinite(dateVal) && dateVal > 0) {
            return Math.floor(dateVal);
        }
        if (typeof dateVal === 'string' && dateVal.trim()) {
            const parsed = Date.parse(dateVal);
            if (Number.isFinite(parsed) && parsed > 0) return parsed;
        }
        return Date.now();
    }

    function getLocalDateKey(dateObj) {
        const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
        if (Number.isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function generateId(seedHint) {
        const rand = Math.random().toString(36).slice(2, 8);
        return 'rec_' + Date.now().toString(36) + '_' + (seedHint !== undefined ? String(seedHint) + '_' : '') + rand;
    }

    function normalizeEntry(raw, fallbackIdx) {
        if (!raw || typeof raw !== 'object') return null;
        const players = String(raw.players || raw.pilot || 'PİLOT-01').trim() || 'PİLOT-01';
        const shipId = String(raw.shipId || raw.ship || 'interceptor').trim() || 'interceptor';
        const mapId = String(raw.mapId || raw.map || 'sector9').trim() || 'sector9';
        const gameMode = normalizeGameMode(raw.gameMode || raw.mode);
        const difficulty = String(raw.difficulty || raw.diff || 'normal').trim().toLowerCase() || 'normal';
        const wave = Math.max(0, Math.floor(Number(raw.wave) || 1));
        const score = Math.max(0, Math.floor(Number(raw.score) || 0));
        const kills = Math.max(0, Math.floor(Number(raw.kills) || 0));
        const time = formatDuration(raw.time !== undefined ? raw.time : raw.duration);
        const date = normalizeDateMs(raw.date);
        const seed = raw.seed ? String(raw.seed) : null;
        const id = raw.id ? String(raw.id) : generateId(fallbackIdx);

        return {
            id,
            players,
            shipId,
            mapId,
            gameMode,
            difficulty,
            wave,
            score,
            kills,
            time,
            date,
            seed
        };
    }

    function compareRecordsDesc(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        if (b.wave !== a.wave) return b.wave - a.wave;
        return b.date - a.date;
    }

    function readRawRecords() {
        const storage = getStorage();
        if (!storage) return [];

        const rawV10 = storage.getItem(STORAGE_KEY);
        if (rawV10 !== null) {
            try {
                const parsed = JSON.parse(rawV10);
                if (!Array.isArray(parsed)) return [];
                return parsed.map((item, idx) => normalizeEntry(item, idx)).filter(Boolean);
            } catch (err) {
                return [];
            }
        }

        // First-read migration from legacy local key if present
        const rawLegacy = storage.getItem(LEGACY_STORAGE_KEY);
        if (rawLegacy !== null) {
            try {
                const legacyParsed = JSON.parse(rawLegacy);
                const migrated = Array.isArray(legacyParsed)
                    ? legacyParsed.map((item, idx) => normalizeEntry(item, idx)).filter(Boolean)
                    : [];
                const capped = capRecords(migrated);
                storage.setItem(STORAGE_KEY, JSON.stringify(capped));
                return capped;
            } catch (err) {
                storage.setItem(STORAGE_KEY, '[]');
                return [];
            }
        }

        return [];
    }

    function capRecords(records) {
        const sorted = records.slice().sort(compareRecordsDesc);
        if (sorted.length <= MAX_ENTRIES) return sorted;

        const keptIds = new Set();
        const result = [];

        for (let i = 0; i < MAX_ENTRIES && i < sorted.length; i++) {
            keptIds.add(sorted[i].id);
            result.push(sorted[i]);
        }

        // Preserve the top run per mapId and per gameMode beyond the top 60 cap
        const bestByMap = new Map();
        const bestByMode = new Map();

        for (let i = 0; i < sorted.length; i++) {
            const rec = sorted[i];
            if (!bestByMap.has(rec.mapId)) bestByMap.set(rec.mapId, rec);
            if (!bestByMode.has(rec.gameMode)) bestByMode.set(rec.gameMode, rec);
        }

        const champions = [];
        bestByMap.forEach(rec => champions.push(rec));
        bestByMode.forEach(rec => champions.push(rec));

        for (let i = 0; i < champions.length; i++) {
            const champ = champions[i];
            if (!keptIds.has(champ.id)) {
                keptIds.add(champ.id);
                result.push(champ);
            }
        }

        return result.sort(compareRecordsDesc);
    }

    function writeRecords(records) {
        const storage = getStorage();
        const capped = capRecords(records);
        if (storage) {
            try {
                storage.setItem(STORAGE_KEY, JSON.stringify(capped));
            } catch (err) {
                // Ignore quota exceeded errors
            }
        }
        return capped;
    }

    function matchesFilter(entry, filter) {
        if (!filter || typeof filter !== 'object') return true;
        if (filter.gameMode && filter.gameMode !== 'all' && entry.gameMode !== normalizeGameMode(filter.gameMode)) {
            return false;
        }
        if (filter.mapId && filter.mapId !== 'all' && entry.mapId !== filter.mapId) {
            return false;
        }
        if (filter.difficulty && filter.difficulty !== 'all' && entry.difficulty !== String(filter.difficulty).toLowerCase()) {
            return false;
        }
        if (filter.shipId && filter.shipId !== 'all' && entry.shipId !== filter.shipId) {
            return false;
        }
        return true;
    }

    function getLocalScores(filter = {}) {
        const all = readRawRecords();
        return all.filter(entry => matchesFilter(entry, filter)).sort(compareRecordsDesc);
    }

    function getPersonalBests() {
        const all = readRawRecords().sort(compareRecordsDesc);
        const byMap = {};
        const byMode = {};
        const todayKey = getLocalDateKey(new Date());
        let todayDailyBest = null;

        for (let i = 0; i < all.length; i++) {
            const rec = all[i];
            if (!byMap[rec.mapId] || compareRecordsDesc(rec, byMap[rec.mapId]) < 0) {
                byMap[rec.mapId] = rec;
            }
            if (!byMode[rec.gameMode] || compareRecordsDesc(rec, byMode[rec.gameMode]) < 0) {
                byMode[rec.gameMode] = rec;
            }
            if (rec.gameMode === 'daily') {
                const recDay = getLocalDateKey(rec.date);
                const matchesSeed = typeof rec.seed === 'string' && (rec.seed.indexOf(todayKey) !== -1 || rec.seed.indexOf(todayKey.replace(/-/g, '')) !== -1);
                if (recDay === todayKey || matchesSeed) {
                    if (!todayDailyBest || compareRecordsDesc(rec, todayDailyBest) < 0) {
                        todayDailyBest = rec;
                    }
                }
            }
        }

        return {
            overallBest: all.length > 0 ? all[0] : null,
            byMap,
            byMode,
            todayDailyBest,
            totalRuns: all.length
        };
    }

    function submitScore(playersLabel, score, wave, gameTimeInSeconds, difficulty, metaOrMode) {
        let rawPayload;

        if (playersLabel && typeof playersLabel === 'object' && !Array.isArray(playersLabel)) {
            rawPayload = Object.assign({}, playersLabel);
        } else {
            const meta = metaOrMode && typeof metaOrMode === 'object' ? metaOrMode : {};
            const modeStr = typeof metaOrMode === 'string'
                ? metaOrMode
                : (meta.gameMode || meta.mode || 'survival');

            rawPayload = {
                id: meta.id,
                players: playersLabel,
                shipId: meta.shipId || meta.ship || 'interceptor',
                mapId: meta.mapId || meta.map || 'sector9',
                gameMode: modeStr,
                difficulty: difficulty || meta.difficulty || meta.diff || 'normal',
                wave: wave,
                score: score,
                kills: meta.kills || 0,
                time: meta.time !== undefined ? meta.time : gameTimeInSeconds,
                date: meta.date || Date.now(),
                seed: meta.seed || null
            };
        }

        const record = normalizeEntry(rawPayload, 0);
        if (!record) return false;

        const existing = readRawRecords();
        existing.push(record);
        writeRecords(existing);
        return true;
    }

    function clearLocalScores() {
        const storage = getStorage();
        if (storage) {
            try {
                storage.setItem(STORAGE_KEY, '[]');
                storage.removeItem(LEGACY_STORAGE_KEY);
            } catch (err) {
                return false;
            }
        }
        return true;
    }

    const CosmicLeaderboard = {
        STORAGE_KEY,
        MAX_ENTRIES,
        getLocalScores,
        getPersonalBests,
        submitScore,
        clearLocalScores
    };

    global.CosmicLeaderboard = CosmicLeaderboard;
})(typeof window !== 'undefined' ? window : globalThis);
