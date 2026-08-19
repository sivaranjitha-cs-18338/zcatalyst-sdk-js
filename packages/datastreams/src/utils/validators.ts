import { CatalystDataStreamError } from './errors';

/**
 * Allowed hostname pattern (RFC 1123). Only alphanumeric characters, hyphens,
 * and dots are permitted between labels. Delimiters that carry special
 * meaning in a URL authority (`/`, `\`, `#`, `?`, `@`, `:`, `%`, whitespace,
 * unicode, etc.) are rejected.
 */
const HOSTNAME_PATTERN =
	/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates that a value is safe to interpolate into a WebSocket URL
 * authority component. This guards against authority-injection payloads
 * (e.g. `host/#`, `host@attacker.example`, `host:1234`) that would otherwise
 * cause the DataStreams connection - and its auth key - to be sent to an
 * attacker-controlled origin (SSRF).
 * @param host - The DataStreams host to validate.
 * @param name - The name of the value being validated, used in error messages.
 * @throws {CatalystDataStreamError} when the host is missing, empty, or contains disallowed characters.
 */
export function assertValidHost(host: unknown, name: string): asserts host is string {
	if (typeof host !== 'string' || host === '') {
		throw new CatalystDataStreamError(
			'INVALID_ARGUMENT',
			`Value provided for ${name} must be a non-empty String.`,
			host
		);
	}
	if (!HOSTNAME_PATTERN.test(host)) {
		throw new CatalystDataStreamError(
			'INVALID_ARGUMENT',
			`Value provided for ${name} contains invalid characters. Only alphanumeric ` +
				'characters, hyphens, and dots are allowed.',
			host
		);
	}
}

/**
 * Verifies that a constructed DataStreams WebSocket URL resolves to the
 * expected `wss:` origin for the given host. This is a defense-in-depth
 * check performed immediately before the URL is used to open a connection,
 * so that any future change to URL construction cannot silently reintroduce
 * an authority-injection (SSRF) bypass.
 * @param wsUrl - The constructed WebSocket URL to verify.
 * @param expectedHost - The host that `wsUrl` is expected to resolve to.
 * @returns The parsed, verified `URL` instance. Callers should use this
 * returned object (e.g. its `href`) as the actual value passed to the
 * WebSocket constructor, rather than the original `wsUrl` string, so that
 * the connection is opened from a value that has been demonstrably parsed
 * and validated rather than merely checked and discarded.
 * @throws {CatalystDataStreamError} when the URL does not match the expected authority.
 */
export function assertValidWebSocketUrl(wsUrl: string, expectedHost: string): URL {
	let parsed: URL;
	try {
		parsed = new URL(wsUrl);
	} catch {
		throw new CatalystDataStreamError(
			'INVALID_ARGUMENT',
			'Unable to construct a valid WebSocket URL for the given host.',
			wsUrl
		);
	}
	if (
		parsed.protocol !== 'wss:' ||
		parsed.username !== '' ||
		parsed.password !== '' ||
		parsed.hostname.toLowerCase() !== expectedHost.toLowerCase()
	) {
		throw new CatalystDataStreamError(
			'INVALID_ARGUMENT',
			'The constructed WebSocket URL does not match the expected DataStreams host.',
			wsUrl
		);
	}
	return parsed;
}
