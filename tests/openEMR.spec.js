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
    await expect(page.locator('#mainMenu')).toBeVisible({ timeout: 15_000 });

 await test.step('Navigate to Patient → New/Search', async () => {
  const nav = page.getByRole('navigation');
  await nav.getByRole('button', { name: 'Patient' }).click();
  await nav.getByText('New/Search', { exact: true }).click();

  const pat = page.frameLocator('iframe[name="pat"]');
  await expect(
    pat.getByRole('heading', { name: /Search or Add Patient|Demographics/i })
  ).toBeVisible({ timeout: 15_000 });
});

  // Patient content lives in iframe name="pat"
  const pat = page.frameLocator('iframe[name="pat"]');
  await expect(
    pat.getByRole('heading', { name: /Search or Add Patient|Demographics/i })
  ).toBeVisible({ timeout: 50_000 });

// Open the create form (this button lives inside 'pat')
await pat.getByRole('button', { name: /Add New Patient|Create New Patient/i }).click();


//Work inside the modal frame
const modal = page.frameLocator('iframe[name="modalframe"]');

// Use stable attribute selectors (labels are unreliable here)
const firstName = modal.locator('input[name="fname"], input[name="form_fname"], #form_fname');
const lastName  = modal.locator('input[name="lname"], input[name="form_lname"], #form_lname');
const dob       = modal.locator('input[name="DOB"], input[name="form_DOB"], input[name="dob"], #form_DOB');

 // replaces the failing getByLabel wait
await expect(modal.locator('#FirstName')).toBeVisible({ timeout: 30_000 });
await firstName.fill('John');
await lastName.fill('ju');
  await modal.getByLabel(/Date of Birth|DOB/i).fill('2000-01-01'); // ISO format is typically accepted
  await modal.getByLabel(/^Sex$/i).selectOption({ label: 'Male' });

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








