// tests/scheduleappointment.spec.js
// @ts-check
const { test, expect } = require('@playwright/test');

/** @typedef {import('@playwright/test').Page} Page */
/** Login helper */

/** @param {Page} page */
async function loginOpenEMR(page) {
  const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8300/';
  const USER = process.env.EMR_USER ?? 'admin';
  const PASS = process.env.EMR_PASS ?? 'changeMeNow123!';

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 90_000 });

  const langSelect = page.locator("select[name='languageChoice']");
  await langSelect.waitFor({ state: 'visible' });
  await langSelect.selectOption({ label: 'English (Standard)' });

  await page.fill('#authUser', USER);
  await page.fill('#clearPass', PASS);
  await page.click('#login-button');

  await page.locator('#mainMenu').waitFor({ state: 'visible', timeout: 15_000 });
}

/** Calendar page object (ONLY ONE) */
// inside CalendarPage
class CalendarPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Calendar is rendered inside this frame
    this.frame = page.frameLocator('iframe[src*="/interface/main/calendar/index.php"]');

    // Prefer a role-based locator; fall back to text selector
    this.plus =
      this.frame.getByRole('button', { name: '+' })
        .or(this.frame.getByRole('link', { name: '+' }))
        .or(this.frame.locator('button:has-text("+"), a:has-text("+")'))
        .first();
  }

  async open() {
    // If the frame is already there, skip clicking the tab
    await this.page.locator('iframe[src*="/interface/main/calendar/index.php"]').waitFor({ state: 'attached' });
    await this.plus.waitFor({ state: 'visible' }); // reliable "ready" signal
  }

  async clickPlus() {
    await this.open();
    await this.plus.click();
  }
}
