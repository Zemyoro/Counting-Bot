import { Counting } from './client/Client';
import { Intents } from 'discord.js';

export const client = new Counting({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
    allowedMentions: { parse: ['users'] },
});

for (const event of Object.values(client.events)) {
    // @ts-ignore
    client.on(event.name, (...args: any) => event.execute([...args], client));
}

import * as Commands from './commands/Commands';
for (const command of Object.values(Commands)) {
    client.commands.set(command.name, command);
}

import fs from 'fs';
client.on('ready', () => {
    console.log('Ready!');

    if (!fs.existsSync('./CountData')) {
        fs.mkdirSync('./CountData');
    }
})

client.login(client.config.token);