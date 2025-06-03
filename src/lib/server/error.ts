export class ServerError extends Error {
	type: string;

	error: unknown;

	constructor(message: string, type: string, error: unknown) {
		super(message);

		this.type = type;
		this.error = error;
	}
}
