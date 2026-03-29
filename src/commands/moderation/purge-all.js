// Global purge state tracker
const purgeState = new Map();

module.exports = {
    name: 'purgeall',
    description: 'Delete ALL messages in channel (Usage: zzpurgeall)',
    
    async execute(message) {
        const channel = message.channel;

        // Check if there's already a purge running
        if (purgeState.has(channel.id)) {
            return message.reply('⚠️ A purge is already running! Use zzstoppurge to stop it.');
        }

        // Send confirmation prompt
        const confirmMsg = await message.reply(
            `⚠️ **PURGE WARNING**\n` +
            `You are about to delete ALL messages in this channel!\n\n` +
            `This cannot be undone.\n` +
            `**Type \`confirm\` to proceed (30 seconds)**`
        );

        // Wait for confirmation
        const filter = (m) => m.author.id === message.author.id;
        
        try {
            const collected = await channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ['time']
            });

            const response = collected.first();
            
            if (response.content.toLowerCase() !== 'confirm') {
                await response.delete().catch(() => {});
                await confirmMsg.delete().catch(() => {});
                return message.reply('❌ Purge cancelled');
            }

            await response.delete().catch(() => {});
            await confirmMsg.delete().catch(() => {});
            await message.delete().catch(() => {});

            // Start purging
            const statusMsg = await channel.send('🗑️ Starting purge... Use zzstoppurge to stop.');
            await this.purgeChannel(channel, statusMsg);

        } catch (error) {
            if (error.message === 'time') {
                await confirmMsg.delete().catch(() => {});
                return message.reply('❌ Purge cancelled - timeout');
            }
            console.error('Purge error:', error);
            message.reply(`❌ Purge failed: ${error.message}`);
        }
    },

    async purgeChannel(channel, statusMsg) {
        const channelId = channel.id;
        purgeState.set(channelId, { active: true, deleted: 0, startTime: Date.now() });

        let totalDeleted = 0;

        try {
            while (purgeState.get(channelId)?.active) {
                const messages = await channel.messages.fetch({ limit: 100 });
                
                if (messages.size === 0) break;

                // Remove status message from deletion
                const toDelete = messages.filter(m => m.id !== statusMsg.id);
                if (toDelete.size === 0) break;

                const now = Date.now();
                const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);
                
                const recent = toDelete.filter(m => m.createdTimestamp > twoWeeksAgo);
                const old = toDelete.filter(m => m.createdTimestamp <= twoWeeksAgo);

                if (recent.size > 0) {
                    try {
                        await channel.bulkDelete(recent, true);
                        totalDeleted += recent.size;
                        purgeState.get(channelId).deleted = totalDeleted;
                    } catch (error) {
                        console.error('Bulk delete error:', error);
                    }
                }

                for (const [, msg] of old) {
                    if (!purgeState.get(channelId)?.active) break;
                    try {
                        await msg.delete();
                        totalDeleted++;
                        purgeState.get(channelId).deleted = totalDeleted;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        console.error('Delete error:', error);
                    }
                }

                await statusMsg.edit(`🗑️ Purging... ${totalDeleted} deleted`).catch(() => {});
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            purgeState.delete(channelId);
            await statusMsg.edit(`✅ Purge complete! Deleted ${totalDeleted} messages`).catch(() => {});

        } catch (error) {
            purgeState.delete(channelId);
            console.error('Purge error:', error);
            await statusMsg.edit(`❌ Purge stopped: ${error.message}. Deleted ${totalDeleted} messages`).catch(() => {});
        }
    },

    // Export purge state so stop-purge can access it
    getPurgeState() {
        return purgeState;
    }
};
