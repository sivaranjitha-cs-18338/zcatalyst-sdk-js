'use strict';

import { Handler, IRequestConfig, RequestType, ResponseType } from '@zcatalyst/transport';
import {
	CatalystService,
	CONSTANTS,
	isValidInputString,
	wrapValidatorsWithPromise
} from '@zcatalyst/utils';

import { CatalystConnectionsError } from './utils/error';

const { REQ_METHOD, CREDENTIAL_USER } = CONSTANTS;

export class Connections {
	app?: unknown;
	requester: Handler;
	constructor(app?: unknown) {
		this.app = app;
		this.requester = new Handler(app);
	}

	/**
	 * Get the connection credentials for a specified connection.
	 *
	 * @param {string} connectionName - The name of the connection to retrieve.
	 * @returns {Connection} An instance of the requested connection.
	 * @throws {CatalystConnectionError} If the connection JSON is invalid or required properties are missing.
	 *
	 * @example
	 * try {
	 *     const myConnection = catalystApp.getConnectionCredentials('connector_name');
	 *     console.log(myConnection); // Instance of Connection
	 * } catch (error) {
	 *     console.error('Failed to get connection:', error.message);
	 * }
	 */
	async getConnectionCredentials(connectionName: string): Promise<ICatalystConnectionsResponse> {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(connectionName, 'connection_name', true);
		}, CatalystConnectionsError);
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/connection-details`,
			qs: {
				'connection-link-name': connectionName
			},
			type: RequestType.JSON,
			expecting: ResponseType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data;
	}
}
