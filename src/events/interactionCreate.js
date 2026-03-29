/**
 * interactionCreate Event Handler
 * Handles slash commands and other interactions
 */

module.exports = {
    name: 'interactionCreate',
    
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (!command) {
                console.warn(`⚠️ No command matching ${interaction.commandName} was found.`);
                // Always acknowledge slash interactions to avoid Discord timeout message.
                await interaction.reply({
                    content: '❌ This command is currently unavailable. Try running `/deploy` updates or restarting the bot.',
                    ephemeral: true
                }).catch(console.error);
                return;
            }
            
            try {
                // Log command usage
                console.log(`[SLASH CMD] ${interaction.user.tag} used /${interaction.commandName} in ${interaction.guild?.name || 'DM'}`);
                
                // Execute the command
                await command.execute(interaction);
                
            } catch (error) {
                console.error(`❌ Error executing /${interaction.commandName}:`, error);
                
                const errorMessage = {
                    content: '❌ There was an error executing this command!',
                    ephemeral: true
                };
                
                // Send error message depending on interaction state
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage).catch(console.error);
                } else {
                    await interaction.reply(errorMessage).catch(console.error);
                }
            }
        }
        
        // Handle button interactions (future expansion)
        else if (interaction.isButton()) {
            // Add button handler logic here if needed
        }
        
        // Handle select menu interactions (future expansion)
        else if (interaction.isStringSelectMenu()) {
            // Add select menu handler logic here if needed
        }
    }
};
