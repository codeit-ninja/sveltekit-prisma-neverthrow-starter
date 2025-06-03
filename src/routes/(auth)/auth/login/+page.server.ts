import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from './schema';
import { verify } from 'argon2';
import prisma from '$lib/prisma';
import { t } from '$lib/i18n/index.svelte';
import { redirect } from '@sveltejs/kit';

const INVALID_CREDENTIALS = {
	type: 'INVALID_CREDENTIALS' as const,
	message: 'Invalid credentials.'
};

const FAILED_TO_AUTHENTICATE = {
	type: 'FAILED_TO_AUTHENTICATE' as const,
	message: 'We could not authenticate you at this moment, try again.'
};

export const load = async () => {
	return {
		form: await superValidate(zod(loginSchema))
	};
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod(loginSchema));
		const user = await locals.services.user().getUserByEmail(form.data.email);

		if (!form.valid) {
			return message(form, { type: 'FORM_INVALID', message: 'Form validation failed' });
		}

		const tokenResult = await locals.services.auth().login(form.data.email, form.data.password);

		if (tokenResult.isErr()) {
			if (tokenResult.error.type === 'USER_NOT_FOUND' || tokenResult.error.type === 'INVALID_CREDENTIALS') {
				return message(form, INVALID_CREDENTIALS);
			}

			if (tokenResult.error.type === 'FAILED_TO_CREATE_TOKEN') {
				return message(form, FAILED_TO_AUTHENTICATE);
			}

			return message(form, FAILED_TO_AUTHENTICATE);
		}

		cookies.set('app:auth', tokenResult.value.token, {
			path: '/',
			expires: tokenResult.value.expiresAt
		});

		redirect(303, '/');
	}
};
