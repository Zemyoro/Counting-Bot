import { Routes } from 'discord-api-types/v9'
import { REST } from '@discordjs/rest'
import 'dotenv/config';

const GuildID = process.env.GUILD_ID;
const ClientID = process.env.CLIENT_ID;
const argv = process.argv[2];

const rest = new REST().setToken(`${process.env.TOKEN}`);
const guild = Routes.applicationGuildCommands;
const global = Routes.applicationCommands;
let commandData = [];

import commands from './commands';
for (const command of commands) {
    if (command.data)
        commandData.push(command.data.toJSON());
}

(async () => {
    try {
        console.log(`Started refreshing application (/) commands ${argv === '--guild' ? 'in guild' : 'globally'}.`);

        switch (argv) {
            case '--guild':
                await rest.put(guild(ClientID as string, GuildID as string), { body: commands });
                break;
            case '--global':
                await rest.put(global(ClientID as string), { body: commands });
                break;
            default:
                console.log('Invalid parameter provided.');
        }

        console.log(`Successfully refreshed application commands (/)`);
    } catch (e) {
        console.error(e);
    }
})();