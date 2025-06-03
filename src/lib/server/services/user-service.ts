import type { Prisma, User } from '@prisma/client';
import { Service } from './base-service';
import { err, fromPromise, ok, ResultAsync } from 'neverthrow';
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
	getUserByEmail(email: string, include?: Prisma.UserInclude) {
		return fromPromise(
			this.prisma.user.findUniqueOrThrow({
				where: { email },
				include: {
					profile: true,
					...include
				}
			}),
			(error) => {
				if (isObject(error) && 'code' in error && error.code === 'P2025') {
					return USER_NOT_FOUND;
				}

				return USER_ERROR;
			}
		).andThen((user) => {
			if (!user) {
				return err(USER_NOT_FOUND);
			}
			return ok(user);
		});
	}

	getUserByToken(token: string, include?: Prisma.UserInclude) {
		return fromPromise(
			this.prisma.user.findFirst({
				where: { token: { some: { token } } },
				include: {
					profile: true,
					...include
				}
			}),
			(error) => {
				if (isObject(error) && 'code' in error && error.code === 'P2025') {
					return USER_NOT_FOUND;
				}

				return USER_ERROR;
			}
		).andThen((user) => {
			if (!user) {
				return err(USER_NOT_FOUND);
			}

			return ok(user);
		});
	}
}
