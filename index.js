import { REST, Routes, ActivityType } from 'discord.js';
import { commands } from './Utilities/commands.js';
import { vSetup, vCheckReaction, vGetMessages } from './Verifier/verifier.js';
import { uClearChat } from './Utilities/utilities.js';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

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

client.on(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}!`);

    client.user.setActivity({ name: 'your clips!', type: ActivityType.Watching });
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

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.member.permissions.has('Administrator')) message.delete();

});

const postclipCommand = commands.find(command => command.name === 'postclip');
postclipCommand.perm

client.login(config.token);
