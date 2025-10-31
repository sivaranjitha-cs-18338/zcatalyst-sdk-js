import { ConfigStore, getCredentials } from '@zcatalyst/auth-client';
import { Handler, IRequestConfig, RequestType, ResponseType } from '@zcatalyst/transport';
import { CatalystService, CONSTANTS, isValidUrl } from '@zcatalyst/utils';

import { AUTH_ERROR_MSG, AUTH_STATIC_FILES, UM_PROPERTY, URL_DIVIDER } from './utils/constants';
import { Auth_Protocol } from './utils/enums';
import { CatalystAuthenticationError } from './utils/error';
import { wrapCheck } from './utils/functions';
import {
	BodyData,
	ICatalystAuthResponse,
	ICatalystSignInConfig,
	UserDataOptions,
	UserDetails
} from './utils/interface';
import { applyQueryString, hasSuffInfo } from './utils/validators';

const { CREDENTIAL_USER, REQ_METHOD, COMPONENT } = CONSTANTS;

export class Authentication {
	requester: Handler;
	zaid: string = ConfigStore.get('projectConfig.userInfo.credentials.zaid') as string;
	projectId: string = ConfigStore.get('projectConfig.userInfo.credentials.projectId') as string;
	currentPort: string = ConfigStore.get('projectConfig.currentClientPagePort') as string;
	currentHost: string = ConfigStore.get('projectConfig.currentClientPageHost') as string;
	currentProtocol: string = ConfigStore.get('projectConfig.currentClientPageProtocol') as string;
	JWT_TOKEN_KEY = ConfigStore.get('projectConfig.userInfo.jwtAuth.cookieTokenKey');
	authProtocol: Auth_Protocol = ConfigStore.get(
		'projectConfig.serviceInfo.authProtocol'
	) as Auth_Protocol;
	isAppsail: string = ConfigStore.get('projectConfig.serviceInfo.isAppsail') as string;
	constructor(app?: unknown) {
		this.requester = new Handler(app, this);
		this.signIn = this.signIn.bind(this);
		getCredentials();
		this.signOut = this.signOut.bind(this);
		this.isUserAuthenticated = this.isUserAuthenticated.bind(this);
	}

	/**
	 * Retrieves the name of the current component.
	 * @returns The name of the user management component.
	 */
	getComponentName(): string {
		return COMPONENT.user_management;
	}

	/**
	 * @param id -> Dom elements id in which the login iframe should be loaded
	 * @param config -> signInConfig
	 */
	async signIn(id: string, config: ICatalystSignInConfig = {}): Promise<void> {
		try {
			const isValidUser = await this.#isValidUser();
			if (isValidUser) {
				window.location.href = this.#constructRedirectUrl(
					config.redirectUrl ?? config.serviceUrl ?? ''
				);
			} else {
				await this.#notSignedIn(id, config);
			}
		} catch (err) {
			await this.#notSignedIn(id, config);
		}
	}

	async publicSignup(): Promise<ICatalystAuthResponse> {
		const appDomain = `${location.protocol}//${location.host}`;
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			url:
				appDomain +
				`/${URL_DIVIDER.RESERVED_URL}/${URL_DIVIDER.AUTH}/${URL_DIVIDER.PUBLIC_SIGNUP}`,
			type: RequestType.JSON,
			expecting: ResponseType.JSON, // text
			service: CatalystService.EXTERNAL
		};
		const resp = await this.requester.send(request);
		return resp.data;
	}

	//Normal styling for iframe
	#styleIFrame(iframe: HTMLIFrameElement): void {
		iframe.style.height = '100%';
		iframe.style.width = '100%';
		iframe.style.border = 'none';
	}

	#createIframeAndAttach(id: string, url: string) {
		const target: HTMLElement = document.getElementById(id) as HTMLElement;
		if (target === null) {
			throw new CatalystAuthenticationError(
				'AUTHENTICATION_ERROR',
				`Unable to get element with id : ${id}`
			); // TODO: throwing error here is crt
		} else {
			const iframe: HTMLIFrameElement = document.createElement('iframe');
			iframe.src = url;
			iframe.id = 'iam_iframe';
			this.#styleIFrame(iframe);
			target.innerHTML = '';
			target.appendChild(iframe);
			return iframe;
		}
	}

	#constructIAMIframeUrl(config: ICatalystSignInConfig, isPublicSignupEnabled: boolean) {
		const signInProvidersOnly = config.signInProvidersOnly;
		const hideForgotPassword = signInProvidersOnly ? true : false;
		const cssUrl: string =
			config.cssUrl ||
			applyQueryString(AUTH_STATIC_FILES.URL, {
				file_name: config.signInProvidersOnly
					? AUTH_STATIC_FILES.SIGNIN_WITH_PROVIDERS_ONLY
					: AUTH_STATIC_FILES.SIGNIN
			});
		// service url availbel in params
		const redirectUrl = new URLSearchParams(window.location.search).get(
			'service_url'
		) as string;
		const serviceUrl = config.redirectUrl ?? config.serviceUrl ?? redirectUrl;
		const appDomain = `${location.protocol}//${location.host}`;
		const signInRedirect = encodeURIComponent(this.#constructRedirectUrl(serviceUrl));

		const recoveryUrl = `${appDomain}/accounts/p/70-${this.zaid}/password?servicename=ZohoCatalyst&&serviceurl=${signInRedirect}`;

		const urlParams: Record<string, string | boolean> = {
			css_url: cssUrl,
			portal: this.zaid,
			servicename: 'ZohoCatalyst',
			serviceurl: encodeURIComponent(this.#constructRedirectUrl(serviceUrl)),
			hide_signup: true,
			hide_fs: `${!isPublicSignupEnabled}`,
			dcc: true,
			hide_fp: `${hideForgotPassword}`,
			recoveryurl: encodeURIComponent(recoveryUrl)
		};

		const params = Object.keys(urlParams)
			.map((key) => `${key}=${urlParams[key]}`)
			.join('&');
		const baseDomain = `${appDomain}/accounts/p/${this.zaid}/signin?${params}`;
		return baseDomain;
	}

	async #errorMsgHandler() {
		this.#attachMutationObserver(Authentication.#getEmailInpErrorDiv(), this.#trackErrorMsgCnt);
	}

	async #trackErrorMsgCnt(mutationList: Array<MutationRecord>, observer: unknown) {
		for (const mutation of mutationList) {
			if (
				mutation.type === 'attributes' &&
				(mutation.target as HTMLElement).style.display === 'block'
			) {
				const errorDiv = Authentication.#getEmailInpErrorDiv() as HTMLElement;
				if (errorDiv.innerText.toLowerCase().includes(AUTH_ERROR_MSG.noAccountIncludes)) {
					errorDiv.innerText = AUTH_ERROR_MSG.noAccountMsg;
				}
			}
		}
	}

	static #getEmailInpErrorDiv() {
		const iframeElem = document.getElementById('iam_iframe') as HTMLIFrameElement;
		return iframeElem.contentDocument
			?.getElementById('login_id_container')
			?.querySelector('.fielderror');
	}

	#attachMutationObserver(
		elem?: Element | null,
		callbackFn?: (m: Array<MutationRecord>, o: unknown) => void,
		config = { attributes: true }
	) {
		if (callbackFn && elem) {
			// TODO: check this logic
			const observer = new MutationObserver(callbackFn);
			observer.observe(elem, config);
		}
	}

	async signOut(redirectURL = '/'): Promise<void> {
		if (this.authProtocol === Auth_Protocol.JwtTokenProtocol) {
			document.cookie = `${this.JWT_TOKEN_KEY}=; path=/; expires=${new Date().toUTCString()};`;
			document.cookie = `user_cred=; path=/; expires=${new Date().toUTCString()};`;
		} else {
			if (this.isAppsail === 'true') {
				const validUser = await this.#isValidUser();
				if (!validUser) {
					if (redirectURL.startsWith('/')) {
						redirectURL =
							this.currentPort != ''
								? `${this.currentProtocol}//${this.currentHost}:${this.currentPort}${redirectURL}`
								: `${this.currentProtocol}//${this.currentHost}${redirectURL}`;
					}
					window.location.href = redirectURL;
				}

				try {
					const request: IRequestConfig = {
						method: REQ_METHOD.get,
						url: this.#constructSignOutUrl(redirectURL),
						external: true
					};
					await this.requester.send(request);
					document.cookie = `CAUTH=; path=/accounts; expires=${new Date().toUTCString()};`;
					window.location.href = redirectURL;
				} catch (err) {
					window.location.href = this.#constructSignOutUrl(redirectURL);
				}
			} else {
				window.location.href = this.#constructSignOutUrl(redirectURL);
			}
		}
	}

	#constructSignOutUrl(redirectURL: string): string {
		if (redirectURL.startsWith('/')) {
			redirectURL =
				this.currentPort != ''
					? `${this.currentProtocol}/
					/${this.currentHost}:${this.currentPort}${redirectURL}`
					: `${this.currentProtocol}//${this.currentHost}${redirectURL}`;
		}
		return `/accounts/p/${this.zaid}/logout?servicename=ZohoCatalyst&serviceurl=${redirectURL}`;
	}

	async #notSignedIn(
		id: string,
		config: ICatalystSignInConfig
	): Promise<{ status?: number; content?: string }> {
		// Start the asynchronous operation
		const publicSignupResp: ICatalystAuthResponse = await this.publicSignup();
		const isPublicSignupEnabled = publicSignupResp.data?.public_signup as boolean;

		const signinIframe = this.#createIframeAndAttach(
			id,
			this.#constructIAMIframeUrl(config, isPublicSignupEnabled)
		);

		if (signinIframe) {
			signinIframe.onload = () => {
				const iframeElem = document.getElementById(
					'iam_iframe'
				) as HTMLIFrameElement | null;
				if (!iframeElem) return; // Ensure iframeElem exists

				const iframeDoc = iframeElem.contentWindow?.document;
				if (!iframeDoc) return; // Ensure iframeDoc exists

				const loginInpElem = iframeDoc.getElementById(
					'login_id'
				) as HTMLInputElement | null;
				if (loginInpElem) {
					loginInpElem.placeholder = AUTH_ERROR_MSG.emptyEmailAddress;
				}

				// Override values in I18N and error message handling
				this.#overrideValuesInI18N(iframeElem);
				this.#errorMsgHandler();

				if (config.signInProvidersOnly) {
					const fieldcontainer = iframeDoc.querySelector(
						'.fieldcontainer'
					) as HTMLElement | null;
					const signinContainer = iframeDoc.querySelector(
						'.signin_container'
					) as HTMLElement | null;
					const signinBox = iframeDoc.querySelector('.signin_box') as HTMLElement | null;

					if (fieldcontainer && signinContainer && signinBox) {
						fieldcontainer.style.display = 'none';
						signinContainer.style.minHeight = '320px';
						signinBox.style.minHeight = '320px';

						if (!iframeDoc.querySelector('.fed_2show')) {
							const divElem = document.createElement('div');
							divElem.innerText = 'No Social Logins available';
							fieldcontainer?.parentElement?.parentElement?.appendChild(divElem);
						}
					}
				}

				// Forgot password handler
				const forgotPasswordElem = iframeDoc.getElementById('forgotpassword');
				if (forgotPasswordElem) {
					const originalForgotPwd = forgotPasswordElem.querySelector(
						'a'
					) as HTMLElement | null;
					if (originalForgotPwd) {
						originalForgotPwd.onclick = () =>
							this.#forgotPasswordClickHandle(id, config);
					}

					const blueForgotPwd = iframeDoc.querySelectorAll(
						'#blueforgotpassword'
					) as NodeListOf<HTMLElement>;
					blueForgotPwd.forEach((btn) => {
						btn.onclick = () => this.#forgotPasswordClickHandle(id, config);
					});
				}

				// Resolve the promise with the status and content
				return { status: 200, content: 'success' }; // check is it resolvable resolve({})
			};
		}
		return {};
	}

	#overrideValuesInI18N(iframe: HTMLIFrameElement) {
		if (iframe.contentWindow?.I18N) {
			const IAMi18nData = (iframe.contentWindow?.I18N as { data?: Record<string, unknown> })
				?.data;
			if (IAMi18nData) {
				IAMi18nData['IAM.PHONE.ENTER.VALID.MOBILE_NUMBER'] =
					AUTH_ERROR_MSG.emptyEmailAddress;
				IAMi18nData['IAM.NEW.SIGNIN.ENTER.EMAIL.OR.MOBILE'] =
					AUTH_ERROR_MSG.emptyEmailAddress;
			}
		}
	}

	#forgotPasswordClickHandle(id: string, config: ICatalystSignInConfig) {
		const forgotPwdIframe = this.#createIframeAndAttach(
			config.forgotPasswordId ?? id,
			this.#getIAMForgotPasswordURL(config)
		);
		if (forgotPwdIframe) {
			forgotPwdIframe.onload = () => {
				const iframeElem: HTMLIFrameElement = document.getElementById(
					'iam_iframe'
				) as HTMLIFrameElement;
				const iframeDoc = iframeElem.contentWindow?.document as Document;
				const loginInpElem: HTMLInputElement = iframeDoc?.getElementById(
					'login_id'
				) as HTMLInputElement;
				loginInpElem.placeholder = AUTH_ERROR_MSG.emptyEmailAddress;
				this.#overrideValuesInI18N(iframeElem);
			};
		}
	}

	#getIAMForgotPasswordURL(config: ICatalystSignInConfig): string {
		const iframeElem: HTMLIFrameElement = document.getElementById(
			'iam_iframe'
		) as HTMLIFrameElement;
		const iframeDoc = iframeElem.contentWindow?.document;
		const loginInpElem: HTMLInputElement = iframeDoc?.getElementById(
			'login_id'
		) as HTMLInputElement;
		const cssUrl = config.forgotPasswordCssUrl
			? config.forgotPasswordCssUrl
			: applyQueryString(AUTH_STATIC_FILES.URL, { file_name: AUTH_STATIC_FILES.FORGOT_PWD });
		const queryParams = {
			css_url: cssUrl,
			portal: this.zaid,
			servicename: 'ZohoCatalyst',
			serviceurl: `${location.protocol}//${location.host}/`,
			hide_signup: true,
			dcc: true,
			LOGIN_ID: loginInpElem.value.toString()
		};
		const url = applyQueryString(
			`${location.protocol}//${location.host}/accounts/p/${this.zaid}/password`,
			queryParams
		);
		return url;
	}

	public async signUp(body: BodyData): Promise<unknown> {
		await wrapCheck((): void => {
			hasSuffInfo(body, [UM_PROPERTY.LAST_NAME, UM_PROPERTY.EMAIL_ID]);
		});
		const data: UserDataOptions = {};
		data.zaid = this.zaid as string;
		data.platform = (
			body[UM_PROPERTY.PLATFORM] === undefined ? 'web' : body[UM_PROPERTY.PLATFORM]
		) as string;
		if (body[UM_PROPERTY.REDIRECT_URL] !== undefined) {
			data.redirect_url = body[UM_PROPERTY.REDIRECT_URL] as string;
		}
		const userDetails: UserDetails = {};
		userDetails.last_name = body[UM_PROPERTY.LAST_NAME] as string;
		userDetails.email_id = body[UM_PROPERTY.EMAIL_ID] as string;
		if (body[UM_PROPERTY.FIRST_NAME] !== undefined) {
			userDetails.first_name = body[UM_PROPERTY.FIRST_NAME] as string;
		}
		data.user_details = userDetails;
		const appDomain = `${location.protocol}//${location.host}`;
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			url: appDomain + `/__catalyst/${this.projectId}/auth/signup`,
			data: data as Record<string, unknown>,
			service: CatalystService.EXTERNAL
		};
		const response = await this.requester.send(request);
		return response.data;
	}

	public async isUserAuthenticated(org_id?: string): Promise<unknown> {
		const resp = await this.getProjectUserDetails(org_id);
		if (resp.status === 'success') {
			return resp.data;
		} else {
			return false;
		}
	}

	#constructRedirectUrl(redirectUrl: string): string {
		const baseRedirectUrl = `${location.protocol}//${location.host}/__catalyst/${this.projectId}/auth/signin-redirect?PROJECT_ID=${this.zaid}`;
		if (
			redirectUrl &&
			!redirectUrl.includes(window.location.origin) &&
			!isValidUrl(redirectUrl)
		) {
			redirectUrl = `${window.location.origin}${redirectUrl}`;
		}
		return redirectUrl ? `${baseRedirectUrl}&service_url=${redirectUrl}` : baseRedirectUrl;
	}

	async #isValidUser(org_id?: string): Promise<Boolean> {
		const response = await this.getProjectUserDetails(org_id);
		if (response.status === 'success') {
			return true;
		}
		return false;
	}

	async getProjectUserDetails(org_id?: string): Promise<Record<string, unknown>> {
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: '/project-user/current',
			qs: org_id
				? {
						org_id
					}
				: {},
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.user
		};
		const resp = await this.requester.send(request);
		return resp.data;
	}
}
export { UserManagement } from './user-management';

declare global {
	interface Window {
		I18N?: {
			data?: Record<string, unknown>;
		};
	}
}
