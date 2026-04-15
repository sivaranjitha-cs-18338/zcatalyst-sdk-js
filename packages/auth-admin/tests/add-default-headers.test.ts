import { addDefaultAppHeaders } from '../src/add-default-headers';

describe('addDefaultAppHeaders', () => {
	const mockConfig = {
		projectId: 'test-project',
		orgId: 'test-org'
	};

	it('should add default Accept header', () => {
		const headers = {};
		const result = addDefaultAppHeaders(headers, mockConfig as unknown);

		expect(result['Accept']).toContain('application/vnd.catalyst.v2+json');
	});

	it('should prepend to existing Accept header', () => {
		const headers = { Accept: 'application/json' };
		const result = addDefaultAppHeaders(headers, mockConfig as unknown);

		expect(result['Accept']).toContain('application/vnd.catalyst.v2+json');
		expect(result['Accept']).toContain('application/json');
	});

	it('should add CATALYST-COMPONENT header', () => {
		const headers = {};
		const result = addDefaultAppHeaders(headers, mockConfig as unknown);

		expect(result['CATALYST-COMPONENT']).toBe('true');
	});

	it('should add CATALYST-ORG header when orgId is present', () => {
		const headers = {};
		const result = addDefaultAppHeaders(headers, mockConfig as unknown);

		expect(result['CATALYST-ORG']).toBe('test-org');
	});

	it('should not add CATALYST-ORG header when orgId is missing', () => {
		const headers = {};
		const configWithoutOrg = { projectId: 'test-project' };
		const result = addDefaultAppHeaders(headers, configWithoutOrg as unknown);

		expect(result['CATALYST-ORG']).toBeUndefined();
	});

	it('should preserve existing headers', () => {
		const headers = {
			'Custom-Header': 'custom-value',
			'Another-Header': 'another-value'
		};
		const result = addDefaultAppHeaders(headers, mockConfig as unknown);

		expect(result['Custom-Header']).toBe('custom-value');
		expect(result['Another-Header']).toBe('another-value');
	});
});
