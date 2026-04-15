import moment from 'moment';

import { Datastore } from '../src';
import { Table } from '../src/table';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { responses } = require('../../../tests/api-responses.js');

describe('test datastore', () => {
	const datastore: Datastore = new Datastore();

	const tableReqRes = {
		[`/table/123`]: {
			GET: {
				statusCode: 200,
				data: {
					data: {
						project_id: {
							project_name: 'testProject',
							id: 12345
						},
						table_name: 'CustomerInfo',
						modified_by: { last_name: 'test' },
						modified_time: moment(moment.now()).format('MMM DD, YYYY hh:mm A'),
						table_id: 123
					}
				}
			}
		},
		[`/table/testTable`]: {
			GET: {
				statusCode: 200,
				data: {
					data: {
						project_id: {
							project_name: 'testProject',
							id: 12345
						},
						table_name: 'CustomerInfo',
						modified_by: { last_name: 'test' },
						modified_time: moment(moment.now()).format('MMM DD, YYYY hh:mm A'),
						table_id: 123
					}
				}
			}
		},
		['/table']: {
			GET: {
				statusCode: 200,
				data: {
					data: [
						{
							project_id: {
								project_name: 'testProject',
								id: 12345
							},
							table_name: 'CustomerInfo',
							modified_by: { last_name: 'test' },
							modified_time: moment(moment.now()).format('MMM DD, YYYY hh:mm A'),
							table_id: 123
						}
					]
				}
			}
		}
	};
	// app.setRequestResponseMap(tableReqRes);
	it('get all tables', async () => {
		await expect(datastore.getAllTables()).resolves.toBeInstanceOf(Array);
	});
	it('get table details', async () => {
		await expect(datastore.getTableDetails('testTable')).resolves.toBeInstanceOf(Table);
		await expect(datastore.getTableDetails('')).rejects.toThrowError();
	});
	it('get table instance', () => {
		expect(datastore.table('testTable')).toBeInstanceOf(Table);
		expect(() => {
			try {
				datastore.table('');
			} catch (error) {
				throw error;
			}
		}).toThrowError();
	});
});
