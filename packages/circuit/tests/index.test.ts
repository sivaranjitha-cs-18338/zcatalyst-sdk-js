import { Circuit } from '../src';

const { responses } = require('../../../tests/api-responses.js');

describe('testing circuit', () => {
	const circuit: Circuit = new Circuit();
	it('Circuit execute', async () => {
		await expect(
			circuit.execute('123', 'sampleName', {
				name: 'Aaron Jones'
			})
		).resolves.toStrictEqual(responses[`/circuit/123/execute`].POST.data.data);
		await expect(
			circuit.execute('1234', 'sampleName', {
				name: 'Aaron Jones'
			})
		).resolves.toStrictEqual(undefined);
		await expect(
			circuit.execute('', 'sampleName', {
				name: 'Aaron Jones'
			})
		).rejects.toThrowError();
		await expect(
			circuit.execute('123', '', {
				name: 'Aaron Jones'
			})
		).rejects.toThrowError();
	});
	it('circuit status', async () => {
		await expect(circuit.status('xyz', 'xyz')).resolves.toStrictEqual(
			responses['/circuit/xyz/execution/xyz'].GET.data.data
		);
		await expect(circuit.status('xyzz', 'xyzz')).resolves.toStrictEqual(undefined);
		await expect(circuit.status('', 'xyz')).rejects.toThrowError();
		await expect(circuit.status('xyz', '')).rejects.toThrowError();
		await expect(circuit.status('', '')).rejects.toThrowError();
	});
	it('circuit abort', async () => {
		await expect(circuit.abort('xyz', 'xyz')).resolves.toStrictEqual(
			responses['/circuit/xyz/execution/xyz'].DELETE.data.data
		);
		await expect(circuit.abort('xyzz', 'xyzz')).resolves.toStrictEqual(undefined);
		await expect(circuit.abort('', 'xyz')).rejects.toThrowError();
		await expect(circuit.abort('xyz', '')).rejects.toThrowError();
		await expect(circuit.abort('', '')).rejects.toThrowError();
	});
});
