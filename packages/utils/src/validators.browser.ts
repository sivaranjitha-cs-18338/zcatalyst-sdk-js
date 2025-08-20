/**
 * Browser-compatible validators module that avoids Node.js-specific dependencies.
 */
import { CatalystAppError, CatalystError } from './errors';

/**
 * Validates that a value is an array.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is an array or not.
 */
export function isArray(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (Array.isArray(value)) {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be an array.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a value is a boolean.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a boolean or not.
 */
export function isBoolean(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (typeof value === 'boolean') {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be a boolean.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a value is a number.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a number or not.
 */
export function isNumber(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (typeof value === 'number' && !isNaN(value)) {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be a number.`,
			value
		});
	}
	return false;
}

/**
 * Validates if a value is a valid number.
 *
 * @param value the value to validate
 * @param throwErr whether to throw error or resolve to false
 * @returns if the value is a valid number or not
 */
export function isValidNumber(value: unknown, throwErr = false): boolean {
	if (typeof value !== 'number') {
		if (throwErr) {
			throw new CatalystError({
				code: 'INVALID_NUMBER',
				message: 'Not a number type',
				value
			});
		}
		return false;
	}
	if (
		[Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
			.map((val) => val.toString())
			.includes((value as number).toString())
	) {
		if (throwErr) {
			throw new CatalystError({
				code: 'INVALID_NUMBER',
				message: 'Special number values cannot be used',
				value
			});
		}
		return false;
	} else if (value > Number.MAX_SAFE_INTEGER) {
		if (throwErr) {
			throw new CatalystError({
				code: 'UNSAFE_NUMBER',
				message: `Number ${value.toString()} is greater than Number.MAX_SAFE_INTEGER. Use BigInt`,
				value
			});
		}
		return false;
	} else if (value < Number.MIN_SAFE_INTEGER) {
		if (throwErr) {
			throw new CatalystError({
				code: 'UNSAFE_NUMBER',
				message: `Number ${value.toString()} is lesser than Number.MIN_SAFE_INTEGER. Use BigInt`,
				value
			});
		}
		return false;
	}
	return true;
}

/**
 * Validates that a value is a string.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a string or not.
 */
export function isString(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (typeof value === 'string') {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be a string.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a value is a function.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a function or not.
 */
export function isFunction(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (typeof value === 'function') {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be a function.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a value is a nullable object.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is an object or not.
 */
export function isObject(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (typeof value === 'object' && !isArray(value)) {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be an object.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a string is a valid email.
 *
 * @param {unknown} email The string to validate.
 * @return {boolean} Whether the string is valid email or not.
 */
export function isEmail(email: unknown): boolean {
	if (!isString(email)) {
		return false;
	}
	// There must at least one character before the @ symbol and another after.
	const re = /^[^@]+@[^@]+$/;
	return re.test(email as string);
}

/**
 * Validates that a string is a valid web URL using browser-compatible URL API.
 *
 * @param {unknown} urlStr The string to validate.
 * @return {boolean} Whether the string is valid web URL or not.
 */
export function isURL(
	urlStr: unknown,
	allowedProtocols: Array<string> = ['http:', 'https:']
): boolean {
	if (typeof urlStr !== 'string' || !urlStr.trim()) {
		return false;
	}
	try {
		const url = new URL(urlStr);
		if (!allowedProtocols.includes(url.protocol)) {
			return false;
		}
		if (!url.hostname || url.hostname.length === 0) {
			return false;
		}
		const hostnameRegex = /^[a-z0-9.-]+$/i;
		if (!hostnameRegex.test(url.hostname)) {
			return false;
		}
		return true;
	} catch {
		return /^((https?:\/\/)?[\w.-]+(\.[\w.-]+)+\.?(:\d+)?(\/\S*)?(\?\S+)?)$/.test(urlStr);
	}
}

/**
 * Alias for isURL for backward compatibility.
 */
export function isValidUrl(urlStr: unknown, allowedProtocols?: Array<string>): boolean {
	return isURL(urlStr, allowedProtocols);
}

/**
 * Validates that a value is a non-empty string.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a non-empty string or not.
 */
export function isNonEmptyString(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (isString(value) && value !== '') {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be a non-empty and non-null string.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a value is a non-null object.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a non-null object or not.
 */
export function isNonNullObject(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (isObject(value) && value !== null) {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be a non-null json object.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a value is a non-empty object.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a non-empty object or not.
 */
export function isNonEmptyObject(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (
		isNonNullObject(value, name, throwErr) &&
		Object.keys(value as Record<string, unknown>).length !== 0
	) {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be a non-empty and non-null json object.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a value is a non-empty array.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a non-empty array or not.
 */
export function isNonEmptyArray(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (isArray(value) && (value as Array<unknown>).length > 0) {
		return true;
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `Value provided for ${name} is expected to be a non-empty array.`,
			value
		});
	}
	return false;
}

/**
 * Validates that a value is a non-empty string with valid input characters.
 *
 * @param {unknown} value The value to validate.
 * @param {string} [name] The name of the value to use in error.
 * @param {boolean} [throwErr] Boolean to determine if error needs to be thrown.
 * @return {boolean} Whether the value is a valid input string or not.
 */
export function isValidInputString(value: unknown, name?: string, throwErr?: boolean): boolean {
	if (isNonEmptyString(value, name, throwErr)) {
		if (/^[a-zA-Z0-9-_]+$/.test(value as string)) {
			return true;
		}
	}
	if (throwErr) {
		throw new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: `The value provided for ${name} contains invalid characters.`,
			value
		});
	}
	return false;
}

/**
 * Wraps the validators in a promise so that the promise chain wont fail.
 *
 * @param {function} targetFunction The function that will be executed.
 * @param {CatalystAppError} errorInstance Error that should be thrown.
 * @return {Promise} if the target functions doesnt throw error this will resolve else reject.
 */
export function wrapValidatorsWithPromise(
	targetFunction: () => void,
	errorInstance: typeof CatalystAppError
): Promise<void> {
	return new Promise((resolve, reject) => {
		try {
			targetFunction();
		} catch (e) {
			// error is assumed to be a CatalystError Instance
			if (e instanceof CatalystError) {
				reject(new errorInstance(e.code, e.message));
			}
			reject(e);
		}
		resolve();
	});
}

/**
 * Executes the target function and throws a custom error if it fails.
 *
 * @param {function} targetFunction The function that will be executed.
 * @param {CatalystAppError} errorInstance Error that should be thrown.
 */
export function wrapValidators(
	targetFunction: () => void,
	errorInstance: typeof CatalystAppError
): void {
	try {
		targetFunction();
	} catch (e) {
		// error is assumed to be a CatalystError Instance
		if (e instanceof CatalystError) {
			throw new errorInstance(e.code, e.message);
		}
		throw e;
	}
}
