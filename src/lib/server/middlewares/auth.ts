import { redirect, type Handle } from '@sveltejs/kit';
import { Result } from 'neverthrow';

const PUBLIC_ROUTES = ['/auth', '/api/health'] as const;

/**
 * Checks if a pathname is a public route that doesn't require authentication
 */
const isPublicRoute = (pathname: string): boolean => {
	return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
};

export const auth: Handle = async ({ event, resolve }) => {
	// check boot.ts for the auth cookie
	if (!event.locals.auth && !isPublicRoute(event.url.pathname)) {
		redirect(303, '/auth/login');
	}

	if (event.locals.auth) {
		const user = await event.locals.services.user().getUserByToken(event.locals.auth);

		if (user.isErr() || !user.value) {
			event.locals.auth = undefined;

			if (!isPublicRoute(event.url.pathname)) {
				redirect(303, '/auth/login');
			}

			return resolve(event);
		}

		event.locals.user = user.value;
	}
	//const user = await event.locals.services.user().getUserByToken(event.locals.auth);

	return resolve(event);
};
