import { Message } from "discord.js";
import { Counting } from "../Client";
import fs from "fs";

export let messageCreate = {
    name: 'messageCreate',
    async execute(arg: any, client: Counting) {
        let message: Message = arg[0];
        if (message.author.bot) return;

        if (fs.existsSync(`./CountData/${message.guild?.id}`) && fs.existsSync(`./CountData/${message.guild?.id}/config.json`)) {
            let Config = JSON.parse(fs.readFileSync(`./CountData/${message.guild?.id}/config.json`).toString());

            if (Config.enabled && message.channel.id === Config.channel) {
                const num = parseInt(message.content);
                if (num && num.toString().length < message.content.length) return;

                if (!isNaN(num)) {
                    const count = parseInt(Config.count || 0);
                    const newCount = count + 1;
                    if (!fs.existsSync(`./CountData/${message.guild?.id}/users`)) {
                        fs.mkdirSync(`./CountData/${message.guild?.id}/users`);
                    }

                    if (!fs.existsSync(`./CountData/${message.guild?.id}/users/${message.author.id}.json`)) {
                        fs.writeFileSync(`./CountData/${message.guild?.id}/users/${message.author.id}.json`, JSON.stringify({
                            count: 0,
                        }));
                    }

                    let UserConfig = JSON.parse(fs.readFileSync(`./CountData/${message.guild?.id}/users/${message.author.id}.json`).toString());
                    if (!UserConfig.count) UserConfig.count = 0;

                    if (!Config.type) Config.type = 'default';
                    if (Config.type === 'default') {
                        if (newCount === num) {
                            Config.count = num;
                            UserConfig.count = UserConfig.count + 1;
                            Config.lastUser = message.author.id;
                            fs.writeFileSync(`./CountData/${message.guild?.id}/users/${message.author.id}.json`, JSON.stringify(UserConfig));
                            fs.writeFileSync(`./CountData/${message.guild?.id}/config.json`, JSON.stringify(Config));
                            message.react('✅');
                        } else {
                            Config.count = 0;
                            Config.lastUser = 0;
                            fs.writeFileSync(`./CountData/${message.guild?.id}/config.json`, JSON.stringify(Config));
                            message.reply(`You messed up. Count was reset to 0!`);
                            message.react('❌');
                        }
                    } else if (Config.type === 'alternate') {
                        if (Config.lastUser === message.author.id) {
                            Config.count = 0;
                            UserConfig.count = 0;
                            Config.lastUser = 0;
                            fs.writeFileSync(`./CountData/${message.guild?.id}/users/${message.author.id}.json`, JSON.stringify(UserConfig));
                            fs.writeFileSync(`./CountData/${message.guild?.id}/config.json`, JSON.stringify(Config));
                            message.react('💀');
                        } else {
                            if (newCount === num) {
                                Config.count = num;
                                UserConfig.count = UserConfig.count + 1;
                                Config.lastUser = message.author.id;
                                fs.writeFileSync(`./CountData/${message.guild?.id}/users/${message.author.id}.json`, JSON.stringify(UserConfig));
                                fs.writeFileSync(`./CountData/${message.guild?.id}/config.json`, JSON.stringify(Config));
                                message.react('✅');
                            } else {
                                Config.count = 0;
                                Config.lastUser = 0;
                                fs.writeFileSync(`./CountData/${message.guild?.id}/config.json`, JSON.stringify(Config));
                                message.reply(`You messed up. Count was reset to 0!`);
                                message.react('❌');
                            }
                        }
                    }
                }
            }
        }

        if (message.reference && message.reference.messageId && client.data.has(message.reference?.messageId)) {
            let data = client.data.get(message.reference?.messageId);
            if (data.execute && data.channelSetup) {
                const channel = message.guild?.channels.cache.get(message.content.replace(/<#(.*?)>/g, '$1'));
                if (!channel) return message.reply('Invalid channel!');

                if (!fs.existsSync(`./CountData/${message.guild?.id}`)) {
                    fs.mkdirSync(`./CountData/${message.guild?.id}`);
                }

                if (!fs.existsSync(`./CountData/${message.guild?.id}/config.json`)) {
                    fs.writeFileSync(`./CountData/${message.guild?.id}/config.json`, JSON.stringify({
                        enabled: false,
                    }));
                }

                let Config = JSON.parse(fs.readFileSync(`./CountData/${message.guild?.id}/config.json`).toString());
                Config.channel = channel.id;

                fs.writeFileSync(`./CountData/${message.guild?.id}/config.json`, JSON.stringify(Config));

                message.reply('Channel set!');
                const theMessage = await message.fetchReference();
                if (theMessage) {
                    try {
                        theMessage.delete();
                    } catch (e) {
                        console.log(e);
                    }
                }
                return client.data.delete(message.reference?.messageId);
            }
        }

        if (message.content.startsWith(client.config.prefix)) {
            let args = message.content
                .slice(client.config.prefix.length)
                .trim()
                .split(/ +/g);

            const commandName = args.shift()?.toLowerCase();
            const command = client.commands.get(commandName);
            if (!command) return;

            try {
                await command.execute(message, args, client);
            } catch (e) {
                console.error(e);
                return message.reply('there was an error trying to execute that command!');
            }
        }
    }
}