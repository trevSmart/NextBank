import {test, expect} from '@playwright/test';

test.describe('NextBank - Interactive Elements', () => {
	test('should have clickable navigation links', async ({page}) => {
		await page.goto('/public/index.html');
		const navLinks = page.locator('nav ul li a');
		const count = await navLinks.count();
		for (let i = 0; i < count; i++) {
			const link = navLinks.nth(i);
			await expect(link).toBeEnabled();
		}
	});

	test('should have clickable logo', async ({page}) => {
		await page.goto('/public/index.html');
		const logo = page.locator('header .logo a');
		await expect(logo).toBeEnabled();
		await expect(logo).toHaveAttribute('href', '/public/index.html');
	});

	test('should have hoverable support button', async ({page}) => {
		await page.goto('/public/index.html');
		const supportButton = page.locator('.support-button');
		await supportButton.hover();
		await page.waitForTimeout(100);
	});

	test('should have clickable language switcher', async ({page}) => {
		await page.goto('/public/index.html');
		const languageSwitcher = page.locator('.language-switcher');
		await expect(languageSwitcher).toBeEnabled();
	});

	test('should prevent default on navigation clicks', async ({page}) => {
		await page.goto('/public/index.html');
		const myAccountsLink = page.locator('nav ul li a:has-text("My accounts")');
		await myAccountsLink.click();
		const url = page.url();
		expect(url).not.toContain('#');
	});

	test('should have draggable=false on logo elements', async ({page}) => {
		await page.goto('/public/index.html');
		const logoLink = page.locator('header .logo a');
		const logoImg = page.locator('header .logo img');
		await expect(logoLink).toHaveAttribute('draggable', 'false');
		await expect(logoImg).toHaveAttribute('draggable', 'false');
	});

	test('should have draggable=false on navigation links', async ({page}) => {
		await page.goto('/public/index.html');
		const navLinks = page.locator('nav ul li a');
		const count = await navLinks.count();
		for (let i = 0; i < count; i++) {
			const link = navLinks.nth(i);
			await expect(link).toHaveAttribute('draggable', 'false');
		}
	});

	test('should handle rapid navigation clicks', async ({page}) => {
		await page.goto('/public/index.html');
		const links = await page.locator('nav ul li a').all();
		for (const link of links) {
			await link.click();
			await page.waitForTimeout(100);
		}
		const lastLink = links[links.length - 1];
		await expect(lastLink).toHaveClass(/active/);
	});
});
