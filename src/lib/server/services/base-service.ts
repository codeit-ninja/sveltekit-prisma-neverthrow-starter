import prisma from '$lib/prisma';
import type { Services } from '.';

export class Service {
	constructor(
		readonly services: Services,
		readonly locals: App.Locals
	) {}

	get prisma() {
		return prisma;
	}
}
