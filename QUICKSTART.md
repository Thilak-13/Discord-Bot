# ⚡ QUICK START - 3 Steps

## 1️⃣ Configure .env
Copy `.env.example` to `.env` and fill in:

```env
BOT_TOKEN=your_bot_token_from_discord_developer_portal
OWNER_ID=your_discord_user_id
LOG_CHANNEL_ID=channel_id_for_logs
```

**Critical:** Get your OWNER_ID by enabling Developer Mode in Discord, then right-click your name → Copy User ID

## 2️⃣ Deploy Commands
```bash
npm run deploy
```

## 3️⃣ Start Bot
```bash
npm start
```

---

## ✅ That's it!

The bot will:
- ✅ Only respond to YOU (OWNER_ID)
- ✅ Show you private responses (ephemeral)
- ✅ Reject all other users instantly
- ✅ Run super fast (optimized for single user)

## Commands Available
- `/ping` - Test latency
- `/userinfo [@user]` - User details
- `/ban @user [reason]` - Ban user
- `/kick @user [reason]` - Kick user
- `/timeout @user [duration] [reason]` - Timeout user
- `/reload [command]` - Reload commands

All responses are private to you only!

---

## 🔥 Performance Notes
- No permission checks (since only you use it)
- No role hierarchy checks
- Instant owner verification
- Minimal logging overhead
- Optimized startup time

## ⚠️ Important
If someone else tries to use a command, they see:
> ❌ Unauthorized. This bot is private.

And nothing else. No command will execute for them.
