import { test, expect } from '@playwright/test';

test('complete e2e core requisition requisition pipeline run', async ({ page }) => {
  // 1. Open the page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // 2. Clear input elements
  const emailInput = page.getByRole('textbox', { name: /email directory channel/i }).or(page.locator('input[type="email"]'));
  const passwordInput = page.locator('input[type="password"]');

  // 3. Fill out credentials using your verified Ashesi profile row
  await emailInput.fill('rachel.murambiwa@ashesi.edu.gh'); 
  await passwordInput.fill('Chacha@1583'); 

  // 4. Submit form natively
  await passwordInput.press('Enter');

  // 5. ✨ THE MATCHING ASSERTION: Wait for the correct requester route to mount!
  await page.waitForURL('**/requester-dashboard', { timeout: 15000 });
  
  // 6. Confirm a core element on your requester view actually loaded (e.g., your heading or a new request button)
  await expect(page.locator('text=requisition').first()).toBeVisible();
});