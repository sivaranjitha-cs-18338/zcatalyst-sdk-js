import { Pipeline } from '../src';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { responses } = require('../../../tests/api-responses.js');

describe('test :: pipeline', () => {
	const pipeline: Pipeline = new Pipeline();
	const pipelineId = '1234';

	it('get pipeline details', async () => {
		await expect(pipeline.getPipelineDetails(pipelineId)).resolves.toStrictEqual(
			responses['/pipeline/1234'].GET.data.data
		);
		await expect(pipeline.getPipelineDetails('')).rejects.toThrowError();
	});

	it('run pipeline', async () => {
		await expect(pipeline.runPipeline(pipelineId)).resolves.toStrictEqual(
			responses['/pipeline/1234/run'].POST.data.data
		);
		await expect(pipeline.runPipeline('')).rejects.toThrowError();
	});
});
