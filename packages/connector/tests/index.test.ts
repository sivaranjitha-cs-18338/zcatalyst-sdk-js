import { CONSTANTS } from '@zcatalyst/utils';

import { Connection, Connector } from '../src';
import { getConnectorJson } from '../src/utils/validators';

const pkg = require('../package.json');
const { COMPONENT } = CONSTANTS;

const propJson = {
	falseConnector: {
		client_id: 'false_client_id',
		client_secret: 'false_client_secret',
		auth_url: 'https://oauth.example.com/false/authorize',
		refresh_url: 'https://oauth.example.com/false/refresh',
		refresh_token: 'false_refresh_token',
		redirect_url: 'https://app.example.com/false/callback'
	},
	testConnector: {
		client_id: 'test_client_id',
		client_secret: 'test_client_secret',
		auth_url: 'https://oauth.example.com/test/authorize',
		refresh_url: 'https://oauth.example.com/test/refresh',
		refresh_token: 'test_refresh_token',
		redirect_url: 'https://app.example.com/test/callback'
	},
	empty: {}
};

describe('testing connection', () => {
	it('returns connector instances and component metadata for object input', () => {
		const connection = new Connection(propJson);

		expect(connection.getComponentName()).toBe(COMPONENT.connector);
		expect(connection.getComponentVersion()).toBe(pkg.version);
		expect(connection.getConnector('testConnector')).toBeInstanceOf(Connector);
		expect(connection.getConnector('falseConnector')).toBeInstanceOf(Connector);
	});

	it('loads connector definitions from a JSON file path', () => {
		const connection = new Connection('./tests/connection_properties.json');

		expect(connection.getConnector('testConnector')).toBeInstanceOf(Connector);
		expect(connection.getConnector('falseConnector')).toBeInstanceOf(Connector);
	});

	it('throws for invalid connector definitions and invalid connection input', () => {
		const connection = new Connection(propJson);

		expect(() => connection.getConnector('empty')).toThrowError();
		expect(() => connection.getConnector('noConnector')).toThrowError();

		connection.connectionJson = null;
		expect(() => connection.getConnector('testConnector')).toThrowError(
			'The input passed to connector must be a valid JSON object'
		);

		const badConnection = new Connection('./tests/missing-connection.json');
		expect(() => badConnection.getConnector('testConnector')).toThrowError(
			'The input passed to connector must be a valid JSON object'
		);
	});
});

describe('testing connection validator', () => {
	it('returns connector JSON from an object or a valid file', () => {
		expect(getConnectorJson(propJson)).toBe(propJson);
		expect(getConnectorJson('./tests/connection_properties.json')).toEqual(
			expect.objectContaining({
				testConnector: expect.any(Object),
				falseConnector: expect.any(Object)
			})
		);
	});

	it('returns null for missing files, malformed files, or null input', () => {
		expect(getConnectorJson('./tests/missing-connection.json')).toBeNull();
		expect(getConnectorJson('./tests/invalid-connection.json')).toBeNull();
		expect(getConnectorJson(null)).toBeNull();
	});
});
