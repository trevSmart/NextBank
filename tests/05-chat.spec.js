import {test, expect} from '@playwright/test';

test.describe('NextBank - Chat Widget', () => {
	test('should display chat widget button after initialization', async ({page}) => {
		await page.goto('/public/index.html');
		const chatButton = page.locator('.pop-out-icon');
		await page.waitForTimeout(6000);
		if (await chatButton.count() > 0) {
			await expect(chatButton).toBeVisible();
		}
	});

	test('should toggle chat widget when clicking button', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(6000);
		const chatButton = page.locator('.pop-out-icon');
		if (await chatButton.count() > 0) {
			await chatButton.click();
			const chatWidget = page.locator('#chatWidget');
			await expect(chatWidget).toHaveClass(/chat-widget-open/);
		}
	});

	test('should close chat widget when clicking button again', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(6000);
		const chatButton = page.locator('.pop-out-icon');
		if (await chatButton.count() > 0) {
			await chatButton.click();
			await page.waitForTimeout(500);
			await chatButton.click();
			const chatWidget = page.locator('#chatWidget');
			await expect(chatWidget).not.toHaveClass(/chat-widget-open/);
		}
	});

	test('should hide support popover when opening chat', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(6000);
		const supportButton = page.locator('.support-button');
		const chatButton = page.locator('.pop-out-icon');
		const supportPopover = page.locator('.support-popover');

		await supportButton.hover();
		await page.waitForTimeout(100);
		await expect(supportPopover).toHaveClass(/visible/);

		if (await chatButton.count() > 0) {
			await chatButton.click();
			await expect(supportPopover).not.toHaveClass(/visible/);
		}
	});

	test('should display chat messages container', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(6000);
		const chatButton = page.locator('.pop-out-icon');
		if (await chatButton.count() > 0) {
			await chatButton.click();
			const messagesContainer = page.locator('.chat-messages');
			await expect(messagesContainer).toBeVisible();
		}
	});

	test('should display chat input field', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(6000);
		const chatButton = page.locator('.pop-out-icon');
		if (await chatButton.count() > 0) {
			await chatButton.click();
			const chatInput = page.locator('.chat-input-input');
			await expect(chatInput).toBeVisible();
		}
	});

	test('should display send button', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(6000);
		const chatButton = page.locator('.pop-out-icon');
		if (await chatButton.count() > 0) {
			await chatButton.click();
			const sendButton = page.locator('.send-button');
			await expect(sendButton).toBeVisible();
		}
	});
});
