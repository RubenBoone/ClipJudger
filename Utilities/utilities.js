import { MessageFlags } from 'discord.js';

const uClearChat = async (interaction) => {
    if (interaction.commandName === 'clearchat') {
        const amount = interaction.options.getInteger('amount') || 100;
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'You can only clear between 1 and 100 messages.', flags: MessageFlags.Ephemeral });
        }

        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount });

            const messagesToDelete = messages.filter(message => message.author.bot || message.author.id !== interaction.client.user.id);

            await interaction.channel.bulkDelete(messagesToDelete);

            return interaction.reply({ content: 'Cleared the chat!', flags: MessageFlags.Ephemeral });
        } catch (err) {
            console.error('Error clearing chat:', err);
            return interaction.reply({ content: 'Something went wrong while clearing the chat.', flags: MessageFlags.Ephemeral });
        }
    }
}


export { uClearChat };