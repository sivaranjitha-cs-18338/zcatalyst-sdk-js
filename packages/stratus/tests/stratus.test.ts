import { BucketAdmin as Bucket } from '../src/bucket';
import { StratusAdmin as Stratus } from '../src/stratus';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { responses } = require('../../../tests/api-responses.js');

describe('stratus', () => {
	const stratus: Stratus = new Stratus();

	it('list buckets', async () => {
		await expect(stratus.listBuckets()).resolves.toStrictEqual(
			responses['/bucket'].GET.data.data
		);
	});

	it('head bucket', async () => {
		await expect(stratus.headBucket('testBucket')).resolves.toStrictEqual(
			responses['/bucket'].HEAD.statusCode === 200
		);
		await expect(stratus.headBucket('')).rejects.toThrowError();
	});
});
