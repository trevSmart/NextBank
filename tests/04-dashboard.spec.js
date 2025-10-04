import {test, expect} from '@playwright/test';

test.describe('NextBank - Dashboard Components', () => {
	test('should display dashboard cards', async ({page}) => {
		await page.goto('/public/index.html');
		const dashboard = page.locator('.dashboard-grid');
		await expect(dashboard).toBeVisible();
	});

	test('should display balance card', async ({page}) => {
		await page.goto('/public/index.html');
		const balanceCard = page.locator('.dashboard-card.balance');
		await expect(balanceCard).toBeVisible();
	});

	test('should display movements/transactions', async ({page}) => {
		await page.goto('/public/index.html');
		const movimentsCard = page.locator('.dashboard-card.moviments');
		await expect(movimentsCard).toBeVisible();
	});

	test('should display transaction items', async ({page}) => {
		await page.goto('/public/index.html');
		const movimentItems = page.locator('.moviment-item');
		await expect(movimentItems.first()).toBeVisible();
	});

	test('should display transaction amounts', async ({page}) => {
		await page.goto('/public/index.html');
		const amounts = page.locator('.moviment-amount');
		await expect(amounts.first()).toBeVisible();
	});

	test('should display calendar component', async ({page}) => {
		await page.goto('/public/index.html');
		const calendar = page.locator('.dashboard-card.calendar');
		await expect(calendar).toBeVisible();
	});

	test('should display stock view if present', async ({page}) => {
		await page.goto('/public/index.html');
		const stockView = page.locator('stock-view-component');
		if (await stockView.count() > 0) {
			await expect(stockView).toBeVisible();
		}
	});
});
