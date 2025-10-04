import {test, expect} from '@playwright/test';

test.describe('NextBank - Navigation Tests', () => {
	test('should navigate to My accounts section', async ({page}) => {
		await page.goto('/public/index.html');
		const myAccountsLink = page.locator('nav ul li a:has-text("My accounts")');
		await myAccountsLink.click();
		await expect(myAccountsLink).toHaveClass(/active/);
	});

	test('should navigate to Cards section', async ({page}) => {
		await page.goto('/public/index.html');
		const cardsLink = page.locator('nav ul li a:has-text("Cards")');
		await cardsLink.click();
		await expect(cardsLink).toHaveClass(/active/);
	});

	test('should navigate to Transfers section', async ({page}) => {
		await page.goto('/public/index.html');
		const transfersLink = page.locator('nav ul li a:has-text("Transfers")');
		await transfersLink.click();
		await expect(transfersLink).toHaveClass(/active/);
	});

	test('should switch active state when navigating between sections', async ({page}) => {
		await page.goto('/public/index.html');
		const summaryLink = page.locator('nav ul li a:has-text("Summary")');
		const myAccountsLink = page.locator('nav ul li a:has-text("My accounts")');

		await expect(summaryLink).toHaveClass(/active/);
		await myAccountsLink.click();
		await expect(myAccountsLink).toHaveClass(/active/);
		await expect(summaryLink).not.toHaveClass(/active/);

		await summaryLink.click();
		await expect(summaryLink).toHaveClass(/active/);
		await expect(myAccountsLink).not.toHaveClass(/active/);
	});

	test('should show development message when clicking navigation items', async ({page}) => {
		await page.goto('/public/index.html');
		const myAccountsLink = page.locator('nav ul li a:has-text("My accounts")');
		await myAccountsLink.click();
	});
});
