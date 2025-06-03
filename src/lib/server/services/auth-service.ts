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

// ...existing code...
export class AuthService extends Service {
	login(
		email: string,
		password: string
	): ResultAsync<Token, UserNotFoundError | InvalidCredentialsError | FailedToCreateTokenError> {
		return fromPromise(this.prisma.user.findUniqueOrThrow({ where: { email } }), (_) => USER_NOT_FOUND)
			.andThen((user) => {
				return fromPromise(verify(user.password, password), () => INVALID_CREDENTIALS).andThen((isPasswordValid) => {
					if (!isPasswordValid) {
						return err(INVALID_CREDENTIALS);
					}

					return ok(user);
				});
			})
			.andThen((user) => {
				return this.services
					.token()
					.create(user.id)
					.mapErr(() => FAILED_TO_CREATE_TOKEN); // Map specific token creation error
			});
	}
}
