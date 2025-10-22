// tests/scheduleappointment.spec.js
// @ts-check
const { test, expect } = require('@playwright/test');

/** @param {import('@playwright/test').Page} page */
async function loginOpenEMR(page) {
  const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8300/';
  const USER = process.env.EMR_USER ?? 'admin';
  const PASS = process.env.EMR_PASS ?? 'changeMeNow123!';

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });

  const langSelect = page.locator("select[name='languageChoice']");
  await langSelect.waitFor({ state: 'visible' });
  await langSelect.selectOption({ label: 'English (Standard)' });

  await page.fill('#authUser', USER);
  await page.fill('#clearPass', PASS);
  await page.click('#login-button');

  await page.locator('#mainMenu').waitFor({ state: 'visible', timeout: 15000 });
}

/** Calendar page object */
class CalendarPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.getByRole('link', { name: 'Calendar' }).click();
    await expect(this.page.getByTestId('calendar-root')).toBeVisible();
  }

  /** @param {string} patientName */
  async openCalendarAndSearchPatient(patientName) {
    await this.goto();
    const addBtn =
      this.page.getByTestId('add-appointment')
        .or(this.page.locator('[data-testid="calendar-add"]'))
        .or(this.page.locator('[aria-label="Add appointment"]'))
        .or(this.page.locator('button:has-text("+")'));
    await addBtn.first().click();

    await expect(this.page.getByTestId('appointment-dialog')).toBeVisible();
    await this.page.getByTestId('patient-search').fill(patientName);
    await this.page.getByTestId('patient-search-btn').click();
  }
}

test.describe('Calendar', () => {
  test('open calendar → plus → search patient', async ({ page }) => {
    await loginOpenEMR(page);
    const cal = new CalendarPage(page);
    await cal.openCalendarAndSearchPatient('Kelvin k');
    await expect(page.getByTestId('patient-picker-summary')).toContainText(/Kelvin k/i);
  });
});
