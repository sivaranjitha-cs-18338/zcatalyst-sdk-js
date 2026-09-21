import { showIframeConfirmModal } from '../src/internal/iframe-confirm-modal';
import { wrapCheck, wrapWithPromise } from '../src/utils/functions';
import { buildPopupLoginUrl, buildPopupLogoutUrl, openPopupWindow } from '../src/utils/popup-auth';
import { assertPopupAuthAllowed } from '../src/utils/popup-support';
import { applyQueryString, hasSuffInfo, toUpperCaseKeys } from '../src/utils/validators';

describe('auth utilities', () => {
	const realGetElementById = Document.prototype.getElementById;

	beforeEach(() => {
		document.getElementById = realGetElementById.bind(
			document
		) as typeof document.getElementById;
		Object.defineProperty(window, 'screenX', { value: 50, configurable: true });
		Object.defineProperty(window, 'outerWidth', { value: 1200, configurable: true });
		Object.defineProperty(window, 'screenY', { value: 20, configurable: true });
		Object.defineProperty(window, 'outerHeight', { value: 900, configurable: true });
	});

	describe('validators helpers', () => {
		it('should apply query strings and encode values', () => {
			expect(
				applyQueryString('/accounts/signin', { portal: '123 45', hide_signup: true })
			).toBe('/accounts/signin?portal=123%2045&hide_signup=true');
		});

		it('should convert object keys to uppercase', () => {
			expect(toUpperCaseKeys({ email_id: 'user@example.com', org_id: 42 })).toEqual({
				EMAIL_ID: 'user@example.com',
				ORG_ID: 42
			});
		});

		it('should detect sufficient info and return false when keys are missing', () => {
			expect(
				hasSuffInfo({ email_id: 'user@example.com', first_name: 'Ava' }, ['email_id'])
			).toBe(true);
			expect(hasSuffInfo({ email_id: 'user@example.com' }, ['email_id', 'first_name'])).toBe(
				false
			);
		});

		it('should execute wrapped callbacks', async () => {
			const callback = jest.fn();
			await expect(wrapCheck(callback)).resolves.toBe('success');
			await expect(wrapWithPromise(callback)).resolves.toBe('success');
			expect(callback).toHaveBeenCalledTimes(2);
		});
	});

	describe('popup url helpers', () => {
		it('should build popup login and logout urls from config', () => {
			const loginUrl = buildPopupLoginUrl('http://localhost:3000', 'event-123', {
				isHosted: true,
				cssUrl: 'https://cdn.example.com/auth.css',
				signInProvidersOnly: true,
				forgotPasswordCssUrl: 'https://cdn.example.com/forgot.css',
				forgotPasswordId: 'forgot-container',
				is_customize_forgot_password: true,
				redirectUrl: '/dashboard',
				serviceUrl: '/service'
			});

			expect(loginUrl).toContain('/__catalyst/auth/login/popup/event-123#');
			expect(loginUrl).toContain('hosted=true');
			expect(loginUrl).toContain('css_url=https%3A%2F%2Fcdn.example.com%2Fauth.css');
			expect(loginUrl).toContain('providers_only=true');
			expect(loginUrl).toContain('fp_css_url=https%3A%2F%2Fcdn.example.com%2Fforgot.css');
			expect(loginUrl).toContain('forgot_password_id=forgot-container');
			expect(loginUrl).toContain('is_customize_fp=true');
			expect(loginUrl).toContain('redirect_url=%2Fdashboard');
			expect(loginUrl).toContain('service_url=%2Fservice');
			expect(buildPopupLogoutUrl('http://localhost:3000')).toBe(
				'http://localhost:3000/__catalyst/auth/logout/popup'
			);
		});

		it('should open a centered popup window and throw when blocked', () => {
			const popup = { closed: false } as Window;
			const openSpy = jest
				.spyOn(window, 'open')
				.mockReturnValueOnce(popup)
				.mockReturnValueOnce(null);

			expect(
				openPopupWindow({
					url: 'http://localhost:3000/popup',
					name: 'auth',
					width: 600,
					height: 700
				})
			).toBe(popup);
			expect(openSpy).toHaveBeenNthCalledWith(
				1,
				'http://localhost:3000/popup',
				'auth',
				expect.stringContaining('left=350')
			);
			expect(() =>
				openPopupWindow({ url: 'http://localhost:3000/popup', name: 'auth' })
			).toThrow('Popup was blocked by the browser');
		});
	});

	describe('popup support checks', () => {
		it('should reject when IndexedDB open is blocked', async () => {
			(global as unknown as { indexedDB: unknown }).indexedDB = {
				open: jest.fn(() => {
					const req: Record<string, (() => void) | unknown> = {};
					queueMicrotask(() => {
						(req.onblocked as (() => void) | undefined)?.();
					});
					return req;
				})
			};

			await expect(assertPopupAuthAllowed()).rejects.toThrow('IndexedDB could not be opened');
		});
	});

	describe('iframe confirm modal', () => {
		it('should render in the body by default and reject on confirm failure', async () => {
			const onConfirm = jest.fn().mockRejectedValue(new Error('nope'));
			const promise = showIframeConfirmModal(onConfirm, undefined, 'Continue');
			const button = document.getElementById('zc-signin-button') as HTMLButtonElement;

			expect(button).not.toBeNull();
			expect(button.textContent).toBe('Continue');
			button.click();

			await expect(promise).rejects.toThrow('nope');
			expect(button.disabled).toBe(false);
		});
	});
});
