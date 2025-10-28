import { Handler, IRequestConfig, RequestType } from '@zcatalyst/transport';
import {
	CatalystService,
	CONSTANTS,
	isNonEmptyObject,
	isNonEmptyString,
	ObjectHasProperties,
	wrapValidatorsWithPromise
} from '@zcatalyst/utils';

import { CatalystUserManagementError } from './utils/error';
import { ICatalystSignupConfig, ICatalystUser } from './utils/interface';

const { CREDENTIAL_USER, REQ_METHOD, COMPONENT, REQUEST_TYPE, ADD_USER, REQUEST_DETAILS } =
	CONSTANTS;

export class Authentication {
	requester: Handler;
	constructor(app?: unknown) {
		this.requester = new Handler(app, this);
	}

	/**
	 * Retrieves the name of the current component.
	 * @returns The name of the user management component.
	 */
	getComponentName(): string {
		return COMPONENT.user_management;
	}

	/**
	 * Retrieves the details of the currently logged-in user.
	 * @returns A promise that resolves to the details of the current user.
	 *
	 * @example
	 * const user = await userManagement.getCurrentUser();
	 * console.log(user.email);
	 */
	async getCurrentUser(): Promise<ICatalystUser> {
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/project-user/current`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.user
		};
		const resp = await this.requester.send(request);
		return resp.data.data as ICatalystUser;
	}

	/**
	 * Resets the password for a given user email.
	 * @param email - The email ID of the user requesting a password reset.
	 * @param resetConfig - Configuration object containing user metadata.
	 * @returns A promise that resolves to a confirmation message.
	 *
	 * @example
	 * const resetConfig = {
	 *   platform_type: "web",
	 * };
	 * const message = await userManagement.resetPassword("user@example.com", resetConfig);
	 * console.log(message);
	 */
	async resetPassword(email: string, resetConfig: ICatalystSignupConfig): Promise<string> {
		await wrapValidatorsWithPromise(() => {
			isNonEmptyObject(resetConfig, 'resetConfig', true);
			ObjectHasProperties(resetConfig, ['platform_type'], 'resetConfig', true);
			isNonEmptyString(email, 'email_id', true);
		}, CatalystUserManagementError);
		resetConfig.user_details = { email_id: email };
		const request: IRequestConfig = {
			method: REQ_METHOD.post,
			path: `/project-user/forgotpassword`,
			data: resetConfig,
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.user
		};
		const resp = await this.requester.send(request);
		return resp.data.data as string;
	}
}
export { UserManagement } from './user-management';
