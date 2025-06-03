import { AuthService } from './auth-service';
import { TokenService } from './token-service';
import { UserService } from './user-service';

export class Services {
	constructor(readonly locals: App.Locals) {}

	user() {
		return new UserService(this, this.locals);
	}

	auth() {
		return new AuthService(this, this.locals);
	}

	token() {
		return new TokenService(this, this.locals);
	}
}
