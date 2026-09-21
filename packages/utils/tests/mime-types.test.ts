import { getContentType } from '../src/mime-types';

describe('Mime types', () => {
	it('should resolve known extensions regardless of case', () => {
		expect(getContentType('report.JSON')).toBe('application/json');
		expect(getContentType('photo.JPEG')).toBe('image/jpeg');
	});

	it('should return octet-stream for unknown extensions', () => {
		expect(getContentType('archive.custom')).toBe('application/octet-stream');
	});

	it('should return octet-stream when the file name has no extension', () => {
		expect(getContentType('README')).toBe('application/octet-stream');
	});
});
