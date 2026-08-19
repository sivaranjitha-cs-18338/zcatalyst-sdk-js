import { CatalystDataStreamError } from '../src/utils/errors';
import { assertValidHost, assertValidWebSocketUrl } from '../src/utils/validators';

describe('assertValidHost', () => {
	it('should accept a plain hostname', () => {
		expect(() => assertValidHost('example.com', 'url')).not.toThrow();
	});

	it('should accept a hostname with hyphenated labels', () => {
		expect(() => assertValidHost('my-catalyst-domain.example.com', 'url')).not.toThrow();
	});

	it('should reject a non-string value', () => {
		expect(() => assertValidHost(undefined, 'url')).toThrow(CatalystDataStreamError);
		expect(() => assertValidHost(123, 'url')).toThrow(CatalystDataStreamError);
	});

	it('should reject an empty string', () => {
		expect(() => assertValidHost('', 'url')).toThrow(CatalystDataStreamError);
	});

	it.each([
		['a path segment', 'example.com/evil'],
		['embedded credentials', 'example.com@attacker.example'],
		['a port delimiter', 'example.com:1234'],
		['a fragment', 'example.com#frag'],
		['a query string', 'example.com?x=1'],
		['whitespace', 'example.com '],
		['a backslash', 'example.com\\evil']
	])('should reject a host containing %s', (_desc, host) => {
		expect(() => assertValidHost(host, 'url')).toThrow(CatalystDataStreamError);
	});
});

describe('assertValidWebSocketUrl', () => {
	it('should accept a wss url that matches the expected host', () => {
		expect(() =>
			assertValidWebSocketUrl('wss://example.com/wsconnect?prd=CY', 'example.com')
		).not.toThrow();
	});

	it('should be case-insensitive when comparing hosts', () => {
		expect(() =>
			assertValidWebSocketUrl('wss://Example.COM/wsconnect', 'example.com')
		).not.toThrow();
	});

	it('should reject a non-wss protocol', () => {
		expect(() =>
			assertValidWebSocketUrl('https://example.com/wsconnect', 'example.com')
		).toThrow(CatalystDataStreamError);
	});

	it('should reject a url with embedded credentials', () => {
		expect(() =>
			assertValidWebSocketUrl('wss://user:pass@example.com/wsconnect', 'example.com')
		).toThrow(CatalystDataStreamError);
	});

	it('should reject a url whose host does not match the expected host', () => {
		expect(() =>
			assertValidWebSocketUrl('wss://attacker.example/wsconnect', 'example.com')
		).toThrow(CatalystDataStreamError);
	});

	it('should reject an unparsable url', () => {
		expect(() => assertValidWebSocketUrl('not a url', 'example.com')).toThrow(
			CatalystDataStreamError
		);
	});
});
