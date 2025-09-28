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
{

const menu = page.locator('#mainMenu');
await expect(menu).toBeVisible();

};
});

test('@patient @create Patient > Create new patient', async ({ page }) => {
  // / Patient → New/Search
  const nav = page.getByRole('navigation');
  await nav.getByRole('button', { name: 'Patient' }).click();

  const newSearch = page.getByRole('menuitem', { name: /New\/Search/i });
  if (await newSearch.count()) await newSearch.click();
  else await page.getByText('New/Search', { exact: true }).click();

  // Demographics form is in the content iframe
  const frame = page.frameLocator('iframe');
  await expect(frame.getByRole('heading', { name: /Demographics/i })).toBeVisible({ timeout: 15000 });
});
