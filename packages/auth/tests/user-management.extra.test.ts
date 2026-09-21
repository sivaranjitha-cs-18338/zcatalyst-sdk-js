import pkg from '../package.json';
import { UserManagement, UserManagementAdmin } from '../src/user-management';

describe('user management extras', () => {
	it('should expose component info and parse signup validation requests', async () => {
		const userManagement = new UserManagement();
		const admin = new UserManagementAdmin();

		expect(userManagement.getComponentName()).toBe('UserManagement');
		expect(userManagement.getComponentVersion()).toBe(pkg.version);

		const requestObject = {
			getArgument: jest.fn((name: string) => {
				if (name === 'request_type') {
					return 'add_user';
				}
				if (name === 'request_details') {
					return {
						auth_type: 'web',
						user_details: {
							email_id: 'ava@example.com',
							first_name: 'Ava',
							last_name: 'Stone'
						}
					};
				}
				return undefined;
			})
		};

		expect(admin.getSignupValidationRequest(requestObject as any)).toEqual({
			auth_type: 'web',
			user_details: {
				email_id: 'ava@example.com',
				first_name: 'Ava',
				last_name: 'Stone'
			}
		});

		const requestJson = {
			getArgument: jest.fn((name: string) => {
				if (name === 'request_type') {
					return 'add_user';
				}
				if (name === 'request_details') {
					return JSON.stringify({
						auth_type: 'mobile',
						user_details: {
							email_id: 'ava@example.com',
							first_name: 'Ava',
							last_name: 'Stone'
						}
					});
				}
				return undefined;
			})
		};
		expect(admin.getSignupValidationRequest(requestJson as any)?.auth_type).toBe('mobile');
		expect(
			admin.getSignupValidationRequest({
				getArgument: jest.fn((name: string) => {
					if (name === 'request_type') {
						return 'other';
					}
					return undefined;
				})
			} as any)
		).toBeUndefined();
		expect(() =>
			admin.getSignupValidationRequest({
				getArgument: jest.fn((name: string) => {
					if (name === 'request_type') {
						return 'add_user';
					}
					if (name === 'request_details') {
						return '{oops';
					}
					return undefined;
				})
			} as any)
		).toThrow("Unable to parse 'request_details' from basicio args");
	});

	it('should generate custom tokens through the admin requester', async () => {
		const admin = new UserManagementAdmin();
		const sendSpy = jest.spyOn(admin.requester, 'send').mockResolvedValue({
			data: {
				data: {
					jwt_token: 'jwt-token',
					client_id: 'client-id',
					scopes: ['scope.one']
				}
			}
		} as any);

		await expect(
			admin.generateCustomToken({
				type: 'web',
				user_details: {
					email_id: 'ava@example.com',
					first_name: 'Ava',
					last_name: 'Stone',
					role_name: 'admin'
				}
			})
		).resolves.toEqual({
			jwt_token: 'jwt-token',
			client_id: 'client-id',
			scopes: ['scope.one']
		});
		expect(sendSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				path: '/authentication/custom-token'
			})
		);
	});
});
