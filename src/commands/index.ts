import { CommandInteraction, Message } from 'discord.js';
import CB from '../client';

import { setup } from './setup';

export default [
    setup
] as Command[];

export interface Command {
    name: string; // Command name
    description: string; // Command purpose
    usage: string[]; // Basic command usage
    args?: boolean; // Arguments required
    data: any; // Slash command data
    execute: (message: Message, client: CB, args: string[]) => any;
    slashExecute: (interaction: CommandInteraction, client: CB) => any;
}