import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
const prisma = new PrismaClient();

async function main() {
	// Create admin user
	await prisma.user.create({
		data: {
			email: 'richard@codeit.ninja',
			password: await hash('Creative12!@'),
			role: 'ADMIN'
		}
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();

		// @ts-ignore
		process.exit(1);
	});
