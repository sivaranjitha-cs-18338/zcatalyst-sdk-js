import { CatalystAuthError } from '../src/errors';

describe('CatalystAuthError', () => {
	it('prefixes auth error codes with the app namespace', () => {
		const error = new CatalystAuthError('INVALID_CREDENTIAL', 'bad credential', {
			reason: 'missing'
		});

		expect(error.code).toBe('app/INVALID_CREDENTIAL');
		expect(error.message).toBe('bad credential');
		expect(error.value).toEqual({ reason: 'missing' });
		expect(error.statusCode).toBe(400);
	});
});
