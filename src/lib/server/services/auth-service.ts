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
	/**
	 * Logs in a user with the provided email and password.
	 * If the user is not found, it returns a `UserNotFoundError`.
	 * If the password is invalid, it returns an `InvalidCredentialsError`.
	 * If the token creation fails, it returns a `FailedToCreateTokenError`.
	 *
	 * @param email - The email of the user to log in.
	 * @param password - The password of the user to log in.
	 * @returns A `ResultAsync` containing the created Token or an error if login fails.
	 */
	login(
		email: string,
		password: string
	): ResultAsync<Token, UserNotFoundError | InvalidCredentialsError | FailedToCreateTokenError> {
		return fromPromise(
			this.prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true, password: true } }),
			(_) => USER_NOT_FOUND
		)
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
					.mapErr(() => FAILED_TO_CREATE_TOKEN);
			});
	}
}
