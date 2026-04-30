/**
 * Catalyst Circuit — orchestrate workflows that span multiple Catalyst components.
 *
 * @packageDocumentation
 */

import { Handler, IRequestConfig, RequestType } from '@zcatalyst/transport';
import {
	CatalystService,
	Component,
	CONSTANTS,
	isNonEmptyString,
	isValidInputString,
	wrapValidatorsWithPromise
} from '@zcatalyst/utils';

import pkg from '../package.json';
const { version } = pkg;
import { CatalystCircuitError } from './utils/error';

const { REQ_METHOD, COMPONENT, CREDENTIAL_USER } = CONSTANTS;

export class Circuit implements Component {
	requester: Handler;
	constructor(app?: unknown) {
		this.requester = new Handler(app, this);
	}

	/**
	 * Returns the component name.
	 * @returns The name of the circuit component.
	 */
	getComponentName(): string {
		return COMPONENT.circuit;
	}

	getComponentVersion(): string {
		return version;
	}

	/**
	 * Executes a specific circuit.
	 * @param id - The circuit ID.
	 * @param name - The execution name.
	 * @param input - Optional input parameters.
	 * @returns The execution response.
	 * @throws If the circuit ID or name is invalid.
	 */
	async execute(id: string, name: string, input?: { [x: string]: string }): Promise<unknown> {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'circuit_id', true);
			isNonEmptyString(name, 'name', true);
		}, CatalystCircuitError);
		const request: IRequestConfig = {
			method: REQ_METHOD.post,
			path: `/circuit/${id}/execute`,
			data: {
				name,
				input: input === undefined ? {} : input
			},
			type: RequestType.JSON,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data;
	}

	/**
	 * Fetches the status of a specific circuit execution.
	 * @param id - The circuit ID.
	 * @param exeId - The execution ID.
	 * @returns The execution status response.
	 * @throws If the circuit ID or execution ID is invalid.
	 */
	async status(id: string, exeId: string | number) {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'circuit_id', true);
			isValidInputString(exeId, 'execution_id', true);
		}, CatalystCircuitError);

		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/circuit/${id}/execution/${exeId}`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data;
	}

	/**
	 * Aborts a running circuit execution.
	 * @param id - The circuit ID.
	 * @param exeId - The execution ID.
	 * @returns The response confirming the execution abort.
	 * @throws If the circuit ID or execution ID is invalid.
	 */
	async abort(id: string, exeId: string) {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'circuit_id', true);
			isValidInputString(exeId, 'execution_id', true);
		}, CatalystCircuitError);

		const request: IRequestConfig = {
			method: REQ_METHOD.delete,
			path: `/circuit/${id}/execution/${exeId}`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.admin
		};
		const resp = await this.requester.send(request);
		return resp.data.data;
	}
}
