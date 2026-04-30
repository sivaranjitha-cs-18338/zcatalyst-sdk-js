import { Handler, IRequestConfig } from '@zcatalyst/transport';
import {
	CatalystService,
	Component,
	CONSTANTS,
	isValidInputString,
	wrapValidators,
	wrapValidatorsWithPromise
} from '@zcatalyst/utils';

import pkg from '../package.json';
const { version } = pkg;
import { Table, TableAdmin } from './table';
import { CatalystDataStoreError } from './utils/error';
import { ICatalystTable } from './utils/interface';

const { REQ_METHOD, CREDENTIAL_USER, COMPONENT } = CONSTANTS;

export class Datastore implements Component {
	requester: Handler;
	constructor(app?: unknown) {
		this.requester = new Handler(app, this);
	}

	getComponentName(): string {
		return COMPONENT.datastore;
	}

	getComponentVersion(): string {
		return version;
	}

	/**
	 * Retrieves a table instance without making an API call.
	 *
	 * @param id - The table ID or name.
	 * @returns The table instance.
	 * @throws If the provided ID is invalid.
	 *
	 * @example
	 * const datastore = new Datastore();
	 * const tableById = datastore.table('12345');
	 * const tableByName = datastore.table('Users');
	 */
	table(id: string): Table {
		wrapValidators(() => {
			isValidInputString(id, 'table_id/table_name', true);
		}, CatalystDataStoreError);
		if (!parseInt(id + '')) {
			return new Table(this, { table_name: id + '' });
		}
		return new Table(this, { table_id: id + '' });
	}
}

export class DatastoreAdmin extends Datastore {
	constructor(app?: unknown) {
		super(app);
	}

	/**
	 * Retrieves all tables in the datastore.
	 *
	 * @returns A list of all tables.
	 *
	 * @example
	 * const datastore = new DatastoreAdmin();
	 * const tables = await datastore.getAllTables();
	 */
	async getAllTables(): Promise<Array<Table>> {
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/table`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.user
		};
		const resp = await this.requester.send(request);
		const jsonArr = resp.data.data as Array<ICatalystTable>;
		const tableArr: Array<Table> = [];
		jsonArr.forEach((table) => {
			tableArr.push(new Table(this, table));
		});
		return tableArr;
	}

	/**
	 * Retrieves details of a specific table.
	 *
	 * @param id - The ID of the table.
	 * @returns The table details.
	 * @throws If the provided ID is invalid.
	 *
	 * @example
	 * const datastore = new DatastoreAdmin();
	 * const tableDetails = await datastore.getTableDetails('12345');
	 */
	async getTableDetails(id: string): Promise<Table> {
		await wrapValidatorsWithPromise(() => {
			isValidInputString(id, 'table_id', true);
		}, CatalystDataStoreError);
		const request: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/table/${id}`,
			service: CatalystService.BAAS,
			track: true,
			user: CREDENTIAL_USER.user
		};
		const resp = await this.requester.send(request);
		const json = resp.data.data as ICatalystTable;
		return new Table(this, json);
	}

	/**
	 * Retrieves a table instance without making an API call.
	 *
	 * @param id - The table ID or name.
	 * @returns The table instance.
	 * @throws If the provided ID is invalid.
	 *
	 * @example
	 * const datastore = new Datastore();
	 * const tableById = datastore.table('12345');
	 * const tableByName = datastore.table('Users');
	 */
	table(id: string): TableAdmin {
		wrapValidators(() => {
			isValidInputString(id, 'table_id/table_name', true);
		}, CatalystDataStoreError);
		if (!parseInt(id + '')) {
			return new TableAdmin(this, { table_name: id + '' });
		}
		return new TableAdmin(this, { table_id: id + '' });
	}
}
