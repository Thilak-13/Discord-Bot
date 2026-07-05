const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojiloop')
        .setDescription('Configure automatic periodic emoji and sticker cache refreshes')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('Toggle the periodic emoji refresh loop on/off')
                .addIntegerOption(option =>
                    option.setName('interval_hours')
                        .setDescription('Select how often to refresh (in hours, e.g. 1)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(720))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('runnow')
                .setDescription('Trigger the emoji and sticker rename cycle immediately once')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check the status of the emoji refresh loop for this guild')
        ),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({ content: '❌ This command can only be used in a server.', flags: 64 });
        }

        const db = interaction.client.database;
        if (!db || !db.connected) {
            return interaction.reply({ content: '❌ Database system is not connected.', flags: 64 });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'toggle') {
            await interaction.deferReply({ flags: 64 });
            const intervalHours = interaction.options.getInteger('interval_hours');
            const intervalMinutes = intervalHours * 60;

            const existingLoop = db.getEmojiLoop(interaction.guildId);

            if (existingLoop) {
                const deleted = db.deleteEmojiLoop(interaction.guildId);
                if (deleted) {
                    return interaction.editReply({
                        content: '✅ **Loop Deactivated!**\nPeriodic emoji and sticker cache refreshes have been turned off.'
                    });
                } else {
                    return interaction.editReply({ content: '❌ Failed to deactivate loop due to a database error.' });
                }
            } else {
                const saved = db.saveEmojiLoop(interaction.guildId, intervalMinutes, 'active');
                if (saved) {
                    return interaction.editReply({
                        content: `✅ **Loop Activated!**\nPeriodic emoji and sticker refreshes will run every **${intervalHours}** hour(s) for this guild.\n*First cycle will trigger in ${intervalHours} hour(s). Use \`/emojiloop runnow\` to refresh right away.*`
                    });
                } else {
                    return interaction.editReply({ content: '❌ Failed to activate loop due to a database error.' });
                }
            }
        }

        if (subcommand === 'status') {
            const config = db.getEmojiLoop(interaction.guildId);

            if (!config) {
                return interaction.reply({
                    content: 'ℹ️ **Not Configured**\nNo emoji refresh loop is configured for this server. Use `/emojiloop toggle` to activate it.',
                    flags: 64
                });
            }

            await interaction.deferReply({ flags: 64 });

            const lastRunText = config.last_run > 0 
                ? `<t:${Math.floor(config.last_run / 1000)}:F> (<t:${Math.floor(config.last_run / 1000)}:R>)` 
                : 'Never';
            const nextRunText = config.status === 'active' 
                ? `<t:${Math.floor(config.next_run / 1000)}:F> (<t:${Math.floor(config.next_run / 1000)}:R>)` 
                : 'Paused';

            const embed = new EmbedBuilder()
                .setTitle('✨ Emoji Refresh Loop Status')
                .setColor('#9b59b6')
                .addFields(
                    { name: 'Server Name', value: `${interaction.guild.name}`, inline: true },
                    { name: 'Status', value: `${config.status.toUpperCase()}`, inline: true },
                    { name: 'Interval', value: `${config.interval_minutes / 60} hour(s)`, inline: true },
                    { name: 'Last Run', value: lastRunText },
                    { name: 'Next Scheduled Run', value: nextRunText }
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === 'runnow') {
            await interaction.deferReply({ flags: 64 });
            const engine = interaction.client.emojiLoopEngine;
            if (!engine) {
                return interaction.editReply({ content: '❌ Emoji Loop Engine is not running.' });
            }

            await interaction.editReply({ content: '⏳ Starting manual emoji and sticker refresh cycle. This may take up to a minute depending on guild expressions count...' });
            
            try {
                const config = db.getEmojiLoop(interaction.guildId);
                const interval = config ? config.interval_minutes : 60;
                
                await engine.runCycle(interaction.guildId, interval);
                return interaction.editReply({ content: '✅ **Refresh Cycle Complete!** All emojis and stickers have been successfully renamed and reverted.' });
            } catch (err) {
                return interaction.editReply({ content: `❌ An error occurred during refresh: ${err.message}` });
            }
        }
    }
};
