import { test, expect } from '@playwright/test';

test('seamless programmatic e2e requisition run', async ({ page }) => {
  // 1. Navigate to the login screen and wait for the bundle to load
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // 2. Clear out selectors
  const emailInput = page.locator('input[type="email"], input[placeholder*="org"]');
  const passwordInput = page.locator('input[type="password"]');

  // 3. Populate with your verified personal Gmail account that has a database profile row
  await emailInput.fill('rachelmurambiwa88@gmail.com');
  await passwordInput.fill('Chacha@1583'); // Make sure this matches the password for that specific user in Supabase Auth!

  // 4. Submit natively via Enter to avoid dead custom button clicks
  await passwordInput.press('Enter');

  // 5. Assert that the dashboard loads smoothly once the profile fetches successfully
  await page.waitForURL((url) => url.pathname.includes('dashboard'), { timeout: 15000 });
});