import {test} from '../fixtures';
import {mockDcdoKey} from '../shared/dcdo';
import {setEuropeanIpCookie} from '../shared/geolocation';

import {OneTrustPage} from './one-trust-page';

test.describe('OneTrust integration', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "User sees OneTrust cookie pop-up when self-hosting OneTrust libraries on code.org"
   *
   * @eyes scenario — Applitools visual comparison not available in Playwright
   * port. Skipped; the functional duplicate (scenario 2) covers the same flow.
   */
  test.skip('User sees OneTrust cookie pop-up when self-hosting OneTrust libraries on code.org (@eyes)', async () => {
    // @eyes: Applitools visual diff not ported; covered by the scenario below.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "OneTrust cookie pop-up shows when self-hosting OneTrust libraries on code.org"
   */
  test('OneTrust cookie pop-up shows when self-hosting OneTrust libraries on code.org', async ({
    page,
    signInAsNewUser,
  }) => {
    const ot = new OneTrustPage(page);

    await signInAsNewUser({type: 'student', name: 'Alice'});

    // Set the European geo-override cookie (Spain IP).
    await setEuropeanIpCookie(page);

    // Navigate to /home with OT reset params and wait for otreset=false.
    await ot.gotoHomeWithOtReset();

    // OT injects the banner after its SDK initialises — wait for the element.
    await ot.waitForOtBannerVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "The dashboard pages load the self hosted OneTrust libraries."
   */
  test('The dashboard pages load the self hosted OneTrust libraries.', async ({
    page,
  }) => {
    const ot = new OneTrustPage(page);

    await ot.goto('/users/sign_in');

    await ot.expectScriptExists(
      "script[src$='onetrust/cdo/scripttemplates/otSDKStub.js']",
    );
    await ot.expectScriptExists("script[src$='977d/OtAutoBlock.js']");
    await ot.expectScriptAbsent("script[src$='977d-test/OtAutoBlock.js']");
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "The dashboard pages load the Onetrust prod libraries."
   *
   * NOTE: The DCDO cookie domain must be the top-level domain (.code.org) so
   * the Rack::CookieDCDO middleware reads it. An initial navigation primes the
   * cookie domain before the DCDO cookie is set.
   */
  test('The dashboard pages load the Onetrust prod libraries.', async ({
    page,
  }) => {
    const ot = new OneTrustPage(page);

    // Prime the domain so context.addCookies has a valid host to target.
    await ot.goto('/users/sign_in');
    await mockDcdoKey(page, 'onetrust_cookie_scripts', 'prod');

    await ot.goto('/users/sign_in');

    await ot.expectScriptExists("script[src$='otSDKStub.js']");
    await ot.expectScriptExists("script[src$='977d/OtAutoBlock.js']");
    await ot.expectScriptAbsent("script[src$='977d-test/OtAutoBlock.js']");
    await ot.expectScriptAbsent(
      "script[src$='onetrust/scripttemplates/otSDKStub.js']",
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "The dashboard pages load the test OneTrust libraries."
   */
  test('The dashboard pages load the test OneTrust libraries.', async ({
    page,
  }) => {
    const ot = new OneTrustPage(page);

    await ot.goto('/users/sign_in?onetrust_cookie_scripts=test');

    await ot.expectScriptExists("script[src$='otSDKStub.js']");
    await ot.expectScriptAbsent("script[src$='977d/OtAutoBlock.js']");
    await ot.expectScriptExists("script[src$='977d-test/OtAutoBlock.js']");
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "The dashboard pages do not load the OneTrust libraries."
   */
  test('The dashboard pages do not load the OneTrust libraries.', async ({
    page,
  }) => {
    const ot = new OneTrustPage(page);

    await ot.goto('/users/sign_in?onetrust_cookie_scripts=off');

    await ot.expectScriptAbsent("script[src$='otSDKStub.js']");
    await ot.expectScriptAbsent("script[src$='977d/OtAutoBlock.js']");
    await ot.expectScriptAbsent("script[src$='977d-test/OtAutoBlock.js']");
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "Critical Javascript files are appropriately categorized by OneTrust on dashboard"
   */
  test('Critical Javascript files are appropriately categorized by OneTrust on dashboard', async ({
    page,
  }) => {
    const ot = new OneTrustPage(page);

    await ot.goto('/users/sign_in');

    await ot.expectNotCategorizedByOneTrust(
      "script[src*='/assets/application']",
    );
    await ot.expectNotCategorizedByOneTrust(
      "script[src*='js/webpack-runtime']",
    );
    await ot.expectNotCategorizedByOneTrust("script[src*='js/essential']");
    await ot.expectNotCategorizedByOneTrust("script[src*='js/vendors']");
    await ot.expectNotCategorizedByOneTrust("script[src*='/common_locale']");
    await ot.expectNotCategorizedByOneTrust(
      "script[src*='js/code-studio-common']",
    );
    await ot.expectNotCategorizedByOneTrust("script[src*='js/code-studio']");
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "Embedded projects do not display the OneTrust banner" (@as_student)
   */
  for (const projectType of [
    'music',
    'spritelab',
    'artist',
    'gamelab',
    'dance',
    'applab',
    'poetry',
    'flappy',
    'frozen',
  ]) {
    test(`Embedded projects do not display the OneTrust banner — ${projectType}`, async ({
      page,
      signInAsNewUser,
    }) => {
      const ot = new OneTrustPage(page);

      // @as_student hook: sign in as a student before the scenario.
      await signInAsNewUser({type: 'student', name: 'Student'});

      // Set European geo-override cookie.
      await setEuropeanIpCookie(page);

      // Navigate to /projects/{type}/new — auto-redirects to /edit URL.
      await ot.goto(`/projects/${projectType}/new`);

      // Switch to the embedded view with OT reset params.
      await ot.switchToEmbeddedView('otreset=true&otgeo=es');

      // Embed pages must not load any OT scripts.
      await ot.expectScriptAbsent("script[src$='otSDKStub.js']");
      await ot.expectScriptAbsent("script[src$='OtAutoBlock.js']");
    });
  }
});
