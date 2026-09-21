import { copyInstance, envOverride } from '../src/helpers';

describe('Helpers', () => {
	const globalWithWindow = global as Record<string, unknown>;
	const originalWindow = globalWithWindow.window;

	afterEach(() => {
		delete process.env.TEST_ENV_OVERRIDE;
		delete process.env.TEST_ENV_JSON;
		delete process.env.TEST_ENV_BAD_JSON;
		if (originalWindow === undefined) {
			delete globalWithWindow.window;
		} else {
			globalWithWindow.window = originalWindow;
		}
	});

	describe('envOverride', () => {
		it('should return the environment variable when it is set', () => {
			process.env.TEST_ENV_OVERRIDE = 'from-env';

			expect(envOverride('TEST_ENV_OVERRIDE', 'fallback')).toBe('from-env');
		});

		it('should use the coerced value when conversion succeeds', () => {
			process.env.TEST_ENV_JSON = '{"enabled":true}';

			expect(
				envOverride('TEST_ENV_JSON', { enabled: false }, (environmentValue) =>
					JSON.parse(environmentValue as string)
				)
			).toEqual({ enabled: true });
		});

		it('should return the original value when coercion fails', () => {
			process.env.TEST_ENV_BAD_JSON = 'not-json';

			expect(
				envOverride('TEST_ENV_BAD_JSON', { enabled: false }, (environmentValue) =>
					JSON.parse(environmentValue as string)
				)
			).toEqual({ enabled: false });
		});

		it('should return the original value when the environment variable is absent', () => {
			expect(envOverride('MISSING_ENV_OVERRIDE', 'fallback')).toBe('fallback');
		});

		it('should ignore environment lookup when running with a window object', () => {
			process.env.TEST_ENV_OVERRIDE = 'from-env';
			globalWithWindow.window = {};

			expect(envOverride('TEST_ENV_OVERRIDE', 'fallback')).toBe('fallback');
		});
	});

	describe('copyInstance', () => {
		it('should create a shallow copy that preserves the prototype', () => {
			class Example {
				constructor(public value: string) {}

				describe(): string {
					return `value:${this.value}`;
				}
			}

			const original = new Example('first');
			const copied = copyInstance(original);

			expect(copied).not.toBe(original);
			expect(copied).toBeInstanceOf(Example);
			expect(copied.describe()).toBe('value:first');

			copied.value = 'second';
			expect(original.value).toBe('first');
		});
	});
});
