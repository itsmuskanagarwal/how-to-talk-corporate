import { expect, test } from '@playwright/test';

test.describe('How to Talk Corporate P2 — Web App UI', () => {
  test('shows the main rewrite interface on load', async ({ page }) => {
    await page.goto('/');

    // Header with branding
    await expect(page.locator('h1')).toContainText('How to Talk Corporate');

    // Tone preset selector with 5 options
    const presets = page.getByRole('radio');
    await expect(presets).toHaveCount(5);

    // Message input textarea
    await expect(page.getByPlaceholder('Paste your draft message here...')).toBeVisible();

    // Submit button initially disabled
    await expect(page.getByRole('button', { name: 'Rewrite' })).toBeDisabled();

    // Usage counter showing 10/10
    await expect(page.getByText('/ 10 remaining')).toBeVisible();
  });

  test('enables the rewrite button when text is entered', async ({ page }) => {
    await page.goto('/');
    const textarea = page.getByPlaceholder('Paste your draft message here...');
    await textarea.fill('i need help with this bug');
    await expect(page.getByRole('button', { name: 'Rewrite' })).toBeEnabled();
  });

  test('allows selecting a tone preset', async ({ page }) => {
    await page.goto('/');
    const presetBtns = page.getByRole('radio');

    // Default: first preset selected
    await expect(presetBtns.nth(0)).toHaveAttribute('aria-checked', 'true');

    // Click second preset
    await presetBtns.nth(1).click();
    await expect(presetBtns.nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(presetBtns.nth(0)).toHaveAttribute('aria-checked', 'false');
  });

  test('shows the output card after a successful rewrite', async ({ page }) => {
    await page.route('**/api/rewrite', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'X-RateLimit-Remaining': '9', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewritten: 'Could you please take a look at this bug when you have a moment?',
          intent: 'asking',
          grammarFixed: true,
          toneScore: { politeness: 0.7, assertiveness: 0.3, driftFromPreset: 0.1 },
        }),
      });
    });

    await page.goto('/');
    await page.getByPlaceholder('Paste your draft message here...').fill('pls fix this bug');
    await page.getByRole('button', { name: 'Rewrite' }).click();

    // Wait for result
    await expect(page.getByText('Could you please take a look')).toBeVisible();

    // Copy button visible
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();

    // Usage counter decremented
    await expect(page.getByText('9 / 10 remaining')).toBeVisible();
  });

  test('shows the limit-reached banner on 429', async ({ page }) => {
    await page.route('**/api/rewrite', async (route) => {
      await route.fulfill({
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 86_400_000).toISOString(),
        },
        body: JSON.stringify({ error: 'Daily limit reached. Resets at 9:00 AM.' }),
      });
    });

    await page.goto('/');
    await page.getByPlaceholder('Paste your draft message here...').fill('test message');
    await page.getByRole('button', { name: 'Rewrite' }).click();

    // Banner visible
    await expect(page.getByText('Daily limit reached')).toBeVisible();
    await expect(page.getByText('free rewrites reset')).toBeVisible();
  });

  test('shows error on server error', async ({ page }) => {
    await page.route('**/api/rewrite', async (route) => {
      await route.fulfill({
        status: 500,
        headers: { 'X-RateLimit-Remaining': '10' },
        body: JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      });
    });

    await page.goto('/');
    await page.getByPlaceholder('Paste your draft message here...').fill('test message');
    await page.getByRole('button', { name: 'Rewrite' }).click();

    // Error message
    await expect(page.getByText('unexpected error')).toBeVisible();
  });

  test('supports copying the rewritten text to clipboard', async ({ page }) => {
    await page.route('**/api/rewrite', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'X-RateLimit-Remaining': '9' },
        body: JSON.stringify({
          rewritten: 'Thank you for your help on this.',
          intent: 'asking',
          grammarFixed: true,
          toneScore: { politeness: 0.8, assertiveness: 0.3, driftFromPreset: 0.05 },
        }),
      });
    });

    await page.goto('/');
    await page.getByPlaceholder('Paste your draft message here...').fill('thx for ur help');
    await page.getByRole('button', { name: 'Rewrite' }).click();
    await page.getByRole('button', { name: 'Copy' }).click();

    await expect(page.getByText('Copied!')).toBeVisible();
  });
});
