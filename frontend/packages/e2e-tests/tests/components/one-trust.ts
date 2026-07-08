import {type Locator, type Page} from '@playwright/test';

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
