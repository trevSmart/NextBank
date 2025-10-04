import {test, expect} from '@playwright/test';

test.describe('NextBank - Page Load and Initial State', () => {
	test('should load the homepage successfully', async ({page}) => {
		await page.goto('/public/index.html');
		await expect(page).toHaveTitle('NextBank');
	});

	test('should display the logo and brand name', async ({page}) => {
		await page.goto('/public/index.html');
		const logo = page.locator('header .logo span');
		await expect(logo).toHaveText('NextBank');
	});

	test('should display navigation menu', async ({page}) => {
		await page.goto('/public/index.html');
		const navLinks = page.locator('nav ul li a');
		await expect(navLinks).toHaveCount(4);
		await expect(navLinks.nth(0)).toHaveText('Summary');
		await expect(navLinks.nth(1)).toHaveText('My accounts');
		await expect(navLinks.nth(2)).toHaveText('Cards');
		await expect(navLinks.nth(3)).toHaveText('Transfers');
	});

	test('should have active state on Summary by default', async ({page}) => {
		await page.goto('/public/index.html');
		const summaryLink = page.locator('nav ul li a:has-text("Summary")');
		await expect(summaryLink).toHaveClass(/active/);
	});

	test('should display support button', async ({page}) => {
		await page.goto('/public/index.html');
		const supportButton = page.locator('.support-button');
		await expect(supportButton).toBeVisible();
		await expect(supportButton).toContainText('Need help?');
	});

	test('should display footer with copyright', async ({page}) => {
		await page.goto('/public/index.html');
		const footer = page.locator('footer');
		await expect(footer).toBeVisible();
		await expect(footer).toContainText('International Business Machines, S.A.');
		await expect(footer).toContainText('All rights reserved.');
	});

	test('should display language switcher', async ({page}) => {
		await page.goto('/public/index.html');
		const languageSwitcher = page.locator('.language-switcher');
		await expect(languageSwitcher).toBeVisible();
		await expect(languageSwitcher).toContainText('English');
	});
});
