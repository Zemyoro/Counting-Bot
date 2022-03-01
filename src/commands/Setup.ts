import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { Counting } from "../client/Client";
import fs from 'fs';
import { SlashCommandBuilder } from "@discordjs/builders";

let B1 = new MessageButton().setCustomId('B1SETUP').setStyle('PRIMARY').setLabel('Channel')
let B2 = new MessageButton().setCustomId('B2SETUP').setStyle('PRIMARY').setLabel('Type')
let B3 = new MessageButton().setCustomId('B3SETUP').setStyle('PRIMARY').setLabel('Enable')
let B4 = new MessageButton().setCustomId('B4SETUP').setStyle('PRIMARY').setLabel('Disable')
let Row = new MessageActionRow().addComponents(B1, B2)

let data = async (interaction: CommandInteraction, client: Counting, data: any) => {
    if (!interaction || !client || !data) return;

    // @ts-ignore
    switch (interaction.customId) {
        case 'B3SETUP':
            if (fs.existsSync(`./CountData/${interaction.guild?.id}`) && fs.existsSync(`./CountData/${interaction.guild?.id}/config.json`)) {
                const Config = JSON.parse(fs.readFileSync(`./CountData/${interaction.guild?.id}/config.json`).toString());
                Config.enabled = true;
                fs.writeFileSync(`./CountData/${interaction.guild?.id}/config.json`, JSON.stringify(Config));

                const ConfigMessage: any = await interaction.channel?.messages.fetch()
                // @ts-ignore
                const theMessage = ConfigMessage.get(interaction.message.id);
                const EnabledEmbed = new MessageEmbed(theMessage.embeds[0])
                EnabledEmbed.fields[2].value = `${EnabledEmbed.fields[2].value.replace('Disabled', 'Enabled')}`
                if (theMessage) {
                    Row.setComponents(B4, B1, B2)
                    try {
                        theMessage.edit({ embeds: [EnabledEmbed], components: [Row] });
                    } catch (e) {
                        console.log(e);
                    }

                    interaction.reply({ content: 'Counting has been enabled!', ephemeral: true });
                }
            }
            break;
        case 'B4SETUP':
            if (fs.existsSync(`./CountData/${interaction.guild?.id}`) && fs.existsSync(`./CountData/${interaction.guild?.id}/config.json`)) {
                const Config = JSON.parse(fs.readFileSync(`./CountData/${interaction.guild?.id}/config.json`).toString());
                Config.enabled = false;
                fs.writeFileSync(`./CountData/${interaction.guild?.id}/config.json`, JSON.stringify(Config));

                const ConfigMessage: any = await interaction.channel?.messages.fetch()
                // @ts-ignore
                const theMessage = ConfigMessage.get(interaction.message.id);
                const DisabledEmbed = new MessageEmbed(theMessage.embeds[0])
                DisabledEmbed.fields[2].value = `${DisabledEmbed.fields[2].value.replace('Enabled', 'Disabled')}`
                if (theMessage) {
                    Row.setComponents(B3, B1, B2)
                    try {
                        theMessage.edit({ embeds: [DisabledEmbed], components: [Row] });
                    } catch (e) {
                        console.log(e);
                    }

                    interaction.reply({ content: 'Counting has been disabled!', ephemeral: true });
                }
            }
            break;
        case 'B1SETUP':
            const ChannelEmbed = new MessageEmbed()
                .setTitle('Channel')
                .setDescription('Reply to this message with the channel you want to use for the counting!')

            // @ts-ignore
            client.data.set(interaction.message.id, {
                execute: data.execute,
                channelSetup: true,
                channel: null,
            })
            // @ts-ignore
            interaction.update({ embeds: [ChannelEmbed], components: [] })
            break;
        case 'B2SETUP':
            const ChannelTypeEmbed = new MessageEmbed()
                .setTitle('Counting type')
                .setDescription("Choose the type of counting you'd like to use.")
                .addFields(
                    {
                        name: '🔢 Default',
                        value: `No rules.`,
                    },
                    {
                        name: '🔢 Alternate',
                        value: `Can only count one time per user.`,
                    }
                )
            let B2Default = new MessageButton().setCustomId('B2Default').setStyle('PRIMARY').setLabel('Default')
            let B2Alternate = new MessageButton().setCustomId('B2Alternate').setStyle('PRIMARY').setLabel('Alternate')
            let B2Row = new MessageActionRow().addComponents(B2Default, B2Alternate)
            // @ts-ignore
            interaction.update({ embeds: [ChannelTypeEmbed], components: [B2Row] })
            break;
        case 'B2Default':
            if (!fs.existsSync('./CountData')) {
                fs.mkdirSync('./CountData');
            }

            if (!fs.existsSync(`./CountData/${interaction.guild?.id}`)) {
                fs.mkdirSync(`./CountData/${interaction.guild?.id}`);
            }

            if (!fs.existsSync(`./CountData/${interaction.guild?.id}/config.json`)) {
                fs.writeFileSync(`./CountData/${interaction.guild?.id}/config.json`, JSON.stringify({
                    enabled: false,
                    type: 'default',
                }));
            }

            const GuildConfig = JSON.parse(fs.readFileSync(`./CountData/${interaction.guild?.id}/config.json`).toString());
            GuildConfig.type = 'default';
            fs.writeFileSync(`./CountData/${interaction.guild?.id}/config.json`, JSON.stringify(GuildConfig));

            const DefaultEmbed = new MessageEmbed()
                .setTitle('Counting type')
                .setDescription('Counting type set to default!')
            // @ts-ignore
            interaction.update({ embeds: [DefaultEmbed], components: [] })
            break;
        case 'B2Alternate':
            if (!fs.existsSync('./CountData')) {
                fs.mkdirSync('./CountData');
            }

            if (!fs.existsSync(`./CountData/${interaction.guild?.id}`)) {
                fs.mkdirSync(`./CountData/${interaction.guild?.id}`);
            }

            if (!fs.existsSync(`./CountData/${interaction.guild?.id}/config.json`)) {
                fs.writeFileSync(`./CountData/${interaction.guild?.id}/config.json`, JSON.stringify({
                    enabled: false,
                    type: 'alternate'
                }));
            }

            const GuildConfig2 = JSON.parse(fs.readFileSync(`./CountData/${interaction.guild?.id}/config.json`).toString());
            GuildConfig2.type = 'alternate';
            fs.writeFileSync(`./CountData/${interaction.guild?.id}/config.json`, JSON.stringify(GuildConfig2));

            const AlternateEmbed = new MessageEmbed()
                .setTitle('Counting type')
                .setDescription('Counting type set to alternate!')
            // @ts-ignore
            interaction.update({ embeds: [AlternateEmbed], components: [] })
            break;
    }
}

export let Setup = {
    name: 'setup',
    description: 'Setup the bot',
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the bot'),
    execute(message: Message, args: any, client: Counting) {
        let GuildConfig: any = false;
        let GuildConfigChannel: any = false;

        if (fs.existsSync(`./CountData/${message.guild?.id}`) && fs.existsSync(`./CountData/${message.guild?.id}/config.json`)) {
            GuildConfig = JSON.parse(fs.readFileSync(`./CountData/${message.guild?.id}/config.json`).toString());
            if (GuildConfig.channel) {
                GuildConfigChannel = client.channels.cache.get(GuildConfig.channel);
            }
            if (GuildConfig.enabled && GuildConfig !== null) Row.setComponents(B4, B1, B2)
            if (!GuildConfig.enabled && GuildConfig !== null) Row.setComponents(B3, B1, B2)
        }


        const SetupEmbed = new MessageEmbed()
            .setTitle('Setup configuration')
            .setDescription('Configure counting with ease!')
            .addFields(
                {
                    name: 'Channel',
                    value: `Set the counting channel.`,
                },
                {
                    name: 'Type',
                    value: `Set the counting type.`,
                },
                {
                    name: 'State',
                    value: `${GuildConfig && GuildConfig.enabled ? '**Enabled**' : '**Disabled**'} | ${GuildConfig && GuildConfigChannel ? `Channel: ${GuildConfigChannel}` : 'Channel: **None**'}`,
                }
            );

        message.reply({ embeds: [SetupEmbed], components: [Row] }).then((msg) => {
            client.data.set(msg.id, {
                execute: data,
            });

            setTimeout(async () => {
                if (msg.deleted === false) {

                    if (client.data.has(msg.id)) {
                        client.data.delete(msg.id);
                    }

                    msg.delete();
                }
            }, 600000);
        });
    },
    async slashExecute(interaction: CommandInteraction, client: Counting) {
        let GuildConfig: any = false;
        let GuildConfigChannel: any = false;

        if (fs.existsSync(`./CountData/${interaction.guild?.id}`) && fs.existsSync(`./CountData/${interaction.guild?.id}/config.json`)) {
            GuildConfig = JSON.parse(fs.readFileSync(`./CountData/${interaction.guild?.id}/config.json`).toString());
            if (GuildConfig.channel) {
                GuildConfigChannel = client.channels.cache.get(GuildConfig.channel);
            }
            if (GuildConfig.enabled && GuildConfig !== null) Row.setComponents(B4, B1, B2)
            if (!GuildConfig.enabled && GuildConfig !== null) Row.setComponents(B3, B1, B2)
        }


        const SetupEmbed = new MessageEmbed()
            .setTitle('Setup configuration')
            .setDescription('Configure counting with ease!')
            .addFields(
                {
                    name: 'Channel',
                    value: `Set the counting channel.`,
                },
                {
                    name: 'Type',
                    value: `Set the counting type.`,
                },
                {
                    name: 'State',
                    value: `${GuildConfig && GuildConfig.enabled ? '**Enabled**' : '**Disabled**'} | ${GuildConfig && GuildConfigChannel ? `Channel: ${GuildConfigChannel}` : 'Channel: **None**'}`,
                }
            );

        interaction.reply({ embeds: [SetupEmbed], components: [Row] })
        const RepliedInteraction = await interaction.fetchReply();
        if (RepliedInteraction) {
            client.data.set(RepliedInteraction.id, {
                execute: data,
            });

            setTimeout(async () => {
                const RepliedInteractionDelete = await interaction.channel?.messages.fetch(RepliedInteraction.id);
                if (RepliedInteractionDelete) {
                    RepliedInteractionDelete.delete();

                    if (client.data.has(RepliedInteraction.id)) {
                        client.data.delete(RepliedInteraction.id);
                    }
                }
            }, 600000);
        }
    }
}