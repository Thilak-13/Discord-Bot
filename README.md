# Discord Moderation Bot

A lightning-fast, private Discord moderation bot built with discord.js v14. **Owner-only** - designed for single-user operation with maximum performance.

## Features

- ⚡ **Owner-Only** - Only you can use any command
- ⚡ **Optimized** - Minimal overhead, instant responses
- ⚡ **Private Responses** - All responses are ephemeral (only you see them)
- ⚡ **No Permission Checks** - Streamlined for speed since only owner uses it

### Moderation Commands
- `/ban` - Ban a member from the server
- `/kick` - Kick a member from the server
- `/timeout` - Timeout a member (mute) with duration options

### Utility Commands
- `/ping` - Check bot latency and response time
- `/userinfo` - View detailed user information

### Admin Commands (Owner Only)
- `/reload` - Reload commands without restarting the bot

**All commands are owner-only and show private responses.**

## Project Structure

```
Discord Bot/
├── src/
│   ├── commands/
│   │   ├── moderation/
│   │   │   ├── ban.js
│   │   │   ├── kick.js
│   │   │   └── timeout.js
│   │   ├── utility/
│   │   │   ├── ping.js
│   │   │   └── userinfo.js
│   │   └── admin/
│   │       └── reload.js
│   ├── events/
│   │   ├── ready.js
│   │   └── interactionCreate.js
│   ├── systems/
│   │   ├── logger.js
│   │   └── database.js
│   └── config/
│       └── config.js
├── index.js
├── deploy-commands.js
├── package.json
├── .env
└── .gitignore
```

## Installation

### Prerequisites
- Node.js v16.9.0 or higher
- A Discord Bot Token ([Create one here](https://discord.com/developers/applications))

### Setup Steps

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your configuration:
   ```env
   BOT_TOKEN=your_bot_token_here
   OWNER_ID=your_discord_user_id_here
   LOG_CHANNEL_ID=moderation_log_channel_id_here
   ```

4. **Deploy slash commands**
   ```bash
   npm run deploy
   ```
   > Note: Global commands may take up to 1 hour to update. For instant updates during development, modify `deploy-commands.js` to use guild commands.

5. **Start the bot**
   ```bash
   npm start
   ```

## Configuration

### Getting Your IDs
- **Bot Token**: Discord Developer Portal > Your Application > Bot > Token
- **Owner ID**: Enable Developer Mode in Discord > Right-click your profile > Copy ID
- **Log Channel ID**: Enable Developer Mode > Right-click channel > Copy ID

### Bot Permissions
The bot needs the following permissions:
- **Ban Members** - For `/ban` command
- **Kick Members** - For `/kick` command
- **Moderate Members** - For `/timeout` command
- **Send Messages** - For logging and responses
- **Embed Links** - For rich embeds
- **Read Message History** - For context

**Recommended Invite Link Structure:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=1099511627830&scope=bot%20applications.commands
```

## S**Owner-Only Access** - Bot rejects all non-owner users immediately
- ✅ Token stored in environment variables (`.env`)
- ✅ All responses are ephemeral (private to you)
- ✅ `.gitignore` configured to prevent token leaks
- ✅ No permission overhead - optimized for single user
- ✅ Role hierarchy validation (can't moderate higher roles)
- ✅ `.gitignore` configured to prevent token leaks

## Future Expansion

The bot is designed to easily add:
- **Automoderation System** - Auto-delete spam, links, invites
- **Report System** - User-submitted moderation reports
- **Case Tracking** - Database of all moderation actions
- **Warning System** - Accumulative user warnings
- **Raid Protection** - Anti-raid and mass-join detection
- **Appeal System** - Ban appeal management
- **Custom Filters** - Configurable word filters
- **Verification System** - New member verification

All systems have placeholder files in `src/systems/` ready for implementation.

## Development

### Adding New Commands

1. Create a new file in the appropriate folder under `src/commands/`
2. Follow this structure:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description'),
    
    // Optional: Restrict to specific permissions
    requiredPermissions: ['Administrator'],
    
    // Optional: Bot needs these permissions
    botPermissions: ['SendMessages'],
    
    // Optional: Owner only command
    ownerOnly: false,
    
    async execute(interaction) {
        // Command logic here
        await interaction.reply('Command response');
    }
};
```

3. Redeploy commands: `npm run deploy`
4. Or use `/reload` command if the bot is running

### Adding New Events

1. Create a new file in `src/events/`
2. Export an object with `name` and `execute` properties
3. Restart the bot

## Troubleshooting

### Commands not showing up
- Run `npm run deploy` to register commands
- Global commands take up to 1 hour to update
- Check bot has `applications.commands` scope

### Permission errors
- Verify bot role is higher than target roles
- Check bot has required permissions in server
- Ensure user has required permissions

### Bot not responding
- Check `.env` file has correct token
- Verify bot is online in Discord
- Check console for error messages

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages in console
3. Verify all configuration is correct

## License

MIT License - Feel free to modify and use for your server!

## Credits

Built with:
- [discord.js v14](https://discord.js.org/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- Node.js
