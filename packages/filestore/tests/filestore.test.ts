// import { createReadStream } from 'fs';
// import { Readable, Stream } from 'stream';

import { Filestore } from '../src';
import { FolderAdmin as Folder } from '../src/folder';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { responses } = require('../../../tests/api-responses.js');

describe('file store', () => {
	const filestore: Filestore = new Filestore();

	it('create folder', async () => {
		await expect(filestore.createFolder('testFolder')).resolves.toStrictEqual(
			responses['/folder/123'].GET.data.data
		);
		await expect(filestore.createFolder('')).rejects.toThrowError();
	});
	it('get all folder details', async () => {
		await expect(filestore.getAllFolders()).resolves.toBeInstanceOf(Array);
	});
	it('get folder details', async () => {
		await expect(filestore.getFolderDetails('123')).resolves.toStrictEqual(
			responses['/folder/123'].GET.data.data
		);
		await expect(filestore.getFolderDetails('')).rejects.toThrowError();
	});
	it('get folder instance', () => {
		expect(filestore.folder('123')).toBeInstanceOf(Folder);
		expect(() => {
			try {
				filestore.folder('');
			} catch (error) {
				throw error;
			}
		}).toThrowError();
	});
});
