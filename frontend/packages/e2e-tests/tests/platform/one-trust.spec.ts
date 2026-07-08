import {OneTrustComponent} from '../components/one-trust';
import {expect, test} from '../fixtures';
import {createStudent, resetSession} from '../shared/auth';
import {setCountryOverride} from '../shared/geolocation';
import {waitForVisualStability} from '../shared/stability';

// OT rewrites /home?otreset=true to otreset=false once it processes the reset.
const OT_RESET_TIMEOUT_MS = 15_000;
// OT injects the banner only after its SDK initializes, which can lag past load.
const OT_BANNER_TIMEOUT_MS = 30_000;

test.describe('OneTrust integration', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "User sees OneTrust cookie pop-up when self-hosting OneTrust libraries on code.org" (@eyes)
   */
  test(
    'User sees OneTrust cookie pop-up when self-hosting OneTrust libraries on code.org',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const oneTrust = new OneTrustComponent(page);

      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Alice'});
      await setCountryOverride(page, {countryCode: 'ES'});

      await page.goto('/home?otreset=true&otgeo=es');
      await expect(page).toHaveURL(/otreset=false/, {
        timeout: OT_RESET_TIMEOUT_MS,
      });

      await expect(oneTrust.banner).toBeVisible({
        timeout: OT_BANNER_TIMEOUT_MS,
      });
      await waitForVisualStability(page, oneTrust.banner);
      await visualCheck('onetrust-pop-up-code-org', {fully: false});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "OneTrust cookie pop-up shows when self-hosting OneTrust libraries on code.org"
   */
  test('OneTrust cookie pop-up shows when self-hosting OneTrust libraries on code.org', async ({
    page,
  }) => {
    const oneTrust = new OneTrustComponent(page);

    await resetSession(page);
    await page.goto('/');
    await createStudent(page, {name: 'Alice'});
    await setCountryOverride(page, {countryCode: 'ES'});

    await page.goto('/home?otreset=true&otgeo=es');
    await expect(page).toHaveURL(/otreset=false/, {
      timeout: OT_RESET_TIMEOUT_MS,
    });

    await expect(oneTrust.banner).toBeVisible({timeout: OT_BANNER_TIMEOUT_MS});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "The dashboard pages load the self hosted OneTrust libraries."
   */
  test('The dashboard pages load the self hosted OneTrust libraries.', async ({
    page,
  }) => {
    const oneTrust = new OneTrustComponent(page);

    await page.goto('/users/sign_in');

    await expect(oneTrust.selfHostedSdkStub.first()).toBeAttached();
    await expect(oneTrust.prodAutoBlock.first()).toBeAttached();
    await expect(oneTrust.testAutoBlock).toHaveCount(0);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "The dashboard pages load the Onetrust prod libraries."
   *
   * dcdo.mock scopes the DCDO override to the top-level domain read from the
   * current URL, so an initial navigation must prime the host before the
   * cookie is set.
   */
  test('The dashboard pages load the Onetrust prod libraries.', async ({
    page,
    dcdo,
  }) => {
    const oneTrust = new OneTrustComponent(page);

    await page.goto('/users/sign_in');
    await dcdo.mock('onetrust_cookie_scripts', 'prod');
    await page.goto('/users/sign_in');

    await expect(oneTrust.sdkStub.first()).toBeAttached();
    await expect(oneTrust.prodAutoBlock.first()).toBeAttached();
    await expect(oneTrust.testAutoBlock).toHaveCount(0);

    // prod serves the stub from cdn.cookielaw.org; confirm it is not served
    // from a self-hosted /onetrust/ path.
    await expect(oneTrust.prodCdnSdkStub).toHaveCount(0);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "The dashboard pages load the test OneTrust libraries."
   */
  test('The dashboard pages load the test OneTrust libraries.', async ({
    page,
  }) => {
    const oneTrust = new OneTrustComponent(page);

    await page.goto('/users/sign_in?onetrust_cookie_scripts=test');

    await expect(oneTrust.sdkStub.first()).toBeAttached();
    await expect(oneTrust.prodAutoBlock).toHaveCount(0);
    await expect(oneTrust.testAutoBlock.first()).toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "The dashboard pages do not load the OneTrust libraries."
   */
  test('The dashboard pages do not load the OneTrust libraries.', async ({
    page,
  }) => {
    const oneTrust = new OneTrustComponent(page);

    await page.goto('/users/sign_in?onetrust_cookie_scripts=off');

    await expect(oneTrust.sdkStub).toHaveCount(0);
    await expect(oneTrust.prodAutoBlock).toHaveCount(0);
    await expect(oneTrust.testAutoBlock).toHaveCount(0);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/one_trust.feature
   * "Critical Javascript files are appropriately categorized by OneTrust on dashboard"
   */
  test('Critical Javascript files are appropriately categorized by OneTrust on dashboard', async ({
    page,
  }) => {
    const oneTrust = new OneTrustComponent(page);

    await page.goto('/users/sign_in');
    await oneTrust.waitForSdkSettled();

    for (const selector of [
      "script[src*='/assets/application']",
      "script[src*='js/webpack-runtime']",
      "script[src*='js/essential']",
      "script[src*='js/vendors']",
      "script[src*='/common_locale']",
      "script[src*='js/code-studio-common']",
      "script[src*='js/code-studio']",
    ]) {
      await expect(oneTrust.categorizedScript(selector)).toHaveCount(0);
    }
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
    }) => {
      const oneTrust = new OneTrustComponent(page);

      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Student'});
      await setCountryOverride(page, {countryCode: 'ES'});

      // /projects/{type}/new redirects to the owner's /edit URL; the embed view
      // is that URL with /edit→/embed (mirrors steps.rb "switch to the embedded
      // view of current project").
      await page.goto(`/projects/${projectType}/new`);
      await page.waitForURL(/\/edit/);
      const embedUrl =
        page.url().replace('/edit', '/embed') + '?otreset=true&otgeo=es';
      await page.goto(embedUrl);

      await expect(oneTrust.sdkStub).toHaveCount(0);
      await expect(oneTrust.autoBlock).toHaveCount(0);
    });
  }
});
