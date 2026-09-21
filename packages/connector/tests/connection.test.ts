import { CatalystService } from '@zcatalyst/utils';
import crypto from 'crypto';

const FIXED_NOW = 1_487_076_708_000;
Date.now = jest.fn(() => FIXED_NOW);

type CacheRecord = {
	cache_name: string;
	cache_value?: string;
	expires_in: string;
	expiry_in_hours: number | null;
	segment_details: { segment_name: string; id: string };
};

const cacheStore = new Map<string, CacheRecord>();
const mockSegmentGet = jest.fn<Promise<CacheRecord>, [string]>();
const mockSegmentPut = jest.fn<Promise<CacheRecord>, [string, string, number]>();
const mockSend = jest.fn();

function buildCacheRecord(
	key: string,
	value?: string,
	expiryInHours: number | null = 1
): CacheRecord {
	return {
		cache_name: key,
		cache_value: value,
		expires_in: String(FIXED_NOW + 60_000),
		expiry_in_hours: expiryInHours,
		segment_details: { segment_name: 'Default', id: '123' }
	};
}

jest.mock('@zcatalyst/cache', () => {
	return {
		Cache: class {
			segment() {
				return {
					get: mockSegmentGet,
					put: mockSegmentPut
				};
			}
		}
	};
});

jest.mock('@zcatalyst/transport', () => {
	return {
		Handler: class {
			async send(options: unknown) {
				return mockSend(options);
			}
		}
	};
});

import { Connection } from '../src';
import { CatalystConnectorError } from '../src/utils/error';

const baseConfig = {
	client_id: 'third-party-client',
	client_secret: 'third-party-secret',
	auth_url: 'https://oauth.example.com/authorize',
	refresh_url: 'https://oauth.example.com/refresh',
	refresh_token: 'seed-refresh-token',
	redirect_url: 'https://app.example/callback',
	expires_in: '3600',
	refresh_in: '3000'
};

const tokenResponse = {
	access_token: 'fresh-access-token',
	refresh_token: 'fresh-refresh-token',
	expires_in: '3600'
};

function createConnection(overrides: Record<string, string | undefined> = {}) {
	const demo = { ...baseConfig, ...overrides };
	for (const [key, value] of Object.entries(demo)) {
		if (typeof value === 'undefined') {
			delete (demo as Record<string, string | undefined>)[key];
		}
	}
	return new Connection({ demo: demo as Record<string, string> });
}

function encryptLegacyToken(text: string, key: string): string {
	const iv = crypto.randomBytes(16);
	const derivedKey = crypto.createHash('sha256').update(key).digest();
	const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	const authTag = cipher.getAuthTag().toString('hex');
	return Buffer.from(`${encrypted}:${iv.toString('hex')}:${authTag}`).toString('base64');
}

describe('testing connector', () => {
	beforeEach(() => {
		cacheStore.clear();
		mockSend.mockReset();
		mockSegmentGet.mockReset();
		mockSegmentPut.mockReset();

		mockSegmentGet.mockImplementation(async (key: string) => {
			return cacheStore.get(key) ?? buildCacheRecord(key);
		});
		mockSegmentPut.mockImplementation(async (key: string, value: string, expiry: number) => {
			const record = buildCacheRecord(key, value, expiry);
			cacheStore.set(key, record);
			return record;
		});
		mockSend.mockRejectedValue(new Error('Unexpected network call'));
	});

	it('returns an in-memory token without touching cache', async () => {
		const connector = createConnection().getConnector('demo');
		connector.accessToken = 'memory-token';
		connector.expiresAt = FIXED_NOW + 5_000;

		await expect(connector.getAccessToken()).resolves.toBe('memory-token');
		expect(mockSegmentGet).not.toHaveBeenCalled();
		expect(mockSend).not.toHaveBeenCalled();
	});

	it('deduplicates concurrent token refreshes when cache misses', async () => {
		mockSend.mockResolvedValue({ data: { access_token: 'fresh-token', expires_in: '3600' } });
		const connector = createConnection().getConnector('demo');

		const [first, second] = await Promise.all([
			connector.getAccessToken(),
			connector.getAccessToken()
		]);

		expect(first).toBe('fresh-token');
		expect(second).toBe('fresh-token');
		expect(mockSend).toHaveBeenCalledTimes(1);
		expect(mockSegmentPut).toHaveBeenCalledTimes(1);
	});

	it('reads a valid plain token from the hashed cache', async () => {
		const writer = createConnection().getConnector('demo');
		writer.accessToken = 'cached-token';
		writer.expiresIn = 3600;
		writer.expiresAt = FIXED_NOW + 3_600_000;

		const cached = await writer.putAccessTokenInCache();
		const reader = createConnection().getConnector('demo');

		await expect(reader.getAccessToken()).resolves.toBe('cached-token');
		expect(cached.cache_name).toMatch(/^ZC_CONN_demo:/);
		expect(mockSend).not.toHaveBeenCalled();
	});

	it('migrates a valid legacy token and recalculates ttl when expiresIn is not finite', async () => {
		cacheStore.set(
			'ZC_CONN_demo',
			buildCacheRecord(
				'ZC_CONN_demo',
				JSON.stringify({
					access_token: 'legacy-token',
					expires_at: FIXED_NOW + 2_700_000
				})
			)
		);
		const connector = createConnection({ expires_in: undefined }).getConnector('demo');

		await expect(connector.getAccessToken()).resolves.toBe('legacy-token');

		expect(mockSegmentPut).toHaveBeenCalledTimes(1);
		expect(mockSegmentPut.mock.calls[0][0]).toMatch(/^ZC_CONN_demo:/);
		expect(mockSegmentPut.mock.calls[0][0]).not.toBe('ZC_CONN_demo');
		expect(mockSegmentPut.mock.calls[0][2]).toBe(1);
	});

	it('retries cache lookup when configuration changes during a read', async () => {
		mockSend.mockResolvedValue({
			data: { access_token: 'refreshed-after-rotation', expires_in: '3600' }
		});
		const connector = createConnection().getConnector('demo');

		let firstLookup = true;
		mockSegmentGet.mockImplementation(async (key: string) => {
			if (firstLookup) {
				firstLookup = false;
				connector.clientId = 'rotated-client-id';
			}
			return cacheStore.get(key) ?? buildCacheRecord(key);
		});

		await expect(connector.getAccessToken()).resolves.toBe('refreshed-after-rotation');
		expect(mockSegmentGet.mock.calls.length).toBe(2);
		expect(mockSend).toHaveBeenCalledTimes(1);
	});

	it('throws when an encrypted cached token is missing a secret key', async () => {
		const writer = createConnection({ secret_key: 'writer-secret' }).getConnector('demo');
		writer.accessToken = 'encrypted-token';
		writer.expiresIn = 3600;
		writer.expiresAt = FIXED_NOW + 3_600_000;
		await writer.putAccessTokenInCache();

		const reader = createConnection().getConnector('demo');

		await expect(reader.getAccessToken()).rejects.toThrow(
			'The cached access token is encrypted. Please provide a valid secret key to decrypt it.'
		);
		expect(mockSend).not.toHaveBeenCalled();
	});

	it('decrypts current-format encrypted cached tokens with the configured secret key', async () => {
		const writer = createConnection({ secret_key: 'shared-secret' }).getConnector('demo');
		writer.accessToken = 'persisted-secret-token';
		writer.expiresIn = 3600;
		writer.expiresAt = FIXED_NOW + 3_600_000;

		const persisted = await writer.putAccessTokenInCache();
		const storedToken = JSON.parse(persisted.cache_value as string).access_token;

		expect(storedToken).not.toBe('persisted-secret-token');

		const reader = createConnection({ secret_key: 'shared-secret' }).getConnector('demo');
		await expect(reader.getAccessToken()).resolves.toBe('persisted-secret-token');
	});

	it('migrates and decrypts legacy encrypted tokens', async () => {
		cacheStore.set(
			'ZC_CONN_demo',
			buildCacheRecord(
				'ZC_CONN_demo',
				JSON.stringify({
					access_token: encryptLegacyToken('legacy-encrypted-token', 'shared-secret'),
					expires_at: FIXED_NOW + 3_600_000
				})
			)
		);
		const connector = createConnection({
			secret_key: 'shared-secret',
			expires_in: undefined
		}).getConnector('demo');

		await expect(connector.getAccessToken()).resolves.toBe('legacy-encrypted-token');
		expect(mockSegmentPut).toHaveBeenCalledTimes(1);
	});

	it('falls back to refresh when an encrypted cache entry cannot be decrypted', async () => {
		const writer = createConnection({ secret_key: 'writer-secret' }).getConnector('demo');
		writer.accessToken = 'encrypted-token';
		writer.expiresIn = 3600;
		writer.expiresAt = FIXED_NOW + 3_600_000;
		await writer.putAccessTokenInCache();

		mockSend.mockResolvedValue({
			data: { access_token: 'recovered-token', expires_in: '3600' }
		});
		const reader = createConnection({ secret_key: 'different-secret' }).getConnector('demo');

		await expect(reader.getAccessToken()).resolves.toBe('recovered-token');
		expect(mockSend).toHaveBeenCalledTimes(1);
	});

	it('validates generateAccessToken input, URLs, and response shape', async () => {
		await expect(
			createConnection().getConnector('demo').generateAccessToken('')
		).rejects.toThrow();
		await expect(
			createConnection({ redirect_url: '' })
				.getConnector('demo')
				.generateAccessToken('grant-code')
		).rejects.toThrow();
		await expect(
			createConnection({ auth_url: 'not-a-url' })
				.getConnector('demo')
				.generateAccessToken('grant-code')
		).rejects.toThrow('The auth_url must be a valid, absolute URL.');
		await expect(
			createConnection({ auth_url: 'http://oauth.example.com/authorize' })
				.getConnector('demo')
				.generateAccessToken('grant-code')
		).rejects.toThrow('The auth_url must use HTTPS.');

		mockSend.mockResolvedValue({ data: { access_token: 'missing-refresh-token' } });
		await expect(
			createConnection().getConnector('demo').generateAccessToken('grant-code')
		).rejects.toThrow();
	});

	it('generates an access token, updates state, and persists using refresh_in when present', async () => {
		mockSend.mockResolvedValue({ data: tokenResponse });
		const connector = createConnection({ secret_key: 'shared-secret' }).getConnector('demo');

		await expect(connector.generateAccessToken('grant-code')).resolves.toBe(
			tokenResponse.access_token
		);

		expect(connector.refreshToken).toBe(tokenResponse.refresh_token);
		expect(connector.accessToken).toBe(tokenResponse.access_token);
		expect(connector.expiresAt).toBe(FIXED_NOW + 3_000_000);
		expect(mockSend.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				service: CatalystService.EXTERNAL,
				auth: false,
				url: baseConfig.auth_url
			})
		);
	});

	it('uses expires_in when refresh_in is not configured during generateAccessToken', async () => {
		mockSend.mockResolvedValue({ data: tokenResponse });
		const connector = createConnection({ refresh_in: undefined }).getConnector('demo');

		await connector.generateAccessToken('grant-code');

		expect(connector.expiresAt).toBe(FIXED_NOW + 2_700_000);
	});

	it('aborts token generation when configuration changes during the exchange', async () => {
		const connector = createConnection().getConnector('demo');
		mockSend.mockImplementation(async () => {
			connector.redirectUrl = 'https://app.example/changed-callback';
			return { data: tokenResponse };
		});

		await expect(connector.generateAccessToken('grant-code')).rejects.toThrow(
			CatalystConnectorError
		);
		expect(mockSegmentPut).not.toHaveBeenCalled();
	});

	it('aborts token generation when configuration changes during persistence', async () => {
		mockSend.mockResolvedValue({ data: tokenResponse });
		const connector = createConnection().getConnector('demo');
		const originalPut = mockSegmentPut.getMockImplementation() as (
			key: string,
			value: string,
			expiry: number
		) => Promise<CacheRecord>;
		mockSegmentPut.mockImplementationOnce(
			async (key: string, value: string, expiry: number) => {
				connector.refreshToken = 'rotated-after-persist';
				return originalPut(key, value, expiry);
			}
		);

		await expect(connector.generateAccessToken('grant-code')).rejects.toThrow(
			'The connector configuration changed while generating the access token.'
		);
		expect(mockSegmentPut).toHaveBeenCalledTimes(1);
	});

	it('validates refreshAccessToken inputs, URLs, and response shape', async () => {
		const blankTokenConnector = createConnection().getConnector('demo');
		blankTokenConnector.refreshToken = '';
		await expect(blankTokenConnector.refreshAccessToken()).rejects.toThrow();

		const blankUrlConnector = createConnection().getConnector('demo');
		blankUrlConnector.refreshUrl = '';
		await expect(blankUrlConnector.refreshAccessToken()).rejects.toThrow();
		await expect(
			createConnection({ refresh_url: 'not-a-url' }).getConnector('demo').refreshAccessToken()
		).rejects.toThrow('The refresh_url must be a valid, absolute URL.');
		await expect(
			createConnection({ refresh_url: 'http://oauth.example.com/refresh' })
				.getConnector('demo')
				.refreshAccessToken()
		).rejects.toThrow('The refresh_url must use HTTPS.');

		mockSend.mockResolvedValue({ data: { expires_in: '3600' } });
		await expect(
			createConnection().getConnector('demo').refreshAccessToken()
		).rejects.toThrow();
	});

	it('retries refreshAccessToken when configuration changes during the request', async () => {
		const connector = createConnection().getConnector('demo');
		mockSend
			.mockImplementationOnce(async () => {
				connector.clientSecret = 'rotated-client-secret';
				return { data: { access_token: 'stale-token', expires_in: '3600' } };
			})
			.mockResolvedValueOnce({ data: { access_token: 'final-token', expires_in: '1800' } });

		await expect(connector.refreshAccessToken()).resolves.toBeUndefined();
		expect(mockSend).toHaveBeenCalledTimes(2);
		expect(connector.accessToken).toBe('final-token');
		expect(connector.expiresAt).toBe(FIXED_NOW + 3_000_000);
	});

	it('retries refreshAndPersistToken when configuration changes during persistence', async () => {
		mockSend.mockResolvedValue({
			data: { access_token: 'persisted-refresh-token', expires_in: '3600' }
		});
		const connector = createConnection().getConnector('demo');
		const originalPut = mockSegmentPut.getMockImplementation() as (
			key: string,
			value: string,
			expiry: number
		) => Promise<CacheRecord>;
		mockSegmentPut.mockImplementationOnce(
			async (key: string, value: string, expiry: number) => {
				connector.refreshUrl = 'https://oauth.example.com/refresh-rotated';
				return originalPut(key, value, expiry);
			}
		);

		await expect(connector.refreshAndPersistToken()).resolves.toBe('persisted-refresh-token');
		expect(mockSend).toHaveBeenCalledTimes(2);
		expect(mockSegmentPut).toHaveBeenCalledTimes(2);
	});

	it('syncs updated connector fields back to the owning connection and invalidates stale state', async () => {
		const connection = createConnection();
		const connector = connection.getConnector('demo');

		connector.accessToken = 'stale-token';
		connector.expiresAt = FIXED_NOW + 5_000;
		connection.connectionJson!.demo = 'not-an-object';

		connector.authUrl = 'https://oauth.example.com/v2/authorize';
		connector.refreshUrl = 'https://oauth.example.com/v2/refresh';
		connector.refreshToken = 'rotated-refresh-token';
		connector.clientId = 'rotated-client-id';
		connector.clientSecret = 'rotated-client-secret';
		connector.redirectUrl = 'https://app.example/rotated-callback';
		connector.connectorName = 'renamed-demo';

		expect(connector.accessToken).toBeNull();
		expect(connector.expiresAt).toBeNull();
		expect(connection.connectionJson?.demo).toEqual({
			auth_url: 'https://oauth.example.com/v2/authorize',
			refresh_url: 'https://oauth.example.com/v2/refresh',
			refresh_token: 'rotated-refresh-token',
			client_id: 'rotated-client-id',
			client_secret: 'rotated-client-secret',
			redirect_url: 'https://app.example/rotated-callback'
		});

		connection.connectionJson = null;
		expect(() => {
			connector.refreshUrl = 'https://oauth.example.com/v3/refresh';
		}).not.toThrow();

		connector.accessToken = 'renamed-token';
		connector.expiresIn = 3600;
		connector.expiresAt = FIXED_NOW + 3_600_000;
		const persisted = await connector.putAccessTokenInCache();

		expect(persisted.cache_name).toMatch(/^ZC_CONN_renamed-demo:/);
	});
});
