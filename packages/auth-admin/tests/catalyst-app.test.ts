import { CatalystApp } from '../src/catalyst-app';

describe('CatalystApp', () => {
	let app: CatalystApp;

	beforeEach(() => {
		const config = {
			projectId: 'test-project-123',
			projectDomain: 'test.catalyst.zoho.com'
		};
		app = new CatalystApp(config as unknown);
	});

	describe('constructor', () => {
		it('should create app instance with config', () => {
			expect(app).toBeInstanceOf(CatalystApp);
			expect(app.config).toBeDefined();
		});

		it('should initialize credential manager', () => {
			expect(app.credential).toBeDefined();
		});
	});

	describe('config', () => {
		it('should store project configuration', () => {
			expect(app.config.projectId).toBe('test-project-123');
			expect(app.config.projectDomain).toBe('test.catalyst.zoho.com');
		});
	});
});
