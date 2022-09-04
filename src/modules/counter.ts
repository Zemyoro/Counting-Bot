import { configCheck } from './setup';
import { Message } from 'discord.js';
import fs from 'fs';

export default async function (message: Message) {
    if (!/^[0-9]+$/.test(message.content)) return;
    const config = configCheck(`./data/${message.guild?.id}`);
    if (!config.state || !config.channel || config.channel !== message.channel.id) return;
    const number = parseInt(message.content);

    const GuildDirectory = `./data/${message.guild?.id}`;
    if (!fs.existsSync(`${GuildDirectory}/users`))
        fs.mkdirSync(`${GuildDirectory}/users`);
    if (!fs.existsSync(`${GuildDirectory}/users/${message.author.id}.json`))
        fs.writeFileSync(`${GuildDirectory}/users/${message.author.id}.json`, JSON.stringify({
            count: 0
        }));
    const userConfig = JSON.parse(fs.readFileSync(`${GuildDirectory}/users/${message.author.id}.json`).toString());

    function write() {
        fs.writeFileSync(`${GuildDirectory}/config.json`, JSON.stringify(config));
        fs.writeFileSync(`${GuildDirectory}/users/${message.author.id}.json`, JSON.stringify(userConfig));
    }

    if (!userConfig.count) userConfig.count = 0;
    if (!config.lastUser) config.lastUser = '';
    if (!config.type) config.type = 'default';
    if (!config.count) config.count = 0;

    switch (config.type) {
        case 'default':
            if (config.count + 1 === number) {
                config.count = number;
                userConfig.count++;

                write();
                return message.react('✅');
            } else {
                config.count = 0;
                userConfig.count = 0;

                write();
                return message.react('❌');
            }
        case 'alternate':
            if (config.lastUser === message.author.id) {
                config.count = 0;
                config.lastUser = '';
                userConfig.count = 0;

                write();
                return message.react('💀');
            } else {
                if (config.count + 1 === number) {
                    config.count = number;
                    config.lastUser = message.author.id;
                    userConfig.count++;

                    write();
                    message.react('✅');
                } else {
                    config.count = 0;
                    config.lastUser = '';
                    userConfig.count = 0;

                    write();
                    message.react('❌');
                }
            }
    }
}