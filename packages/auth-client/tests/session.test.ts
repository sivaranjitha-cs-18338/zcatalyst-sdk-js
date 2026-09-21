import {
	clearStratusJwt,
	getStratusJwtExpiry,
	getStratusSessionVersion,
	isStratusJwtFresh,
	setStratusJwtExpiry,
	STRATUS_JWT_COOKIE,
	STRATUS_JWT_EXPIRY_KEY,
	STRATUS_JWT_EXPIRY_SKEW_MS,
	STRATUS_SESSION_VERSION_KEY,
	syncProjectSession
} from '../src/utils/session';

describe('session utils', () => {
	const credentials: any = {
		project_id: 'project-1',
		zaid: 'zaid-1',
		project_domain: 'project-1.catalyst.zoho.com',
		environment: 'development'
	};

	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
		document.cookie = '';
		jest.restoreAllMocks();
	});

	it('should clear the stratus cookie and persisted expiry', () => {
		document.cookie = `${STRATUS_JWT_COOKIE}=token-value`;
		sessionStorage.setItem(STRATUS_JWT_EXPIRY_KEY, '123456');

		clearStratusJwt();

		expect(document.cookie).not.toContain('token-value');
		expect(document.cookie).toContain('max-age=0');
		expect(sessionStorage.getItem(STRATUS_JWT_EXPIRY_KEY)).toBeNull();
	});

	it('should ignore session storage removal errors when clearing the cookie', () => {
		document.cookie = `${STRATUS_JWT_COOKIE}=token-value`;
		const removeSpy = jest
			.spyOn(Object.getPrototypeOf(window.sessionStorage), 'removeItem')
			.mockImplementation(() => {
				throw new Error('storage disabled');
			});

		expect(() => clearStratusJwt()).not.toThrow();
		expect(document.cookie).not.toContain('token-value');
		expect(document.cookie).toContain('max-age=0');

		removeSpy.mockRestore();
	});

	it('should persist and read the stratus expiry timestamp', () => {
		const expiresAt = Date.now() + 120_000;

		setStratusJwtExpiry(expiresAt);

		expect(getStratusJwtExpiry()).toBe(expiresAt);
	});

	it('should ignore invalid expiry values and fall back to zero for bad storage data', () => {
		setStratusJwtExpiry(Number.NaN);
		expect(getStratusJwtExpiry()).toBe(0);

		sessionStorage.setItem(STRATUS_JWT_EXPIRY_KEY, 'not-a-number');
		expect(getStratusJwtExpiry()).toBe(0);
	});

	it('should safely ignore session storage write failures when persisting expiry', () => {
		const setSpy = jest
			.spyOn(Object.getPrototypeOf(window.sessionStorage), 'setItem')
			.mockImplementation(() => {
				throw new Error('storage disabled');
			});

		expect(() => setStratusJwtExpiry(Date.now() + 60_000)).not.toThrow();
		expect(getStratusJwtExpiry()).toBe(0);

		setSpy.mockRestore();
	});

	it('should report freshness based on cookie presence and expiry skew', () => {
		expect(isStratusJwtFresh()).toBe(false);

		document.cookie = `${STRATUS_JWT_COOKIE}=fresh-token`;
		expect(isStratusJwtFresh()).toBe(true);

		setStratusJwtExpiry(Date.now() + STRATUS_JWT_EXPIRY_SKEW_MS + 10_000);
		expect(isStratusJwtFresh()).toBe(true);

		setStratusJwtExpiry(Date.now() + STRATUS_JWT_EXPIRY_SKEW_MS - 1_000);
		expect(isStratusJwtFresh()).toBe(false);
	});

	it('should clear a stale cookie on first sync and bump the session version', () => {
		document.cookie = `${STRATUS_JWT_COOKIE}=stale-token`;
		jest.spyOn(Date, 'now').mockReturnValue(17_000);

		const switched = syncProjectSession(credentials);

		expect(switched).toBe(true);
		expect(document.cookie).not.toContain('stale-token');
		expect(localStorage.getItem('__catalyst_last_project_ctx')).toBe(
			'project-1|zaid-1|project-1.catalyst.zoho.com|development'
		);
		expect(getStratusSessionVersion()).toBe('17000');
	});

	it('should keep the cookie when the project session is unchanged', () => {
		localStorage.setItem(
			'__catalyst_last_project_ctx',
			'project-1|zaid-1|project-1.catalyst.zoho.com|development'
		);
		document.cookie = `${STRATUS_JWT_COOKIE}=active-token`;

		const switched = syncProjectSession(credentials);

		expect(switched).toBe(false);
		expect(document.cookie).toContain(`${STRATUS_JWT_COOKIE}=active-token`);
		expect(getStratusSessionVersion()).toBe('');
	});

	it('should record the first project context without switching when there is no stale cookie', () => {
		const switched = syncProjectSession(credentials);

		expect(switched).toBe(false);
		expect(localStorage.getItem('__catalyst_last_project_ctx')).toBe(
			'project-1|zaid-1|project-1.catalyst.zoho.com|development'
		);
		expect(getStratusSessionVersion()).toBe('');
	});

	it('should clear the cookie and bump the version when the project changes', () => {
		localStorage.setItem(
			'__catalyst_last_project_ctx',
			'project-1|zaid-1|project-1.catalyst.zoho.com|development'
		);
		document.cookie = `${STRATUS_JWT_COOKIE}=old-token`;
		jest.spyOn(Date, 'now').mockReturnValue(25_000);

		const switched = syncProjectSession({
			...credentials,
			project_id: 'project-2'
		} as any);

		expect(switched).toBe(true);
		expect(document.cookie).not.toContain('old-token');
		expect(getStratusSessionVersion()).toBe('25000');
		expect(localStorage.getItem('__catalyst_last_project_ctx')).toBe(
			'project-2|zaid-1|project-1.catalyst.zoho.com|development'
		);
	});

	it('should return false when no credentials are provided', () => {
		expect(syncProjectSession(undefined)).toBe(false);
	});

	it('should treat unreadable local storage as a session switch and avoid throwing', () => {
		document.cookie = `${STRATUS_JWT_COOKIE}=stale-token`;
		jest.spyOn(Date, 'now').mockReturnValue(31_000);
		const getSpy = jest
			.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem')
			.mockImplementation(() => {
				throw new Error('local storage disabled');
			});
		const setSpy = jest
			.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
			.mockImplementation(() => {
				throw new Error('local storage disabled');
			});

		expect(syncProjectSession(credentials)).toBe(true);
		expect(document.cookie).not.toContain('stale-token');
		expect(getStratusSessionVersion()).toBe('');

		getSpy.mockRestore();
		setSpy.mockRestore();
	});

	it('should read the current session version from storage', () => {
		sessionStorage.setItem(STRATUS_SESSION_VERSION_KEY, '42');

		expect(getStratusSessionVersion()).toBe('42');
	});

	it('should return an empty session version when session storage reads fail', () => {
		const getSpy = jest
			.spyOn(Object.getPrototypeOf(window.sessionStorage), 'getItem')
			.mockImplementation(() => {
				throw new Error('session storage disabled');
			});

		expect(getStratusSessionVersion()).toBe('');

		getSpy.mockRestore();
	});
});
