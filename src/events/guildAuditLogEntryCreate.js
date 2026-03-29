module.exports = {
    name: 'guildAuditLogEntryCreate',
    async execute() {
        // Intentionally disabled: moderation reports now use MOD_LOG_CHANNEL_ID as the only source.
        return;
    }
};