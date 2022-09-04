import CB from '../client';

import { messageCreate } from './messageCreate';
import { interactionCreate } from './interactionCreate';
import { ready } from './ready';

export default [
    messageCreate,
    interactionCreate,
    ready
] as Event[];

export interface Event {
    name: string;
    execute: (_: any[], client: CB) => any;
}