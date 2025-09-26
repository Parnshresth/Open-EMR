// @ts-check
import { test, expect } from '@playwright/test';


test('Successfull login using admin user credendiatls', async ({ page }) => {
   await page.goto('https://demo.openemr.io/openemr', {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });

 // Use stable attribute instead of role+name (no accessible name on this page)
  const langSelect = page.locator("select[name='languageChoice']");
  await expect(langSelect).toBeVisible();

  await langSelect.selectOption({ label: 'English (Standard)' });
  await expect(langSelect.locator('option:checked')).toHaveText('English (Standard)');


  
    await page.fill('#authUser', 'admin');
    await page.fill('#clearPass', 'pass');
    await page.click('#login-button');
    await expect(page.locator('#mainMenu')).toBeVisible(({ timeout: 15_000 }));

// Click Admin
await page.getByText('Admin', { exact: true }).click();

// Wait until Users option is visible
await expect(page.getByText('Users')).toBeVisible();

// Click Users
await page.getByText('Users').click();

const menu = page.locator('#mainMenu');
await expect(menu).toBeVisible();
await menu.getByText('Calendar', { exact: true }).click();

// Verify Calendar view is active
await expect(page.getByText(/^\s*Calendar\s*$/)).toBeVisible();






});