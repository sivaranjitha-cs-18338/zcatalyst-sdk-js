import * as authClient from '@zcatalyst/auth-client';

import pkg from '../package.json';
import { Authentication as NodeAuthentication, zcAuth as nodeZcAuth } from '../src/node';
import { Auth_Protocol } from '../src/utils/enums';
import { Authentication } from '../src/web';

describe('web and node authentication surfaces', () => {
	const realGetElementById = Document.prototype.getElementById;
	const realTop = window.top;

	beforeEach(() => {
		document.getElementById = realGetElementById.bind(
			document
		) as typeof document.getElementById;
		document.body.innerHTML = '<div id="signin-root"></div>';
		authClient.ConfigStore.clear();
		authClient.ConfigStore.set('ZAID', 'test-zaid');
		authClient.ConfigStore.set('PROJECT_ID', 'test-project');
		authClient.ConfigStore.set('IAM_DOMAIN', 'https://accounts.zohoportal.com');
		authClient.ConfigStore.set('INITIALIZED', 'true');
		authClient.ConfigStore.set('IS_APPSAIL', 'false');
		Object.defineProperty(window, 'self', { value: window, configurable: true });
		Object.defineProperty(window, 'top', { value: window, configurable: true });
	});

	afterEach(() => {
		Object.defineProperty(window, 'top', { value: realTop ?? window, configurable: true });
		jest.restoreAllMocks();
	});

	it('should initialize from credentials, restore OAuth protocol and expose popup constants', async () => {
		const getCredentialsSpy = jest.spyOn(authClient, 'getCredentials').mockResolvedValue();
		const getOAuthSpy = jest
			.spyOn(authClient, 'getOAuthTokenFromIDB')
			.mockResolvedValue({ token: 'oauth-token', exp: Date.now() + 60_000 });

		authClient.ConfigStore.set('AUTH_PROTOCOL', Auth_Protocol.ZcrfTokenProtocol);
		const auth = new Authentication();
		await auth.init();

		expect(getCredentialsSpy).toHaveBeenCalled();
		expect(getOAuthSpy).toHaveBeenCalled();
		expect(auth.authProtocol).toBe(Auth_Protocol.OAuthTokenProtocol);
		expect(auth.popupConstants.POPUP_MSG_AUTH_TOKEN).toBe('catalyst-auth-token');
		expect(auth.getComponentVersion()).toBe(pkg.version);
	});

	it('should sign in existing users by redirecting and render iframe auth for unauthenticated users', async () => {
		jest.spyOn(authClient, 'getCredentials').mockResolvedValue();
		const auth = new Authentication();
		const sendSpy = jest
			.spyOn(auth.requester, 'send')
			.mockResolvedValueOnce({ data: { status: 'success', data: { user_id: '123' } } } as any)
			.mockResolvedValueOnce({ data: { status: 'failure' } } as any)
			.mockResolvedValueOnce({ data: { status: 200, data: { public_signup: true } } } as any);

		await auth.signIn('signin-root', { redirectUrl: '/dashboard' });
		expect(window.location.href).toContain('signin-redirect?PROJECT_ID=test-zaid');
		expect(window.location.href).toContain(
			'service_url=http%3A%2F%2Flocalhost%3A3000%2Fdashboard'
		);

		await auth.signIn('signin-root', { serviceUrl: '/service' });
		const iframe = document.getElementById('iam_iframe') as HTMLIFrameElement;
		expect(iframe).not.toBeNull();
		expect(iframe.src).toContain('/accounts/p/test-zaid/signin?');
		expect(sendSpy).toHaveBeenCalledTimes(3);
	});

	it('should cover jwt sign-in helpers, sign-up and authentication checks', async () => {
		jest.spyOn(authClient, 'getCredentials').mockResolvedValue();
		const auth = new Authentication();
		const callback = jest.fn();
		const sendSpy = jest
			.spyOn(auth.requester, 'send')
			.mockResolvedValueOnce({ data: { status: 200, data: { signup: true } } } as any)
			.mockResolvedValueOnce({ data: { status: 'success', data: { user_id: '123' } } } as any)
			.mockResolvedValueOnce({ data: { status: 'failure' } } as any)
			.mockResolvedValueOnce({
				data: { status: 'success', data: { user_id: '123', org_id: 'org-1' } }
			} as any);

		auth.signinWithJwt(callback);
		expect(authClient.ConfigStore.get('AUTH_PROTOCOL')).toBe(Auth_Protocol.JwtTokenProtocol);

		const signUpResp = await auth.signUp({
			first_name: 'Ava',
			last_name: 'Stone',
			email_id: 'ava@example.com',
			redirect_url: '/verify'
		});
		expect(signUpResp).toEqual({ status: 200, data: { signup: true } });
		expect(sendSpy).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				method: 'POST',
				url: 'http://localhost:3000/__catalyst/test-project/auth/signup',
				data: expect.objectContaining({
					zaid: 'test-zaid',
					redirect_url: '/verify',
					user_details: expect.objectContaining({
						email_id: 'ava@example.com',
						last_name: 'Stone'
					})
				})
			})
		);

		await expect(auth.isUserAuthenticated()).resolves.toEqual({ user_id: '123' });
		await expect(auth.isUserAuthenticated()).resolves.toBe(false);
		await expect(auth.getProjectUserDetails('org-1')).resolves.toEqual({
			status: 'success',
			data: { user_id: '123', org_id: 'org-1' }
		});

		await auth.signOut('/signed-out');
		expect(window.location.replace).toHaveBeenCalledWith('/signed-out');
	});

	it('should delegate token generation and raw token revocation through the requester', async () => {
		jest.spyOn(authClient, 'getCredentials').mockResolvedValue();
		authClient.ConfigStore.set('AUTH_PROTOCOL', Auth_Protocol.ZcrfTokenProtocol);
		const auth = new Authentication();
		const sendSpy = jest
			.spyOn(auth.requester, 'send')
			.mockResolvedValueOnce({
				data: { data: { jwt_token: 'jwt-1', client_id: 'client-1', scopes: ['scope.one'] } }
			} as any)
			.mockResolvedValueOnce({
				data: { access_token: 'oauth-token', expires_in_sec: 7200 }
			} as any)
			.mockResolvedValueOnce({ data: {} } as any);

		await expect(auth.generateAuthToken('stratus')).resolves.toEqual({
			access_token: 'oauth-token',
			expires_in_sec: 7200
		});
		await expect(auth.revokeAccessToken('oauth-token')).resolves.toBeUndefined();
		expect(sendSpy).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				path: '/authentication/custom-token',
				qs: { feature: 'stratus' }
			})
		);
		expect(sendSpy).toHaveBeenNthCalledWith(
			3,
			expect.objectContaining({ path: '/accounts/op/test-zaid/oauth/v2/token/revoke' })
		);
	});

	it('should expose node helpers and guard against browser usage of the node entry point', async () => {
		const auth = new NodeAuthentication();
		const initResult = { name: 'app-1' };
		const appResult = { name: 'app-2' };
		(auth as any).authInstance = {
			init: jest.fn().mockReturnValue(initResult),
			app: jest.fn().mockReturnValue(appResult)
		};

		await expect(
			auth.init({ projectId: '1000', environment: 'Development' } as any, { appName: 'svc' })
		).resolves.toBe(initResult);
		await expect(auth.getApp('svc')).resolves.toBe(appResult);
		await expect((new NodeAuthentication() as any).getAuthInstance()).rejects.toThrow(
			'Browser environment detected'
		);
		expect(nodeZcAuth).toBeInstanceOf(NodeAuthentication);
	});
});
