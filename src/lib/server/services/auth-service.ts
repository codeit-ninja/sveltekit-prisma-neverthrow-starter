import { err, fromPromise, ok, ResultAsync } from 'neverthrow';
import { Service } from './base-service';
import { verify } from 'argon2';
import type { Token } from '@prisma/client';
import type { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const USER_NOT_FOUND = {
	type: 'USER_NOT_FOUND' as const,
	message: 'User not found'
};

export const INVALID_CREDENTIALS = {
	type: 'INVALID_CREDENTIALS' as const,
	message: 'Invalid email or password'
};

export const FAILED_TO_CREATE_TOKEN = {
	type: 'FAILED_TO_CREATE_TOKEN' as const,
	message: 'Failed to create token'
};

export type UserNotFoundError = typeof USER_NOT_FOUND;
export type InvalidCredentialsError = typeof INVALID_CREDENTIALS;
export type FailedToCreateTokenError = typeof FAILED_TO_CREATE_TOKEN;

export class AuthService extends Service {
	async login(
		email: string,
		password: string
	): Promise<ResultAsync<Token, UserNotFoundError | InvalidCredentialsError | FailedToCreateTokenError>> {
		const user = await fromPromise(this.prisma.user.findUniqueOrThrow({ where: { email } }), (error) => error as PrismaClientKnownRequestError);

		if (user.isErr()) {
			return err(USER_NOT_FOUND);
		}

		if (!(await verify(user.value.password, password))) {
			return err(INVALID_CREDENTIALS);
		}

		const token = await this.services.token().create(user.value.id);

		if (token.isErr()) {
			return err(FAILED_TO_CREATE_TOKEN);
		}

		return ok(token.value);
	}
}
