import { clearOAuthTokenFromIDB, ConfigStore, setOAuthTokenInIDB } from '@zcatalyst/auth-client';

import { PopupManager } from '../src/internal/popup-manager';
import { TokenManager } from '../src/internal/token-manager';
import {
	POPUP_MSG_AUTH_ERROR,
	POPUP_MSG_AUTH_TOKEN,
	POPUP_MSG_SIGNOUT_DONE,
	ZAID
} from '../src/utils/constants';
import { Auth_Protocol } from '../src/utils/enums';

describe('TokenManager and PopupManager', () => {
	const realGetElementById = Document.prototype.getElementById;
	const idbStore = new Map<string, unknown>();

	function setupIndexedDBMock() {
		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const req: any = {
					result: {
						objectStoreNames: { contains: () => true },
						createObjectStore: jest.fn(),
						close: jest.fn(),
						transaction: (_n: string, _m: string) => {
							const tx: any = {};
							const store = {
								get: (k: string) => {
									const r: any = {};
									queueMicrotask(() => {
										r.result = idbStore.get(k);
										r.onsuccess?.(new Event('success'));
										tx.oncomplete?.(new Event('complete'));
									});
									return r;
								},
								put: (v: unknown, k: string) => {
									const r: any = {};
									queueMicrotask(() => {
										idbStore.set(k, v);
										r.result = undefined;
										r.onsuccess?.(new Event('success'));
										tx.oncomplete?.(new Event('complete'));
									});
									return r;
								},
								delete: (k: string) => {
									const r: any = {};
									queueMicrotask(() => {
										idbStore.delete(k);
										r.result = undefined;
										r.onsuccess?.(new Event('success'));
										tx.oncomplete?.(new Event('complete'));
									});
									return r;
								}
							};
							return {
								objectStore: () => store,
								set oncomplete(h: unknown) {
									tx.oncomplete = h;
								},
								get oncomplete() {
									return tx.oncomplete;
								},
								set onerror(h: unknown) {
									tx.onerror = h;
								},
								get onerror() {
									return tx.onerror;
								},
								error: null
							};
						}
					}
				};
				queueMicrotask(() => req.onsuccess?.(new Event('success')));
				return req;
			})
		};
	}

	beforeEach(() => {
		document.getElementById = realGetElementById.bind(
			document
		) as typeof document.getElementById;
		ConfigStore.clear();
		ConfigStore.set(ZAID, 'test-zaid');
		ConfigStore.set('IAM_DOMAIN', 'https://accounts.zohoportal.com');
		ConfigStore.set('PROJECT_ID', 'project-1');
		idbStore.clear();
		setupIndexedDBMock();
	});

	describe('TokenManager', () => {
		it('should generate tokens, handle fallbacks, revoke stored tokens and finish sign-out', async () => {
			const send = jest
				.fn()
				.mockResolvedValueOnce({
					data: {
						data: { jwt_token: 'jwt-1', client_id: 'client-1', scopes: ['scope.one'] }
					}
				})
				.mockResolvedValueOnce({
					data: { access_toke: 'oauth-token', expires_in: 1800 }
				})
				.mockResolvedValueOnce({ data: {} });

			const tokenManager = new TokenManager({ send } as any, jest.fn());
			const generated = await tokenManager.generateAuthToken('functions');

			expect(generated).toEqual({ access_token: 'oauth-token', expires_in_sec: 1800 });
			expect(send).toHaveBeenNthCalledWith(
				1,
				expect.objectContaining({
					path: '/authentication/custom-token',
					qs: { feature: 'functions' }
				})
			);
			expect(send).toHaveBeenNthCalledWith(
				2,
				expect.objectContaining({
					path: '/clientoauth/v2/test-zaid/remote/auth',
					qs: expect.objectContaining({ client_id: 'client-1', jwt_token: 'jwt-1' })
				})
			);

			await setOAuthTokenInIDB('stored-oauth', Date.now() + 60_000);
			await tokenManager.revokeStoredAccessToken();
			expect(send).toHaveBeenNthCalledWith(
				3,
				expect.objectContaining({
					path: '/accounts/op/test-zaid/oauth/v2/token/revoke',
					qs: { token: 'stored-oauth' }
				})
			);

			await tokenManager.clearTokenStorage();
			await tokenManager.finishZcrfSignOut('/bye', '/accounts/logout');
			expect(window.location.replace).toHaveBeenCalledWith('/accounts/logout');
		});

		it('should reject invalid features and clear tokens when sign-out overlaps a write', async () => {
			const tokenManager = new TokenManager({ send: jest.fn() } as any, jest.fn());

			await expect(tokenManager.generateAuthToken('other' as 'functions')).rejects.toThrow(
				"'feature' must be either 'functions' or 'stratus'."
			);

			const pendingWrite = tokenManager.setTokenStorage('token-1', 60);
			await tokenManager.clearTokenStorage();
			await pendingWrite;

			expect(idbStore.size).toBe(0);
			expect(await clearOAuthTokenFromIDB()).toBeUndefined();
		});

		it('should fall back gracefully when stored revoke fails and use iframe redirect flow', async () => {
			const tokenManager = new TokenManager(
				{
					send: jest.fn().mockRejectedValue(new Error('network'))
				} as any,
				jest.fn()
			);
			await setOAuthTokenInIDB('stored-oauth', Date.now() + 60_000);
			Object.defineProperty(window, 'self', { value: window, configurable: true });
			Object.defineProperty(window, 'top', { value: {}, configurable: true });

			await expect(tokenManager.revokeStoredAccessToken()).resolves.toBeUndefined();
			await tokenManager.finishZcrfSignOut('/iframe-out', '/accounts/logout');

			expect(window.location.replace).toHaveBeenCalledWith('/iframe-out');
		});
	});

	describe('PopupManager', () => {
		function fakePopup(closed = false): Window {
			return { closed, close: jest.fn(), postMessage: jest.fn() } as unknown as Window;
		}

		it('should reject invalid tokens, auth errors, and post-auth failures', async () => {
			const protocolChange = jest.fn();
			const tokenManager = {
				setTokenStorage: jest.fn().mockResolvedValue(Date.now() + 60000),
				revokeStoredAccessToken: jest.fn(),
				clearTokenStorage: jest.fn(),
				onProtocolChange: jest.fn()
			} as unknown as TokenManager;
			const popupManager = new PopupManager(tokenManager, protocolChange);

			const popup1 = fakePopup();
			jest.spyOn(window, 'open').mockReturnValueOnce(popup1);
			const invalidTokenPromise = popupManager.signInViaPopup({ timeoutMs: 1000 });
			const authRequest = await waitForPopupEventId(popup1);
			window.dispatchEvent(
				new MessageEvent('message', {
					origin: window.location.origin,
					source: popup1,
					data: { type: POPUP_MSG_AUTH_TOKEN, eventId: authRequest, access_token: '' }
				})
			);
			await expect(invalidTokenPromise).rejects.toThrow('missing or malformed token');

			const popup2 = fakePopup();
			(window.open as jest.Mock).mockReturnValueOnce(popup2);
			const authErrorPromise = popupManager.signInViaPopup({ timeoutMs: 1000 });
			const authRequest2 = await waitForPopupEventId(popup2);
			window.dispatchEvent(
				new MessageEvent('message', {
					origin: window.location.origin,
					source: popup2,
					data: {
						type: POPUP_MSG_AUTH_ERROR,
						eventId: authRequest2,
						message: 'login failed'
					}
				})
			);
			await expect(authErrorPromise).rejects.toThrow('login failed');

			const popup3 = fakePopup();
			const failingTokenManager = {
				setTokenStorage: jest.fn().mockRejectedValue(new Error('idb failed')),
				revokeStoredAccessToken: jest.fn(),
				clearTokenStorage: jest.fn(),
				onProtocolChange: jest.fn()
			} as unknown as TokenManager;
			const failingPopupManager = new PopupManager(failingTokenManager, protocolChange);
			(window.open as jest.Mock).mockReturnValueOnce(popup3);
			const postAuthPromise = failingPopupManager.signInViaPopup({ timeoutMs: 1000 });
			const authRequest3 = await waitForPopupEventId(popup3);
			window.dispatchEvent(
				new MessageEvent('message', {
					origin: window.location.origin,
					source: popup3,
					data: {
						type: POPUP_MSG_AUTH_TOKEN,
						eventId: authRequest3,
						access_token: 'oauth-token',
						expires_in_sec: -10
					}
				})
			);
			await expect(postAuthPromise).rejects.toThrow('idb failed');
			expect(protocolChange).not.toHaveBeenCalled();
		});

		it('should use the Math.random fallback event id and finish sign-out without redirect', async () => {
			const protocolChange = jest.fn();
			const popup = fakePopup();
			const randomUUID = crypto.randomUUID;
			Object.defineProperty(globalThis, 'crypto', {
				value: { ...crypto, randomUUID: undefined },
				configurable: true
			});
			jest.spyOn(Math, 'random').mockReturnValue(0.25);
			jest.spyOn(window, 'open').mockReturnValueOnce(popup).mockReturnValueOnce(fakePopup());

			const tokenManager = {
				setTokenStorage: jest.fn().mockResolvedValue(Date.now() + 60000),
				revokeStoredAccessToken: jest.fn(),
				clearTokenStorage: jest.fn(),
				onProtocolChange: jest.fn()
			} as unknown as TokenManager;
			const popupManager = new PopupManager(tokenManager, protocolChange);

			const signInPromise = popupManager.signInViaPopup({ timeoutMs: 1000 });
			const eventId = await waitForPopupEventId(popup);
			expect(eventId).toMatch(/[0-9a-f-]{36}/);

			window.dispatchEvent(
				new MessageEvent('message', {
					origin: window.location.origin,
					source: popup,
					data: {
						type: POPUP_MSG_AUTH_TOKEN,
						eventId,
						access_token: 'oauth-token',
						expires_in_sec: 3600
					}
				})
			);
			const signInResult = await signInPromise;
			expect(signInResult.event_id).toBe(eventId);
			expect(protocolChange).toHaveBeenCalledWith(Auth_Protocol.OAuthTokenProtocol);

			const signOutPromise = popupManager.signOutViaPopup('');
			const signOutPopup = (window.open as jest.Mock).mock.results[1].value as Window;
			window.dispatchEvent(
				new MessageEvent('message', {
					origin: window.location.origin,
					source: signOutPopup,
					data: { type: POPUP_MSG_SIGNOUT_DONE }
				})
			);
			await expect(signOutPromise).resolves.toBeUndefined();
			expect(window.location.replace).not.toHaveBeenCalledWith('');

			Object.defineProperty(globalThis, 'crypto', {
				value: { ...crypto, randomUUID },
				configurable: true
			});
		});
	});

	async function waitForPopupEventId(popup: Window): Promise<string> {
		for (let i = 0; i < 20; i++) {
			const call = (popup.postMessage as jest.Mock).mock.calls[0];
			if (call?.[0]?.eventId) {
				return call[0].eventId as string;
			}
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
		throw new Error('popup event id was not sent');
	}
});
