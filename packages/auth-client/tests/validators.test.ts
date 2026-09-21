import { applyQueryString, hasSuffInfo, toUpperCaseKeys } from '../src/utils/validators';

describe('validator helpers', () => {
	describe('applyQueryString', () => {
		it('should append encoded query strings in order', () => {
			expect(
				applyQueryString('https://example.com/resource', {
					search: 'john doe',
					redirect: 'https://example.com/callback?a=1&b=2'
				})
			).toBe(
				'https://example.com/resource?search=john%20doe&redirect=https%3A%2F%2Fexample.com%2Fcallback%3Fa%3D1%26b%3D2'
			);
		});

		it('should return the base URL when there are no query values', () => {
			expect(applyQueryString('https://example.com/resource', {})).toBe(
				'https://example.com/resource'
			);
		});
	});

	describe('toUpperCaseKeys', () => {
		it('should convert keys to upper case without changing values', () => {
			expect(
				toUpperCaseKeys({
					projectId: 'project-1',
					zaid: 123,
					nestedValue: { region: 'us' }
				})
			).toEqual({
				PROJECTID: 'project-1',
				ZAID: 123,
				NESTEDVALUE: { region: 'us' }
			});
		});
	});

	describe('hasSuffInfo', () => {
		it('should return true when all required keys exist', () => {
			expect(hasSuffInfo({ email_id: 'user@example.com', 1: 'first' }, ['email_id', 1])).toBe(
				true
			);
		});

		it('should return false when a required key is missing', () => {
			expect(hasSuffInfo({ email_id: 'user@example.com' }, ['email_id', 'first_name'])).toBe(
				false
			);
		});

		it('should skip automatic failure handling when disabled', () => {
			expect(
				hasSuffInfo({ email_id: 'user@example.com' }, ['email_id', 'first_name'], false)
			).toBe(true);
		});
	});
});
