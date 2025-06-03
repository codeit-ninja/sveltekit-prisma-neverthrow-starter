import type { Prisma, User } from '@prisma/client';
import { Service } from './base-service';
import { err, ok, ResultAsync } from 'neverthrow';
import { isObject } from 'lodash-es';
import type { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

export const USER_NOT_FOUND = {
	type: 'USER_NOT_FOUND' as const,
	message: 'User not found'
};

export const USER_ERROR = {
	type: 'USER_ERROR' as const,
	message: 'An error occurred with the user service'
};

export type UserNotFoundError = typeof USER_NOT_FOUND;
export type UserError = typeof USER_ERROR;

export class UserService extends Service {
	async getUserByEmail(
		email: string,
		include?: Prisma.UserInclude
	): Promise<ResultAsync<User, UserNotFoundError | UserError>> {
		const defaultInclude: Prisma.UserInclude = {
			profile: true,
			token: true,
			...include
		};

		const userResult = await ResultAsync.fromPromise(
			this.prisma.user.findUniqueOrThrow({ where: { email }, include: defaultInclude }),
			(error) => error as PrismaClientKnownRequestError
		);

		if (userResult.isErr()) {
			if (userResult.error.code === 'P2025') {
				return err(USER_NOT_FOUND);
			}

			return err(USER_ERROR);
		}

		return ok(userResult.value);
	}
}
