import {test, expect} from '@playwright/test';

test.describe('NextBank - Calendar Component', () => {
	test('should display calendar component', async ({page}) => {
		await page.goto('/public/index.html');
		const calendar = page.locator('calendar-component');
		await expect(calendar).toBeVisible();
	});

	test('should have calendar in shadow DOM', async ({page}) => {
		await page.goto('/public/index.html');
		const calendar = page.locator('calendar-component');
		const shadowRoot = await calendar.evaluateHandle(el => el.shadowRoot);
		expect(shadowRoot).toBeTruthy();
	});

	test('should render calendar device structure', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(1000);
		const calendar = page.locator('calendar-component');
		const hasCalDevice = await calendar.evaluate(el => {
			const shadow = el.shadowRoot;
			return shadow && shadow.querySelector('.cal-device') !== null;
		});
		expect(hasCalDevice).toBeTruthy();
	});

	test('should have calendar navigation elements', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(1000);
		const calendar = page.locator('calendar-component');
		const hasNavigation = await calendar.evaluate(el => {
			const shadow = el.shadowRoot;
			return shadow && shadow.querySelector('.cal-bar') !== null;
		});
		expect(hasNavigation).toBeTruthy();
	});

	test('should have calendar and schedule scenes', async ({page}) => {
		await page.goto('/public/index.html');
		await page.waitForTimeout(1000);
		const calendar = page.locator('calendar-component');
		const hasScenes = await calendar.evaluate(el => {
			const shadow = el.shadowRoot;
			if (!shadow) {return false}
			const calendarScene = shadow.querySelector('.cal-scene.-calendar');
			const scheduleScene = shadow.querySelector('.cal-scene.-schedule');
			return calendarScene !== null && scheduleScene !== null;
		});
		expect(hasScenes).toBeTruthy();
	});
});
