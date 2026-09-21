import { ConfigStore } from '../src/config-store';
import { IDB_DB_NAME, PROJECT_ID } from '../src/utils/constants';
import {
	clearOAuthTokenFromIDB,
	getOAuthTokenFromIDB,
	setOAuthTokenInIDB
} from '../src/utils/idb-token';

describe('idb token helpers', () => {
	const originalIndexedDb = (global as unknown as { indexedDB?: unknown }).indexedDB;

	beforeEach(() => {
		ConfigStore.clear();
		(global as unknown as { indexedDB?: unknown }).indexedDB = originalIndexedDb;
	});

	afterAll(() => {
		(global as unknown as { indexedDB?: unknown }).indexedDB = originalIndexedDb;
	});

	it('should reject when IndexedDB is unavailable', async () => {
		delete (global as unknown as { indexedDB?: unknown }).indexedDB;

		await expect(getOAuthTokenFromIDB()).rejects.toThrow(
			'IndexedDB is not available in this environment.'
		);
	});

	it('should create the token object store during upgrade when it is missing', async () => {
		const createObjectStore = jest.fn();
		const close = jest.fn();
		const transactionState: Record<string, ((event?: Event) => void) | undefined> = {};

		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {
					result: {
						objectStoreNames: {
							contains: () => false
						},
						createObjectStore,
						transaction: () => ({
							objectStore: () => ({
								put: () => {
									const idbRequest: any = {};
									queueMicrotask(() => {
										idbRequest.result = undefined;
										idbRequest.onsuccess?.(new Event('success'));
										transactionState.oncomplete?.(new Event('complete'));
									});
									return idbRequest;
								}
							}),
							set oncomplete(handler: (event?: Event) => void) {
								transactionState.oncomplete = handler;
							},
							get oncomplete() {
								return transactionState.oncomplete as any;
							},
							set onerror(handler: (event?: Event) => void) {
								transactionState.onerror = handler;
							},
							get onerror() {
								return transactionState.onerror as any;
							},
							set onabort(handler: (event?: Event) => void) {
								transactionState.onabort = handler;
							},
							get onabort() {
								return transactionState.onabort as any;
							},
							error: null
						}),
						close
					}
				};

				queueMicrotask(() => {
					request.onupgradeneeded?.(new Event('upgradeneeded'));
					request.onsuccess?.(new Event('success'));
				});

				return request;
			})
		};

		await expect(setOAuthTokenInIDB('token', 100)).resolves.toBeUndefined();
		expect(createObjectStore).toHaveBeenCalledWith(IDB_DB_NAME);
		expect(close).toHaveBeenCalled();
	});

	it('should return null for malformed stored values', async () => {
		const close = jest.fn();
		const transactionState: Record<string, ((event?: Event) => void) | undefined> = {};

		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {
					result: {
						objectStoreNames: {
							contains: () => true
						},
						createObjectStore: jest.fn(),
						transaction: () => ({
							objectStore: () => ({
								get: () => {
									const idbRequest: any = {};
									queueMicrotask(() => {
										idbRequest.result = { token: 'token-without-exp' };
										idbRequest.onsuccess?.(new Event('success'));
										transactionState.oncomplete?.(new Event('complete'));
									});
									return idbRequest;
								}
							}),
							set oncomplete(handler: (event?: Event) => void) {
								transactionState.oncomplete = handler;
							},
							get oncomplete() {
								return transactionState.oncomplete as any;
							},
							set onerror(handler: (event?: Event) => void) {
								transactionState.onerror = handler;
							},
							get onerror() {
								return transactionState.onerror as any;
							},
							set onabort(handler: (event?: Event) => void) {
								transactionState.onabort = handler;
							},
							get onabort() {
								return transactionState.onabort as any;
							},
							error: null
						}),
						close
					}
				};
				queueMicrotask(() => {
					request.onsuccess?.(new Event('success'));
				});
				return request;
			})
		};

		await expect(getOAuthTokenFromIDB()).resolves.toBeNull();
		expect(close).toHaveBeenCalled();
	});

	it('should namespace tokens by project id when using the direct helper', async () => {
		const store = new Map<string, unknown>();
		const close = jest.fn();
		const transactionState: Record<string, ((event?: Event) => void) | undefined> = {};

		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {
					result: {
						objectStoreNames: {
							contains: () => true
						},
						createObjectStore: jest.fn(),
						transaction: () => ({
							objectStore: () => ({
								get: (key: string) => {
									const idbRequest: any = {};
									queueMicrotask(() => {
										idbRequest.result = store.get(key);
										idbRequest.onsuccess?.(new Event('success'));
										transactionState.oncomplete?.(new Event('complete'));
									});
									return idbRequest;
								},
								put: (value: unknown, key: string) => {
									const idbRequest: any = {};
									queueMicrotask(() => {
										store.set(key, value);
										idbRequest.result = undefined;
										idbRequest.onsuccess?.(new Event('success'));
										transactionState.oncomplete?.(new Event('complete'));
									});
									return idbRequest;
								},
								delete: (key: string) => {
									const idbRequest: any = {};
									queueMicrotask(() => {
										store.delete(key);
										idbRequest.result = undefined;
										idbRequest.onsuccess?.(new Event('success'));
										transactionState.oncomplete?.(new Event('complete'));
									});
									return idbRequest;
								}
							}),
							set oncomplete(handler: (event?: Event) => void) {
								transactionState.oncomplete = handler;
							},
							get oncomplete() {
								return transactionState.oncomplete as any;
							},
							set onerror(handler: (event?: Event) => void) {
								transactionState.onerror = handler;
							},
							get onerror() {
								return transactionState.onerror as any;
							},
							set onabort(handler: (event?: Event) => void) {
								transactionState.onabort = handler;
							},
							get onabort() {
								return transactionState.onabort as any;
							},
							error: null
						}),
						close
					}
				};
				queueMicrotask(() => {
					request.onsuccess?.(new Event('success'));
				});
				return request;
			})
		};

		ConfigStore.set(PROJECT_ID, 'project-a');
		await setOAuthTokenInIDB('token-a', 101);
		ConfigStore.set(PROJECT_ID, 'project-b');
		await setOAuthTokenInIDB('token-b', 202);

		await expect(getOAuthTokenFromIDB()).resolves.toEqual({ token: 'token-b', exp: 202 });
		ConfigStore.set(PROJECT_ID, 'project-a');
		await expect(getOAuthTokenFromIDB()).resolves.toEqual({ token: 'token-a', exp: 101 });

		await clearOAuthTokenFromIDB();
		await expect(getOAuthTokenFromIDB()).resolves.toBeNull();
	});

	it('should reject when opening the database fails', async () => {
		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {
					error: new Error('open failed')
				};
				queueMicrotask(() => {
					request.onerror?.(new Event('error'));
				});
				return request;
			})
		};

		await expect(getOAuthTokenFromIDB()).rejects.toThrow('open failed');
	});

	it('should use the default open-database error when IndexedDB omits one', async () => {
		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {};
				queueMicrotask(() => {
					request.onerror?.(new Event('error'));
				});
				return request;
			})
		};

		await expect(getOAuthTokenFromIDB()).rejects.toThrow('Failed to open IndexedDB.');
	});

	it('should reject when a request inside the transaction fails', async () => {
		const close = jest.fn();
		const transactionState: Record<string, ((event?: Event) => void) | undefined> = {};

		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {
					result: {
						objectStoreNames: {
							contains: () => true
						},
						createObjectStore: jest.fn(),
						transaction: () => ({
							objectStore: () => ({
								delete: () => {
									const idbRequest: any = {
										error: new Error('request failed')
									};
									queueMicrotask(() => {
										idbRequest.onerror?.(new Event('error'));
									});
									return idbRequest;
								}
							}),
							set oncomplete(handler: (event?: Event) => void) {
								transactionState.oncomplete = handler;
							},
							get oncomplete() {
								return transactionState.oncomplete as any;
							},
							set onerror(handler: (event?: Event) => void) {
								transactionState.onerror = handler;
							},
							get onerror() {
								return transactionState.onerror as any;
							},
							set onabort(handler: (event?: Event) => void) {
								transactionState.onabort = handler;
							},
							get onabort() {
								return transactionState.onabort as any;
							},
							error: null
						}),
						close
					}
				};
				queueMicrotask(() => {
					request.onsuccess?.(new Event('success'));
				});
				return request;
			})
		};

		await expect(clearOAuthTokenFromIDB()).rejects.toThrow('request failed');
		expect(close).not.toHaveBeenCalled();
	});

	it('should use the default request error when IndexedDB omits one', async () => {
		const transactionState: Record<string, ((event?: Event) => void) | undefined> = {};

		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {
					result: {
						objectStoreNames: {
							contains: () => true
						},
						createObjectStore: jest.fn(),
						transaction: () => ({
							objectStore: () => ({
								delete: () => {
									const idbRequest: any = {};
									queueMicrotask(() => {
										idbRequest.onerror?.(new Event('error'));
									});
									return idbRequest;
								}
							}),
							set oncomplete(handler: (event?: Event) => void) {
								transactionState.oncomplete = handler;
							},
							get oncomplete() {
								return transactionState.oncomplete as any;
							},
							set onerror(handler: (event?: Event) => void) {
								transactionState.onerror = handler;
							},
							get onerror() {
								return transactionState.onerror as any;
							},
							set onabort(handler: (event?: Event) => void) {
								transactionState.onabort = handler;
							},
							get onabort() {
								return transactionState.onabort as any;
							},
							error: null
						}),
						close: jest.fn()
					}
				};
				queueMicrotask(() => {
					request.onsuccess?.(new Event('success'));
				});
				return request;
			})
		};

		await expect(clearOAuthTokenFromIDB()).rejects.toThrow('IndexedDB request failed.');
	});

	it('should reject when the transaction aborts', async () => {
		const close = jest.fn();
		const transactionState: Record<string, ((event?: Event) => void) | undefined> = {};

		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {
					result: {
						objectStoreNames: {
							contains: () => true
						},
						createObjectStore: jest.fn(),
						transaction: () => ({
							objectStore: () => ({
								put: () => {
									const idbRequest: any = {};
									queueMicrotask(() => {
										transactionState.onabort?.(new Event('abort'));
									});
									return idbRequest;
								}
							}),
							set oncomplete(handler: (event?: Event) => void) {
								transactionState.oncomplete = handler;
							},
							get oncomplete() {
								return transactionState.oncomplete as any;
							},
							set onerror(handler: (event?: Event) => void) {
								transactionState.onerror = handler;
							},
							get onerror() {
								return transactionState.onerror as any;
							},
							set onabort(handler: (event?: Event) => void) {
								transactionState.onabort = handler;
							},
							get onabort() {
								return transactionState.onabort as any;
							},
							error: new Error('transaction failed')
						}),
						close
					}
				};
				queueMicrotask(() => {
					request.onsuccess?.(new Event('success'));
				});
				return request;
			})
		};

		await expect(setOAuthTokenInIDB('token', 100)).rejects.toThrow('transaction failed');
		expect(close).toHaveBeenCalled();
	});

	it('should use the default transaction error when IndexedDB omits one', async () => {
		const close = jest.fn();
		const transactionState: Record<string, ((event?: Event) => void) | undefined> = {};

		(global as unknown as { indexedDB: unknown }).indexedDB = {
			open: jest.fn(() => {
				const request: any = {
					result: {
						objectStoreNames: {
							contains: () => true
						},
						createObjectStore: jest.fn(),
						transaction: () => ({
							objectStore: () => ({
								put: () => {
									const idbRequest: any = {};
									queueMicrotask(() => {
										transactionState.onerror?.(new Event('error'));
									});
									return idbRequest;
								}
							}),
							set oncomplete(handler: (event?: Event) => void) {
								transactionState.oncomplete = handler;
							},
							get oncomplete() {
								return transactionState.oncomplete as any;
							},
							set onerror(handler: (event?: Event) => void) {
								transactionState.onerror = handler;
							},
							get onerror() {
								return transactionState.onerror as any;
							},
							set onabort(handler: (event?: Event) => void) {
								transactionState.onabort = handler;
							},
							get onabort() {
								return transactionState.onabort as any;
							},
							error: null
						}),
						close
					}
				};
				queueMicrotask(() => {
					request.onsuccess?.(new Event('success'));
				});
				return request;
			})
		};

		await expect(setOAuthTokenInIDB('token', 100)).rejects.toThrow(
			'IndexedDB transaction failed.'
		);
		expect(close).toHaveBeenCalled();
	});
});
