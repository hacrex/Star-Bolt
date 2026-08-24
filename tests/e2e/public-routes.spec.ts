import { expect, test } from '@playwright/test';

const legalRoutes = [
  ['/terms', 'Terms'],
  ['/privacy', 'Privacy'],
  ['/copyright', 'Copyright'],
  ['/community-guidelines', 'Community Guidelines'],
] as const;

test.describe('Star Lyrix public shell', () => {
  test('home renders a stable discovery shell', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Star Lyrix/i);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Star Lyrix' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Create|AI Lyrics/i }).first()).toBeVisible();
  });

  test('command palette opens with keyboard and navigates by selection', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('/');
    await expect(page.getByRole('dialog', { name: /quick jump/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /translate & collaborate/i })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /quick jump/i })).toHaveCount(0);
  });

  for (const [path, heading] of legalRoutes) {
    test(`${path} renders its dedicated document`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main')).toContainText(new RegExp(heading, 'i'));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    });
  }

  test('search preserves language filter in the URL', async ({ page }) => {
    await page.goto('/search');
    const hindiFilter = page.getByRole('button', { name: /हिंदी/ }).first();
    if (await hindiFilter.count()) {
      await hindiFilter.click();
      await expect(page).toHaveURL(/language=hi/);
    }
  });

  test('mobile navigation remains available at a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav')).toContainText('Discover');
  });
});

test.describe('protected routes', () => {
  for (const path of ['/profile', '/add-song', '/playlists', '/generated-lyrics', '/translate/00000000-0000-0000-0000-000000000000']) {
    test(`${path} redirects signed-out visitors`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth$/);
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });
  }
});
