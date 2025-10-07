import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 1,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		['html'],
		['list'],
		['json', { outputFile: 'test-results/results.json' }]
	],
	use: {
		baseURL: 'http://127.0.0.1:8080',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 10000,
		navigationTimeout: 30000,
	},

	projects: [
		{
			name: 'chromium',
			use: {...devices['Desktop Chrome']},
		},
		{
			name: 'Mobile Chrome',
			use: {...devices['Pixel 5']},
		},
		{
			name: 'Desktop Chrome',
			use: {...devices['Desktop Chrome']},
		},
	],

	webServer: {
		command: 'npx http-server public -p 8080 -c-1',
		url: 'http://127.0.0.1:8080',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		stdout: 'pipe',
		stderr: 'pipe',
	},

	// Global setup and teardown
	globalSetup: undefined,
	globalTeardown: undefined,

	// Test timeout
	timeout: 30000,
	expect: {
		timeout: 5000,
	},
});
