// Browser-compatible logger without Node.js console import
interface ICatalystLoggerOptions {
	enable_info: boolean;
	enable_warn: boolean;
	enable_error: boolean;
	enable_debug: boolean;
	enable_fine: boolean;
}

/**
 * The `ZCLogger` supports the following log levels based on the precedence, as the level with the highest values will have the most precedence.
 * i.e. the log level acts as a minimum threshold and allows the logs with levels equal to or higher to be logged.
 *
 * For Example, if we set the log level to WARN(4) the levels WARN(4) and ERROR(5) will be logged as they are equal to or higher than the
 * threshold set by log level which is WARN(4). Whereas the logs INFO(3), DEBUG(2) and FINE(1) won't be logged as their level is lesser than the
 * set threshold
 *
 * ```md
 * | Level | Precedence |
 * |-------|------------|
 * | NONE  | INF        |
 * | ALL   | 0          |
 * | FINE  | 1          |
 * | DEBUG | 2          |
 * | INFO  | 3          |
 * | WARN  | 4          |
 * | ERROR | 5          |
 * ```
 */
export enum LEVEL {
	NONE = 'none',
	ALL = 'all',
	FINE = 'fine',
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error'
}

// Browser-compatible console functions
const browserConsole = {
	log: (...args: Array<unknown>) => {
		// eslint-disable-next-line no-console
		if (typeof console !== 'undefined' && console.log) {
			// eslint-disable-next-line no-console
			console.log(...args);
		}
	},
	info: (...args: Array<unknown>) => {
		// eslint-disable-next-line no-console
		if (typeof console !== 'undefined' && console.info) {
			// eslint-disable-next-line no-console
			console.info(...args);
		}
	},
	warn: (...args: Array<unknown>) => {
		// eslint-disable-next-line no-console
		if (typeof console !== 'undefined' && console.warn) {
			// eslint-disable-next-line no-console
			console.warn(...args);
		}
	},
	error: (...args: Array<unknown>) => {
		// eslint-disable-next-line no-console
		if (typeof console !== 'undefined' && console.error) {
			// eslint-disable-next-line no-console
			console.error(...args);
		}
	},
	debug: (...args: Array<unknown>) => {
		// eslint-disable-next-line no-console
		if (typeof console !== 'undefined' && console.debug) {
			// eslint-disable-next-line no-console
			console.debug(...args);
		}
	}
};

class Logger {
	logOptions: ICatalystLoggerOptions;

	constructor(options?: ICatalystLoggerOptions) {
		this.logOptions = {
			enable_debug: options?.enable_debug || false,
			enable_error: options?.enable_error || false,
			enable_info: options?.enable_info || false,
			enable_warn: options?.enable_warn || false,
			enable_fine: options?.enable_fine || false
		};
	}

	/**
	 * Change the logger options at runtime.
	 * @param logOptions log options to set.
	 */
	setLogOptions(logOptions: ICatalystLoggerOptions): void {
		this.logOptions = logOptions;
	}

	/**
	 * get the logger options.
	 */
	getLogOptions(): ICatalystLoggerOptions {
		return this.logOptions;
	}

	/**
	 * Log debug message.
	 * @param args arguments to log.
	 */
	debug(...args: Array<unknown>): void {
		if (this.logOptions.enable_debug) {
			browserConsole.debug('[ZCatalyst-DEBUG]', ...args);
		}
	}

	/**
	 * Log info message.
	 * @param args arguments to log.
	 */
	info(...args: Array<unknown>): void {
		if (this.logOptions.enable_info) {
			browserConsole.info('[ZCatalyst-INFO]', ...args);
		}
	}

	/**
	 * Log error message.
	 * @param args arguments to log.
	 */
	error(...args: Array<unknown>): void {
		if (this.logOptions.enable_error) {
			browserConsole.error('[ZCatalyst-ERROR]', ...args);
		}
	}

	/**
	 * Log warning message.
	 * @param args arguments to log.
	 */
	warn(...args: Array<unknown>): void {
		if (this.logOptions.enable_warn) {
			browserConsole.warn('[ZCatalyst-WARN]', ...args);
		}
	}

	/**
	 * Log fine message.
	 * @param args arguments to log.
	 */
	fine(...args: Array<unknown>): void {
		if (this.logOptions.enable_fine) {
			browserConsole.debug('[ZCatalyst-FINE]', ...args);
		}
	}
}

const ZCLogger = new Logger();

export { ICatalystLoggerOptions, Logger, ZCLogger };
