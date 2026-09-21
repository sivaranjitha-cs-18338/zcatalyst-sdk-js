import { IframeSignInManager } from '../src/internal/iframe-signin';

describe('IframeSignInManager', () => {
	const realGetElementById = Document.prototype.getElementById;

	beforeEach(() => {
		document.getElementById = realGetElementById.bind(
			document
		) as typeof document.getElementById;
		document.body.innerHTML = `
			<div id="signin-root"></div>
			<div id="forgot-root"></div>
		`;
		window.location.pathname = '/';
		window.location.search = '?service_url=%2Ffrom-query';
	});

	function createIframeDocument(options?: { hasFedLogins?: boolean }) {
		const iframeDoc = document.implementation.createHTMLDocument('iframe');
		const loginIdContainer = iframeDoc.createElement('div');
		loginIdContainer.id = 'login_id_container';
		const fieldError = iframeDoc.createElement('div');
		fieldError.className = 'fielderror';
		loginIdContainer.appendChild(fieldError);

		const loginInput = iframeDoc.createElement('input');
		loginInput.id = 'login_id';
		loginInput.value = 'ava@example.com';

		const forgotContainer = iframeDoc.createElement('div');
		forgotContainer.id = 'forgotpassword';
		const forgotLink = iframeDoc.createElement('a');
		forgotContainer.appendChild(forgotLink);
		const blueForgot = iframeDoc.createElement('button');
		blueForgot.id = 'blueforgotpassword';

		const fieldContainer = iframeDoc.createElement('div');
		fieldContainer.className = 'fieldcontainer';
		const fieldParent = iframeDoc.createElement('div');
		const fieldGrandParent = iframeDoc.createElement('div');
		fieldGrandParent.appendChild(fieldParent);
		fieldParent.appendChild(fieldContainer);
		if (options?.hasFedLogins) {
			const fed = iframeDoc.createElement('div');
			fed.className = 'fed_2show';
			fieldGrandParent.appendChild(fed);
		}

		const signinContainer = iframeDoc.createElement('div');
		signinContainer.className = 'signin_container';
		const signinBox = iframeDoc.createElement('div');
		signinBox.className = 'signin_box';

		iframeDoc.body.append(
			loginIdContainer,
			loginInput,
			forgotContainer,
			blueForgot,
			fieldGrandParent,
			signinContainer,
			signinBox
		);

		return {
			iframeDoc,
			loginInput,
			fieldError,
			forgotLink,
			signinContainer,
			signinBox,
			fieldContainer
		};
	}

	it('should render the sign-in iframe, override i18n values and rewrite account-not-found errors', async () => {
		const manager = new IframeSignInManager(
			'portal-1',
			'project-1',
			(url) => `redirect:${url}`
		);
		const { iframeDoc, fieldError, signinContainer, signinBox, fieldContainer } =
			createIframeDocument();

		await manager.renderSignInIframe(
			'signin-root',
			{ signInProvidersOnly: true, cssUrl: 'https://cdn.example.com/signin.css' },
			false
		);

		const iframe = document.getElementById('iam_iframe') as HTMLIFrameElement;
		const iframeWindow = { document: iframeDoc, I18N: { data: {} as Record<string, unknown> } };
		Object.defineProperty(iframe, 'contentWindow', { value: iframeWindow, configurable: true });
		Object.defineProperty(iframe, 'contentDocument', { value: iframeDoc, configurable: true });

		iframe.onload?.(new Event('load'));

		expect(iframe.src).toContain('/accounts/p/portal-1/signin?');
		expect(iframe.src).toContain('css_url=https://cdn.example.com/signin.css');
		expect(iframe.src).toContain('hide_fs=true');
		expect(iframe.src).toContain('serviceurl=redirect%3A%2Ffrom-query');
		expect((iframeDoc.getElementById('login_id') as HTMLInputElement).placeholder).toBe(
			'Please enter your email address'
		);
		expect(
			(iframeWindow.I18N?.data as Record<string, string>)[
				'IAM.NEW.SIGNIN.ENTER.EMAIL.OR.MOBILE'
			]
		).toBe('Please enter your email address');
		expect(fieldContainer.style.display).toBe('none');
		expect(signinContainer.style.minHeight).toBe('320px');
		expect(signinBox.style.minHeight).toBe('320px');
		expect(
			Array.from(iframeDoc.querySelectorAll('div')).some(
				(elem) => (elem as HTMLElement).innerText === 'No Social Logins available'
			)
		).toBe(true);

		fieldError.innerText = 'This account does not exist in portal';
		fieldError.style.display = 'block';
		fieldError.setAttribute('data-state', 'changed');
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(fieldError.innerText).toBe('This account does not exist');
	});

	it('should use updated config and forgot-password target when the forgot link is clicked', async () => {
		const manager = new IframeSignInManager(
			'old-portal',
			'project-1',
			(url) => `redirect:${url}`
		);
		manager.updateConfig('new-portal', 'project-2');
		const { iframeDoc, forgotLink } = createIframeDocument({ hasFedLogins: true });

		await manager.renderSignInIframe(
			'signin-root',
			{
				serviceUrl: '/landing',
				forgotPasswordId: 'forgot-root',
				forgotPasswordCssUrl: 'https://cdn.example.com/forgot.css'
			},
			true
		);

		const iframe = document.getElementById('iam_iframe') as HTMLIFrameElement;
		Object.defineProperty(iframe, 'contentWindow', {
			value: { document: iframeDoc },
			configurable: true
		});
		Object.defineProperty(iframe, 'contentDocument', { value: iframeDoc, configurable: true });
		iframe.onload?.(new Event('load'));

		(forgotLink.onclick as (() => void) | null)?.();

		const forgotIframe = document.querySelector('#forgot-root iframe') as HTMLIFrameElement;
		const forgotDoc = document.implementation.createHTMLDocument('forgot');
		const forgotInput = forgotDoc.createElement('input');
		forgotInput.id = 'login_id';
		forgotDoc.body.appendChild(forgotInput);
		document.querySelector('#signin-root iframe')?.remove();
		Object.defineProperty(forgotIframe, 'contentWindow', {
			value: { document: forgotDoc },
			configurable: true
		});
		forgotIframe.onload?.(new Event('load'));

		expect(forgotIframe.parentElement?.id).toBe('forgot-root');
		expect(forgotIframe.src).toContain('/accounts/p/new-portal/password?');
		expect(forgotIframe.src).toContain('css_url=https%3A%2F%2Fcdn.example.com%2Fforgot.css');
		expect(forgotIframe.src).toContain('LOGIN_ID=ava%40example.com');
		expect(forgotInput.placeholder).toBe('Please enter your email address');
	});

	it('should throw when the mount target does not exist', async () => {
		const manager = new IframeSignInManager('portal-1', 'project-1', (url) => url);
		await expect(manager.renderSignInIframe('missing-root', {}, true)).rejects.toThrow(
			'Unable to get element with id : missing-root'
		);
	});
});
