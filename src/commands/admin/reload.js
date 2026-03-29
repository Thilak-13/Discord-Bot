const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'reload',
    description: 'Reload all commands (Usage: zzreload)',
    
    async execute(message) {
        try {
            const commandsPath = path.join(__dirname, '..');
            const commandFolders = fs.readdirSync(commandsPath);

            let reloaded = 0;
            let failed = 0;

            for (const folder of commandFolders) {
                const folderPath = path.join(commandsPath, folder);
                if (!fs.statSync(folderPath).isDirectory()) continue;

                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

                for (const file of commandFiles) {
                    const filePath = path.join(folderPath, file);
                    
                    try {
                        delete require.cache[require.resolve(filePath)];
                        const command = require(filePath);
                        
                        if ('name' in command && 'execute' in command) {
                            message.client.commands.set(command.name, command);
                            reloaded++;
                        }
                    } catch (error) {
                        console.error(`❌ ${file}:`, error.message);
                        failed++;
                    }
                }
            }

            message.reply(`🔄 Reloaded ${reloaded} commands, ${failed} failed`);
        } catch (error) {
            message.reply(`❌ Reload failed: ${error.message}`);
        }
    }
};
