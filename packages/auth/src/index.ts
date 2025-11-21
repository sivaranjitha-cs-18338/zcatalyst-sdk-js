import { ZCAuth } from '@zcatalyst/auth-admin';

import { ICatalystAppConfig, ICatalystCredentials } from './utils/interface';

export class Authentication {
	authInstance = new ZCAuth();
	constructor() {}

	init(options: ICatalystAppConfig & ICatalystCredentials): unknown {
		return this.authInstance.init(options as unknown as Record<string, string | number>);
	}

	getApp(name: string): unknown {
		return this.authInstance.app(name);
	}
}

export { USER_STATUS, UserManagementAdmin as UserManagement } from './user-management';

export const zcAuth = new Authentication();
