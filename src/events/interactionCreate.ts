import { Interaction } from 'discord.js';
import { Event } from '.';

export const interactionCreate: Event = {
    name: 'interactionCreate',
    execute(_, client) {
        const interaction: Interaction = _[0];
        
        if (interaction.isChatInputCommand()) {

        } else if (interaction.isButton()) {
            const button = client.setup.get(interaction.message.id);
            if (!button) return interaction.reply({
                content: 'The bot may have restarted/crashed after this button was made',
                ephemeral: true
            });

            try {
                return button.execute(interaction, client, button);
            } catch(e) {
                console.log(e);
                return interaction.reply({
                    content: 'There was a problem executing that button. Please try again.',
                    ephemeral: true
                });
            }
        }
    }
}