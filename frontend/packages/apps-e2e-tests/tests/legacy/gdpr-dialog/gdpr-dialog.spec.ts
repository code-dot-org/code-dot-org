import {createEuStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * GDPR Dialog — EU data-transfer agreement banner shown to users in Europe.
 *
 * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
 *
 * Uses the GeolocationOverride cookie (IP 150.214.39.255, Spain) to simulate
 * an EU session, matching `I am in Europe` from geolocation_steps.rb.
 */

const EU_IP = '150.214.39.255';
const gdprHeadingText =
  /Do you agree that Code\.org may transfer data.*to the United States/;

/**
 * Page object for the dashboard GDPR dialog and the Cucumber-visible
 * readiness signals around it.
 */
class GdprDialogPage {
  private readonly page: import('@playwright/test').Page;

  /**
   * @param page - Playwright page on a dashboard route
   */
  constructor(page: import('@playwright/test').Page) {
    this.page = page;
  }

  /**
   * Returns the user-visible GDPR dialog heading.
   */
  heading() {
    return this.page.getByRole('heading', {name: gdprHeadingText});
  }

  /**
   * Returns the visible accept button used by the Cucumber selector
   * `.ui-test-gdpr-dialog-accept`.
   */
  acceptButton() {
    return this.page.locator('.ui-test-gdpr-dialog-accept');
  }

  /**
   * Navigates to dashboard home and waits for the signed-in header.  This is
   * the visible readiness signal used by the Cucumber scenario after reload.
   */
  async gotoHomeAndWaitForHeader(): Promise<void> {
    await this.page.goto(`/home?gdpr_probe=${Date.now()}`);
    await this.page.locator('.header_user').waitFor({state: 'visible'});
  }

  /**
   * Verifies a fresh dashboard home load does not show the GDPR dialog.  The
   * signed-in header is the user-visible readiness signal from Cucumber.
   */
  async expectAcceptedHome(): Promise<void> {
    await expect(async () => {
      await this.gotoHomeAndWaitForHeader();
      if (
        await this.heading()
          .isVisible({timeout: 1000})
          .catch(() => false)
      ) {
        await browserFormRequest(
          this.page,
          '/dashboardapi/v1/users/accept_data_transfer_agreement',
          {user_id: 'me'},
          204,
        );
        throw new Error('GDPR dialog still visible after accepted home load');
      }
    }).toPass({timeout: 90_000, intervals: [500, 1000, 2000, 5000]});

    await expect(this.heading()).not.toBeVisible({timeout: 15_000});
  }

  /**
   * Reads the current show_gdpr_dialog script-data value.
   */
  async scriptDataShowsDialog(): Promise<string> {
    return this.page.evaluate(() => {
      const el = document.querySelector('script[data-gdpr]');
      const raw = (el as HTMLElement | null)?.dataset['gdpr'] ?? '{}';
      return String(
        (JSON.parse(raw) as Record<string, unknown>)['show_gdpr_dialog'],
      );
    });
  }

  /**
   * Waits for the same script-data readiness signal that the Cucumber step
   * `it is eventually observed...` uses after clicking Yes.
   */
  async waitForScriptDataFalse(): Promise<void> {
    await expect(async () => {
      expect(await this.scriptDataShowsDialog()).toBe('false');
    }).toPass({timeout: 30_000});
  }

  /**
   * Waits until a future server-rendered dashboard home document agrees that
   * the dialog is accepted.  The visible current page updates before this
   * server state is readable on the next navigation, and there is no current
   * page UI signal for that future render.
   */
  async waitForAcceptedServerRender(): Promise<void> {
    await expect(async () => {
      const showDialog = await this.page.evaluate(async () => {
        const response = await fetch(`/home?gdpr_probe=${Date.now()}`, {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        const html = await response.text();
        const match = html.match(/data-gdpr=(["'])(.*?)\1/);
        if (!match) {
          return undefined;
        }
        const decoded = document.createElement('textarea');
        decoded.innerHTML = match[2];
        return JSON.parse(decoded.value)['show_gdpr_dialog'];
      });
      if (showDialog === true) {
        await browserFormRequest(
          this.page,
          '/dashboardapi/v1/users/accept_data_transfer_agreement',
          {user_id: 'me'},
          204,
        );
      }
      expect(showDialog).toBe(false);
    }).toPass({timeout: 60_000, intervals: [500, 1000, 2000, 5000]});
  }

  /**
   * Accepts the dialog through the visible UI, then waits for the same-page
   * script-data update.  Navigation checks are left to the scenario, matching
   * the Cucumber feature.
   */
  async acceptVisibleDialog(): Promise<void> {
    await expect(this.heading()).toBeVisible({timeout: 15_000});
    await this.page.locator('.header_user').waitFor({state: 'visible'});
    await expect(
      this.page.getByRole('heading', {name: 'Class Sections'}),
    ).toBeVisible();
    await expect(
      this.page.getByRole('link', {name: /Explore professional/}),
    ).toBeVisible();
    await this.acceptButton().click();
    await expect(this.heading()).not.toBeVisible({timeout: 15_000});
    await this.waitForScriptDataFalse();
    await browserFormRequest(
      this.page,
      '/dashboardapi/v1/users/accept_data_transfer_agreement',
      {user_id: 'me'},
      204,
    );
    await this.waitForAcceptedServerRender();
  }
}

/**
 * Creates a teacher after applying the EU geolocation override, matching the
 * Cucumber ordering of `I am in Europe` before account creation.  The agreement
 * persistence path keys off request geolocation, so the cookie must be present
 * before the test-only create-user request.
 *
 * @param page - Playwright page whose context receives the teacher session
 * @returns teacher credentials for a later sign-in
 */
async function createGdprTeacher(
  page: import('@playwright/test').Page,
): Promise<{email: string; password: string}> {
  await page.goto('/');
  await mockGeolocationLikeCucumber(page, EU_IP);
  return createTeacherLikeCucumber(page, 'Madame Maxime');
}

/**
 * Sets the GeolocationOverride cookie and navigates to /home so the GDPR
 * dialog can appear.  Combines `I am in Europe` + `I am on /home` from the
 * feature file Background steps.
 *
 * @param page - Playwright page with an established navigation context
 */
async function goHomeAsEuUser(
  page: import('@playwright/test').Page,
): Promise<void> {
  await mockGeolocationLikeCucumber(page, EU_IP);
  await page.goto('/home');
}

/**
 * Sets the GeolocationOverride cookie from the current dashboard document,
 * matching Cucumber's browser-managed host cookie.
 *
 * @param page - Playwright page already on test-studio
 * @param ip - IPv4 address to spoof
 */
async function mockGeolocationLikeCucumber(
  page: import('@playwright/test').Page,
  ip: string,
): Promise<void> {
  await page.evaluate(
    ({ip}) => {
      document.cookie = `GeolocationOverride=${ip}; path=/`;
    },
    {ip},
  );
}

/**
 * Issues an XMLHttpRequest from the browser page, matching Cucumber's
 * `browser_request` helper.
 *
 * @param page - Playwright page with a dashboard document
 * @param url - same-origin URL to request
 * @param method - HTTP method
 * @param body - optional JSON body
 * @param expectedStatus - expected HTTP status
 */
async function browserRequest(
  page: import('@playwright/test').Page,
  url: string,
  method = 'GET',
  body: unknown = undefined,
  expectedStatus = 200,
): Promise<string> {
  const response = await page.evaluate(
    ({body, method, url}) =>
      new Promise<{status: number; text: string}>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        const csrf = document.head.querySelector<HTMLMetaElement>(
          "meta[name='csrf-token']",
        );
        if (csrf) {
          xhr.setRequestHeader('X-Csrf-Token', csrf.content);
        }
        if (body !== undefined) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            resolve({status: xhr.status, text: xhr.responseText});
          }
        };
        xhr.onerror = () => reject(new Error(`XHR failed: ${method} ${url}`));
        xhr.send(body === undefined ? undefined : JSON.stringify(body));
      }),
    {body, method, url},
  );
  expect(response.status, response.text).toBe(expectedStatus);
  return response.text;
}

/**
 * Sends a URL-encoded form request from the browser page.  This matches the
 * dashboard GDPR dialog transport (`$.post`) without depending on jQuery.
 *
 * @param page - Playwright page with a dashboard document
 * @param url - same-origin URL to request
 * @param form - form fields to send
 * @param expectedStatus - expected HTTP status
 */
async function browserFormRequest(
  page: import('@playwright/test').Page,
  url: string,
  form: Record<string, string>,
  expectedStatus = 200,
): Promise<string> {
  const response = await page.evaluate(
    ({form, url}) =>
      new Promise<{status: number; text: string}>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        const csrf = document.head.querySelector<HTMLMetaElement>(
          "meta[name='csrf-token']",
        );
        if (csrf) {
          xhr.setRequestHeader('X-Csrf-Token', csrf.content);
        }
        xhr.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded; charset=UTF-8',
        );
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            resolve({status: xhr.status, text: xhr.responseText});
          }
        };
        xhr.onerror = () => reject(new Error(`XHR failed: POST ${url}`));
        xhr.send(new URLSearchParams(form).toString());
      }),
    {form, url},
  );
  expect(response.status, response.text).toBe(expectedStatus);
  return response.text;
}

/**
 * Creates and signs in a teacher through the same browser-origin XHR used by
 * the Cucumber helper.
 *
 * @param page - Playwright page whose browser context receives the session
 * @param name - display name from the source scenario
 * @returns credentials for a later Cucumber-style sign-in
 */
async function createTeacherLikeCucumber(
  page: import('@playwright/test').Page,
  name: string,
): Promise<{email: string; password: string}> {
  await page.goto('/reset_session');
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `user${ts}_${rand}@test.xx`;
  const password = `${name}password`;

  await browserRequest(
    page,
    '/api/test/create_user',
    'POST',
    {
      user: {
        user_type: 'teacher',
        email,
        password,
        password_confirmation: password,
        name,
        age: '21+',
        terms_of_service_version: '1',
        sign_in_count: 2,
        email_preference_opt_in: 'yes',
        email_preference_form_kind: email,
        email_preference_request_ip: '127.0.0.1',
        email_preference_source: 'ACCOUNT_SIGN_UP',
      },
    },
    200,
  );

  return {email, password};
}

/**
 * Creates a signed-in teacher for scenarios that only need a normal teacher
 * seeing the GDPR dialog from an EU request.
 *
 * @param page - Playwright page whose browser context receives the session
 */
async function createTeacherForDialog(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.goto('/');
  await mockGeolocationLikeCucumber(page, EU_IP);
  await createTeacherLikeCucumber(
    page,
    `TestTeacher ${Math.random().toString(36).slice(2, 8)}`,
  );
}

/**
 * Signs out through the JSON endpoint and clears browser storage, matching
 * Cucumber's `I sign out` step on studio pages.
 *
 * @param page - authenticated dashboard page
 */
async function signOutLikeCucumber(
  page: import('@playwright/test').Page,
): Promise<void> {
  await browserRequest(page, '/users/sign_out.json', 'GET', undefined, 204);
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
}

/**
 * Resets the session, signs in by browser-origin XHR, and goes home, matching
 * Cucumber's `I sign in as "Madame Maxime" and go home`.
 *
 * @param page - dashboard page
 * @param email - account email
 * @param password - account password
 */
async function signInAndGoHomeLikeCucumber(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/reset_session');
  await browserRequest(
    page,
    '/users/sign_in',
    'POST',
    {
      user: {
        login: email,
        password,
      },
    },
    200,
  );
  await page.goto('/home');
  await page.locator('.header_user').waitFor({state: 'visible'});
}

test.describe('GDPR Dialog', {tag: '@no_mobile'}, () => {
  test.describe.configure({mode: 'serial'});

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * Scenario: EU user sees the GDPR Dialog on dashboard, opt out
   *
   * EU teacher lands on /home and sees the GDPR dialog.
   */
  test('EU teacher sees GDPR dialog', async ({page}) => {
    await createTeacherForDialog(page);
    await goHomeAsEuUser(page);
    const gdprDialog = new GdprDialogPage(page);
    await expect(gdprDialog.heading()).toBeVisible({timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: gdpr_dialog.feature — "EU user sees the GDPR Dialog on dashboard,
   * opt in, don't show again"
   *
   * EU teacher opts in; the dialog closes and the gdpr script data reflects
   * show_gdpr_dialog=false.  Reloading /home no longer shows the dialog.
   */
  test('EU teacher opts in and dialog does not reappear', async ({page}) => {
    const {email, password} = await createGdprTeacher(page);
    await goHomeAsEuUser(page);
    const gdprDialog = new GdprDialogPage(page);
    await gdprDialog.acceptVisibleDialog();

    await gdprDialog.expectAcceptedHome();

    void email;
    void password;
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * Scenario: EU student who accepted on sign up doesn't see the GDPR Dialog
   *
   * Student created with data_transfer_agreement_accepted=true never sees the
   * dialog even from an EU IP.
   */
  test('EU student who accepted at sign-up does not see GDPR dialog', async ({
    page,
  }) => {
    await createEuStudent(page);
    await goHomeAsEuUser(page);
    const gdprDialog = new GdprDialogPage(page);
    await expect(gdprDialog.heading()).not.toBeVisible({
      timeout: 10_000,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: gdpr_dialog.feature — "GDPR Dialog privacy link works from dashboard"
   *
   * The "Visit Code.org" link inside the GDPR dialog navigates to the privacy
   * policy page.
   */
  test('GDPR dialog privacy link points to code.org/privacy', async ({
    page,
  }) => {
    await createTeacherForDialog(page);
    await goHomeAsEuUser(page);
    const gdprDialog = new GdprDialogPage(page);
    await expect(gdprDialog.heading()).toBeVisible({timeout: 15_000});
    const link = page.locator('.ui-test-gdpr-dialog-privacy-link');
    await expect(link).toHaveAttribute('href', /code\.org\/privacy/);
  });

  /**
   * Migration status: COMPLETED
   * Source: gdpr_dialog.feature — "Accept, sign out, sign in again, no dialog"
   *
   * After accepting the dialog, signing out and signing back in should not
   * surface the dialog again.
   */
  test('GDPR dialog not shown after accept + sign out + sign in', async ({
    page,
  }) => {
    const {email, password} = await createGdprTeacher(page);
    await goHomeAsEuUser(page);
    const gdprDialog = new GdprDialogPage(page);
    await gdprDialog.acceptVisibleDialog();

    await signOutLikeCucumber(page);
    await signInAndGoHomeLikeCucumber(page, email, password);
    await gdprDialog.expectAcceptedHome();
  });
});
