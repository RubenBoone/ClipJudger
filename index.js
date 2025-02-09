import { REST, Routes } from 'discord.js';
import { commands } from './Utilities/commands.js';
import { vSetup, vCheckReaction, vGetMessages } from './Verifier/verifier.js';
import { uClearChat } from './Utilities/utilities.js';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))[0];

const rest = new REST({ version: '10' }).setToken(config.token);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands("1110704202050719764"), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}

import { Client, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    uClearChat(interaction);

    vSetup(interaction);
    vGetMessages(interaction);
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    vCheckReaction(reaction, user);
});

client.login(config.token);
