import {expect, type Locator, type Page} from '@playwright/test';

/**
 * OneTrust cookie-consent integration. OneTrust is injected into every
 * studio.code.org page rather than living on a page of its own, so it is
 * modeled as a component the spec drives directly, mirroring AuthoredHints.
 *
 * The SDK is served from different paths per `onetrust_cookie_scripts` mode;
 * each mode is identified by which of these <script> tags it injects.
 */
export class OneTrustComponent {
  private readonly page: Page;

  /**
   * The cookie-consent banner OneTrust injects once its SDK initializes.
   * #onetrust-banner-sdk is OneTrust's own fixed widget id (no accessible
   * role/name until content renders) — the same selector the Cucumber step
   * ("element \"#onetrust-banner-sdk\" is visible") asserts on.
   */
  readonly banner: Locator;

  /** SDK stub at any path — present whenever OneTrust loads at all. */
  readonly sdkStub: Locator;

  /** SDK stub served from code.org's self-hosted path (the default mode). */
  readonly selfHostedSdkStub: Locator;

  /** SDK stub served from OneTrust's prod CDN path (not self-hosted). */
  readonly prodCdnSdkStub: Locator;

  /** Auto-block script at any path. */
  readonly autoBlock: Locator;

  /** Auto-block script for the prod (977d) consent group. */
  readonly prodAutoBlock: Locator;

  /** Auto-block script for the test (977d-test) consent group. */
  readonly testAutoBlock: Locator;

  /** The preference-center modal. */
  readonly preferenceCenter: Locator;

  /** Performance-cookie (C0002) toggle; OneTrust hides the input behind its label. */
  readonly performanceToggle: Locator;
  private readonly performanceToggleLabel: Locator;

  /** "Confirm my choices" in the preference center. */
  readonly savePreferencesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.banner = page.locator('#onetrust-banner-sdk');
    this.sdkStub = page.locator("script[src$='otSDKStub.js']");
    this.selfHostedSdkStub = page.locator(
      "script[src$='onetrust/cdo/scripttemplates/otSDKStub.js']",
    );
    this.prodCdnSdkStub = page.locator(
      "script[src$='onetrust/scripttemplates/otSDKStub.js']",
    );
    this.autoBlock = page.locator("script[src$='OtAutoBlock.js']");
    this.prodAutoBlock = page.locator("script[src$='977d/OtAutoBlock.js']");
    this.testAutoBlock = page.locator(
      "script[src$='977d-test/OtAutoBlock.js']",
    );
    this.preferenceCenter = page.locator('#onetrust-pc-sdk');
    this.performanceToggle = page.locator('#ot-group-id-C0002');
    this.performanceToggleLabel = page.locator(
      "label[for='ot-group-id-C0002']",
    );
    this.savePreferencesButton = page.locator('.save-preference-btn-handler');
  }

  /**
   * Load path as seen from region geo (an ISO country code OneTrust accepts as
   * otgeo) and open the preference center through OneTrust's API, which works
   * whether or not consent was already given. The default, Spain, gets the
   * opt-in template with a performance-cookie toggle.
   */
  async openPreferenceCenter(
    path: string,
    {geo = 'es'}: {geo?: string} = {},
  ): Promise<void> {
    const url = new URL(path, this.page.url());
    url.searchParams.set('otgeo', geo);
    await this.page.goto(url.pathname + url.search);
    await this.page.waitForFunction(
      () => typeof window.OneTrust?.ToggleInfoDisplay === 'function',
      undefined,
      {timeout: 30_000},
    );
    // A call made while the banner is still initializing is silently dropped.
    // Retry only while hidden, since a second call would close the panel.
    await expect(async () => {
      if (!(await this.preferenceCenter.isVisible())) {
        await this.page.evaluate(() => window.OneTrust?.ToggleInfoDisplay?.());
      }
      await expect(this.preferenceCenter).toBeVisible({timeout: 2_000});
    }).toPass({timeout: 20_000});
  }

  /** Set the performance-cookie toggle, save, and wait for OneTrust's UI to close. */
  async savePerformanceConsent(enabled: boolean): Promise<void> {
    if ((await this.performanceToggle.isChecked()) !== enabled) {
      await this.performanceToggleLabel.click();
    }
    await expect(this.performanceToggle).toBeChecked({checked: enabled});
    await this.savePreferencesButton.click();
    await expect(this.preferenceCenter).toBeHidden();
    await expect(this.banner).toBeHidden();
  }

  /** OneTrust's active consent groups, e.g. ['C0001', 'C0002']. */
  async activeGroups(): Promise<string[]> {
    return this.page.evaluate(() =>
      (window.OnetrustActiveGroups ?? '').split(',').filter(Boolean),
    );
  }

  /**
   * <script> tags matching selector that OneTrust has categorized (tagged with
   * an optanon-category-* class). Critical scripts must never be categorized,
   * so the spec asserts this locator has count 0 — but only after the SDK has
   * had a chance to run its classification pass (see waitForSdkSettled).
   */
  categorizedScript(selector: string): Locator {
    return this.page.locator(`${selector}[class*='optanon-category-']`);
  }

  /** Wait for the OneTrust SDK script tag to appear in the DOM. */
  async waitForSdkSettled(): Promise<void> {
    await this.page.waitForFunction(
      () =>
        document.querySelector(
          "script[src*='otBannerSdk'], script[src*='otSDKStub']",
        ) !== null,
      undefined,
      {timeout: 15_000},
    );
  }
}
