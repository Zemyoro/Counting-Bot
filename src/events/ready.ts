import { Event } from '.';

export const ready: Event = {
    name: 'ready',
    execute(_, client) {
        console.log(`${client.user?.id} is ready!`);   
    }
}