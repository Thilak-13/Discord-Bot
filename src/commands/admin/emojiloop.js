const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojiloop')
        .setDescription('Configure continuous emoji and sticker cache refreshes')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start the continuous emoji and sticker refresh loop (1 item every 90 seconds)')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop the continuous emoji and sticker refresh loop')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('runnow')
                .setDescription('Process the next queued emoji or sticker immediately')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check status and progress of the continuous refresh queue')
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
        const engine = interaction.client.emojiLoopEngine;

        if (subcommand === 'start') {
            await interaction.deferReply({ flags: 64 });
            
            // Fixed interval of 1.5 minutes (90 seconds)
            const intervalMinutes = 1.5; 

            // Initialize/Activate loop in database
            const saved = db.saveEmojiLoop(interaction.guildId, intervalMinutes, 'active');
            if (saved) {
                // Instantly trigger one execution to start the queue if not already running
                if (engine) {
                    engine.runCycle(interaction.guildId).catch(console.error);
                }
                return interaction.editReply({
                    content: `✅ **Continuous Loop Started!**\nThe bot is now refreshing **1 sticker/emoji every 90 seconds** in a continuous circular loop (prioritizing stickers first).\n*Check current queue progress with \`/emojiloop status\`.*`
                });
            } else {
                return interaction.editReply({ content: '❌ Failed to start loop due to a database error.' });
            }
        }

        if (subcommand === 'stop') {
            await interaction.deferReply({ flags: 64 });
            
            const existingLoop = db.getEmojiLoop(interaction.guildId);
            if (!existingLoop) {
                return interaction.editReply({ content: 'ℹ️ The emoji loop is not currently active on this server.' });
            }

            const deleted = db.deleteEmojiLoop(interaction.guildId);
            if (deleted) {
                return interaction.editReply({
                    content: '✅ **Loop Stopped!**\nContinuous emoji and sticker cache refreshes have been turned off.'
                });
            } else {
                return interaction.editReply({ content: '❌ Failed to stop loop due to a database error.' });
            }
        }

        if (subcommand === 'status') {
            const config = db.getEmojiLoop(interaction.guildId);
            if (!config) {
                return interaction.reply({
                    content: 'ℹ️ **Not Configured**\nNo continuous emoji loop is active for this server. Use `/emojiloop start` to activate it.',
                    flags: 64
                });
            }

            await interaction.deferReply({ flags: 64 });

            // Parse current queue from database
            let pendingItems = [];
            try {
                pendingItems = JSON.parse(config.pending_items || '[]');
            } catch (e) {
                pendingItems = [];
            }

            const embed = new EmbedBuilder()
                .setTitle('✨ Continuous Emoji & Sticker Refresh Loop')
                .setColor('#9b59b6')
                .setTimestamp();

            const nextRunText = config.status === 'active' 
                ? `<t:${Math.floor(config.next_run / 1000)}:F> (<t:${Math.floor(config.next_run / 1000)}:R>)` 
                : 'Paused';

            embed.addFields(
                { name: 'Server Name', value: `${interaction.guild.name}`, inline: true },
                { name: 'Status', value: `${config.status.toUpperCase()}`, inline: true },
                { name: 'Pacing Rate', value: '1 item every 90 seconds', inline: true },
                { name: 'Queue Status', value: `**${pendingItems.length}** item(s) remaining in the current round.` },
                { name: 'Next Queued Execution', value: nextRunText }
            );

            // Fetch progress info from in-memory engine if available
            const progress = engine?.progress?.[interaction.guildId];
            if (progress) {
                const refreshedStatus = progress.rateLimitTime 
                    ? '⚠️ Rate Limited (Deferred)' 
                    : (progress.refreshed ? '✅ Refreshed' : '❌ Skipped/Failed');

                embed.addFields(
                    { name: 'Last Processed Item', value: `**${progress.lastItem}** (${progress.type.toUpperCase()})` },
                    { name: 'Last Refreshed Status', value: refreshedStatus }
                );

                if (progress.rateLimitTime) {
                    const resumeTimeText = `<t:${Math.floor(progress.rateLimitTime / 1000)}:R>`;
                    embed.addFields({ name: 'Rate Limit Cooldown', value: `Rate limit hit! Queue is deferred and will resume automatically **${resumeTimeText}**.` });
                }
            }

            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === 'runnow') {
            await interaction.deferReply({ flags: 64 });
            if (!engine) {
                return interaction.editReply({ content: '❌ Emoji Loop Engine is not running.' });
            }

            if (engine.runningGuilds.has(interaction.guildId)) {
                return interaction.editReply({ content: '⚠️ The engine is currently processing an item. Please wait a moment.' });
            }

            // Trigger a single step immediately in the background
            engine.runCycle(interaction.guildId).catch(err => {
                console.error(`Error executing manual background emoji loop step:`, err);
            });

            return interaction.editReply({ content: '✅ **Step Triggered!** The bot is processing the next queued emoji/sticker in the background right now. Use `/emojiloop status` to see details.' });
        }
    }
};
