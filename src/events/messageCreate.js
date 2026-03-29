const config = require('../config/config');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const content = typeof message.content === 'string' ? message.content : '';
        const prefix = config.bot.prefix || 'zz';
        const mentionPrefix = `<@${message.client.user.id}>`;
        const mentionNickPrefix = `<@!${message.client.user.id}>`;

        if (message.author.bot) {
            return;
        }

        let usedPrefix = null;
        if (content.startsWith(prefix)) usedPrefix = prefix;
        if (content.startsWith(mentionPrefix)) usedPrefix = mentionPrefix;
        if (content.startsWith(mentionNickPrefix)) usedPrefix = mentionNickPrefix;

        // Ignore non-command messages.
        if (!usedPrefix) return;

        // Owner-only check
        if (message.author.id !== config.ownerId) {
            return message.reply('❌ Unauthorized. This bot is private.').catch(() => {});
        }

        // Parse command and args
        const rawInput = content.slice(usedPrefix.length).trim();
        if (!rawInput) {
            return message.reply(`Use \`${prefix}ping\` to test commands.`).catch(() => {});
        }

        const args = rawInput.split(/ +/);
        const commandName = (args.shift() || '').toLowerCase();

        const command = message.client.commands.get(commandName);

        if (!command) {
            return message.reply(`❌ Unknown command: \`${commandName}\``).catch(() => {});
        }

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`Error executing ${commandName}:`, error);
            message.reply('❌ Command failed.').catch(() => {});
        }
    }
};
