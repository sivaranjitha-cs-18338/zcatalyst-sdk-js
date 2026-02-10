import { ZCAuth } from '@zcatalyst/auth-admin';

import { ICatalystAppConfig, ICatalystCredentials } from './utils/interface';

export class Authentication {
	authInstance = new ZCAuth();
	constructor() {}

	init(
		config: ICatalystAppConfig & ICatalystCredentials,
		options: { type?: string; appName?: string; scope?: 'admin' | 'user' }
	): unknown {
		return this.authInstance.init(
			config as unknown as Record<string, string | number>,
			options
		);
	}

	getApp(name: string): unknown {
		return this.authInstance.app(name);
	}
}

export { USER_STATUS, UserManagementAdmin as UserManagement } from './user-management';

export const zcAuth = new Authentication();
