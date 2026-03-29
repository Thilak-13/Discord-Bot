module.exports = {
    name: 'ping',
    description: 'Check bot latency',
    
    async execute(message) {
        const sent = await message.reply('🏓 Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const wsLatency = message.client.ws.ping;
        
        sent.edit(`🏓 Pong!\n📡 Latency: \`${latency}ms\`\n💓 Websocket: \`${wsLatency}ms\``);
    }
};
