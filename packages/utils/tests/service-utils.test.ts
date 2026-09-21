import { CatalystService } from '../src/enums';
import { getServicePath } from '../src/service-utils';

describe('Service utils', () => {
	it('should return the baas path by default', () => {
		expect(getServicePath()).toBe('/baas/v1');
	});

	it('should return the quickml path for QUICKML service', () => {
		expect(getServicePath(CatalystService.QUICKML)).toBe('/quickml/v1');
	});

	it('should return the smartbrowz path for SMARTBROWZ service', () => {
		expect(getServicePath(CatalystService.SMARTBROWZ)).toBe('/browser360/v1');
	});

	it('should fall back to the baas path for unsupported services', () => {
		expect(getServicePath(CatalystService.STRATUS)).toBe('/baas/v1');
	});
});
