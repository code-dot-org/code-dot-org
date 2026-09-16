import {CookieBannerComponent} from '../components/cookie-banner';
import {expect, test} from '../fixtures';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {labLevelUrl} from '../shared/routes';
import {waitForVisualStability} from '../shared/stability';

// Examples row url is labLevelUrl({lesson: 3, level: 1}) (Lesson 3: Artist, a
// legacy Blockly lab), but the literal contract URL omits noautoplay
// (labLevelUrl defaults it on) — override it off, as tests/levels/multi3.spec.ts
// does for the same discrepancy. show_cookie_banner_on_test has no labLevelUrl
// param, so append it directly.
const url = `${labLevelUrl({lesson: 3, level: 1, noautoplay: false})}?show_cookie_banner_on_test=true`;

// Measured against test-studio.code.org (chromium/firefox/webkit, identical
// counts). One violation:
// - color-contrast (1 node, #accept-cookies): white text (#ffffff) on an
//   orange background (#ffa400) measures 1.98:1; WCAG AA requires 4.5:1.
const EXPECTED_VIOLATIONS: Record<string, number> = {'color-contrast': 1};

// Cucumber's "I dismiss the language selector" step is omitted here: its target
// (a LocalizeJS widget) is force-disabled in apps/src/localization/entrypoint.js
// and can never render.
test.describe('Cookie banner', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/cookie_banner.feature
   * "Show cookie banner, dismiss it and confirm it's dismissed" (studio.code.org puzzle) (@eyes)
   *
   * Split into three tests below (functional, visual, a11y): the single
   * Cucumber scenario mixes an Eyes checkpoint with plain assertions, but a
   * Playwright project can't mix them — @visual tests only run under the
   * visual-* (Eyes) projects, never chromium/firefox/webkit. Same split as
   * tests/global-edition/fa/sign-in-page.spec.ts for the same reason.
   */
  test("Show cookie banner, dismiss it and confirm it's dismissed (studio.code.org puzzle)", async ({
    page,
  }) => {
    const cookieBanner = new CookieBannerComponent(page);

    // Deliberately not LegacyBlocklyLab.gotoLevelUrl/waitForReady: those
    // auto-dismiss the level's own instructions overlay, which the legacy
    // Cucumber sequence for this scenario never does. The banner's script tag
    // has no async/defer attribute, so it blocks parsing and
    // 'domcontentloaded' alone already guarantees it ran; the assertion below
    // is the real (semantic) readiness signal regardless.
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    await expect(cookieBanner.acceptButton).toBeVisible();

    await cookieBanner.accept();
    await expect(cookieBanner.acceptButton).not.toBeVisible();

    await page.reload({waitUntil: 'domcontentloaded'});
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    await expect(cookieBanner.acceptButton).not.toBeVisible();
  });

  test(
    "Show cookie banner, dismiss it and confirm it's dismissed (studio.code.org puzzle) — visual snapshot",
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const cookieBanner = new CookieBannerComponent(page);
      await page.goto(url, {waitUntil: 'domcontentloaded'});
      await expect(cookieBanner.acceptButton).toBeVisible();

      // The level's intro video (apps/src/code-studio/videos.js
      // showVideoDialog) autoplays behind this dialog and burns in live
      // captions, so its frame content is never identical between runs.
      // Mask the iframe itself (.video-player), not an ancestor: .video-modal
      // is Bootstrap's full-viewport backdrop and would mask the fixed-bottom
      // cookie banner too, and .modal-dialog clips short of the iframe's true
      // bottom edge (a sizing quirk in videos.js that doesn't account for the
      // modal's own padding/border), leaving a sliver of live video visible.
      const introVideoDialog = page.locator('.video-modal .video-player');
      await waitForVisualStability(page, cookieBanner.banner);
      await visualCheck('initial-load-with-cookie-banner', {
        mask: [introVideoDialog],
      });
    },
  );

  /**
   * Net-new coverage (no Cucumber source): WCAG AA scan of the cookie banner.
   */
  test('The cookie banner passes a WCAG AA scan', async ({page}) => {
    const cookieBanner = new CookieBannerComponent(page);
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    await expect(cookieBanner.acceptButton).toBeVisible();

    expect(
      await analyze(page, {
        include: cookieBanner.rootSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS);
  });
});
