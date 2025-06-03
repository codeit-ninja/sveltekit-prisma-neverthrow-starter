import type { Handle } from '@sveltejs/kit';
import { Services } from '../services';

export const boot: Handle = async ({ event, resolve }) => {
	event.locals.services = new Services(event.locals);

	return resolve(event);
};
