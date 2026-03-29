# Gradient Role Colors - Deployment Guide

## What Was Implemented

The `/rolecolor` command has been completely refactored to support Discord's new gradient role colors feature.

### ✅ Features Implemented

1. **Slash Command Structure** - Converted from message-based to Discord slash command
2. **Gradient Color Support** - Supports 2-3 color gradients
3. **Hex Conversion Helper** - `hexToInt()` function with validation
4. **Personal Role Management** - Creates/reuses `color-{userId}` roles
5. **Role Hierarchy Management** - Positions roles correctly below bot's highest role
6. **Error Handling** - Validates colors, permissions, and provides clear error messages

### 📁 Files Modified/Created

- ✏️ **Modified**: `src/commands/admin/rolecolor.js` - Complete refactor
- ✏️ **Modified**: `index.js` - Updated to support both slash and message commands
- ✨ **Created**: `src/events/interactionCreate.js` - Slash command handler

## How to Deploy

### Step 1: Deploy Slash Commands to Discord

Run the deployment script to register the `/rolecolor` command with Discord:

```powershell
node deploy-commands.js
```

This will register the slash command globally or to your guild (depending on your deploy-commands.js configuration).

### Step 2: Restart the Bot

If the bot is already running, restart it to load the new changes:

```powershell
# Stop the current bot (Ctrl+C if running in terminal)
# Then start it again:
node index.js
```

### Step 3: Test the Command

In Discord, use the slash command:

```
/rolecolor color1:#ff0000 color2:#00ff00
/rolecolor color1:#ff0000 color2:#00ff00 color3:#0000ff
```

## Gradient API Structure

The command uses the following payload structure discovered from Discord DevTools:

```javascript
{
    color: PRIMARY_COLOR,      // Fallback for non-gradient clients
    colors: {
        primary_color: PRIMARY_COLOR,
        secondary_color: SECONDARY_COLOR,
        tertiary_color: OPTIONAL_THIRD_COLOR  // Only if 3 colors provided
    }
}
```

## Hex Format Support

The command accepts multiple hex formats:
- `#ff0000` (with hash)
- `ff0000` (without hash)
- `0xff0000` (with 0x prefix)

All are converted to decimal integers (e.g., `#ff0000` → `16711680`)

## How It Works

1. **User runs `/rolecolor`** with 2-3 hex colors
2. **Validates** all hex inputs and converts to decimal
3. **Checks** if user has existing `color-{userId}` role
4. **Creates** new role if needed, positioned below bot's highest role
5. **Applies** gradient using the `colors` object structure
6. **Assigns** role to user automatically
7. **Returns** success message with color visualization

## Permission Requirements

- Bot needs **Manage Roles** permission
- Bot's role must be higher than the color roles
- Command restricted to members with **Manage Roles** permission by default

## Debug Output

The command logs gradient payloads to console for debugging:

```
🎨 Gradient Payload: {
  "color": 16711680,
  "colors": {
    "primary_color": 16711680,
    "secondary_color": 65280
  }
}
```

## Notes

- Each user gets ONE reusable personal color role
- Roles are named `color-{userId}` to prevent duplicates
- The `color` field ensures backward compatibility with clients that don't support gradients
- All operations use ephemeral (private) replies for better UX

## Troubleshooting

**Command not showing up?**
- Make sure you ran `node deploy-commands.js`
- Check that CLIENT_ID and BOT_TOKEN are set in .env
- Slash commands can take up to 1 hour to sync globally

**"Missing permissions" error?**
- Ensure bot has Manage Roles permission
- Check bot's role is above the color roles in server settings

**Gradient not showing?**
- Make sure your Discord client is up to date
- The gradient feature may be limited to certain server boost levels
- Check console logs for the actual API response
