import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Channel, EmbedBuilder } from 'discord.js';
import { Setup } from '../client';
import CB from '../client';
import fs from 'fs';

export const EnableButton = new ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId('Enable').setLabel('Enable');
export const DisableButton = new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('Disable').setLabel('Disable');
export const ChannelButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('Channel').setLabel('Channel');
export const TypeButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('Type').setLabel('Type');
export const BackButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('Back').setLabel('Back');

export function ConfirmButton() {
    return new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('Confirm').setLabel('Confirm');
}

export function row(buttons: ButtonBuilder[]) {
    const ActionRow = new ActionRowBuilder().setComponents(buttons);
    // @ts-ignore
    return ActionRow as Row;
}

export function SetupEmbed(config: Config) {
    return new EmbedBuilder()
        .setTitle('Counting | Setup')
        .setDescription('Configure counting settings!')
        .setColor('Random')
        .setFields([
            {
                name: 'State',
                value: `**${config.state ? 'Enabled' : 'Disabled'}** | Channel: ${config.channel ? `<#${config.channel}>` : '**None**'} (${config.type})`
            },
            {
                name: 'Channel',
                value: 'Where members will count'
            },
            {
                name: 'Type',
                value: 'Counting behaviour'
            }
        ]);
}

function TypeSetupEmbed() {
    return new EmbedBuilder()
        .setTitle('Counting | Type')
        .setDescription('Choose a type of your choice')
        .setColor('Random')
        .addFields([
            {
                name: '🔢 Default',
                value: `Count as much as you want`,
            },
            {
                name: '🔢 Alternate',
                value: `Take turns counting with anyone`,
            }
        ]);
}

export function ChannelSetupEmbed() {
    return new EmbedBuilder()
        .setTitle('Counting | Channel')
        .setDescription('Reply with a channel');
}

export default function (interaction: ButtonInteraction, client: CB, data: Setup) {
    const GuildDirectory = `./data/${interaction.guild?.id}`;

    const config = configCheck(GuildDirectory);
    const buttonsRow = row([config.state ? DisableButton : EnableButton, ChannelButton, TypeButton]);

    switch (interaction.customId) {
        case 'Enable':
            config.state = true;
            fs.writeFileSync(`${GuildDirectory}/config.json`, JSON.stringify(config));
            buttonsRow.setComponents([DisableButton, ChannelButton, TypeButton]);
            interaction.message.embeds[0].fields[0].value = interaction.message.embeds[0].fields[0].value.replace('Disabled', 'Enabled');

            return interaction.message.edit({
                embeds: interaction.message.embeds,
                components: [buttonsRow]
            }).then(() => {
                return interaction.reply({
                    content: 'Counting has been enabled!',
                    ephemeral: true
                });
            }).catch(() => {
                return interaction.reply({ content: 'Failed to edit setup embed but counting has been enabled!', ephemeral: true });
            });
        case 'Disable':
            config.state = false;
            fs.writeFileSync(`${GuildDirectory}/config.json`, JSON.stringify(config));
            buttonsRow.setComponents([EnableButton, ChannelButton, TypeButton]);
            interaction.message.embeds[0].fields[0].value = interaction.message.embeds[0].fields[0].value.replace('Enabled', 'Disabled');

            return interaction.message.edit({
                embeds: interaction.message.embeds,
                components: [buttonsRow]
            }).then(() => {
                return interaction.reply({
                    content: 'Counting has been disabled!',
                    ephemeral: true
                });
            }).catch(() => {
                return interaction.reply({ content: 'Failed to edit setup embed but counting has been disabled!', ephemeral: true });
            });
        case 'Channel':
            client.setup.set(interaction.message.id, {
                mode: 'channel',
                execute: data.execute
            });


            const ChannelSetupRow = row([BackButton, ConfirmButton().setDisabled(true)]);
            return interaction.update({ embeds: [ChannelSetupEmbed()], components: [ChannelSetupRow] });
        case 'Confirm':
            config.channel = data.special;
            fs.writeFileSync(`${GuildDirectory}/config.json`, JSON.stringify(config));

            data.mode = 'normal';
            data.special = '';
            client.setup.set(interaction.message.id, data);
            return interaction.update({ embeds: [SetupEmbed(config)], components: [buttonsRow] });
        case 'Type':
            const DefaultButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('Default').setLabel('Default');
            const AlternateButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('Alternate').setLabel('Alternate');
            const TypeSetupRow = row([BackButton, DefaultButton, AlternateButton]);
            return interaction.update({ embeds: [TypeSetupEmbed()], components: [TypeSetupRow] });
        case 'Default':
            config.type = 'default';
            fs.writeFileSync(`${GuildDirectory}/config.json`, JSON.stringify(config));
            const DefaultTypeSetupEmbed = TypeSetupEmbed();
            DefaultTypeSetupEmbed.setFooter({
                text: '✅ Type set to default'
            })
            interaction.message.edit({ embeds: [DefaultTypeSetupEmbed] });
            return interaction.reply({ content: '✅ Type set to default', ephemeral: true });
        case 'Alternate':
            config.type = 'alternate';
            fs.writeFileSync(`${GuildDirectory}/config.json`, JSON.stringify(config));
            const AlternateTypeSetupEmbed = TypeSetupEmbed();
            AlternateTypeSetupEmbed.setFooter({
                text: '✅ Type set to alternate'
            })
            interaction.message.edit({ embeds: [AlternateTypeSetupEmbed] });
            return interaction.reply({ content: '✅ Type set to alternate', ephemeral: true });
        case 'Back':
            data.mode = 'normal';
            data.special = '';
            client.setup.set(interaction.message.id, data);
            return interaction.update({ embeds: [SetupEmbed(config)], components: [buttonsRow] });
    }
}

export function configCheck(GuildDirectory: string) {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data');
    if (!fs.existsSync(GuildDirectory)) fs.mkdirSync(GuildDirectory);
    if (!fs.existsSync(`${GuildDirectory}/config.json`))
        fs.writeFileSync(`${GuildDirectory}/config.json`, '{}');

    return JSON.parse(fs.readFileSync(`${GuildDirectory}/config.json`).toString()) as Config;
}

interface Config {
    state?: boolean;
    channel?: string;
    lastUser?: string;
    count?: number;
    type?: 'default' | 'alternate';
}

export interface Row {
    equals: number;
    toJSON: () => any;
    setComponents: (components: ButtonBuilder[]) => any;
    addComponents: (components: ButtonBuilder[]) => any;
    data: {
        type: number
    }
    components: [{
        data: {
            type: number;
            emoji: string | undefined;
            style: number;
            custom_id: string;
            label: string;
            disabled?: boolean;
        }
    }]
}