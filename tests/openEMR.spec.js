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
    await page.goto('https://demo.openemr.io/openemr',{
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


// Decide which frame hosts the form (modal vs inline)
const modalEl   = page.locator('iframe[name="modalframe"]');
const formFrame = (await modalEl.isVisible())
  ? page.frameLocator('iframe[name="modalframe"]') // modal-based form
  : pat;                                           // inline form in 'pat'

// ---- Fill required fields using stable attributes ----
const firstName = formFrame.locator('#form_fname, input[name="form_fname"], input[name="fname"]');
const lastName  = formFrame.locator('#form_lname, input[name="form_lname"], input[name="lname"]');
const dob       = formFrame.locator('#form_DOB, input[name="form_DOB"], input[name="DOB"], input[name="dob"]');
const sexSelect = formFrame.locator('select[name="sex"], select[name="form_sex"]');

await expect(firstName).toBeVisible({ timeout: 15_000 });
await firstName.fill('John');
await lastName.fill('Ju');

// DOB: some builds expect US format
await dob.fill('01/01/2000'); // use '2000-01-01' if your build accepts ISO

if (await sexSelect.count()) {
  await sexSelect.selectOption({ label: 'Male' });
} else {
  await formFrame.getByRole('radio', { name: /Male/i }).check();
}

  // Facility may be required depending on config; set it if present
  const facility = pat.getByLabel(/Facility/i);
  if (await facility.count()) {
    // pick first non-placeholder option
    await facility.selectOption({ index: 1 });
  }

  // Create
  await pat.getByRole('button', { name: /Create New Patient/i }).click();

  // Some builds show a confirm dialog inside the same frame; handle it if it appears
  const confirmInForm = formFrame.getByRole('button', { name: /Create New Patient/i }).first();
if (await confirmInForm.isVisible()) {
  await confirmInForm.click({ timeout: 10_000 });
} else {
  // Fallback: some builds show a top-level confirm
  const confirmTop = page.getByRole('button', { name: /Create New Patient/i }).first();
  if (await confirmTop.isVisible()) {
    await confirmTop.click({ timeout: 10_000 });
  }
}

  // --- Then a new Patient ID is created and the chart header shows the patient ---
  // Verify the patient dashboard/summary shows the created name inside the patient frame
 await expect(
  pat.getByText(new RegExp('John\\s+Ju', 'i'))
).toBeVisible({ timeout: 15_000 });



  // (Optional) also check that a PID appears somewhere on the page
  const pidHint = pat.getByText(/Patient\s*ID|PID|Record\s*ID/i);
  if (await pidHint.count()) {
    await expect(pidHint.first()).toBeVisible();
  }
});








