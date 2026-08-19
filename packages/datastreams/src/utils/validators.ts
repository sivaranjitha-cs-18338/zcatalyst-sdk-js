import { CatalystDataStreamError } from './errors';

/**
 * Allowed hostname pattern (RFC 1123). Only alphanumeric characters, hyphens,
 * and dots are permitted between labels.
 */
const HOSTNAME_PATTERN =
	/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates that a value is safe to interpolate into a WebSocket URL
 * authority component.
 * @param host - The DataStreams host to validate.
 * @param name - The name of the value being validated, used in error messages.
 * @throws {CatalystDataStreamError} when the host is missing, empty, or contains disallowed characters.
 */
export function assertValidHost(host: unknown, name: string): string {
	if (typeof host !== 'string' || host === '') {
		throw new CatalystDataStreamError(
			'INVALID_ARGUMENT',
			`Value provided for ${name} must be a non-empty String.`,
			host
		);
	}
	const match = HOSTNAME_PATTERN.exec(host);
	if (!match) {
		throw new CatalystDataStreamError(
			'INVALID_ARGUMENT',
			`Value provided for ${name} contains invalid characters. Only alphanumeric ` +
				'characters, hyphens, and dots are allowed.',
			host
		);
	}

	return match[0];
}

/**
 * Verifies that a constructed DataStreams WebSocket URL

 * @param wsUrl - The constructed WebSocket URL to verify.
 * @param expectedHost - The host that `wsUrl` is expected to resolve to.
 * @returns The parsed, verified `URL` instance.
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
