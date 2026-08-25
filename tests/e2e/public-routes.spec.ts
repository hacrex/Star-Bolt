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
    await expect(page.getByRole('link', { name: 'Star Lyrix', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Start creating|For creators/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Submit a video/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Watch Shorts/i }).first()).toHaveAttribute('href', '/shorts');
    await expect(page.locator('.site-header').getByRole('link', { name: /Submit a video/i })).toHaveCount(0);
    await expect(page.locator('.site-header').getByRole('link', { name: /For creators/i }).first()).toHaveAttribute('href', '/creators');
  });

  test('creator story panels route to the correct public or protected entry point', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.marketing-path-card').nth(0)).toHaveAttribute('href', '/auth');
    await expect(page.locator('.marketing-path-card').nth(1)).toHaveAttribute('href', '/lyrics');
    await expect(page.locator('.marketing-path-card').nth(2)).toHaveAttribute('href', '/shorts');
  });

  test('command palette opens with keyboard and navigates by selection', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('/');
    await expect(page.getByRole('dialog', { name: /quick jump/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /translate & collaborate/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /creator studio/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /for creators/i })).toBeVisible();
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

  test('For Creators page presents the Artist and Stars pathway', async ({ page }) => {
    await page.goto('/creators');
    await expect(page).toHaveTitle(/For Creators/i);
    await expect(page.locator('main')).toContainText(/Artists \/ Stars|Your sound|Original lyric studio|Official channel pathway/i);
    await expect(page.getByRole('link', { name: /Submit for review/i })).toHaveAttribute('href', '/submit');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /rights-aware Star Lyrix creator workflow/i);
  });

  test('public Lyrics Reader keeps catalog and lyrics source language clear', async ({ page }) => {
    await page.goto('/lyrics');
    await expect(page).toHaveTitle(/Lyrics Reader/i);
    await expect(page.locator('main')).toContainText(/Spotify catalog matching|Musixmatch/i);
  });

  test('public Shorts route points only to the Star Lyrix YouTube channel', async ({ page }) => {
    await page.goto('/shorts');
    await expect(page).toHaveTitle(/Star Lyrix Shorts/i);
    await expect(page.locator('main')).toContainText(/official Star Lyrix channel/i);
    await expect(page.getByRole('link', { name: /open @starlyrix on youtube/i })).toHaveAttribute('href', 'https://www.youtube.com/@starlyrix');
  });

  test('mobile navigation remains available at a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav')).toContainText('Discover');
  });
});

test.describe('protected routes', () => {
  for (const path of ['/profile', '/add-song', '/playlists', '/generated-lyrics', '/ai-lyrics', '/creator', '/settings/ai', '/submit', '/translate/00000000-0000-0000-0000-000000000000']) {
    test(`${path} redirects signed-out visitors`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth$/);
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });
  }
});
