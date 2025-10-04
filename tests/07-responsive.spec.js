import {test, expect} from '@playwright/test';

test.describe('NextBank - Responsive Design', () => {
	test('should be responsive on mobile viewport', async ({page}) => {
		await page.setViewportSize({width: 375, height: 667});
		await page.goto('/public/index.html');
		await expect(page).toHaveTitle('NextBank');
		await expect(page.locator('header')).toBeVisible();
	});

	test('should be responsive on tablet viewport', async ({page}) => {
		await page.setViewportSize({width: 768, height: 1024});
		await page.goto('/public/index.html');
		await expect(page).toHaveTitle('NextBank');
		await expect(page.locator('header')).toBeVisible();
	});

	test('should be responsive on desktop viewport', async ({page}) => {
		await page.setViewportSize({width: 1920, height: 1080});
		await page.goto('/public/index.html');
		await expect(page).toHaveTitle('NextBank');
		await expect(page.locator('header')).toBeVisible();
	});

	test('should maintain navigation on small screens', async ({page}) => {
		await page.setViewportSize({width: 375, height: 667});
		await page.goto('/public/index.html');
		const nav = page.locator('nav');
		await expect(nav).toBeVisible();
	});

	test('should display footer on all screen sizes', async ({page}) => {
		const viewports = [
			{width: 375, height: 667},
			{width: 768, height: 1024},
			{width: 1920, height: 1080}
		];

		for (const viewport of viewports) {
			await page.setViewportSize(viewport);
			await page.goto('/public/index.html');
			const footer = page.locator('footer');
			await expect(footer).toBeVisible();
		}
	});
});
