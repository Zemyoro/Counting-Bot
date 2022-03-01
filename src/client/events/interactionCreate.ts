import { CommandInteraction } from "discord.js";
import { Counting } from "../Client";

export let interactionCreate = {
    name: 'interactionCreate',
    async execute(arg: any, client: Counting) {
        let interaction: CommandInteraction = arg[0];

        if (interaction.isButton()) {
            const button = client.data.get(interaction.message.id);
            if (!button) return;

            if (button.execute) {
                try {
                    await button.execute(interaction, client, button);
                } catch (e) {
                    console.log(e)
                    return interaction.reply({ content: 'There was an error with this button!', ephemeral: true })
                }
            } else {
                interaction.reply({ content: 'This button is improperly configured!', ephemeral: true });
            }
        } else if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (e) {
                console.log(e)
                return interaction.reply({ content: 'There was an error with this command!', ephemeral: true })
            }
        }
    }
}