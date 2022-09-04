import CB from './client';
import 'dotenv/config';

export const client = new CB({
    intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
    allowedMentions: { parse: ['users'] }
});

import events from './events';
for (const event of events) {
    client.on(event.name, (...args) => event.execute([...args], client));
}

import commands from './commands';
for (const command of commands) {
    client.commands.set(command.name, command);
}

client.login(process.env.TOKEN);