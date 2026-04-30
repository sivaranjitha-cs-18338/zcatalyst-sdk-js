/**
 * Catalyst Functions — invoke deployed serverless functions by ID or name.
 *
 * @packageDocumentation
 */

import { Handler, IRequestConfig, RequestType } from '@zcatalyst/transport';
import {
	CatalystService,
	Component,
	CONSTANTS,
	isNonEmptyObject,
	isValidInputString,
	wrapValidatorsWithPromise
} from '@zcatalyst/utils';

import pkg from '../package.json';
const { version } = pkg;
import { CatalystFunctionError } from './utils/error';

const { REQ_METHOD, CREDENTIAL_USER, COMPONENT } = CONSTANTS;

/**
 * Client for invoking Catalyst serverless Functions.
 *
 * @example
 * ```ts
 * const functions = new Functions();
 * const result = await functions.execute('myFunction', { args: { foo: 'bar' } });
 * ```
 */
export class Functions implements Component {
	requester: Handler;
	constructor(app?: unknown) {
		this.requester = new Handler(app, this);
	}

	/** * Returns the component name used by the SDK transport layer. */
	getComponentName(): string {
		return COMPONENT.functions;
	}

	/** * Returns the version of this component as published on npm. */
	getComponentVersion(): string {
		return version;
	}

	/**
	 * Executes a deployed Catalyst Function by ID or name.
	 *
	 * @param id - The function ID or name.
	 * @param options - Invocation options.
	 * @param options.args - Arguments passed to the function. Sent as query string parameters
	 *   for `GET` requests; otherwise sent as a JSON body.
	 * @param options.method - HTTP method to use. Defaults to `GET`.
	 * @param options.data - Alias for `args`, used only when `args` is empty.
	 * @returns The function's response payload as a string.
	 * @throws `CatalystFunctionError` when `id` is not a non-empty string.
	 *
	 * @example
	 * ```ts
	 * const functions = new Functions();
	 *
	 * const greeting = await functions.execute('hello', { args: { name: 'Ada' } });
	 *
	 * const created = await functions.execute('createUser', {
	 *   method: 'POST',
	 *   data: { email: 'ada@example.com' }
	 * });
	 * ```
	 */
	async execute(
		id: string,
		{
			args = {},
			method = REQ_METHOD.get,
			data = {}
		}: { args?: { [x: string]: string }; method?: string; data?: { [x: string]: string } } = {}
	): Promise<string> {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'function_id|functions_name', true);
		}, CatalystFunctionError);
		let functionData: { [x: string]: string } = {};
		if (isNonEmptyObject(args)) {
			functionData = args;
		} else if (isNonEmptyObject(data)) {
			functionData = data;
		}
		const request: IRequestConfig = {
			method,
			path: `/function/${id}/execute`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.user
		};
		if (method === REQ_METHOD.get) {
			request.qs = functionData;
		} else {
			request.data = functionData;
			request.type = RequestType.JSON;
		}
		const resp = await this.requester.send(request);
		return (resp.data.data === undefined ? resp.data.output : resp.data.data) as string;
	}
}
