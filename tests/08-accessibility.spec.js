import {test, expect} from '@playwright/test';

test.describe('NextBank - Accessibility and SEO', () => {
	test('should have proper page title', async ({page}) => {
		await page.goto('/public/index.html');
		await expect(page).toHaveTitle('NextBank');
	});

	test('should have proper meta tags', async ({page}) => {
		await page.goto('/public/index.html');
		const viewport = page.locator('meta[name="viewport"]');
		await expect(viewport).toHaveAttribute('content', /width=device-width/);
	});

	test('should have favicon', async ({page}) => {
		await page.goto('/public/index.html');
		const favicon = page.locator('link[rel="icon"]');
		await expect(favicon).toHaveAttribute('href', /favicon/);
	});

	test('should have proper heading hierarchy', async ({page}) => {
		await page.goto('/public/index.html');
		const headings = page.locator('h1, h2, h3, h4, h5, h6');
		const count = await headings.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should have alt text on images', async ({page}) => {
		await page.goto('/public/index.html');
		const images = page.locator('img');
		const count = await images.count();
		for (let i = 0; i < count; i++) {
			const img = images.nth(i);
			const alt = await img.getAttribute('alt');
			expect(alt).toBeTruthy();
		}
	});

	test('should have aria labels on buttons', async ({page}) => {
		await page.goto('/public/index.html');
		const languageSwitcher = page.locator('.language-switcher');
		await expect(languageSwitcher).toHaveAttribute('aria-label', 'Change language');
	});

	test('should have semantic HTML elements', async ({page}) => {
		await page.goto('/public/index.html');
		await expect(page.locator('header')).toBeVisible();
		await expect(page.locator('nav')).toBeVisible();
		await expect(page.locator('footer')).toBeVisible();
	});

	test('should not have console errors on load', async ({page}) => {
		const errors = [];
		page.on('console', msg => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});
		await page.goto('/public/index.html');
		await page.waitForTimeout(2000);
		expect(errors.length).toBeLessThan(5);
	});
});
