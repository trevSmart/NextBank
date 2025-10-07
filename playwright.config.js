import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: false, // Desactivem paral·lelisme per evitar sobrecàrrega
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0, // Menys reintents en desenvolupament
	workers: 2, // Només un worker per evitar sobrecàrrega
	reporter: [
		['html'],
		['list'],
		['json', { outputFile: 'test-results/results.json' }]
	],
	use: {
		baseURL: 'http://127.0.0.1:5500',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 5000, // Reduït de 10s a 5s
		navigationTimeout: 15000, // Reduït de 30s a 15s
	},

	projects: [
		{
			name: 'chromium',
			use: {...devices['Desktop Chrome']},
		},
	],

	webServer: {
		command: 'npx http-server public -p 5500 -c-1',
		url: 'http://127.0.0.1:5500',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		stdout: 'pipe',
		stderr: 'pipe',
	},

	// Global setup and teardown
	globalSetup: undefined,
	globalTeardown: undefined,

	// Test timeout
	timeout: 15000, // Reduït de 30s a 15s
	expect: {
		timeout: 3000, // Reduït de 5s a 3s
	},
});
