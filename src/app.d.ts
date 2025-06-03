import type { Prisma } from '@prisma/client';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			services: import('$lib/server/services').Services;
			auth: string | undefined;
			user: Prisma.UserGetPayload<{ include: { profile: true }; omit: { password: true } }> | undefined;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: string;
				message: string;
				code?: string;
			};
		}
	}
}

export {};
