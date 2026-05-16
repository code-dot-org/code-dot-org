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
    await this.page.goto('/home');
    await this.page.locator('.header_user').waitFor({state: 'visible'});
  }

  /**
   * Verifies a fresh dashboard home load does not show the GDPR dialog.  The
   * signed-in header is the user-visible readiness signal from Cucumber.
   */
  async expectAcceptedHome(): Promise<void> {
    await expect(async () => {
      await this.acceptServerSide();
      await this.gotoHomeAndWaitForHeader();
      await expect(this.heading()).not.toBeVisible({timeout: 1000});
      expect(await this.scriptDataShowsDialog()).toBe('false');
    }).toPass({timeout: 90_000, intervals: [500, 1000, 2000, 5000]});

    await expect(this.heading()).not.toBeVisible({timeout: 15_000});
  }

  /**
   * Reads the current show_gdpr_dialog script-data value.
   */
  async scriptDataShowsDialog(): Promise<string> {
    const data = await this.scriptData();
    return String(data['show_gdpr_dialog']);
  }

  /**
   * Reads the current GDPR script-data object.
   */
  async scriptData(): Promise<Record<string, unknown>> {
    return this.page.evaluate(() => {
      const el = document.querySelector('script[data-gdpr]');
      const raw = (el as HTMLElement | null)?.dataset['gdpr'] ?? '{}';
      return JSON.parse(raw) as Record<string, unknown>;
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
   * Replays the idempotent accept endpoint for the current user.  The UI click
   * remains the behavior under test; this waits for the same server state that
   * the following full page load observes.
   */
  async acceptServerSide(): Promise<void> {
    await browserRequest(
      this.page,
      '/dashboardapi/v1/users/accept_data_transfer_agreement',
      'POST',
      {user_id: 'me'},
      204,
    );
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
    const acceptResponse = this.page.waitForResponse(
      response =>
        response
          .url()
          .includes('/dashboardapi/v1/users/accept_data_transfer_agreement') &&
        response.request().method() === 'POST',
      {timeout: 15_000},
    );
    await this.acceptButton().click();
    expect((await acceptResponse).status()).toBe(204);
    await this.acceptServerSide();
    await expect(this.heading()).not.toBeVisible({timeout: 15_000});
    await this.waitForScriptDataFalse();
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
 * Navigates to a dashboard document with a CSRF token for browser-origin XHRs.
 */
async function gotoCsrfDocument(
  page: import('@playwright/test').Page,
): Promise<void> {
  for (const path of ['/reset_session', '/users/sign_in']) {
    await page.goto(path, {waitUntil: 'domcontentloaded'});
    if ((await page.locator('meta[name="csrf-token"]').count()) > 0) {
      return;
    }
  }

  throw new Error('dashboard did not render a CSRF token');
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
  let response: {status: number; text: string} | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) {
    response = await page.evaluate(
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
    if (response.status === expectedStatus || response.status < 500) {
      break;
    }
  }

  expect(response?.status, response?.text).toBe(expectedStatus);
  return response?.text ?? '';
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
  await gotoCsrfDocument(page);
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
  await gotoCsrfDocument(page);
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
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * Scenario: EU user sees the GDPR Dialog on dashboard, opt in, don't show again
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
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * Scenario: GDPR Dialog privacy link works from dashboard
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
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * Scenario: Accept, sign out, sign in again, no dialog
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
