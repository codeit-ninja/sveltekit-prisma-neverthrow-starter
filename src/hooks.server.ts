import { auth } from '$lib/server/middlewares/auth';
import { boot } from '$lib/server/middlewares/boot';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(boot, auth);
