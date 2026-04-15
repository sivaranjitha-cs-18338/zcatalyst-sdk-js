import { ICatalystAppConfig, ICatalystCredentials } from './utils/interface';

class Authentication {
	private authInstance: unknown;
	constructor() {
		// Will be initialized dynamically based on environment
	}

	private async getAuthInstance() {
		if (!this.authInstance) {
			if (typeof window === 'undefined') {
				// Node.js environment - use auth-admin
				const { ZCAuth } = await import('@zcatalyst/auth-admin');
				this.authInstance = new ZCAuth();
			} else {
				// Browser environment - this should not happen as browser variant should be used
				throw new Error(
					'Browser environment detected. Please use the browser variant of @zcatalyst/auth'
				);
			}
		}
		return this.authInstance;
	}

	async init(
		options: ICatalystAppConfig & ICatalystCredentials,
		config?: { type?: string; appName?: string; scope?: 'user' | 'admin' }
	): Promise<unknown> {
		const instance = await this.getAuthInstance();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (instance as any).init(
			options as unknown as Record<string, string | number>,
			config
		);
	}

	async getApp(name: string): Promise<unknown> {
		const instance = await this.getAuthInstance();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (instance as any).app(name);
	}
}

export { USER_STATUS, UserManagementAdmin as UserManagement } from './user-management';

export const zcAuth = new Authentication();
