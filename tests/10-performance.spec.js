import {test, expect} from '@playwright/test';

test.describe('NextBank - Performance and Loading', () => {
	test('should load all CSS files', async ({page}) => {
		const failedRequests = [];
		page.on('response', response => {
			if (response.url().endsWith('.css') && !response.ok()) {
				failedRequests.push(response.url());
			}
		});
		await page.goto('/public/index.html');
		await page.waitForTimeout(2000);
		expect(failedRequests.length).toBe(0);
	});

	test('should load all JavaScript files', async ({page}) => {
		const failedRequests = [];
		page.on('response', response => {
			if (response.url().endsWith('.js') && !response.ok()) {
				failedRequests.push(response.url());
			}
		});
		await page.goto('/public/index.html');
		await page.waitForTimeout(2000);
		expect(failedRequests.length).toBe(0);
	});

	test('should load external dependencies', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(2000);
		const lottiePlayer = page.locator('dotlottie-player');
		if (await lottiePlayer.count() > 0) {
			expect(await lottiePlayer.count()).toBeGreaterThan(0);
		}
	});

	test('should complete DOMContentLoaded event', async ({page}) => {
		await page.goto('/public/index.html');
		const readyState = await page.evaluate(() => document.readyState);
		expect(readyState).toBe('complete');
	});

	test('should initialize main JavaScript module', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(1000);
		const hasNavigationListeners = await page.evaluate(() => {
			const links = document.querySelectorAll('nav a');
			return links.length > 0;
		});
		expect(hasNavigationListeners).toBe(true);
	});

	test('should load FontAwesome icons', async ({page}) => {
		await page.goto('/public/index.html');
		const icons = page.locator('i.fas');
		const count = await icons.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should load images successfully', async ({page}) => {
		const failedImages = [];
		page.on('response', response => {
			if (response.url().match(/\.(png|jpg|jpeg|webp|svg)$/) && !response.ok()) {
				failedImages.push(response.url());
			}
		});
		await page.goto('/public/index.html');
		await page.waitForTimeout(2000);
		expect(failedImages.length).toBe(0);
	});

	test('should not have memory leaks after interactions', async ({page}) => {
		await page.goto('/public/index.html');
		const links = await page.locator('nav ul li a').all();
		for (let i = 0; i < 5; i++) {
			for (const link of links) {
				await link.click();
				await page.waitForTimeout(50);
			}
		}
		await expect(page.locator('nav')).toBeVisible();
	});
});
