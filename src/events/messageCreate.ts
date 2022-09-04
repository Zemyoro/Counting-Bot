import { BackButton, ChannelSetupEmbed, ConfirmButton, row } from '../modules/setup';
import counter from '../modules/counter';
import { Message } from 'discord.js';
import { Event } from '.';

export const messageCreate: Event = {
    name: 'messageCreate',
    async execute(_, client) {
        const message: Message = _[0];
        if (message.author.bot || message.webhookId) return;

        if (message.content.startsWith(client.prefix)) {
            const args = message.content
                .slice(client.prefix.length)
                .trim()
                .split(/ +/g);
            
            const commandName = `${args.shift()?.toLowerCase()}`;
            const command = client.commands.get(commandName);
            if (!command) return message.reply({ content: 'That command does not exist!' });

            if (command.args && !args.length)
                return message.reply({ content: `You're missing arguments! Usage: \`${client.prefix}${commandName} ${command.usage.join(' ')}\`` });
            
            try {
                return command.execute(message, client, args);
            } catch (e) {
                console.log(e);
                return message.reply({ content: 'There was a problem executing that command. Please try again.' });
            }
        }

        if (message.reference && message.reference.messageId && client.setup.has(message.reference.messageId)) {
            const referenceMessage = client.setup.get(message.reference.messageId);
            if (referenceMessage?.mode !== 'channel') return;
            
            const fetchedReference = await message.fetchReference();
            const channel = await message.guild?.channels.fetch(message.content.replace(/[<#>]/g, '')).catch(() => null);
            const updatedChannelSetupEmbed = ChannelSetupEmbed();
            if (!channel) {
                updatedChannelSetupEmbed.setFooter({
                    text: '❌ The provided channel is invalid!'
                });
                return fetchedReference.edit({ embeds: [updatedChannelSetupEmbed] });
            }

            updatedChannelSetupEmbed.setFooter({
                text: `✅ Channel ready to be set to ${channel.name}`
            });

            referenceMessage.special = channel.id;
            const UpdatedRow = row([BackButton, ConfirmButton()]);
            return fetchedReference.edit({ embeds: [updatedChannelSetupEmbed], components: [UpdatedRow] });
        }

        return counter(message);
    }
}