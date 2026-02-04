import { Search } from '../src';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { responses } = require('../../../tests/api-responses.js');

describe('search', () => {
	const search: Search = new Search();
	it('execute search query', async () => {
		await expect(
			search.executeSearchQuery({
				search: 'test',
				search_table_columns: { test_table: ['test_column'] },
				select_table_columns: { test_table: ['test_column'] },
				order_by: { test_column: 'test_column' },
				start: 0,
				end: 10
			})
		).resolves.toStrictEqual(responses['/search'].POST.data.data);
		await expect(
			search.executeSearchQuery({
				search: 'test',
				search_table_columns: { test_table: ['test_column'] }
			})
		).resolves.toStrictEqual(responses['/search'].POST.data.data);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await expect((search as any).executeSearchQuery({})).rejects.toThrowError();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await expect((search as any).executeSearchQuery({ xx: 'xx' })).rejects.toThrowError();
	});
});
