import { ActionRowBuilder, ChannelSelectMenuBuilder, MessageFlags, ChannelType, ComponentType, RoleSelectMenuBuilder } from "discord.js";
import { readData, writeData } from "../Utilities/datahandler.js";

let settings = readData('Data/verifydata.json');
const urlRegex = /(https?:\/\/[^\s]+)/;

const vSetup = async (interaction, collector) => {
    if (interaction.commandName === 'setupverifier') {
        const clips = new ChannelSelectMenuBuilder()
            .setCustomId('clips')
            .setPlaceholder('Select a channel to send verified clips to')
            .setChannelTypes(ChannelType.GuildText)
            .setMaxValues(1);

        const requests = new ChannelSelectMenuBuilder()
            .setCustomId('requests')
            .setPlaceholder('Select a channel to send clip requests to')
            .setChannelTypes(ChannelType.GuildText)
            .setMaxValues(1);

        const setupReply = await interaction.reply({
            content: 'Select the channel for verified clips and clip requests.',
            components: [
                new ActionRowBuilder().addComponents(clips),
                new ActionRowBuilder().addComponents(requests),
            ],
            flags: MessageFlags.Ephemeral
        });

        const channelCollector = setupReply.createMessageComponentCollector(
            {
                componentType: ComponentType.ChannelSelect
            }
        );

        const roles = new RoleSelectMenuBuilder()
            .setCustomId('roles')
            .setPlaceholder('Select a role to verify clips')
            .setMaxValues(5)
            .setMinValues(0);

        const replyMessage = await interaction.followUp({ content: 'Select roles that want to receive a ping if there is a new request.', components: [new ActionRowBuilder().addComponents(roles)], flags: MessageFlags.Ephemeral });

        const roleCollector = replyMessage.createMessageComponentCollector({ componentType: ComponentType.RoleSelect });

        channelCollector.on('collect', async (interaction) => {
            handleSetup(interaction);
            writeData('Data/verifydata.json', settings);
        });


        roleCollector.on('collect', async (interaction) => {
            if (interaction.customId === 'roles') {
                settings['roles'] = interaction.values;
                writeData('Data/verifydata.json', settings);
                await interaction.reply({ content: `✅ Roles set: ${interaction.values.map(role => `<@&${role}>`).join(', ')}`, flags: MessageFlags.Ephemeral });
            }
        });
    }
}

const handleSetup = async (interaction) => {

    if (interaction.customId === 'clips') {
        settings['inputChannel'] = interaction.values[0];
        await interaction.reply({ content: `✅ Input channel set: <#${interaction.values[0]}>`, flags: MessageFlags.Ephemeral });
    } else if (interaction.customId === 'requests') {
        settings['outputChannel'] = interaction.values[0];
        await interaction.reply({ content: `✅ Output channel set: <#${interaction.values[0]}>`, flags: MessageFlags.Ephemeral });
    }
}

const vGetMessages = async (interaction) => {
    if (interaction.commandName === 'postclip') {
        const clipURL = interaction.options.getString('url');
        if (!urlRegex.test(clipURL)) return await interaction.reply({ content: 'Please provide a valid URL.', flags: MessageFlags.Ephemeral });
        let roletext = "";
        const roles = settings['roles'];
        !roles ? roletext = " " : roles.map(role => { roletext += `<@&${role}>` });
        const outputMessage = await interaction.client.channels.cache.get(settings['outputChannel'])
            .send({ content: `${roletext}${interaction.user} shared: ${clipURL}` });
        await interaction.reply({ content: 'Your clip has been sent to the mods for approval!', flags: MessageFlags.Ephemeral });
        try {
            outputMessage.react('✅');
            outputMessage.react('❌');
        } catch (err) {
            interaction.channel.send({ content: 'Something went wrong with adding reactions to the message...' });
            console.log(new Date().getTime(), err);

        }

    }
}

const vWatchClipChannel = async (message) => {
    if (message.channel.id !== settings['inputChannel']) return;
    message.delete();
    const warning = message.channel.send({ content: `${message.author}, please use "/postclip" to sumbit a clip! :clapper:` });
    setTimeout(() => { warning.then(m => m.delete()) }, 10000);
}

const vCheckReaction = async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.channel.id !== settings['outputChannel']) return;
    if (reaction.emoji.name !== '✅' && reaction.emoji.name !== '❌') return;
    if (reaction.emoji.name === '❌') return await reaction.message.delete();

    const message = reaction.message.content.split(' shared: ')
    const originalMessageContent = message[1].trim();
    const messageAuthor = message[0];
    const sanitizedMessageAuthor = messageAuthor.replace(/<@!?(\d+)>/g, '').trim();

    try {
        await reaction.message.client.channels.cache.get(settings['inputChannel']).send({ content: `${originalMessageContent}` });
        await reaction.message.delete();
    } catch (err) {
        reaction.message.channel.send({ content: 'Something went wrong, please try again later.' });
    }
}

export { vSetup, vGetMessages, vCheckReaction, vWatchClipChannel };