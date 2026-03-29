require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./src/config/config');

const commands = [];

// Load all command files
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(commandsPath);
let legacyCommandCount = 0;
let invalidCommandCount = 0;

console.log('📋 Loading commands for deployment...\n');

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if ('data' in command && typeof command.execute === 'function' && typeof command.data?.toJSON === 'function') {
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded: ${command.data.name}`);
        } else if ('name' in command && typeof command.execute === 'function') {
            // Legacy prefix commands are runtime-only and should not be deployed via REST.
            legacyCommandCount++;
            console.log(`ℹ️ Ignored legacy command: ${command.name}`);
        } else {
            invalidCommandCount++;
            console.warn(`⚠️ Skipped ${file}: invalid command export`);
        }
    }
}

console.log(`\n📦 Total commands to deploy: ${commands.length}\n`);
if (legacyCommandCount > 0) {
    console.log(`ℹ️ Ignored ${legacyCommandCount} legacy prefix command(s) during deploy.`);
}
if (invalidCommandCount > 0) {
    console.warn(`⚠️ Found ${invalidCommandCount} invalid command file(s).`);
}
console.log('');

// Validate required environment variables
if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN not found in .env file!');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('❌ CLIENT_ID not found in .env file!');
    console.log('💡 Get your CLIENT_ID from Discord Developer Portal > Your Application > Application ID');
    process.exit(1);
}

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const rest = new REST().setToken(process.env.BOT_TOKEN);

// Deploy commands
(async () => {
    try {
        if (guildId) {
            console.log(`🚀 Deploying ${commands.length} commands to guild ${guildId} for application ${clientId}...\n`);

            const guildData = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );

            console.log(`✅ Successfully deployed ${guildData.length} commands to guild ${guildId}!`);
            console.log('📝 Guild commands update almost immediately.\n');

            console.log(`🌍 Syncing ${commands.length} commands globally for application ${clientId}...\n`);

            const globalData = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            console.log(`✅ Successfully synced ${globalData.length} commands globally!`);
            console.log('📝 Global commands can still take time to refresh in the Discord client.\n');
        } else {
            console.log(`🚀 Deploying ${commands.length} commands globally to application ${clientId}...\n`);

            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            console.log(`✅ Successfully deployed ${data.length} commands globally!`);
            console.log('📝 Note: Global commands may take up to 1 hour to appear.\n');
        }

    } catch (error) {
        console.error('❌ Deploy failed:', error.message);
        
        if (error.code === 50001) {
            console.log('\n💡 Error 50001: Missing Access');
            console.log('Make sure your bot has the "applications.commands" scope enabled.');
        } else if (error.code === 0) {
            console.log('\n💡 Invalid token or client ID');
        }
        process.exit(1);
    }
})();
