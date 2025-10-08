// @ts-nocheck
import { test, expect } from '@playwright/test';

test('Patient > Create new patient (minimal required fields)', async ({ page }) => {
  // --- Login ---
    await page.goto('http://localhost:8300/',{
      waitUntil: 'domcontentloaded',
    timeout: 90_000,
  }); 

 // Use stable attribute instead of role+name (no accessible name on this page)
  const langSelect = page.locator("select[name='languageChoice']");
  await expect(langSelect).toBeVisible();

  await langSelect.selectOption({ label: 'English (Standard)' });
  await expect(langSelect.locator('option:checked')).toHaveText('English (Standard)');


  
    await page.fill('#authUser', 'admin');
    await page.fill('#clearPass', 'changeMeNow123!');
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
const contactSectionBtn = formFrame.getByRole('button', { name: /^Contact$/i });
const mobilePhone = formFrame.getByLabel(/mobile phone/i).or(formFrame.getByPlaceholder(/mobile phone/i));
const contactEmail = formFrame.getByLabel(/contact email/i).or(formFrame.getByPlaceholder(/contact email/i));
await expect(firstName).toBeVisible({ timeout: 15_000 });
await firstName.fill('Kelvin');
await lastName.fill('k');

// DOB: some builds expect US format
await dob.fill('01/01/2000'); // use '2000-01-01' if your build accepts ISO

if (await sexSelect.count()) {
  await sexSelect.selectOption({ label: 'Male' });
} else {
  await formFrame.getByRole('radio', { name: /Male/i }).check();
}

const scope = typeof formFrame !== 'undefined' ? formFrame : page;

// 1) Open Contacts section: #header_2 > h2 > button
const contactsToggle = scope.locator('#header_2 > h2 > button').first();
await contactsToggle.scrollIntoViewIfNeeded();
const expanded = (await contactsToggle.getAttribute('aria-expanded')) ?? 'false';
if (expanded !== 'true') {
  await expect(contactsToggle).toBeVisible({ timeout: 50_000 });
  await contactsToggle.click();
}

// 2) Mobile phone: #form_phone_cell
const mobilePhoneInput = scope.locator('#form_phone_cell'); // ID is unique
await expect(mobilePhoneInput).toBeVisible({ timeout: 50_000 });
await mobilePhoneInput.fill('0212345678');

// 3) Contact email: #form_email
const emailInput = scope.locator('#form_email').first();
await expect(emailInput).toBeVisible({ timeout: 20_000 });
await emailInput.fill('kelvin.k@example.com');

  // Facility may be required depending on config; set it if present
  const facility = pat.getByLabel(/Facility/i);
  if (await facility.count()) {
    // pick first non-placeholder option
    await facility.selectOption({ index: 1 });
  }

  // Create
  await pat.getByRole('button', { name: /Create New Patient/i }).click();

  // Some builds show a confirm dialog inside the same frame; handle it if it appears
  const confirmInForm = formFrame.getByRole('button', { name: /Confirm Create New Patient/i }).first();
if (await confirmInForm.isVisible()) {
  await confirmInForm.first().click({ timeout: 40_000 });
} else {
  // Fallback: some builds show a top-level confirm
  const confirmTop = page.getByRole('button', { name: /Confirm Create New Patient/i }).first();
  if (await confirmTop.isVisible()) {
    await confirmTop.click({ timeout: 60_000 });
  }
}
// Wait for the modal to appear, then click Confirm
const inlineConfirm = pat.getByRole('button', { name: /Confirm Create New Patient/i }).first();
const dialog = page.getByRole('dialog');

if (await inlineConfirm.isVisible({ timeout: 2_000 }).catch(() => false)) {
  await inlineConfirm.click();
} else if (await dialog.isVisible({ timeout: 15_000 }).catch(() => false)) {
  const modalFrame = dialog.frameLocator('iframe'); // content is inside dialog iframe
  await modalFrame.getByRole('button', { name: /Confirm Create New Patient/i }).click();
} 

  // (Optional) also check that a PID appears somewhere on the page
  const pidHint = pat.getByText(/Patient\s*ID|PID|Record\s*ID/i);
  if (await pidHint.count()) {
    await expect(pidHint.first()).toBeVisible();
  }
});