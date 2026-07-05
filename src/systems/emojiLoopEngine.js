class EmojiLoopEngine {
    constructor(client) {
        this.client = client;
        this.interval = null;
        this.runningGuilds = new Set(); // Prevent concurrent execution for the same guild
    }

    start() {
        if (this.interval) clearInterval(this.interval);
        // Check every minute
        this.interval = setInterval(() => this.checkLoops().catch(console.error), 60 * 1000);
        // Run first check immediately
        this.checkLoops().catch(console.error);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
    }

    async checkLoops() {
        const db = this.client.database;
        if (!db || !db.connected) return;

        const activeLoops = db.listAllEmojiLoops();
        const now = Date.now();

        for (const loop of activeLoops) {
            if (loop.status !== 'active') continue;
            if (now >= loop.next_run) {
                // Trigger the cycle asynchronously so it doesn't block the scheduler loop
                this.runCycle(loop.guild_id, loop.interval_minutes).catch(err => {
                    console.error(`Error executing emoji loop for guild ${loop.guild_id}:`, err);
                });
            }
        }
    }

    async runCycle(guildId, intervalMinutes = 60) {
        // Prevent concurrent runs for the same guild
        if (this.runningGuilds.has(guildId)) {
            console.warn(`[Emoji Loop] Cycle is already running for guild ${guildId}. Skipping.`);
            return;
        }

        const db = this.client.database;
        if (!db || !db.connected) return;

        this.runningGuilds.add(guildId);
        console.log(`[Emoji Loop] Starting cache refresh cycle for guild ${guildId}`);

        try {
            const guild = this.client.guilds.cache.get(guildId)
                || await this.client.guilds.fetch(guildId).catch(() => null);

            if (!guild) {
                console.warn(`[Emoji Loop] Guild ${guildId} not found. Skipping.`);
                this.runningGuilds.delete(guildId);
                return;
            }

            // 1. Refresh emojis
            const emojis = await guild.emojis.fetch().catch(() => null);
            if (emojis && emojis.size > 0) {
                console.log(`[Emoji Loop] Renaming ${emojis.size} emojis in ${guild.name}`);
                for (const [id, emoji] of emojis) {
                    const originalName = emoji.name;
                    try {
                        // Append "_"
                        await emoji.edit({ name: `${originalName}_` });
                        // Revert
                        await emoji.edit({ name: originalName });
                    } catch (err) {
                        console.warn(`[Emoji Loop] Failed to rename emoji ${originalName}:`, err.message);
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // 2. Refresh stickers
            const stickers = await guild.stickers.fetch().catch(() => null);
            if (stickers && stickers.size > 0) {
                console.log(`[Emoji Loop] Renaming stickers in ${guild.name}`);
                for (const [id, sticker] of stickers) {
                    // Check if sticker is editable by the bot
                    if (!sticker.editable) continue;

                    const originalName = sticker.name;
                    const tempName = originalName.length < 30 ? `${originalName}_` : originalName.slice(0, 29) + '_';
                    try {
                        // Append "_"
                        await sticker.edit({ name: tempName });
                        // Revert
                        await sticker.edit({ name: originalName });
                    } catch (err) {
                        console.warn(`[Emoji Loop] Failed to rename sticker ${originalName}:`, err.message);
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            console.log(`[Emoji Loop] Successfully finished cache refresh cycle for guild ${guild.name}`);

            // Update execution stats in database if configuration still exists
            const currentConfig = db.getEmojiLoop(guildId);
            if (currentConfig) {
                const actualInterval = currentConfig.interval_minutes;
                const nextRun = Date.now() + actualInterval * 60 * 1000;
                db.updateEmojiLoopRun(guildId, Date.now(), nextRun);
            }

        } catch (error) {
            console.error(`[Emoji Loop] Error during execution cycle for guild ${guildId}:`, error);
        } finally {
            this.runningGuilds.delete(guildId);
        }
    }
}

let engineInstance = null;

module.exports = {
    async init(client) {
        engineInstance = new EmojiLoopEngine(client);
        engineInstance.start();
        client.emojiLoopEngine = engineInstance;
        return engineInstance;
    },
    getEngine() {
        return engineInstance;
    }
};
