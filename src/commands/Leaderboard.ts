import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import fs from "fs";

let ordinalSuffix = (number: number) => {
    const j = number % 10;
    const k = number % 100;
  
    if (j == 1 && k != 11) return number + 'st';
    if (j == 2 && k != 12) return number + 'nd';
    if (j == 3 && k != 13) return number + 'rd';
  
    return number + 'th';
}

export let Leaderboard = {
    name: 'leaderboard',
    description: 'View the leaderboard!',
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the leaderboard!'),
    execute(message: Message) {
        let GuildConfig: any = false;

        if (fs.existsSync(`./CountData/${message.guild?.id}`) && fs.existsSync(`./CountData/${message.guild?.id}/config.json`)) {
            GuildConfig = JSON.parse(fs.readFileSync(`./CountData/${message.guild?.id}/config.json`).toString());
        }

        if (!GuildConfig) {
            const NoConfig = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Leaderboard')
                .setDescription('This guild has not been setup yet!')
                .setFooter('Please run the setup command to setup this guild!');

            return message.reply({ embeds: [NoConfig] });
        }

        if (!fs.existsSync(`./CountData/${message.guild?.id}/users`)) {
            fs.mkdirSync(`./CountData/${message.guild?.id}/users`);
        }

        let Users: any = [];
        if (fs.readdirSync(`./CountData/${message.guild?.id}/users`).length > 0) {
            for (let file of fs.readdirSync(`./CountData/${message.guild?.id}/users`)) {
                if (file.endsWith('.json')) {
                    let User = JSON.parse(fs.readFileSync(`./CountData/${message.guild?.id}/users/${file}`).toString());
                    User.id = file.replace('.json', '');
                    Users.push(User);
                }
            }
        }

        if (Users.length === 0) {
            const NoUsers = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Leaderboard')
                .setDescription('No users have counted yet!')
                .setFooter('Please count in a counting channel!');

            return message.reply({ embeds: [NoUsers] });
        } else {
            Users.sort((a: any, b: any) => b.count - a.count);
            let LeaderboardUsers: any = [];

            const Leaderboard = new MessageEmbed()
                .setColor('#00ff00')
                .setTitle('Leaderboard')

            for (let i = 0; i < Users.length; i++) {
                LeaderboardUsers += `**${ordinalSuffix(i + 1)}**. <@!${Users[i].id}> - **Score:** ${Users[i].count}\n`;
            }

            Leaderboard.setDescription(LeaderboardUsers);

            return message.reply({ embeds: [Leaderboard] });
        }
    },
    slashExecute(interaction: CommandInteraction) {
        let GuildConfig: any = false;

        if (fs.existsSync(`./CountData/${interaction.guild?.id}`) && fs.existsSync(`./CountData/${interaction.guild?.id}/config.json`)) {
            GuildConfig = JSON.parse(fs.readFileSync(`./CountData/${interaction.guild?.id}/config.json`).toString());
        }

        if (!GuildConfig) {
            const NoConfig = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Leaderboard')
                .setDescription('This guild has not been setup yet!')
                .setFooter('Please run the setup command to setup this guild!');

            return interaction.reply({ embeds: [NoConfig] });
        }

        if (!fs.existsSync(`./CountData/${interaction.guild?.id}/users`)) {
            fs.mkdirSync(`./CountData/${interaction.guild?.id}/users`);
        }

        let Users: any = [];
        if (fs.readdirSync(`./CountData/${interaction.guild?.id}/users`).length > 0) {
            for (let file of fs.readdirSync(`./CountData/${interaction.guild?.id}/users`)) {
                if (file.endsWith('.json')) {
                    let User = JSON.parse(fs.readFileSync(`./CountData/${interaction.guild?.id}/users/${file}`).toString());
                    User.id = file.replace('.json', '');
                    Users.push(User);
                }
            }
        }

        if (Users.length === 0) {
            const NoUsers = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Leaderboard')
                .setDescription('No users have counted yet!')
                .setFooter('Please count in a counting channel!');

            return interaction.reply({ embeds: [NoUsers] });
        } else {
            Users.sort((a: any, b: any) => b.count - a.count);
            let LeaderboardUsers: any;

            const Leaderboard = new MessageEmbed()
                .setColor('#00ff00')
                .setTitle('Leaderboard')

            for (let i = 0; i < Users.length; i++) {
                LeaderboardUsers += `**${ordinalSuffix(i + 1)}**. <@!${Users[i].id}> - **Score:** ${Users[i].count}\n`;
            }

            Leaderboard.setDescription(LeaderboardUsers);

            return interaction.reply({ embeds: [Leaderboard] });
        }
    }
}