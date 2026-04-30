export interface ICatalystError {
	code: string;
	message: string;
	value?: unknown;
	statusCode?: number;
}

export class CatalystError extends Error {
	errorInfo: ICatalystError;
	constructor(errorInfo: ICatalystError) {
		super(errorInfo.message);
		this.errorInfo = errorInfo;
	}

	/** @returns The error code. */
	get code(): string {
		return this.errorInfo?.code;
	}

	/** @returns The error message. */
	get message(): string {
		return this.errorInfo?.message;
	}

	/** @returns The value that caused this error. */
	get value(): unknown {
		return this.errorInfo?.value;
	}

	/** @returns The error status code. */
	get statusCode(): number {
		return this.errorInfo.statusCode || 400;
	}

	/** @returns The object representation of the error. */
	toJSON(): ICatalystError {
		return {
			code: this.code,
			message: this.message,
			value: this.value,
			statusCode: this.statusCode
		};
	}

	/** @returns The string representation of the error. */
	toString(): string {
		return JSON.stringify(this.toJSON());
	}
}

export class PrefixedCatalystError extends CatalystError {
	codePrefix: string;
	constructor(
		codePrefix: string,
		code: string,
		message: string,
		value?: unknown,
		statusCode?: number
	) {
		super({
			code: `${codePrefix}/${code}`,
			message,
			value,
			statusCode
		});
		this.codePrefix = codePrefix;
	}
}

export class CatalystAppError extends PrefixedCatalystError {
	constructor(code: string, message: string, value?: unknown) {
		super('app', code, message, value);
	}
}
