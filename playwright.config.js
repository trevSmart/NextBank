import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://127.0.0.1:8080',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},

	projects: [
		{
			name: 'chromium',
			use: {...devices['Desktop Chrome']},
		},
	],

	webServer: {
		command: 'npx http-server -p 8080 -c-1',
		url: 'http://127.0.0.1:8080',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
