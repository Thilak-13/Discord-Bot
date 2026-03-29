module.exports = {
    name: 'stoppurge',
    description: 'Stop ongoing purge (Usage: zzstoppurge)',
    
    async execute(message) {
        const purgeCommand = message.client.commands.get('purgeall');
        if (!purgeCommand) {
            return message.reply('❌ Purge system not loaded!');
        }

        const state = purgeCommand.getPurgeState().get(message.channel.id);

        if (!state) {
            return message.reply('❌ No active purge in this channel');
        }

        state.active = false;
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        message.reply(`🛑 Purge stopped! Deleted ${state.deleted} messages in ${elapsed}s`);
    }
};
