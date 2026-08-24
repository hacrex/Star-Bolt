import { expect, test } from '@playwright/test';

test.describe('production polish', () => {
  test('unknown routes use the safe home fallback', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('global document metadata and language are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /community|lyrics/i);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0A0A0A');
  });

  test('command palette has a visible keyboard focus path', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('/');
    const dialog = page.getByRole('dialog', { name: /quick jump/i });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(dialog.locator(':focus')).toBeVisible();
  });

  test('reading room metadata route fails safely without exposing lyric content', async ({ page }) => {
    await page.goto('/songs/00000000-0000-0000-0000-000000000000');
    await expect(page.locator('main')).toContainText(/failed to load song details|back to lyrics/i);
    await expect(page.locator('main')).not.toContainText(/password|service.role|anon.key/i);
  });
});
