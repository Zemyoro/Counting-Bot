import { ChannelButton, configCheck, DisableButton, EnableButton, row, SetupEmbed, TypeButton } from '../modules/setup';
import { SlashCommandBuilder } from 'discord.js';
import setupModule from '../modules/setup';
import { Command } from '.';

export const setup: Command = {
    name: 'setup',
    description: 'Configure counting all in one command!',
    usage: [],
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure counting all in one command!'),
    execute(message, client) {
        const config = configCheck(`./data/${message.guild?.id}`);
        message.reply({ embeds: [SetupEmbed(config)], components: [row([config.state ? DisableButton : EnableButton, ChannelButton, TypeButton])] }).then(msg => {
            client.setup.set(msg.id, {
                mode: 'normal',
                execute: setupModule
            })
        });
    },
    async slashExecute(interaction, client) {
        const config = configCheck(`./data/${interaction.guild?.id}`);
        const reply = await interaction.reply({ embeds: [SetupEmbed(config)], components: [row([config.state ? DisableButton : EnableButton])], fetchReply: true });
        client.setup.set(reply.id, {
            mode: 'normal',
            execute: setupModule
        });
    }
}