import moment from 'moment';

import { ZCQL } from '../src';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { responses } = require('../../../tests/api-responses.js');

describe('zcql', () => {
	const zcql: ZCQL = new ZCQL();

	it('execute ZCQL Query', async () => {
		await expect(zcql.executeZCQLQuery('execute query')).resolves.toStrictEqual(
			responses['/query'].POST.data.data
		);
		await expect(zcql.executeZCQLQuery('')).rejects.toThrow();
	});
});
