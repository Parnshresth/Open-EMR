// tests/patient-demographics.spec.js
import { test, expect } from '@playwright/test';

test.describe('Patient core demographics', () => {
  // If login is required, do it here (adjust as needed)
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8300/', { waitUntil: 'domcontentloaded', timeout: 90000 });

    // Language (optional)
    const langSelect = page.locator("select[name='languageChoice']");
    if (await langSelect.isVisible()) {
      await langSelect.selectOption({ label: 'English (Standard)' });
    }

    // Login (adjust selectors/creds as needed)
    await page.fill('#authUser', 'admin');
    await page.fill('#clearPass', 'changeMeNow123!');
    await page.click('#login-button');
    await expect(page.locator('#mainMenu')).toBeVisible({ timeout: 15000 });

    // Navigate to the new-patient form (adjust URL/navigation)
    await test.step('Navigate to Patient → New/Search', async () => {
  const nav = page.getByRole('navigation');
  await nav.getByRole('button', { name: 'Patient' }).click();
  await nav.getByText('New/Search', { exact: true }).click();
  });

  test('Fields for name, DOB, gender, phone, email are available', async ({ page }) => {
    // Prefer accessible roles/labels when possible
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/date of birth|dob/i)).toBeVisible();
    await expect(page.getByRole('combobox', { name: /gender/i })).toBeVisible();
    await expect(page.getByLabel(/phone/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('Happy path: create patient with valid demographics', async ({ page }) => {
    await page.getByLabel(/name/i).fill('Hary Zen');
    await page.getByLabel(/date of birth|dob/i).fill('1990-03-14'); // Adjust to your accepted format
    await page.getByRole('combobox', { name: /gender/i }).selectOption({ label: 'Female' });
    await page.getByLabel(/phone/i).fill('0212345678');
    await page.getByLabel(/email/i).fill('hary.zen@example.com');

    // Submit
    await page.getByTestId('patient-submit').click(); // or page.getByRole('button', { name: /save|create/i })
    // Verify success
    await expect(page.getByTestId('patient-header')).toBeVisible();
    await expect(page.getByTestId('patient-header')).toHaveText(/hary\s+zen/i);
  });

  test('Required fields: inline errors when empty', async ({ page }) => {
    // Submit without filling anything
    await page.getByTestId('patient-submit').click();

    // Example error containers: data-testid="<field>-error"
    await expect(page.getByTestId('patient-name-error')).toHaveText(/required/i);
    await expect(page.getByTestId('patient-dob-error')).toHaveText(/required/i);
    await expect(page.getByTestId('patient-gender-error')).toHaveText(/required|select/i);
    await expect(page.getByTestId('patient-phone-error')).toHaveText(/required/i);
    await expect(page.getByTestId('patient-email-error')).toHaveText(/required/i);
  });

  test('Invalid email format: shows inline error', async ({ page }) => {
    await page.getByLabel(/name/i).fill('John Ju');
    await page.getByLabel(/date of birth|dob/i).fill('1990-03-14');
    await page.getByRole('combobox', { name: /gender/i }).selectOption({ label: 'Male' });
    await page.getByLabel(/phone/i).fill('0212345678');
    await page.getByLabel(/email/i).fill('hary.zen@example.com');

    await page.getByTestId('patient-submit').click();
    await expect(page.getByTestId('patient-email-error')).toHaveText(/valid email/i);
  });

  test('Invalid phone: non-numeric / bad length shows inline error', async ({ page }) => {
    await page.getByLabel(/name/i).fill('Jane Roe');
    await page.getByLabel(/date of birth|dob/i).fill('1985-11-20');
    await page.getByRole('combobox', { name: /gender/i }).selectOption({ label: 'Female' });

    await page.getByLabel(/phone/i).fill('ABC123');
    await page.getByLabel(/email/i).fill('jane.roe@example.com');

    await page.getByTestId('patient-submit').click();
    await expect(page.getByTestId('patient-phone-error')).toHaveText(/digits|valid phone|numeric/i);

    // Too short (adjust your rule/wording)
    await page.getByLabel(/phone/i).fill('123');
    await page.getByTestId('patient-submit').click();
    await expect(page.getByTestId('patient-phone-error')).toHaveText(/length|valid phone|digits/i);
  });

  test('Invalid DOB format: shows inline error', async ({ page }) => {
    await page.getByLabel(/name/i).fill('Alex Kim');
    await page.getByLabel(/date of birth|dob/i).fill('14/03/1990'); // Wrong format if only YYYY-MM-DD allowed
    await page.getByRole('combobox', { name: /gender/i }).selectOption({ label: 'Male' });
    await page.getByLabel(/phone/i).fill('0271234567');
    await page.getByLabel(/email/i).fill('alex.kim@example.com');

    await page.getByTestId('patient-submit').click();
    await expect(page.getByTestId('patient-dob-error')).toHaveText(/date|format/i);
  });
});
