import { ICatalystClientRes, ResponseHandler } from './fetch-handler';
import { Component, IRequestConfig } from './utils/interfaces';

export class Handler {
	component?: Component;
	/**
	 * @constructor
	 */
	constructor(app?: unknown, component?: Component) {
		this.component = component;
	}

	async send(options: IRequestConfig): Promise<ICatalystClientRes> {
		return (await ResponseHandler.send(
			options,
			this.component?.getComponentName(),
			this.component?.getComponentVersion?.()
		)) as unknown as ICatalystClientRes;
	}
}

export { RequestType, ResponseType } from './utils/enums';
export { CatalystAPIError } from './utils/errors';
export { IRequestConfig };
