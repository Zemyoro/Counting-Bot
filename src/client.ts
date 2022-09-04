import { ButtonInteraction, Client, ClientOptions, Collection } from 'discord.js';
import { Command } from './commands';
import 'dotenv/config';

export default class CB extends Client {
    commands: Collection<string, Command>;
    setup: Collection<string, Setup>;
    prefix: string;
    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.setup = new Collection();
        this.prefix = process.env.PREFIX || 'c!';
    }
}

export interface Setup {
    mode: 'normal' | 'channel',
    special?: any;
    execute: (interaction: ButtonInteraction, client: CB, data: Setup) => any;
}