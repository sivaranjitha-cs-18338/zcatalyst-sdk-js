import { Mail } from '../src';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { responses } = require('../../../tests/api-responses.js');

describe('email', () => {
	const email: Mail = new Mail();

	it('send email', async () => {
		await expect(
			email.sendMail({
				from_email: 'testFrom',
				to_email: 'testTo',
				subject: 'testSubject'
			})
		).resolves.not.toBeNull();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await expect((email as any).sendMail({})).rejects.toThrowError();
	});
});
