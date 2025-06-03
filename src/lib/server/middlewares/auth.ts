import { redirect, type Handle } from '@sveltejs/kit';
import { Result } from 'neverthrow';

const AUTH_COOKIE_ERROR = {
	name: 'AuthCookieError',
	message: 'Failed to parse auth cookie'
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth', '/api/health'] as const;

/**
 * Checks if a pathname is a public route that doesn't require authentication
 */
const isPublicRoute = (pathname: string): boolean => {
	return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
};

export const auth: Handle = async ({ event, resolve }) => {
	event.locals.auth = undefined;

	const authCookie = event.cookies.get('app:auth');

	if (authCookie) {
		const authResult = Result.fromThrowable(JSON.parse, () => AUTH_COOKIE_ERROR)(authCookie);

		if (authResult.isOk()) {
			event.locals.auth = authResult.value;
		}
	}

	if (!event.locals.auth && !isPublicRoute(event.url.pathname)) {
		redirect(303, '/auth/login');
	}

	return resolve(event);
};
