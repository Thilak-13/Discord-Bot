# ⚠️ BOT SHOWING OFFLINE FIX

Your bot is running but shows offline in Discord. This is a **Discord Developer Portal** setting issue.

## ✅ Fix - Enable Presence Intent

### Step 1: Go to Discord Developer Portal
1. Open https://discord.com/developers/applications
2. Click on your bot application
3. Go to the **Bot** tab (left sidebar)

### Step 2: Enable Privileged Gateway Intents
Scroll down to **Privileged Gateway Intents** and enable:

- ✅ **PRESENCE INTENT** ← **THIS IS THE KEY ONE!**
- ✅ **SERVER MEMBERS INTENT** (already needed)
- ✅ **MESSAGE CONTENT INTENT** (optional, for future features)

### Step 3: Save Changes
Click **Save Changes** at the bottom.

### Step 4: Restart Your Bot
```bash
# Stop the bot (Ctrl+C) then:
npm start
```

## Why This Happens
Discord requires you to explicitly enable certain "privileged" intents in the Developer Portal. The Presence Intent allows your bot to:
- Show online/idle/dnd status
- Display custom activities ("Watching privately")

Without this intent enabled in the portal, the bot connects but appears offline.

## After Enabling
Once you enable the Presence Intent and restart:
- Bot will show 🟢 **Online**
- Activity will show "Watching privately"
- You'll see `🟢 Status set to online` in console

---

**TL;DR:** Enable PRESENCE INTENT in Discord Developer Portal → Bot tab → Privileged Gateway Intents → Save → Restart bot
