# SETUP GUIDE - PRIVATE BOT

## ⚠️ IMPORTANT: This is a PRIVATE, OWNER-ONLY bot!
Only the user with OWNER_ID can use ANY command. All other users will be rejected.

## Quick Start

### 1. Get Your Bot Token
1. Go to https://discord.com/developers/applications
2. Click "New Application" and give it a name
3. Go to the "Bot" tab
4. Click "Reset Token" and copy it
5. **Enable these Privileged Gateway Intents:**
   - ✅ Server Members Intent
   - ✅ Message Content Intent (optional, for future features)

### 2. Get Your User ID (Owner ID) - **CRITICAL!**
**This is the most important step! Without this, the bot won't work for anyone.**

1. In Discord, go to User Settings > Advanced
2. Enable "Developer Mode"
3. Right-click your username and click "Copy User ID"
4. Save this - you'll need it in the .env file

### 3. Create a Log Channel
1. Create a text channel in your Discord server for moderation logs
2. Right-click the channel and click "Copy Channel ID"

### 4. Configure the Bot
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
2. Edit `.env` and fill in your values:
   ```
   BOT_TOKEN=paste_your_bot_token_here
   OWNER_ID=paste_your_user_id_here
   LOG_CHANNEL_ID=paste_channel_id_here
   ```

### 5. Invite the Bot to Your Server
1. Go back to Discord Developer Portal
2. Go to "OAuth2" > "URL Generator"
3. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
4. Select permissions:
   - ✅ Ban Members
   - ✅ Kick Members
   - ✅ Moderate Members
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
5. Copy the generated URL and open it in your browser
6. Select your server and authorize

### 6. Deploy Commands
```bash
npm run deploy
```

Wait for confirmation message. Global commands may take up to 1 hour to appear.

### 7. Start the Bot
```bash
npm start
```

You should see:
```
✅ Bot is online!
📝 Logged in as: YourBotName#1234
```

### 8. Test the Bot
In your Discord server, try:
- `/ping` - Should respond with latency
- `/userinfo` - Should show your user info
- `/ban` - (requires Ban Members permission)

**ONLY YOU** - the user specified in OWNER_ID.

All other users will see: "❌ Unauthorized. This bot is private."

- All responses you see are **ephemeral** (private to you)
- No permission checks needed - you have full control
- No role hierarchy limitations

- **Admin Commands** (`/reload`)
  - Only the bot owner (OWNER_ID in .env)

### Bot Role Position
⚠️ **IMPORTANT**: The bot's role must be higher than the roles it's moderating!

1. Go to Server Settings > Roles
2. Drag your bot's role above member roles
3. Keep it below admin/moderator roles for safety

## Testing Moderation Commands

### Safe Testing
1. Create a test member account or use an alt
2. Give it a low role
3. Try moderation commands on it
4. Check the log channel for logs

### What to Check
- ✅ Can ban users with lower roles
- ✅ Cannot ban users with higher roles
- ✅ Cannot ban yourself
- ✅ Logs appear in the log channel
- ✅ Permission errors show for unauthorized users

## Troubleshooting

### "Interaction Failed"
- Commands not deployed: Run `npm run deploy`
- Bot offline: Check `npm start` is running
- Permissions missing: Check bot role permissions

### Commands Not Showing
- Wait up to 1 hour for global commands
- Or modify deploy-commands.js for guild commands (instant)

### "Missing Permissions" Error
- Check bot has required permissions in server
- Check bot role is above target user's role
- Verify intents are enabled in Developer Portal

### Logs Not Appearing
- Verify LOG_CHANNEL_ID is correct in .env
- Check bot can send messages in that channel
- Check bot can embed links

## Next Steps

### Customization
- Change bot status in `src/events/ready.js`
- Modify embed colors in `src/config/config.js`
- Add custom timeout durations in config
- Change command descriptions

### Add Features
- Implement database in `src/systems/database.js`
- Add automod system
- Create warning system
- Build case tracking

### Production Tips
- Use a process manager like PM2
- Set up automatic restarts
- Monitor with logging service
- Regular backups if using database

## Running with Docker & Data Persistence

To avoid losing settings (such as autopurge configs, warnings, and command access rules) when the bot restarts or is rebuilt, you **must** mount a persistent volume to map the `/usr/src/app/data` folder to your host system.

### Option A: Using Docker Compose (Recommended)
We have provided a [docker-compose.yml](file:///c:/Users/munch/Discord%20Bot%20-%20Copy/docker-compose.yml) in the root of the project.
1. Build and start the bot:
   ```bash
   docker compose up --build -d
   ```
This automatically maps the `./data` directory on your host machine to `/usr/src/app/data` inside the container.

### Option B: Using Docker CLI
If running directly via `docker run`, mount the directory as a volume:
```bash
docker build -t discord-bot .
docker run -d \
  --name discord-bot \
  --env-file .env \
  -v "$(pwd)/data:/usr/src/app/data" \
  discord-bot
```

## Need Help?

1. Check console output for errors
2. Verify .env configuration
3. Test with simple commands first (/ping)
4. Check Discord Developer Portal settings
5. Review bot permissions in server

---

**Security Reminder**: Never share your .env file or bot token!
