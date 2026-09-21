import { CONSTANTS } from '@zcatalyst/utils';
import { EventEmitter } from 'events';

const {
	AUTH_HEADER,
	COOKIE_HEADER,
	CSRF_TOKEN_NAME,
	CREDENTIAL_HEADER,
	CREDENTIAL_TYPE,
	CREDENTIAL_USER,
	REQ_METHOD
} = CONSTANTS;

const ORIGINAL_ENV = { ...process.env };

type RequestMock = jest.Mock;

function loadCredentialModule() {
	let credentialModule: typeof import('../src/credential');
	jest.isolateModules(() => {
		credentialModule = require('../src/credential');
	});
	return credentialModule!;
}

function loadActualIndexModule() {
	return jest.requireActual('../src') as typeof import('../src');
}

function loadActualCredentialModule() {
	return jest.requireActual('../src/credential') as typeof import('../src/credential');
}

function mockCredentialDependencies({
	fileContents,
	fileError,
	requestMock
}: {
	fileContents?: string;
	fileError?: Error;
	requestMock?: RequestMock;
} = {}) {
	const readFileSync = jest.fn(() => {
		if (fileError) {
			throw fileError;
		}
		return fileContents;
	});

	jest.doMock('fs', () => ({ readFileSync }));
	jest.doMock('http', () => ({
		__esModule: true,
		default: { request: jest.fn() }
	}));
	jest.doMock('https', () => ({
		__esModule: true,
		default: { request: requestMock || jest.fn() }
	}));

	return { readFileSync };
}

function createRequestMock(payload: unknown, opts?: { statusCode?: number; headers?: object }) {
	return jest.fn((options, callback) => {
		const req = new EventEmitter() as EventEmitter & {
			write: jest.Mock;
			end: jest.Mock;
		};
		req.write = jest.fn();
		req.end = jest.fn(() => {
			const res = new EventEmitter() as EventEmitter & {
				headers: object;
				statusCode?: number;
			};

			res.headers = opts?.headers || {};
			res.statusCode = opts?.statusCode || 200;
			callback(res);
			const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
			res.emit('data', Buffer.from(body));
			res.emit('end');
		});
		return req;
	});
}

describe('credential module', () => {
	beforeEach(() => {
		jest.resetModules();
		process.env = { ...ORIGINAL_ENV };
	});

	afterAll(() => {
		process.env = ORIGINAL_ENV;
	});

	describe('AccessTokenCredential', () => {
		it('returns the access token payload and inherited defaults', async () => {
			const { AccessTokenCredential } = loadCredentialModule();
			const credential = new AccessTokenCredential({ accessToken: 'access-token' });

			await expect(credential.getToken()).resolves.toEqual({
				access_token: 'access-token'
			});
			expect(credential.getCurrentUser()).toBe(CREDENTIAL_USER.admin);
			expect(credential.getCurrentUserType()).toBe(CREDENTIAL_USER.admin);
			expect(credential.switchUser()).toBeNull();
		});

		it('throws a CatalystAuthError when access token is missing', () => {
			const { AccessTokenCredential } = loadCredentialModule();

			expect(() => new AccessTokenCredential({})).toThrow('Unable to get access_token');

			try {
				new AccessTokenCredential({});
			} catch (error: any) {
				expect(error.code).toBe('app/INVALID_CREDENTIAL');
				expect(error.value).toEqual({});
			}
		});
	});

	describe('TicketCredential', () => {
		it('returns the ticket payload', async () => {
			const { TicketCredential } = loadCredentialModule();
			const credential = new TicketCredential({ ticket: 'support-ticket' });

			await expect(credential.getToken()).resolves.toEqual({
				ticket: 'support-ticket'
			});
		});
	});

	describe('CookieCredential', () => {
		it('returns cookie and csrf header values', async () => {
			const { CookieCredential } = loadCredentialModule();
			const credential = new CookieCredential({
				cookie: `foo=bar; ${CSRF_TOKEN_NAME}=csrf%20token`
			});

			await expect(credential.getToken()).resolves.toEqual({
				cookie: `foo=bar; ${CSRF_TOKEN_NAME}=csrf%20token`,
				zcrf_header: 'zd_csrparam=csrf token'
			});
			await expect(credential.getToken()).resolves.toEqual({
				cookie: `foo=bar; ${CSRF_TOKEN_NAME}=csrf%20token`,
				zcrf_header: 'zd_csrparam=csrf token'
			});
		});
	});

	describe('RefreshTokenCredential', () => {
		it('requests an access token once and reuses the cached token', async () => {
			const requestMock = createRequestMock({
				access_token: 'fresh-token',
				expires_in: 60
			});
			mockCredentialDependencies({ requestMock });

			const { RefreshTokenCredential } = loadCredentialModule();
			const credential = new RefreshTokenCredential({
				client_id: 'client-id',
				client_secret: 'client-secret',
				refresh_token: 'refresh-token'
			});

			await expect(credential.getToken()).resolves.toEqual({
				access_token: 'fresh-token',
				expires_in: expect.any(Number)
			});
			await expect(credential.getToken()).resolves.toEqual({
				access_token: 'fresh-token',
				expires_in: expect.any(Number)
			});

			expect(requestMock).toHaveBeenCalledTimes(1);
			expect(requestMock).toHaveBeenCalledWith(
				expect.objectContaining({
					hostname: 'accounts.zoho.com',
					method: REQ_METHOD.post,
					path: '/oauth/v2/token?client_id=client-id&client_secret=client-secret&grant_type=refresh_token&refresh_token=refresh-token'
				}),
				expect.any(Function)
			);
			expect(requestMock.mock.calls[0][0]).toEqual(
				expect.objectContaining({
					headers: {
						'Content-Type': 'application/json'
					}
				})
			);
		});

		it('rejects when the token response contains an error', async () => {
			const requestMock = createRequestMock({ error: 'invalid_grant' });
			mockCredentialDependencies({ requestMock });

			const { RefreshTokenCredential } = loadCredentialModule();
			const credential = new RefreshTokenCredential({
				client_id: 'client-id',
				client_secret: 'client-secret',
				refresh_token: 'refresh-token'
			});

			await expect(credential.getToken()).rejects.toBe(
				'Error fetching access token: invalid_grant'
			);
		});

		it('rejects when the token response is missing mandatory fields', async () => {
			const requestMock = createRequestMock({ expires_in: 60 });
			mockCredentialDependencies({ requestMock });

			const { RefreshTokenCredential } = loadCredentialModule();
			const credential = new RefreshTokenCredential({
				client_id: 'client-id',
				client_secret: 'client-secret',
				refresh_token: 'refresh-token'
			});

			await expect(credential.getToken()).rejects.toContain(
				'Unexpected response while fetching access token'
			);
		});
	});

	describe('CatalystCredential', () => {
		const baseHeaders = {
			[CREDENTIAL_HEADER.admin_cred_type]: CREDENTIAL_TYPE.token,
			[CREDENTIAL_HEADER.admin_token]: 'admin-token',
			[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.user
		};

		it('returns admin credentials by default', async () => {
			const { CatalystCredential } = loadCredentialModule();
			const credential = new CatalystCredential({
				[CREDENTIAL_HEADER.admin_cred_type]: CREDENTIAL_TYPE.token,
				[CREDENTIAL_HEADER.admin_token]: 'admin-token',
				[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.admin
			});

			await expect(credential.getToken()).resolves.toEqual({
				access_token: 'admin-token'
			});
			expect(credential.getScope()).toBe(CREDENTIAL_USER.admin);
			expect(credential.getCurrentUser()).toBe(CREDENTIAL_USER.admin);
			expect(credential.getCurrentUserType()).toBe(CREDENTIAL_USER.admin);
		});

		it('supports explicit user token scope and user switching', async () => {
			const { CatalystCredential } = loadCredentialModule();
			const credential = new CatalystCredential(
				{
					...baseHeaders,
					[CREDENTIAL_HEADER.user_cred_type]: CREDENTIAL_TYPE.token,
					[CREDENTIAL_HEADER.user_token]: 'user-token'
				},
				CREDENTIAL_USER.user
			);

			await expect(credential.getToken()).resolves.toEqual({
				access_token: 'user-token'
			});
			expect(credential.switchUser(CREDENTIAL_USER.admin)).toBe(CREDENTIAL_USER.admin);
			await expect(credential.getToken()).resolves.toEqual({
				access_token: 'admin-token'
			});
			expect(credential.switchUser()).toBe(CREDENTIAL_USER.user);
		});

		it('supports user ticket credentials', async () => {
			const { CatalystCredential } = loadCredentialModule();
			const credential = new CatalystCredential(
				{
					...baseHeaders,
					[CREDENTIAL_HEADER.user_cred_type]: CREDENTIAL_TYPE.ticket,
					[CREDENTIAL_HEADER.user_token]: 'user-ticket'
				},
				CREDENTIAL_USER.user
			);

			await expect(credential.getToken()).resolves.toEqual({
				ticket: 'user-ticket'
			});
		});

		it('falls back to cookie-based user credentials', async () => {
			const { CatalystCredential } = loadCredentialModule();
			const credential = new CatalystCredential(
				{
					...baseHeaders,
					[CREDENTIAL_HEADER.cookie]: `foo=bar; ${CSRF_TOKEN_NAME}=csrf-token`
				},
				CREDENTIAL_USER.user
			);

			await expect(credential.getToken()).resolves.toEqual({
				cookie: `foo=bar; ${CSRF_TOKEN_NAME}=csrf-token`,
				zcrf_header: 'zd_csrparam=csrf-token'
			});
		});

		it('throws when user scope is requested for an admin-only user', () => {
			const { CatalystCredential } = loadCredentialModule();

			expect(
				() =>
					new CatalystCredential(
						{
							[CREDENTIAL_HEADER.admin_cred_type]: CREDENTIAL_TYPE.token,
							[CREDENTIAL_HEADER.admin_token]: 'secret-admin-token',
							[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.admin
						},
						CREDENTIAL_USER.user
					)
			).toThrow('User not authenticated');

			try {
				new CatalystCredential(
					{
						[CREDENTIAL_HEADER.admin_cred_type]: CREDENTIAL_TYPE.token,
						[CREDENTIAL_HEADER.admin_token]: 'secret-admin-token',
						[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.admin
					},
					CREDENTIAL_USER.user
				);
			} catch (error: any) {
				expect(error.value).toEqual({
					[CREDENTIAL_HEADER.admin_cred_type]: CREDENTIAL_TYPE.token,
					[CREDENTIAL_HEADER.admin_token]: '[REDACTED]',
					[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.admin
				});
			}
		});

		it('throws when user scope is missing both token and cookie', () => {
			const { CatalystCredential } = loadCredentialModule();

			expect(
				() =>
					new CatalystCredential(
						{
							...baseHeaders
						},
						CREDENTIAL_USER.user
					)
			).toThrow('missing user credentials');
		});

		it('throws when admin credential type is unknown', () => {
			const { CatalystCredential } = loadCredentialModule();

			expect(
				() =>
					new CatalystCredential({
						[CREDENTIAL_HEADER.admin_cred_type]: 'cookie',
						[CREDENTIAL_HEADER.admin_token]: 'secret-admin-token',
						[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.admin
					})
			).toThrow('admin credential type is unknown');
		});

		it('throws when switching to a user credential that is not initialised', async () => {
			const { CatalystCredential } = loadCredentialModule();
			const credential = new CatalystCredential({
				[CREDENTIAL_HEADER.admin_cred_type]: CREDENTIAL_TYPE.token,
				[CREDENTIAL_HEADER.admin_token]: 'admin-token',
				[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.admin
			});

			credential.switchUser(CREDENTIAL_USER.user);
			await expect(credential.getToken()).rejects.toThrow(
				'User Credential is not initialised'
			);
		});

		it('throws when switched to an unrecognised scope', async () => {
			const { CatalystCredential } = loadCredentialModule();
			const credential = new CatalystCredential({
				[CREDENTIAL_HEADER.admin_cred_type]: CREDENTIAL_TYPE.token,
				[CREDENTIAL_HEADER.admin_token]: 'admin-token',
				[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.admin
			});

			credential.switchUser('guest');
			await expect(credential.getToken()).rejects.toThrow('user provided is not recognized');
		});
	});

	describe('ApplicationDefaultCredential', () => {
		it('loads access tokens from the credential file', async () => {
			mockCredentialDependencies({
				fileContents: JSON.stringify({ access_token: 'file-token' })
			});

			const { ApplicationDefaultCredential } = loadCredentialModule();
			const credential = new ApplicationDefaultCredential();

			await expect(credential.getToken()).resolves.toEqual({
				access_token: 'file-token'
			});
		});

		it('falls back to environment refresh token credentials when the file is absent', async () => {
			const requestMock = createRequestMock({
				access_token: 'env-access-token',
				expires_in: 60
			});
			mockCredentialDependencies({
				fileError: new Error('ENOENT'),
				requestMock
			});
			process.env.CLIENT_ID = 'env-client-id';
			process.env.CLIENT_SECRET = 'env-client-secret';
			process.env.REFRESH_TOKEN = 'env-refresh-token';

			const { ApplicationDefaultCredential } = loadCredentialModule();
			const credential = new ApplicationDefaultCredential();

			await expect(credential.getToken()).resolves.toEqual({
				access_token: 'env-access-token',
				expires_in: expect.any(Number)
			});
			expect(requestMock).toHaveBeenCalledTimes(1);
		});

		it('throws a parse error when the credential file is invalid json', () => {
			mockCredentialDependencies({
				fileContents: '{bad-json'
			});

			const { ApplicationDefaultCredential } = loadCredentialModule();

			expect(() => new ApplicationDefaultCredential()).toThrow('Failed to parse token file');
		});

		it('throws when neither file nor env provide valid credentials', () => {
			mockCredentialDependencies({
				fileError: new Error('ENOENT')
			});
			delete process.env.CLIENT_ID;
			delete process.env.CLIENT_SECRET;
			delete process.env.REFRESH_TOKEN;

			const { ApplicationDefaultCredential } = loadCredentialModule();

			expect(() => new ApplicationDefaultCredential()).toThrow(
				'Failed to get the credential string from env variables'
			);
		});

		it('throws when the credential file contains an unsupported token shape', () => {
			mockCredentialDependencies({
				fileContents: JSON.stringify({ unsupported: true })
			});

			const { ApplicationDefaultCredential } = loadCredentialModule();

			expect(() => new ApplicationDefaultCredential()).toThrow(
				'The given token object does not contain proper credentials'
			);
		});
	});

	describe('ApplicationCustomCredential', () => {
		it('wraps access, ticket and refresh token payloads', async () => {
			const requestMock = createRequestMock({
				access_token: 'refreshed-token',
				expires_in: 60
			});
			mockCredentialDependencies({ requestMock });
			const {
				ApplicationCustomCredential,
				AccessTokenCredential,
				TicketCredential,
				RefreshTokenCredential
			} = loadCredentialModule();

			const accessCredential = new ApplicationCustomCredential({
				access_token: 'custom-access-token'
			});
			const ticketCredential = new ApplicationCustomCredential({ ticket: 'custom-ticket' });
			const refreshCredential = new ApplicationCustomCredential({
				client_id: 'client-id',
				client_secret: 'client-secret',
				refresh_token: 'refresh-token'
			});

			expect(accessCredential.credential).toBeInstanceOf(AccessTokenCredential);
			expect(ticketCredential.credential).toBeInstanceOf(TicketCredential);
			expect(refreshCredential.credential).toBeInstanceOf(RefreshTokenCredential);
			await expect(accessCredential.getToken()).resolves.toEqual({
				access_token: 'custom-access-token'
			});
			await expect(ticketCredential.getToken()).resolves.toEqual({
				ticket: 'custom-ticket'
			});
			await expect(refreshCredential.getToken()).resolves.toEqual({
				access_token: 'refreshed-token',
				expires_in: expect.any(Number)
			});
		});

		it('throws for null or unsupported custom credentials', () => {
			const { ApplicationCustomCredential } = loadCredentialModule();

			expect(() => new ApplicationCustomCredential(undefined)).toThrow(
				'Unable to get token object from path or env'
			);
			expect(() => new ApplicationCustomCredential({ cookie: 'value' } as any)).toThrow(
				'The given token object does not contain proper credentials'
			);
		});
	});

	describe('CatalystApp actual credential branches', () => {
		it('adds cookie and csrf headers for cookie-based credentials', async () => {
			const { CatalystApp } = loadActualIndexModule();
			const { CatalystCredential } = loadActualCredentialModule();
			const credential = new CatalystCredential(
				{
					[CREDENTIAL_HEADER.admin_cred_type]: CREDENTIAL_TYPE.token,
					[CREDENTIAL_HEADER.admin_token]: 'admin-token',
					[CREDENTIAL_HEADER.user]: CREDENTIAL_USER.user,
					[CREDENTIAL_HEADER.cookie]: `foo=bar; ${CSRF_TOKEN_NAME}=csrf-token`
				},
				CREDENTIAL_USER.user
			);
			const app = new CatalystApp({
				projectId: 'project-id',
				credential
			} as any);
			const request = { headers: { existing: 'header' } as Record<string, string> };

			await app.authenticateRequest(request);

			expect(request.headers).toEqual({
				existing: 'header',
				[COOKIE_HEADER]: `foo=bar; ${CSRF_TOKEN_NAME}=csrf-token`,
				[CREDENTIAL_HEADER.zcsrf]: 'zd_csrparam=csrf-token'
			});
		});

		it('adds ticket auth headers for ticket credentials', async () => {
			const { CatalystApp, TicketCredential } = loadActualIndexModule();
			const app = new CatalystApp({
				projectId: 'project-id',
				credential: new TicketCredential({ ticket: 'ticket-value' })
			} as any);
			const request = { headers: {} as Record<string, string> };

			await app.authenticateRequest(request);

			expect(request.headers[AUTH_HEADER]).toBe('Zoho-ticket ticket-value');
		});

		it('adds oauth headers for refresh token credentials', async () => {
			const requestMock = createRequestMock({
				access_token: 'oauth-token',
				expires_in: 60
			});
			mockCredentialDependencies({ requestMock });

			const { CatalystApp, RefreshTokenCredential } = loadActualIndexModule();
			const app = new CatalystApp({
				projectId: 'project-id',
				credential: new RefreshTokenCredential({
					client_id: 'client-id',
					client_secret: 'client-secret',
					refresh_token: 'refresh-token'
				})
			} as any);
			const request = {} as Record<string, any>;

			await app.authenticateRequest(request);

			expect(request.headers[AUTH_HEADER]).toBe('Zoho-oauthtoken oauth-token');
		});
	});
});
