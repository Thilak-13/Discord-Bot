module.exports = {
    name: 'userinfo',
    description: 'Get user info (Usage: zzuserinfo [@user])',
    
    async execute(message, args) {
        const target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : message.author);
        if (!target) return message.reply('❌ User not found');

        try {
            const member = await message.guild.members.fetch(target.id);
            const accountAge = Math.floor((Date.now() - target.createdAt) / 86400000);
            const joinAge = Math.floor((Date.now() - member.joinedAt) / 86400000);
            
            const roles = member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.name);
            
            message.reply(
                `**User Info: ${target.tag}**\n` +
                `🆔 ID: \`${target.id}\`\n` +
                `🤖 Bot: ${target.bot ? 'Yes' : 'No'}\n` +
                `📅 Created: ${accountAge} days ago\n` +
                `📥 Joined: ${joinAge} days ago\n` +
                `🎭 Roles [${roles.length}]: ${roles.slice(0, 10).join(', ')}${roles.length > 10 ? '...' : ''}`
            );
        } catch (error) {
            message.reply('❌ User not in server');
        }
    }
};
