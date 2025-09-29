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
});

//

test('Patient > Create new patient (minimal required fields)', async ({ page }) => {
  // --- Login ---
  await page.goto('https://demo.openemr.io/openemr', { waitUntil: 'domcontentloaded', timeout: 90_000 });

  const lang = page.locator("select[name='languageChoice']");
  if (await lang.isVisible()) {
    await lang.selectOption({ label: 'English (Standard)' });
    await expect(lang.locator('option:checked')).toHaveText('English (Standard)');
  }

  await page.fill('#authUser', 'admin');
  await page.fill('#clearPass', 'pass');
  await Promise.all([
    page.waitForURL(/interface\/main\/.*|login_screen\.php\?error=1/i, { timeout: 30_000 }),
    page.click('#login-button'),
  ]);
  if (/error=1/i.test(page.url())) throw new Error('Login failed');
  await expect(page.getByRole('navigation')).toBeVisible({ timeout: 15000 });

  // --- Given I’m on Patient → New/Search ---
  const nav = page.getByRole('navigation');
  await nav.getByRole('button', { name: 'Patient' }).click();

  // Patient content lives in iframe name="pat"
  const pat = page.frameLocator('iframe[name="pat"]');
  await expect(
    pat.getByRole('heading', { name: /Search or Add Patient|Demographics/i })
  ).toBeVisible({ timeout: 15000 });

  // --- When I enter First/Last name, DOB, Sex, (Facility if required) ---
  const unique = Date.now().toString().slice(-6);
  const first = `Auto${unique}`;
  const last  = `Test${unique}`;

  await pat.getByLabel(/First Name/i).fill(first);
  await pat.getByLabel(/Last Name/i).fill(last);
  await pat.getByLabel(/Date of Birth|DOB/i).fill('2000-01-01'); // ISO format is typically accepted
  await pat.getByLabel(/^Sex$/i).selectOption({ label: 'Male' });

  // Facility may be required depending on config; set it if present
  const facility = pat.getByLabel(/Facility/i);
  if (await facility.count()) {
    // pick first non-placeholder option
    await facility.selectOption({ index: 1 });
  }

  // Create
  await pat.getByRole('button', { name: /Create New Patient/i }).click();

  // Some builds show a confirm dialog inside the same frame; handle it if it appears
  const confirm = pat.getByRole('button', { name: /Confirm|OK|Save/i });
  if (await confirm.count()) {
    await confirm.first().click();
  }

  // --- Then a new Patient ID is created and the chart header shows the patient ---
  // Verify the patient dashboard/summary shows the created name inside the patient frame
  await expect(pat.getByText(new RegExp(`${first}\\s+${last}`, 'i'))).toBeVisible({ timeout: 15000 });

  // (Optional) also check that a PID appears somewhere on the page
  const pidHint = pat.getByText(/Patient\s*ID|PID|Record\s*ID/i);
  if (await pidHint.count()) {
    await expect(pidHint.first()).toBeVisible();
  }
});








