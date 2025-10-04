import {test, expect} from '@playwright/test';

test.describe('NextBank - Support Features', () => {
	test('should show support popover on hover', async ({page}) => {
		await page.goto('/public/index.html');
		const supportButton = page.locator('.support-button');
		const supportPopover = page.locator('.support-popover');

		await expect(supportPopover).not.toHaveClass(/visible/);

		await supportButton.hover();
		await page.waitForTimeout(100);
		await expect(supportPopover).toHaveClass(/visible/);
	});

	test('should hide support popover when mouse leaves', async ({page}) => {
		await page.goto('/public/index.html');
		const supportButton = page.locator('.support-button');
		const supportPopover = page.locator('.support-popover');

		await supportButton.hover();
		await page.waitForTimeout(100);
		await expect(supportPopover).toHaveClass(/visible/);

		await page.mouse.move(0, 0);
		await page.waitForTimeout(100);
		await expect(supportPopover).not.toHaveClass(/visible/);
	});

	test('should display support options in popover', async ({page}) => {
		await page.goto('/public/index.html');
		const supportButton = page.locator('.support-button');
		await supportButton.hover();
		await page.waitForTimeout(100);

		const callOption = page.locator('.support-option:has-text("Call us")');
		const emailOption = page.locator('.support-option:has-text("Email support")');
		const helpCenterOption = page.locator('.support-option:has-text("Help center")');

		await expect(callOption).toBeVisible();
		await expect(emailOption).toBeVisible();
		await expect(helpCenterOption).toBeVisible();
	});

	test('should display support option descriptions', async ({page}) => {
		await page.goto('/public/index.html');
		const supportButton = page.locator('.support-button');
		await supportButton.hover();
		await page.waitForTimeout(100);

		await expect(page.locator('.support-option-description:has-text("Speak with a representative")')).toBeVisible();
		await expect(page.locator('.support-option-description:has-text("Get help within 24 hours")')).toBeVisible();
		await expect(page.locator('.support-option-description:has-text("Browse FAQs and tutorials")')).toBeVisible();
	});

	test('should have clickable support options', async ({page}) => {
		await page.goto('/public/index.html');
		const supportButton = page.locator('.support-button');
		await supportButton.hover();
		await page.waitForTimeout(100);

		const callOption = page.locator('.support-option:has-text("Call us")');
		await expect(callOption).toBeEnabled();
	});
});
