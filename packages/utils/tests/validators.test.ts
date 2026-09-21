import { CatalystAppError, CatalystError } from '../src/errors';
import {
	isArray,
	isBoolean,
	isBuffer,
	isEmail,
	isNonEmptyArray,
	isNonEmptyObject,
	isNonEmptyString,
	isNonEmptyStringOrNumber,
	isNonNullObject,
	isNonNullValue,
	isNumber,
	isObject,
	isString,
	isURL,
	isValidApp,
	isValidInputString,
	isValidNumber,
	isValidType,
	isValidUrl,
	ObjectHasDeprecatedProperty,
	ObjectHasProperties,
	wrapValidators,
	wrapValidatorsWithPromise
} from '../src/validators';

describe('Validators', () => {
	describe('primitive validators', () => {
		it('should identify buffers, arrays, booleans, numbers and strings', () => {
			expect(isBuffer(Buffer.from('ok'))).toBe(true);
			expect(isBuffer('ok')).toBe(false);
			expect(isArray(['a'])).toBe(true);
			expect(isArray('a')).toBe(false);
			expect(isBoolean(false)).toBe(true);
			expect(isBoolean('false')).toBe(false);
			expect(isNumber(10)).toBe(true);
			expect(isNumber(NaN)).toBe(false);
			expect(isString('value')).toBe(true);
			expect(isString(1)).toBe(false);
		});

		it('should validate nullable object semantics used by the package', () => {
			expect(isObject({ key: 'value' })).toBe(true);
			expect(isObject([])).toBe(false);
			expect(isObject(null)).toBe(true);
		});
	});

	describe('isValidNumber', () => {
		it('should accept safe finite numbers and reject invalid numbers', () => {
			expect(isValidNumber(100)).toBe(true);
			expect(isValidNumber('100')).toBe(false);
			expect(isValidNumber(Number.POSITIVE_INFINITY)).toBe(false);
			expect(isValidNumber(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
			expect(isValidNumber(Number.MIN_SAFE_INTEGER - 1)).toBe(false);
		});

		it('should throw precise CatalystError variants when requested', () => {
			expect(() => isValidNumber('100', true)).toThrow(
				expect.objectContaining({
					code: 'INVALID_NUMBER',
					message: 'Not a number type',
					value: '100'
				})
			);
			expect(() => isValidNumber(Number.NaN, true)).toThrow(
				expect.objectContaining({
					code: 'INVALID_NUMBER',
					message: 'Special number values cannot be used'
				})
			);
			expect(() => isValidNumber(Number.MAX_SAFE_INTEGER + 1, true)).toThrow(
				expect.objectContaining({
					code: 'UNSAFE_NUMBER'
				})
			);
			expect(() => isValidNumber(Number.MIN_SAFE_INTEGER - 1, true)).toThrow(
				expect.objectContaining({
					code: 'UNSAFE_NUMBER'
				})
			);
		});
	});

	describe('isEmail and URL validators', () => {
		it('should validate emails with content on both sides of @', () => {
			expect(isEmail('user@example.com')).toBe(true);
			expect(isEmail('@example.com')).toBe(false);
			expect(isEmail('user@')).toBe(false);
			expect(isEmail(1234)).toBe(false);
		});

		it('should validate URLs using the URL constructor when possible', () => {
			expect(isURL('https://example.com/path')).toBe(true);
			expect(isURL('ftp://example.com')).toBe(false);
			expect(isURL('https://exa mple.com')).toBe(false);
			expect(isValidUrl('http://example.com')).toBe(true);
		});

		it('should use the fallback URL pattern when URL construction fails', () => {
			expect(isURL('http://[invalid')).toBe(true);
			expect(isURL('notaurl')).toBe(false);
		});
	});

	describe('ObjectHasProperties', () => {
		it('should return true when all required properties are present', () => {
			expect(ObjectHasProperties({ name: 'Ada', age: 30 }, ['name', 'age'], 'user')).toBe(
				true
			);
		});

		it('should reject missing values and throw when requested', () => {
			expect(ObjectHasProperties({ name: '' }, ['name'], 'user')).toBe(false);
			expect(() => ObjectHasProperties({ email: null }, ['email'], 'user', true)).toThrow(
				expect.objectContaining({
					code: 'INVALID_ARGUMENT',
					value: 'email'
				})
			);
		});
	});

	describe('isNonEmptyString', () => {
		it('should validate non-empty strings', () => {
			expect(() => isNonEmptyString('test', 'field')).not.toThrow();
			expect(() => isNonEmptyString('  test  ', 'field')).not.toThrow();
		});

		it('should throw for empty strings', () => {
			expect(() => isNonEmptyString('', 'field', true)).toThrow();
		});

		it('should throw for non-strings when required', () => {
			expect(() => isNonEmptyString(null as unknown, 'field', true)).toThrow();
			expect(() => isNonEmptyString(undefined as unknown, 'field', true)).toThrow();
			expect(() => isNonEmptyString(123 as unknown, 'field', true)).toThrow();
		});

		it('should not throw for null/undefined when not required', () => {
			expect(() => isNonEmptyString(null as unknown, 'field', false)).not.toThrow();
			expect(() => isNonEmptyString(undefined as unknown, 'field', false)).not.toThrow();
		});
	});

	describe('non-null and collection validators', () => {
		it('should validate non-null values and objects', () => {
			expect(isNonNullValue(0)).toBe(true);
			expect(isNonNullObject({ id: 1 })).toBe(true);
			expect(isNonEmptyObject({ id: 1 })).toBe(true);
			expect(isNonEmptyArray([1], 'values')).toBe(true);
			expect(isNonEmptyStringOrNumber(7, 'identifier')).toBe(true);
			expect(isNonEmptyStringOrNumber('abc', 'identifier')).toBe(true);
		});

		it('should return false for invalid values and throw meaningful errors when requested', () => {
			expect(isNonNullValue(null)).toBe(false);
			expect(isNonNullObject([], 'payload')).toBe(false);
			expect(isNonEmptyObject({}, 'payload')).toBe(false);
			expect(isNonEmptyArray([], 'values')).toBe(false);
			expect(isNonEmptyStringOrNumber(null, 'identifier')).toBe(false);

			expect(() => isNonNullValue(null, 'token', true)).toThrow(
				expect.objectContaining({ code: 'INVALID_ARGUMENT' })
			);
			expect(() => isNonNullObject([], 'payload', true)).toThrow(
				expect.objectContaining({ code: 'INVALID_ARGUMENT' })
			);
			expect(() => isNonEmptyObject({}, 'payload', true)).toThrow(
				expect.objectContaining({ code: 'INVALID_ARGUMENT' })
			);
			expect(() => isNonEmptyArray([], 'values', true)).toThrow(
				expect.objectContaining({ code: 'INVALID_ARGUMENT' })
			);
			expect(() => isNonEmptyStringOrNumber(undefined, 'identifier', true)).toThrow(
				expect.objectContaining({ code: 'INVALID_ARGUMENT' })
			);
		});
	});

	describe('isValidType', () => {
		it('should validate exact primitive types', () => {
			expect(isValidType('hello', 'string', 'message')).toBe(true);
			expect(isValidType(12, 'string', 'message')).toBe(false);
		});

		it('should throw when type validation fails and throwErr is true', () => {
			expect(() => isValidType(12, 'string', 'message', true)).toThrow(
				expect.objectContaining({
					code: 'INVALID_ARGUMENT_TYPE',
					message: 'Value provided for message must be of type string'
				})
			);
		});
	});

	describe('isValidApp', () => {
		it('should accept app-like objects with config, credential and projectId', () => {
			expect(
				isValidApp(
					{
						config: { projectId: '2001' },
						credential: { token: 'secret' }
					},
					true
				)
			).toBe(true);
		});

		it('should reject invalid app-like objects and throw CatalystAppError when requested', () => {
			const invalidApp = { config: { projectId: '' } };

			expect(isValidApp(invalidApp, false)).toBe(false);
			expect(() => isValidApp(invalidApp, true)).toThrow(CatalystAppError);
			expect(() => isValidApp(invalidApp, true)).toThrow(
				expect.objectContaining({
					code: 'app/INVALID_PROJECT_INSTANCE',
					message: 'Project instance is not valid'
				})
			);
		});
	});

	describe('ObjectHasDeprecatedProperty', () => {
		let consoleWarnSpy: jest.SpyInstance;

		beforeEach(() => {
			consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
		});

		afterEach(() => {
			consoleWarnSpy.mockRestore();
		});

		it('should copy deprecated values and warn when requested', () => {
			const input = { oldKey: 'value' };

			expect(ObjectHasDeprecatedProperty(input, 'oldKey', 'newKey', true, true)).toBe(true);
			expect(input).toEqual({ newKey: 'value' });
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'Warning! Value for property oldKey is deprecated use newKey instead'
			);
		});

		it('should return false when the deprecated property is absent', () => {
			expect(ObjectHasDeprecatedProperty({ keep: 'value' }, 'oldKey', 'newKey')).toBe(false);
		});
	});

	describe('isValidInputString', () => {
		it('should validate valid input strings', () => {
			expect(() => isValidInputString('validString', 'field')).not.toThrow();
			expect(() => isValidInputString('valid_string_123', 'field')).not.toThrow();
		});

		it('should throw for invalid input strings', () => {
			expect(() => isValidInputString('', 'field', true)).toThrow();
			expect(() => isValidInputString('   ', 'field', true)).toThrow();
		});

		it('should reject strings with unsupported characters', () => {
			expect(isValidInputString('value with space', 'field')).toBe(false);
			expect(() => isValidInputString('invalid!', 'field', true)).toThrow(
				expect.objectContaining({
					code: 'INVALID_ARGUMENT',
					message: 'The value provided for field contains invalid characters.'
				})
			);
		});
	});

	describe('wrapValidatorsWithPromise', () => {
		it('should resolve when validators pass', async () => {
			const validator = () => {
				isNonEmptyString('test', 'field');
			};
			await expect(
				wrapValidatorsWithPromise(validator, CatalystAppError)
			).resolves.toBeUndefined();
		});

		it('should reject when validators fail', async () => {
			const validator = () => {
				isNonEmptyString('', 'field', true);
			};
			await expect(wrapValidatorsWithPromise(validator, CatalystAppError)).rejects.toThrow();
		});

		it('should reject with the original error when a non-Catalyst error is thrown', async () => {
			const validator = () => {
				throw new Error('unexpected');
			};

			await expect(wrapValidatorsWithPromise(validator, CatalystAppError)).rejects.toThrow(
				'unexpected'
			);
		});
	});

	describe('wrapValidators', () => {
		it('should complete silently when validation succeeds', () => {
			expect(() =>
				wrapValidators(() => isNonEmptyString('value', 'field', true), CatalystAppError)
			).not.toThrow();
		});

		it('should wrap CatalystError instances with the provided error type', () => {
			expect(() =>
				wrapValidators(() => isNonEmptyString('', 'field', true), CatalystAppError)
			).toThrow(
				expect.objectContaining({
					code: 'app/INVALID_ARGUMENT',
					message:
						'Value provided for field is expected to be a non-empty and non-null string.'
				})
			);
		});

		it('should rethrow unexpected errors untouched', () => {
			const originalError = new Error('boom');

			expect(() =>
				wrapValidators(() => {
					throw originalError;
				}, CatalystAppError)
			).toThrow(originalError);
		});
	});
});
