// ═══════════════════════════════════════════════════════
//  COSMIC SURVIVORS — Leaderboard Service Module
// ═══════════════════════════════════════════════════════

const CosmicLeaderboard = {
    PUBLIC_URL: "https://dreamlo.com/lb/6692fa528f40bb9f50e7b75f/json",
    PRIVATE_ADD_URL: "https://dreamlo.com/lb/RphLlh7f4ki_Fm41mXqLlwE0F_B4xK-EGKqF0BvE1Oog/add",

    /**
     * Fetches top scores globally from the Dreamlo JSON API.
     * Falls back to offline array if error occurs.
     */
    async getGlobalScores() {
        try {
            const response = await fetch(this.PUBLIC_URL);
            if (!response.ok) throw new Error("Network response not ok");
            const data = await response.json();
            
            let entries = [];
            if (data && data.dreamlo && data.dreamlo.leaderboard && data.dreamlo.leaderboard.entry) {
                let raw = data.dreamlo.leaderboard.entry;
                if (!Array.isArray(raw)) raw = [raw];
                
                entries = raw.map(e => {
                    const parts = (e.text || "easy_1p").split('_');
                    return {
                        players: e.name.replace(/\*/g, ' & ').replace(/\+/g, ' '),
                        score: parseInt(e.score),
                        wave: parseInt(e.seconds || 1),
                        difficulty: parts[0] || 'easy',
                        mode: parts[1] || '1p'
                    };
                });
            }
            // Sort highest first
            return entries.sort((a, b) => b.score - a.score);
        } catch (err) {
            console.error("Global leaderboard fetch error:", err);
            throw err;
        }
    },

    /**
     * Retrieves high scores saved locally in localstorage.
     */
    getLocalScores() {
        const scores = JSON.parse(localStorage.getItem('cosmic_leaderboard') || '[]');
        return scores.sort((a, b) => b.score - a.score);
    },

    /**
     * Saves a score entry to both local storage and sends it to the Dreamlo API.
     */
    async submitScore(playersLabel, score, wave, gameTimeInSeconds, difficulty, mode) {
        const finalScore = Math.floor(score);
        
        // Formulate formatted time MM:SS
        const m = Math.floor(gameTimeInSeconds / 60);
        const s = Math.floor(gameTimeInSeconds % 60);
        const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

        // 1. Save Locally
        const localList = JSON.parse(localStorage.getItem('cosmic_leaderboard') || '[]');
        const newRecord = {
            players: playersLabel,
            mode: mode,
            difficulty: difficulty,
            score: finalScore,
            wave: wave,
            time: timeStr,
            date: Date.now()
        };
        localList.push(newRecord);
        localStorage.setItem('cosmic_leaderboard', JSON.stringify(localList));

        // 2. Save Globally to Dreamlo
        const sanitizedName = playersLabel.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '+');
        const url = `${this.PRIVATE_ADD_URL}/${encodeURIComponent(sanitizedName)}/${finalScore}/${wave}/${difficulty}_${mode}`;

        try {
            const res = await fetch(url);
            if (res.ok) {
                console.log("Global score synced successfully.");
                return true;
            }
        } catch (e) {
            console.error("Global score sync failed:", e);
        }
        return false;
    }
};
