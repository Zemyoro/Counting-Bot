import { Client, Collection } from 'discord.js';
import * as Events from './events/Events';

import fs from 'fs';
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

export class Counting extends Client {
    config: typeof config = config;
    events: typeof Events = Events;
    commands: Collection<any, any> = new Collection();
    data: Collection<any, any> = new Collection();
}