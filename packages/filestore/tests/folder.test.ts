// import { createReadStream } from 'fs';
import { Readable, Stream } from 'stream';
import { Filestore } from '../src';
import { FolderAdmin as Folder } from '../src/folder';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { responses } = require('../../../tests/api-responses.js');

describe('folder', () => {
	const filestore = new Filestore();
	const folder: Folder = filestore.folder('123');

	it('update folder', async () => {
		await expect(folder.update({ folder_name: 'testFolder' })).resolves.toStrictEqual(
			responses['/folder/123'].PUT.data.data
		);
		await expect(folder.update({})).rejects.toThrowError();
		await expect(folder.update({ folder_name: '' })).rejects.toThrowError();
	});
	it('get file details', async () => {
		await expect(folder.getFileDetails('123')).resolves.toStrictEqual(
			responses['/folder/123/file/123'].GET.data.data
		);
		await expect(folder.getFileDetails('1234')).resolves.toStrictEqual(undefined);
		await expect(folder.getFileDetails('')).rejects.toThrowError();
	});
	it('delete file', async () => {
		await expect(folder.deleteFile('123')).resolves.toBeTruthy();
		await expect(folder.deleteFile('1234')).resolves.toBeFalsy();
		await expect(folder.deleteFile('')).rejects.toThrowError();
	});
	// it('upload file', async () => {
	// 	await expect(
	// 		folder.uploadFile({
	// 			code: createReadStream('./tests/connection_properties.json'),
	// 			name: 'connection'
	// 		})
	// 	).resolves.toStrictEqual(foldRes['/folder/123/file'].POST.data.data);
	// 	await expect(
	// 		folder.uploadFile({
	// 			code: createReadStream('./tests/connection_properties.json'),
	// 			name: ''
	// 		})
	// 	).rejects.toThrowError();
	// });
	it('delete folder', async () => {
		await expect(folder.delete()).resolves.toBeTruthy();
		const res = {
			['/folder/1234']: {
				DELETE: {
					statusCode: 200,
					data: {
						data: {
							id: 105000000121078,
							folder_name: 'CustInfo',
							created_time: '2019-03-14T10:18:14+05:30',
							created_by: {
								userId: 54635102,
								email_id: 'emma@zylker.com',
								first_name: 'Amelia',
								last_name: 'Burrows'
							},
							modified_time: '2019-03-14T10:18:14+05:30',
							modified_by: {
								userId: 54690876,
								email_id: 'p.boyle@zylker.com',
								first_name: 'Patricia',
								last_name: 'Boyle'
							},
							project_details: {
								id: 3376000000123022,
								project_name: 'ShipmentTracking'
							},
							file_details: []
						}
					}
				}
			}
		};
		app.setRequestResponseMap(res);
		await expect(folder.delete()).resolves.toBeFalsy();
	});
	it('download file', async () => {
		const res = {
			['/folder/123/file/123/download']: {
				GET: Buffer.alloc(10)
			}
		};
		app.setRequestResponseMap(res);
		await expect(folder.downloadFile('123')).resolves.toBeInstanceOf(Buffer);
		await expect(folder.downloadFile('1234')).resolves.toBeInstanceOf(Buffer);
		await expect(folder.downloadFile('')).rejects.toThrowError();
	});
	it('get file stream', async () => {
		const res = {
			['/folder/123/file/123/download']: {
				GET: {
					statusCode: 200,
					data: {
						data: new Readable()
					}
				}
			}
		};
		app.setRequestResponseMap(res);
		await expect(folder.getFileStream('123')).resolves.toBeInstanceOf(Stream.Readable);
		await expect(folder.getFileStream('1234')).resolves.toBeInstanceOf(Stream.Readable);
		await expect(folder.getFileStream('')).rejects.toThrowError();
	});
	it('to string', () => {
		expect(folder.toString()).toStrictEqual('{"id":"123"}');
	});
	it('to JSON', () => {
		expect(folder.toJSON()).toStrictEqual({ id: '123' });
	});
});
