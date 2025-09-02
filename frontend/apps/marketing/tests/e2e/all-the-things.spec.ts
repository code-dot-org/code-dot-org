import {AxeBuilder} from '@axe-core/playwright';
import {expect, Locator} from '@playwright/test';

import {EXPECTED_LOCALIZATION_STRINGS} from './config/i18n';
import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';
import {type Section} from './pom/all-the-things';
import {MarketingPage} from './pom/marketing';
import {getSiteType} from './utils/getSiteType';

test.describe(`[${getSiteType()}] All the things`, () => {
  test.describe('a11y', () => {
    test('should have no accessibility violations', async ({page}) => {
      const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
      await allTheThingsPage.goto();

      const accessibilityScanResults = await new AxeBuilder({page}).analyze();

      // Do not allow any more accessibility errors. If you fixed one, reduce the number below.
      if (accessibilityScanResults.violations.length > 0) {
        // Log out the violations so we can fix them
        // The current allowed violations are:
        // 1. color contrast on overline
        // 2. color contrast on overline in action block carousel
        console.warn(
          JSON.stringify(accessibilityScanResults.violations, null, 2),
        );

        expect(accessibilityScanResults.violations.length).toEqual(1);
      }
    });
  });

  test.describe('locale-less redirect', () => {
    test('should redirect from localeless paths to english localized paths when no language cookie is set', async ({
      page,
      context,
      browserName,
    }) => {
      test.skip(
        browserName !== 'chromium',
        'This test only needs to run once on Chromium',
      );

      const allTheThingsPage = new MarketingPage(page);
      await allTheThingsPage.goto('/engineering/all-the-things');

      await page.waitForURL('**/en-US/engineering/all-the-things');

      // Should set the language cookie to en-US
      expect(await context.cookies()).toContainEqual(
        expect.objectContaining({
          name: 'language_',
          value: 'en-US',
        }),
      );
    });

    // Re-enable when locales other than English are supported
    test('should redirect from localeless paths to localized paths using the language cookie', async ({
      page,
      context,
      browserName,
    }) => {
      test.skip(
        browserName !== 'chromium',
        'This test only needs to run once on Chromium',
      );
      const allTheThingsPage = new MarketingPage(page);

      await context.addCookies([
        {
          name: 'language_',
          path: '/',
          domain: `.${allTheThingsPage.getCookieDomain()}`,
          value: 'zh-TW',
        },
      ]);

      await allTheThingsPage.goto('/engineering/all-the-things');

      await page.waitForURL('**/zh-Hant/engineering/all-the-things');
    });

    test.use({
      locale: 'completely-invalid',
    });

    test('should redirect from localeless paths to localized english when language cookie is invalid and no accept-header', async ({
      page,
      browserName,
      context,
    }) => {
      test.skip(
        browserName !== 'chromium',
        'This test only needs to run once on Chromium',
      );
      const allTheThingsPage = new MarketingPage(page);

      await context.addCookies([
        {
          name: 'language_',
          path: '/',
          domain: `.${allTheThingsPage.getCookieDomain()}`,
          value: 'invalid',
        },
      ]);

      await allTheThingsPage.goto('/engineering/all-the-things');

      await page.waitForURL('**/en-US/engineering/all-the-things');
    });

    test('should stay on the same locale if starting from a localized page', async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== 'chromium',
        'This test only needs to run once on Chromium',
      );
      const allTheThingsPage = new MarketingPage(page);

      await allTheThingsPage.goto('/zh-Hant/engineering/all-the-things');

      // The middleware should send us back to /zh-Hant with the language_ cookie set via the previous visit
      await allTheThingsPage.goto('/engineering/all-the-things');
      await page.waitForURL('**/zh-Hant/engineering/all-the-things');
    });

    test.describe('accept-language header', () => {
      test.use({
        locale: 'zh-Hant',
      });

      test('redirects to localized page via accept-language', async ({
        page,
        browserName,
      }) => {
        test.skip(
          browserName !== 'chromium',
          'This test only needs to run once on Chromium',
        );
        const allTheThingsPage = new MarketingPage(page);
        await allTheThingsPage.goto('/engineering/all-the-things');

        await page.waitForURL('**/zh-Hant/engineering/all-the-things');
      });
    });
  });

  test('should have the correct top level SEO metadata', async ({page}) => {
    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    await allTheThingsPage.goto();

    expect(await allTheThingsPage.pageTitle).toBe(
      '❌ [ENGINEERING ONLY] UI Integration Testing - SEO',
    );
    expect(await allTheThingsPage.description).toBe('SEO Description');
    expect(await allTheThingsPage.robots).toBe('noindex, nofollow');

    // OpenGraph tests
    expect(await allTheThingsPage.getOpenGraph('title')).toBe(
      'OpenGraph Title',
    );
    expect(await allTheThingsPage.getOpenGraph('description')).toBe(
      'OpenGraph Description',
    );
    expect(await allTheThingsPage.getOpenGraph('image')).toMatch(
      /https:\/\/contentful-images\.code\.org\/(.*)\/4hXiOPiRlCXpmtypRNOZqc\/(.*)\/engineering-only-opengraph-default\.png\?fm=webp/,
    );
    expect(await allTheThingsPage.getOpenGraph('type')).toBe('website');
  });

  Object.entries(EXPECTED_LOCALIZATION_STRINGS).forEach(([locale, entry]) => {
    test.describe(`Localization - ${locale}`, () => {
      let component: Locator;

      test.beforeEach(async ({page}) => {
        const allTheThingsPage = new AllTheThingsPage(page, {locale});
        await allTheThingsPage.goto();

        component = allTheThingsPage.getSectionLocator(
          entry.heading as Section,
        );
        await component.scrollIntoViewIfNeeded();
      });

      test(`has localized text`, async () => {
        // Ensure connectivity to Contentful Content Type `Quote`'s Short Text
        await expect(
          component.getByText(entry.shortText, {exact: true}),
        ).toBeVisible();
        // Ensure connectivity to Contentful Content Type `Quote`'s Long Text
        await expect(component.getByText(entry.longText)).toBeVisible();

        // Ensure math symbols can render
        await expect(
          component.getByText('Math Symbols: 1 + 2 − 2 × 5 ≠ 0'),
        ).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });
  });

  test.describe('CMS components - English', () => {
    let allTheThingsPage: AllTheThingsPage;

    test.beforeEach(async ({page}) => {
      allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
      await allTheThingsPage.goto();
    });

    test.describe('people collection', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('People Collection');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {
          region: component,
          fully: true,
        });
      });
    });

    test.describe('column', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Column');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('container', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Container');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('rich text', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Rich Text');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders', async () => {
        await expect(component.getByText('Normal text')).toBeVisible();
        await expect(component.getByText('Bold text')).toBeVisible();
        await expect(
          component.getByText('Multiline complex text'),
        ).toBeVisible();

        await expect(component.getByText('Normal link')).toBeVisible();
        await expect(component.getByText('Bold link')).toBeVisible();

        await expect(component.getByRole('list')).toHaveCount(2);

        await expect(component.getByRole('table')).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });
  });
});
