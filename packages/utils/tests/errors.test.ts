import { CatalystAppError, CatalystError, PrefixedCatalystError } from '../src/errors';

describe('Errors', () => {
	it('should expose error properties and default statusCode', () => {
		const error = new CatalystError({
			code: 'INVALID_ARGUMENT',
			message: 'Bad input',
			value: 'field-value'
		});

		expect(error.code).toBe('INVALID_ARGUMENT');
		expect(error.message).toBe('Bad input');
		expect(error.value).toBe('field-value');
		expect(error.statusCode).toBe(400);
	});

	it('should serialize with an explicit statusCode', () => {
		const error = new CatalystError({
			code: 'UNAUTHORIZED',
			message: 'Denied',
			value: { resource: 'job' },
			statusCode: 401
		});

		expect(error.toJSON()).toEqual({
			code: 'UNAUTHORIZED',
			message: 'Denied',
			value: { resource: 'job' },
			statusCode: 401
		});
		expect(error.toString()).toBe(
			JSON.stringify({
				code: 'UNAUTHORIZED',
				message: 'Denied',
				value: { resource: 'job' },
				statusCode: 401
			})
		);
	});

	it('should prefix codes for prefixed and app errors', () => {
		const prefixedError = new PrefixedCatalystError(
			'auth',
			'MISSING_TOKEN',
			'Token is missing',
			'header',
			403
		);
		const appError = new CatalystAppError('INVALID_PROJECT_INSTANCE', 'Project is invalid', {
			id: '101'
		});

		expect(prefixedError.code).toBe('auth/MISSING_TOKEN');
		expect(prefixedError.statusCode).toBe(403);
		expect(appError.code).toBe('app/INVALID_PROJECT_INSTANCE');
		expect(appError.message).toBe('Project is invalid');
		expect(appError.value).toEqual({ id: '101' });
	});
});
