import { Handler, IRequestConfig, RequestType } from '@zcatalyst/transport';
import {
	CatalystService,
	Component,
	CONSTANTS,
	isNonEmptyObject,
	isNonEmptyString,
	isValidInputString,
	ObjectHasDeprecatedProperty,
	ObjectHasProperties,
	wrapValidatorsWithPromise
} from '@zcatalyst/utils';

import pkg from '../package.json';
const { version } = pkg;
import { CatalystUserManagementError } from './utils/error.js';
import {
	ICatalystCustomTokenDetails,
	ICatalystCustomTokenResponse,
	ICatalystNewUser,
	ICatalystSearchUserOpts,
	ICatalystSignupConfig,
	ICatalystSignupUserConfig,
	ICatalystSignupValidationReq,
	ICatalystUser,
	ICatalystUserPageOpts
} from './utils/interface.js';

const DEFAULT_PAGE_SIZE = 100;

const { CREDENTIAL_USER, REQ_METHOD, COMPONENT, REQUEST_TYPE, ADD_USER, REQUEST_DETAILS } =
	CONSTANTS;

function definedOnly(qs: Record<string, string | number | boolean | undefined>) {
	return Object.fromEntries(Object.entries(qs).filter(([, v]) => v !== undefined)) as Record<
		string,
		string | number | boolean
	>;
}

function validatePageOpts(opts: ICatalystUserPageOpts): void {
	const { offset, count } = opts ?? {};
	if (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) {
		throw new CatalystUserManagementError(
			'Invalid pagination options',
			`'offset' must be a non-negative integer`
		);
	}
	if (count !== undefined && (!Number.isInteger(count) || count <= 0)) {
		throw new CatalystUserManagementError(
			'Invalid pagination options',
			`'count' must be a positive integer`
		);
	}
}

export enum USER_STATUS {
	ENABLE = 'enable',
	DISABLE = 'disable'
}

/**
 * Provides user-scoped Catalyst user management operations such as current-user lookup and password reset.
 * @category User Management
 */
export class UserManagement implements Component {
	requester: Handler;
	/** Creates a user management client for the provided Catalyst app. */
	constructor(app?: unknown) {
		this.requester = new Handler(app, this);
	}

	/**
	 * Retrieves the name of the current component.
	 * @returns The name of the user management component.
	 * @category Component Info
	 */
	getComponentName(): string {
		return COMPONENT.user_management;
	}

	/** Retrieves the package version used by this component.
	 * @category Component Info
	 */
	getComponentVersion(): string {
		return version;
	}

	/**
	 * Retrieves the details of the currently logged-in user.
	 * @returns A promise that resolves to the details of the current user.
	 *
	 * @example
	 * const user = await userManagement.getCurrentUser();
	 * console.log(user.email);
	 * @category User Lookup
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
	 * @throws {CatalystUserManagementError} when the email or reset configuration is invalid.
	 *
	 * @example
	 * const resetConfig = {
	 *   platform_type: "web",
	 * };
	 * const message = await userManagement.resetPassword("user@example.com", resetConfig);
	 * console.log(message);
	 * @category Account Management
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

/**
 * Provides admin-scoped Catalyst user management operations for project users and organizations.
 * @category User Management
 */
export class UserManagementAdmin extends UserManagement {
	/** Creates an admin user management client for the provided Catalyst app. */
	constructor(app?: unknown) {
		super(app);
	}

	/**
	 * Get all users in a project
	 * @returns List of all users
	 * @example
	 * ```ts
	 * const users = await userManagement.getAllUsers();
	 * console.log(users);
	 * ```
	 * @category User Lookup
	 */
	async getAllUsers(): Promise<Array<ICatalystUser>>;
	/**
	 * Get all the users in an org associated with a project
	 * @param orgId - ID of the org to get the list of associated users.
	 * @returns List of all users in an org
	 * @example
	 * ```ts
	 * const users = await userManagement.getAllUsers('123456789');
	 * console.log(users);
	 * ```
	 */
	async getAllUsers(orgId: string): Promise<Array<ICatalystUser>>;
	/**
	 * Retrieves all project users, optionally limited to an associated organization.
	 *
	 * @param orgId - Optional organization ID used to filter users.
	 * @returns A promise that resolves to matching Catalyst users.
	 *
	 * @example
	 * ```ts
	 * const users = await userManagement.getAllUsers('123456789');
	 * ```
	 * @category User Lookup
	 */
	async getAllUsers(orgId?: string): Promise<Array<ICatalystUser>> {
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/project-user`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin,
			qs: orgId ? { org_id: orgId } : undefined
		};
		const resp = await this.requester.send(request);
		return resp.data.data as Array<ICatalystUser>;
	}

	/**
	 * Get a specific user's details
	 * @param id - ID of the user to get the details
	 * @returns Catalyst user details
	 * @throws {CatalystUserManagementError} when the user ID is invalid.
	 * @example
	 * ```ts
	 * const userDetails = await userManagement.getUserDetails('987654321');
	 * console.log(userDetails);
	 * ```
	 * @category User Lookup
	 */
	async getUserDetails(id: string): Promise<ICatalystUser> {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'user_id', true);
		}, CatalystUserManagementError);
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/project-user/${id}`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data as ICatalystUser;
	}

	/**
	 * Delete a user
	 * @param id - ID of the user to be deleted
	 * @returns `True` if user is deleted successfully
	 * @throws {CatalystUserManagementError} when the user ID is invalid.
	 * @example
	 * ```ts
	 * const isDeleted = await userManagement.deleteUser('987654321');
	 * console.log(isDeleted); // true
	 * ```
	 * @category Account Management
	 */
	async deleteUser(id: string): Promise<boolean> {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'user_id', true);
		}, CatalystUserManagementError);
		const request: IRequestConfig = {
			method: REQ_METHOD.delete,
			path: `/project-user/${id}`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		const json = resp.data;
		return json.data ? true : false;
	}

	/**
	 * Register a new User
	 * @param signupConfig - Meta data to register the user
	 * @param userDetails - Details of the user
	 * @returns Catalyst user details
	 * @throws {CatalystUserManagementError} when signupConfig or userDetails are invalid.
	 * @example
	 * ```ts
	 * const newUser = await userManagement.registerUser(
	 *   { platform_type: 'web' },
	 *   { email_id: 'test@example.com', role_id: '1234556' }
	 * );
	 * console.log(newUser);
	 * ```
	 * @category Registration
	 */
	async registerUser(
		signupConfig: ICatalystSignupConfig,
		userDetails: Omit<ICatalystSignupUserConfig, 'org_id'> & { role_id?: string }
	): Promise<ICatalystNewUser> {
		await wrapValidatorsWithPromise(() => {
			isNonEmptyObject(signupConfig, 'signupConfig', true);
			ObjectHasProperties(signupConfig, ['platform_type'], 'signupConfig', true);
			isNonEmptyObject(userDetails, 'userDetails', true);
			ObjectHasProperties(userDetails, ['first_name', 'email_id'], 'userDetails', true);
		}, CatalystUserManagementError);
		signupConfig.user_details = userDetails;
		const request: IRequestConfig = {
			method: REQ_METHOD.post,
			path: `/project-user`,
			data: signupConfig,
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data as ICatalystNewUser;
	}

	/**
	 * Get all the org_ids associated with a project
	 * @returns List of Org Ids
	 * @example
	 * ```ts
	 * const orgIds = await userManagement.getAllOrgs();
	 * console.log(orgIds);
	 * ```
	 * @category Organization
	 */
	async getAllOrgs(): Promise<Array<string>> {
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/project-user/orgs`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data as Array<string>;
	}

	/**
	 * Adds a user to a specific org.
	 *
	 * @param signupConfig - Meta data to add the user.
	 * @param userDetails - Details of the user.
	 * @returns Catalyst user details.
	 * @throws {CatalystUserManagementError} when signupConfig or userDetails are invalid.
	 *
	 * @example
	 * ```ts
	 * const user = await userManagement.addUserToOrg(
	 *   { platform_type: 'web' },
	 *   { email_id: 'user@example.com', org_id: '12345' }
	 * );
	 * console.log(user);
	 * ```
	 * @category Registration
	 */
	async addUserToOrg(
		signupConfig: ICatalystSignupConfig,
		userDetails: ICatalystSignupUserConfig
	): Promise<ICatalystNewUser> {
		await wrapValidatorsWithPromise(() => {
			isNonEmptyObject(signupConfig, 'signupConfig', true);
			ObjectHasProperties(signupConfig, ['platform_type'], 'signupConfig', true);
			isNonEmptyObject(userDetails, 'userDetails', true);
			ObjectHasDeprecatedProperty(userDetails, 'zaaid', 'org_id', true, true);
			ObjectHasProperties(
				userDetails,
				['first_name', 'email_id', 'org_id'],
				'userDetails',
				true
			);
		}, CatalystUserManagementError);
		signupConfig.user_details = userDetails;
		const request: IRequestConfig = {
			method: REQ_METHOD.post,
			path: `/project-user`,
			data: signupConfig,
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data as ICatalystNewUser;
	}

	/**
	 * Retrieves signup validation request from a given request object.
	 *
	 * @param bioReq - The request object containing arguments.
	 * @returns The parsed signup validation request or undefined.
	 * @throws {CatalystUserManagementError} when request details cannot be parsed as JSON.
	 *
	 * @example
	 * ```ts
	 * const request = userManagement.getSignupValidationRequest(bioReq);
	 * console.log(request);
	 * ```
	 * @category Registration
	 */
	getSignupValidationRequest(bioReq: {
		getArgument: (arg0: string) => unknown;
	}): ICatalystSignupValidationReq | undefined {
		if (bioReq.getArgument(REQUEST_TYPE) !== ADD_USER) {
			return;
		}
		const requestDetails = bioReq.getArgument(REQUEST_DETAILS);
		if (typeof requestDetails === 'object') {
			return requestDetails as ICatalystSignupValidationReq;
		}
		try {
			return JSON.parse(requestDetails as string) as ICatalystSignupValidationReq;
		} catch {
			throw new CatalystUserManagementError(
				'Invalid request details',
				`Unable to parse 'request_details' from basicio args`
			);
		}
	}

	/**
	 * Generates a custom authentication token.
	 *
	 * @param customTokenDetails - Details for generating the token.
	 * @returns The generated custom token.
	 * @throws {CatalystUserManagementError} when custom token details are empty or invalid.
	 *
	 * @example
	 * ```ts
	 * const token = await userManagement.generateCustomToken({ user_id: '12345' });
	 * console.log(token);
	 * ```
	 * @category Registration
	 */
	async generateCustomToken(
		customTokenDetails: ICatalystCustomTokenDetails
	): Promise<ICatalystCustomTokenResponse> {
		await wrapValidatorsWithPromise(() => {
			isNonEmptyObject(customTokenDetails, 'customTokenDetails', true);
		}, CatalystUserManagementError);
		const request: IRequestConfig = {
			method: REQ_METHOD.post,
			path: `/authentication/custom-token`,
			data: customTokenDetails,
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data as ICatalystCustomTokenResponse;
	}

	/**
	 * Enables or disables a user.
	 *
	 * @param id - ID of the user.
	 * @param userStatus - The state to be updated.
	 * @returns True if the state is changed.
	 * @throws {CatalystUserManagementError} when the user ID or status is invalid.
	 *
	 * @example
	 * ```ts
	 * const statusChanged = await userManagement.updateUserStatus('12345', USER_STATUS.ACTIVE);
	 * console.log(statusChanged);
	 * ```
	 * @category Account Management
	 */
	async updateUserStatus(id: string, userStatus: USER_STATUS): Promise<boolean> {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'user_id', true);
			isNonEmptyString(userStatus, 'userStatus', true);
		}, CatalystUserManagementError);
		const request: IRequestConfig = {
			method: REQ_METHOD.post,
			path: `/project-user/${id}/${userStatus}`,
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data ? true : false;
	}

	/**
	 * Updates user details.
	 *
	 * @param id - ID of the user to update.
	 * @param userDetails - Details to be updated.
	 * @returns Updated user details.
	 * @throws {CatalystUserManagementError} when the user ID or user details are invalid.
	 *
	 * @example
	 * ```ts
	 * const updatedUser = await userManagement.updateUserDetails('12345', { email_id: 'new@example.com', role_id: 'admin' });
	 * console.log(updatedUser);
	 * ```
	 * @category Account Management
	 */
	async updateUserDetails(
		id: string,
		userDetails: ICatalystSignupUserConfig & { role_id: string }
	): Promise<ICatalystUser> {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'user_id', true);
			isNonEmptyObject(userDetails, 'userDetails', true);
			ObjectHasDeprecatedProperty(userDetails, 'zaaid', 'org_id', true, true);
			ObjectHasProperties(userDetails, ['email_id'], 'userDetails', true);
		}, CatalystUserManagementError);
		const request: IRequestConfig = {
			method: REQ_METHOD.put,
			path: `/project-user/${id}`,
			data: userDetails,
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data as ICatalystUser;
	}

	/**
	 * Retrieves a single page of project users.
	 *
	 * @param opts - Pagination options (`offset`, `count`) and an optional `orgId`.
	 * @returns A promise that resolves to the users in the requested page.
	 * @throws {CatalystUserManagementError} when pagination options are invalid.
	 *
	 * @example
	 * ```ts
	 * const users = await userManagement.getPagedUsers({ offset: 0, count: 50 });
	 * ```
	 * @category User Lookup
	 */
	async getPagedUsers(
		opts: ICatalystUserPageOpts & { orgId?: string } = {}
	): Promise<Array<ICatalystUser>> {
		await wrapValidatorsWithPromise(() => {
			validatePageOpts(opts);
		}, CatalystUserManagementError);
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/project-user`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin,
			qs: definedOnly({ org_id: opts.orgId, offset: opts.offset, count: opts.count })
		};
		const resp = await this.requester.send(request);
		return resp.data.data as Array<ICatalystUser>;
	}

	/**
	 * Iterates over all project users, fetching them page by page.
	 *
	 * @param orgId - Optional organization ID used to filter users.
	 * @returns An async generator yielding users one by one.
	 *
	 * @example
	 * ```ts
	 * for await (const user of userManagement.getAllUsersIterable()) {
	 *   console.log(user.email_id);
	 * }
	 * ```
	 * @category User Lookup
	 */
	async *getAllUsersIterable(orgId?: string): AsyncGenerator<ICatalystUser, void> {
		let offset = 0;
		for (;;) {
			const page = await this.getPagedUsers({ offset, count: DEFAULT_PAGE_SIZE, orgId });
			if (!Array.isArray(page) || page.length === 0) {
				return;
			}
			yield* page;
			if (page.length < DEFAULT_PAGE_SIZE) {
				return;
			}
			offset += page.length;
		}
	}

	/**
	 * Searches users by email with optional pagination.
	 *
	 * @param email - Email (or part of it) to search for.
	 * @param opts - Pagination options.
	 * @returns A promise that resolves to the matching users.
	 * @throws {CatalystUserManagementError} when the email or pagination options are invalid.
	 *
	 * @example
	 * ```ts
	 * const users = await userManagement.searchUsers('@company.com', { offset: 0, count: 100 });
	 * ```
	 * @category User Lookup
	 */
	async searchUsers(
		email: string,
		opts: ICatalystUserPageOpts = {}
	): Promise<Array<ICatalystUser>> {
		await wrapValidatorsWithPromise(() => {
			isNonEmptyString(email, 'email', true);
			validatePageOpts(opts);
		}, CatalystUserManagementError);
		return this.#search({ ...opts, email });
	}

	/**
	 * Iterates over users matching the given search criteria, page by page.
	 *
	 * @param opts - Search criteria (`email`, `orgId`, `status`, `isConfirmed`, `firstName`, `lastName`, `roleName`).
	 * @returns An async generator yielding matching users one by one.
	 * @throws {CatalystUserManagementError} when the options are invalid.
	 *
	 * @example
	 * ```ts
	 * for await (const user of userManagement.searchUsersIterable({ email: '@company.com', status: 'ACTIVE' })) {
	 *   console.log(user.email_id);
	 * }
	 * ```
	 * @category User Lookup
	 */
	async *searchUsersIterable(opts: ICatalystSearchUserOpts): AsyncGenerator<ICatalystUser, void> {
		await wrapValidatorsWithPromise(() => {
			isNonEmptyObject(opts, 'opts', true);
			validatePageOpts(opts);
		}, CatalystUserManagementError);
		let offset = opts.offset ?? 0;
		const count = opts.count ?? DEFAULT_PAGE_SIZE;
		for (;;) {
			const page = await this.#search({ ...opts, offset, count });
			if (!Array.isArray(page) || page.length === 0) {
				return;
			}
			yield* page;
			if (page.length < count) {
				return;
			}
			offset += page.length;
		}
	}

	async #search(opts: ICatalystSearchUserOpts): Promise<Array<ICatalystUser>> {
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/project-user`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin,
			qs: definedOnly({
				org_id: opts.orgId,
				offset: opts.offset,
				count: opts.count,
				email_id: opts.email,
				status: opts.status,
				is_confirmed: opts.isConfirmed,
				first_name: opts.firstName,
				last_name: opts.lastName,
				role_name: opts.roleName
			})
		};
		const resp = await this.requester.send(request);
		return resp.data.data as Array<ICatalystUser>;
	}

	/**
	 * Re-sends the signup invitation to a user.
	 *
	 * @param email - Email ID of the user to re-invite.
	 * @param signupConfig - Signup configuration (`platform_type` is required).
	 * @returns A promise that resolves once the invitation is sent.
	 * @throws {CatalystUserManagementError} when the email or signup configuration is invalid.
	 *
	 * @example
	 * ```ts
	 * await userManagement.reinviteUser('user@example.com', { platform_type: 'web' });
	 * ```
	 * @category Registration
	 */
	async reinviteUser(email: string, signupConfig: ICatalystSignupConfig): Promise<void> {
		await wrapValidatorsWithPromise(() => {
			isNonEmptyString(email, 'email', true);
			isNonEmptyObject(signupConfig, 'signupConfig', true);
			ObjectHasProperties(signupConfig, ['platform_type'], 'signupConfig', true);
		}, CatalystUserManagementError);
		const request: IRequestConfig = {
			method: REQ_METHOD.post,
			path: `/project-user/reinvite`,
			data: { ...signupConfig, user_details: { email_id: email } },
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		await this.requester.send(request);
	}
}
