import type { Handle } from '@sveltejs/kit';
import { Services } from '../services';
import { fromThrowable } from 'neverthrow';
import { env } from '$env/dynamic/public';

const AUTH_COOKIE_ERROR = {
	name: 'AuthCookieError',
	message: 'Failed to parse auth cookie'
} as const;

export const boot: Handle = async ({ event, resolve }) => {
	const authCookie = event.cookies.get(`${env.PUBLIC_COOKIE_PREFIX || 'app'}-auth`);

	if (authCookie) {
		event.locals.auth = authCookie;
	}

	event.locals.services = new Services(event.locals);

	return resolve(event);
};
