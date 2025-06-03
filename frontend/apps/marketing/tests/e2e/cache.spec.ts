import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';
import {getTestStage} from './utils/stage';

test.describe('Caching Tests', () => {
  test('should cache by default', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getTestStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
    const response = await allTheThingsPage.goto();

    const cacheControlHeader = response?.headers()['cache-control'];
    expect(cacheControlHeader).toMatch(
      /^s-maxage=900, stale-while-revalidate=\d+$/,
    );
  });

  test('should disable cache if draft mode is enabled', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getTestStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
    const response = await allTheThingsPage.enableDraftMode(
      process.env.DRAFT_MODE_TOKEN,
    );

    const cacheControlHeader = response?.headers()['cache-control'];
    expect(cacheControlHeader).toEqual(
      'private, no-cache, no-store, max-age=0, must-revalidate',
    );

    const cookieHeader = await allTheThingsPage.page.context().cookies();

    const prerenderBypassCookie = cookieHeader.find(
      cookie => cookie.name === '__prerender_bypass',
    );

    expect(prerenderBypassCookie).toEqual(
      expect.objectContaining({
        name: '__prerender_bypass',
        path: '/',
        httpOnly: true,
        secure: true, // Needed for SameSite=none
        sameSite: 'None', // Allow cookie in cross-origin iframes
      }),
    );
  });

  test('should not render experiences if draft mode is enabled with search param expEditor=true', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getTestStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
    await allTheThingsPage.enableDraftMode(process.env.DRAFT_MODE_TOKEN);

    // Go to the same page with the expEditor=true query param
    await allTheThingsPage.goto(
      '/engineering/all-the-things?expEditorMode=true',
    );

    // Check that <main> exists
    await expect(page.locator('main')).toHaveCount(1);

    // Check that <main> has nothing except an optional content editor popover.
    await expect(
      page.locator('main > *:not(button:has-text("Draft Version"))'),
    ).toHaveCount(0);
  });

  test('should 401 with an invalid token', async ({page, browserName}) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getTestStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
    const response = await allTheThingsPage.enableDraftMode('invalid-token');

    expect(response?.status()).toEqual(401);
  });
});
