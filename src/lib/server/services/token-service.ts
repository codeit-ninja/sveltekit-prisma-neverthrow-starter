import { err, fromPromise, ok, ResultAsync } from 'neverthrow';
import { Service } from './base-service';
import type { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { Token } from '@prisma/client';

export const TOKEN_ALREADY_EXISTS = {
	type: 'TOKEN_ALREADY_EXISTS' as const,
	message: 'Token already exists'
};

export const FAILED_TO_CREATE_TOKEN = {
	type: 'FAILED_TO_CREATE_TOKEN' as const,
	message: 'Failed to create token'
};

export const TOKEN_NOT_FOUND = {
	type: 'TOKEN_NOT_FOUND' as const,
	message: 'Token not found'
};

export const TOKEN_ERROR = {
	type: 'TOKEN_ERROR',
	message: 'An error occurred with the token service'
};

export type TokenAlreadyExistsError = typeof TOKEN_ALREADY_EXISTS;
export type FailedToCreateTokenError = typeof FAILED_TO_CREATE_TOKEN;
export type TokenNotFoundError = typeof TOKEN_NOT_FOUND;
export type TokenError = typeof TOKEN_ERROR;

export class TokenService extends Service {
	/**
	 * Creates a new token for a user.
	 * If a token already exists for the user, it returns a `TokenAlreadyExistsError`.
	 *
	 * @param userId - The ID of the user to create the token for.
	 * @param expiresAt - Optional expiration date for the token, defaults to 30 days from now.
	 * @returns A `ResultAsync` containing the created Token or an error if it already exists or creation fails.
	 */
	create(
		userId: string,
		expiresAt: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	): ResultAsync<Token, TokenAlreadyExistsError | FailedToCreateTokenError> {
		return fromPromise(
			this.prisma.token.create({
				data: {
					userId,
					token: crypto.randomUUID(),
					expiresAt
				}
			}),
			(error) => {
				if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
					return TOKEN_ALREADY_EXISTS;
				}

				return FAILED_TO_CREATE_TOKEN;
			}
		);
	}

	/**
	 * Retrieves a token by its value.
	 * If the token is expired, it will be deleted and an error will be returned.
	 *
	 * @param token - The token string to retrieve.
	 * @returns A `ResultAsync` containing the Token if found and valid, or an error if not found or expired.
	 */
	get(token: string): ResultAsync<Token, TokenNotFoundError | TokenError> {
		return fromPromise(this.prisma.token.findUnique({ where: { token } }), (error) => {
			if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
				return TOKEN_NOT_FOUND;
			}

			return TOKEN_ERROR;
		}).andThen((tokenResult) => {
			if (!tokenResult) {
				return err(TOKEN_NOT_FOUND);
			}

			if (tokenResult.expiresAt < new Date()) {
				return this.delete(token).andThen(() => err(TOKEN_NOT_FOUND));
			}
			return ok(tokenResult);
		});
	}

	/**
	 * Deletes a token by its value.
	 * If the token does not exist, it returns a `TokenNotFoundError`.
	 *
	 * @param token - The token string to delete.
	 * @returns A `ResultAsync` containing the deleted Token or an error if not found.
	 */
	delete(token: string): ResultAsync<Token, TokenNotFoundError | TokenError> {
		return fromPromise(this.prisma.token.delete({ where: { token } }), (error: unknown) => {
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				(error as PrismaClientKnownRequestError).code === 'P2025'
			) {
				return TOKEN_NOT_FOUND;
			}

			return TOKEN_ERROR;
		}).andThen((tokenResult) => {
			return ok(tokenResult);
		});
	}
}
