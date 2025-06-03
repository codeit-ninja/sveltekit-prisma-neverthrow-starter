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
	create(
		userId: string,
		expiresAt: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	): ResultAsync<Token, TokenAlreadyExistsError | FailedToCreateTokenError> {
		return ResultAsync.fromPromise(
			this.prisma.token.create({
				data: {
					userId,
					token: crypto.randomUUID(),
					expiresAt
				}
			}),
			(error) => {
				if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
					// This case might be rare if 'token' is a UUID and primary key,
					// but good to handle if other unique constraints could be violated.
					return TOKEN_ALREADY_EXISTS;
				}

				return FAILED_TO_CREATE_TOKEN;
			}
		);
	}

	async get(token: string): Promise<ResultAsync<Token, TokenNotFoundError | TokenError>> {
		const tokenResult = await fromPromise(
			this.prisma.token.findUnique({ where: { token } }),
			(error) => error as PrismaClientKnownRequestError
		);

		if (tokenResult.isErr()) {
			if (tokenResult.error.code === 'P2025') {
				return err(TOKEN_NOT_FOUND);
			}

			return err(TOKEN_ERROR);
		}

		if (!tokenResult.value) {
			return err(TOKEN_NOT_FOUND);
		}

		if (tokenResult.value.expiresAt < new Date()) {
			await this.delete(token);
			return err(TOKEN_NOT_FOUND);
		}

		return ok(tokenResult.value);
	}

	async delete(token: string): Promise<ResultAsync<Token, TokenNotFoundError | TokenError>> {
		const tokenResult = await fromPromise(
			this.prisma.token.delete({ where: { token } }),
			(error) => error as PrismaClientKnownRequestError
		);

		if (tokenResult.isErr()) {
			if (tokenResult.error.code === 'P2025') {
				return err(TOKEN_NOT_FOUND);
			}

			return err(TOKEN_ERROR);
		}

		return ok(tokenResult.value);
	}
}
