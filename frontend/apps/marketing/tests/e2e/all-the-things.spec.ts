import {AxeBuilder} from '@axe-core/playwright';
import {expect, Locator} from '@playwright/test';

import {EXPECTED_LOCALIZATION_STRINGS} from './config/i18n';
import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';
import {type Section} from './pom/all-the-things';
import {MarketingPage} from './pom/marketing';

test.describe('All the things UI e2e test', () => {
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

      await page.waitForURL('**/zh-TW/engineering/all-the-things');
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

      await allTheThingsPage.goto('/zh-TW/engineering/all-the-things');

      // The middleware should send us back to /zh-TW with the language_ cookie set via the previous visit
      await allTheThingsPage.goto('/engineering/all-the-things');
      await page.waitForURL('**/zh-TW/engineering/all-the-things');
    });

    test.describe('accept-language header', () => {
      test.use({
        locale: 'zh-TW',
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

        await page.waitForURL('**/zh-TW/engineering/all-the-things');
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
      /https:\/\/contentful-images\.code\.org\/90t6bu6vlf76\/4hXiOPiRlCXpmtypRNOZqc\/(.*)\/engineering-only-opengraph-default\.png\?fm=webp/,
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

    test.describe('action block', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Action Block');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders action block', async () => {
        const overline = component.getByText('K-12 Teachers');
        const title = component.getByText('❌ [ENG] Self-Paced PL 1');
        const description = component.getByText(
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
        );
        const image = component.locator('img[alt=""]');
        const primaryButton = component.getByText('Primary button test');
        const secondaryButton = component.getByText('Secondary button test');
        const externalLinkButton = component.getByText(
          'External link button test',
        );

        expect(await overline.count()).toBeGreaterThan(0);
        expect(await title.count()).toBeGreaterThan(0);
        expect(await description.count()).toBeGreaterThan(0);
        expect(await image.count()).toBeGreaterThan(0);
        expect(await primaryButton.count()).toBeGreaterThan(0);
        expect(await secondaryButton.count()).toBeGreaterThan(0);
        expect(await externalLinkButton.count()).toBeGreaterThan(0);
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('action block pattern default', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Action Block Pattern Default',
        );
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('action block pattern hidden elements', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Action Block Pattern Hidden Elements',
        );
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('full width action block', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Full Width Action Block',
        );
        await component.scrollIntoViewIfNeeded();
      });

      test('renders full width action block', async () => {
        const overline = component.getByText('K-12 Teachers');
        const title = component.getByText('❌ [ENG] Self-Paced PL 1');
        const description = component.getByText(
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
        );
        const image = component.locator('img[alt=""]');
        const primaryButton = component.getByText('Primary button test');
        const secondaryButton = component.getByText('Secondary button test');
        const externalLinkButton = component.getByText(
          'External link button test',
        );

        expect(await overline.count()).toBeGreaterThan(0);
        expect(await title.count()).toBeGreaterThan(0);
        expect(await description.count()).toBeGreaterThan(0);
        expect(await image.count()).toBeGreaterThan(0);
        expect(await primaryButton.count()).toBeGreaterThan(0);
        expect(await secondaryButton.count()).toBeGreaterThan(0);
        expect(await externalLinkButton.count()).toBeGreaterThan(0);
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('button', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Button');
        await component.scrollIntoViewIfNeeded();
      });

      test('internal primary button should go to website in same tab', async ({
        page,
      }) => {
        const button = component.getByRole('link', {name: 'Primary Button'});

        await button.click();

        await page.waitForURL('**/ping');
      });

      test('internal secondary button should go to website in same tab', async ({
        page,
      }) => {
        const button = component.getByRole('link', {
          name: 'Secondary Black Button',
        });

        await button.click();

        await page.waitForURL('**/ping');
      });

      test('external link opens to new tab', async ({page}) => {
        // Start waiting for new page before clicking. Note no await.
        const popupPromise = page.waitForEvent('popup');

        const button = component.getByRole('link', {name: 'External Button'});

        await button.click();
        // Grab the popup page
        const newPage = await popupPromise;

        expect(newPage.url()).toBe('about:blank');
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    ['Action Block Carousel', 'Image Carousel', 'Video Carousel'].forEach(
      carousel => {
        test.describe(carousel.toLowerCase(), () => {
          let component: Locator;

          test.beforeEach(async () => {
            component = allTheThingsPage.getSectionLocator(carousel as Section);
            await component.scrollIntoViewIfNeeded();
          });

          test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
            await eyes.check(testInfo.title, {
              region: component,
              fully: true,
            });
          });
        });
      },
    );

    ['Action Block Collection', 'Logo Collection', 'People Collection'].forEach(
      carousel => {
        test.describe(carousel.toLowerCase(), () => {
          let component: Locator;

          test.beforeEach(async () => {
            component = allTheThingsPage.getSectionLocator(carousel as Section);
            await component.scrollIntoViewIfNeeded();
          });

          test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
            await eyes.check(testInfo.title, {
              region: component,
              fully: true,
            });
          });
        });
      },
    );

    test.describe('divider', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Divider');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders', async () => {
        // There are two dividers, ensure they both are visible
        const separatorLocator = component.getByRole('separator');
        await expect(separatorLocator).toHaveCount(2);

        const separators = await separatorLocator.all();

        for (const separator of separators) {
          await expect(separator).toBeVisible();
        }
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('editorial card', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Editorial Card');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders', async () => {
        const imageLocator = component.locator('img[alt=""]');
        await expect(imageLocator).toHaveCount(7);
        for (const image of await imageLocator.all()) {
          await expect(image).toBeVisible();
        }

        const iconsLocator = component.locator(
          'i.fa-circle-1, i.fa-circle-2, i.fa-circle-3',
        );
        await expect(iconsLocator).toHaveCount(3);
        for (const icon of await iconsLocator.all()) {
          await expect(icon).toBeVisible();
        }
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('faq accordion', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('FAQ Accordion');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders', async () => {
        const accordionButtons = component.getByRole('button', {name: /.+/});

        await expect(accordionButtons).toHaveCount(3);

        for (const button of await accordionButtons.all()) {
          await expect(button).toBeVisible();
        }
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        const accordionButtons = component.getByRole('button', {name: /.+/});

        for (const button of await accordionButtons.all()) {
          await button.click();
        }

        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('heading', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Heading');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders', async () => {
        // There are six headers, ensure they are visible
        const headerLocator = component.getByRole('heading');
        await expect(headerLocator).toHaveCount(6);

        const headerLocators = await headerLocator.all();

        for (const header of headerLocators) {
          await expect(header).toBeVisible();
        }
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('hero banner basic', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Hero Banner Basic');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders', async () => {
        const heading = component.getByText('Hero Banner Basic');
        const subheading = component.getByText('Hero banner subheading');
        const description = component.getByText(
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
        );
        const button = component.getByText('Primary Button');
        await expect(heading).toBeVisible();
        await expect(subheading).toBeVisible();
        await expect(description).toBeVisible();
        await expect(button).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('hero banner with background color', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Hero Banner with Background Color',
        );
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('hero banner with background image', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Hero Banner with Background Image',
        );
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('hero banner with image big', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Hero Banner with Image Big',
        );
        await component.scrollIntoViewIfNeeded();

        const image = component.locator('img[alt=""]');
        await expect(image).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('hero banner with image small', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Hero Banner with Image Small',
        );
        await component.scrollIntoViewIfNeeded();

        const image = component.locator('img[alt=""]');
        await expect(image).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('hero banner with video', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Hero Banner with Video',
        );
        await component.scrollIntoViewIfNeeded();

        const playButton = component.getByAltText(
          "Play video What Most Schools Don't Teach",
        );
        await expect(playButton).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('hero banner with partner callout', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Hero Banner with Partner Callout',
        );
        await component.scrollIntoViewIfNeeded();

        const partnerCallout = component.getByText('In partnership with');
        await expect(partnerCallout).toBeVisible();
        const partnerLogo = component.locator('img[alt=""]');
        await expect(partnerLogo).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('hero banner with announcement banner', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator(
          'Hero Banner with Announcement Banner',
        );
        await component.scrollIntoViewIfNeeded();

        const announcementBannerText = component.getByText(
          'This is an announcement banner!',
        );
        const announcementBannerLink = component.getByText(
          'Announcement banner link',
        );
        await expect(announcementBannerText).toBeVisible();
        await expect(announcementBannerLink).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('icon highlight', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Icon Highlight');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('image', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Image');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders all images with correct alt text', async () => {
        const altText = ['', 'Image with border', 'Image with shadow'];

        for (const alt of altText) {
          const image =
            alt === ''
              ? component.locator('img[alt=""]')
              : component.getByRole('img', {name: alt});

          await image.scrollIntoViewIfNeeded();
          await expect(image).toBeVisible();
        }
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('overline', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Overline');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders', async () => {
        await expect(
          component.getByText('Overline Primary Medium'),
        ).toBeVisible();
        await expect(
          component.getByText('Overline Secondary Small'),
        ).toBeVisible();
        await expect(
          component.getByText('Overline Primary Large'),
        ).toBeVisible();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('paragraph', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Paragraph');
        await component.scrollIntoViewIfNeeded();
      });

      test('renders', async () => {
        await expect(component.getByText('Paragraph Body XS')).toBeVisible();
        await expect(
          component.getByText('Paragraph Secondary Medium'),
        ).toBeVisible();
        await expect(
          component.getByText('Paragraph Secondary Bold'),
        ).toBeVisible();
        await expect(component.getByText('Lorem ipsum')).toBeVisible();
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

    [
      'Section - Dark Gray',
      'Section - Pattern Dark',
      'Section - Pattern Teal',
    ].forEach(carousel => {
      test.describe(carousel.toLowerCase(), () => {
        let component: Locator;

        test.beforeEach(async () => {
          component = allTheThingsPage.getSectionLocator(carousel as Section);
          await component.scrollIntoViewIfNeeded();
        });

        test('eyes', {tag: '@eyes'}, async ({eyes, browserName}, testInfo) => {
          // Skip the test on Safari for 'Section - Dark Gray' since it's taking
          // too long to render and causing timeouts.
          test.skip(
            carousel === 'Section - Dark Gray' && browserName === 'webkit',
            'Skipping Section - Dark Gray on Safari',
          );

          await eyes.check(testInfo.title, {
            region: component,
            fully: true,
          });
        });
      });
    });

    test.describe('simple list', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Simple List');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('skinny banner', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Skinny Banner');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('snapshot', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Snapshot');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('tab group', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Tab Group');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('testimonial', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Testimonial');
        await component.scrollIntoViewIfNeeded();
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('text link', () => {
      let component: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Text Link');
        await component.scrollIntoViewIfNeeded();
      });

      Array.of(
        'Internal link XS',
        'Internal Link S',
        'Internal Link M',
      ).forEach(linkText => {
        test(`opens internal page - ${linkText}`, async ({page}) => {
          const link = component.getByText(linkText);

          await link.click();
          await page.waitForURL('**/ping');
        });
      });

      test('opens external page in new tab', async ({page}) => {
        // Start waiting for new page before clicking. Note no await.
        const popupPromise = page.waitForEvent('popup');

        const link = component.getByText('External Link L');

        await link.click();
        // Grab the popup page
        const newPage = await popupPromise;

        expect(newPage.url()).toBe('about:blank');
      });

      test('eyes', {tag: '@eyes'}, async ({eyes}, testInfo) => {
        await eyes.check(testInfo.title, {region: component});
      });
    });

    test.describe('video', () => {
      let component: Locator;
      const videoCaptions = [/^$/, 'Video without Fallback'];

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Video');
        await component.scrollIntoViewIfNeeded();
      });

      // The default drop in has no caption
      videoCaptions.forEach(caption => {
        test(`should render video with caption '${caption}'`, async () => {
          const video = component
            .getByRole('figure')
            .filter({hasText: caption});
          await expect(video).toBeVisible();

          // Play Button should display
          const playButton = video.getByLabel('Play Video', {exact: false});
          await expect(playButton).toBeVisible();

          // Clicking the play button should start the video
          if (caption === 'Video without Fallback') {
            await playButton.click();

            // Video Facade and Play Button will go away and be replaced with a video
            await expect(playButton).not.toBeVisible();

            // Ensure YouTube loaded
            const youtubeIFrameLocator = video.locator('iframe');

            // Expect the iframe to be there
            await expect(youtubeIFrameLocator).toBeVisible();
          }
        });
      });

      test('video with fallback', async () => {
        const video = component
          .getByRole('figure')
          .filter({hasText: 'Video with Fallback'});
        await expect(video).toBeVisible();
      });

      // No eyes tests were made for Video, this is intentional - it relies on YouTube which is subject to change.
      // Instead, Video is tested in Storybook more rigorously. The scope of this test is to ensure the video component
      // renders.
    });

    /**
     * Ensure Video Carousel can be hooked to Contentful items array
     */
    test.describe('video carousel', () => {
      let component: Locator;
      let howAIWorksVideo: Locator;
      let whatMostSchoolsDontTeachVideo: Locator;
      let computerScienceIsChangingEverythingVideo: Locator;
      let introducingHowComputersWorkVideo: Locator;

      test.beforeEach(async () => {
        component = allTheThingsPage.getSectionLocator('Video Carousel');
        await component.scrollIntoViewIfNeeded();

        howAIWorksVideo = component.getByText('Introducing How AI Works');
        whatMostSchoolsDontTeachVideo = component.getByText(
          "What Most Schools Don't Teach",
        );
        computerScienceIsChangingEverythingVideo = component.getByText(
          'Computer Science is Changing Everything',
        );
        introducingHowComputersWorkVideo = component.getByText(
          'Introducing How Computers Work',
        );
      });

      test('renders', async () => {
        await expect(howAIWorksVideo).toBeInViewport();
        await expect(whatMostSchoolsDontTeachVideo).toBeInViewport();
        await expect(
          computerScienceIsChangingEverythingVideo,
        ).not.toBeInViewport();
        await expect(introducingHowComputersWorkVideo).not.toBeInViewport();
      });

      test('can paginate', async () => {
        // wait for slides to load
        await expect(howAIWorksVideo).toBeInViewport();
        await expect(whatMostSchoolsDontTeachVideo).toBeInViewport();

        // go to second page
        const nextButton = component.getByLabel('Next slide');
        await nextButton.click();

        await expect(howAIWorksVideo).not.toBeInViewport();
        await expect(whatMostSchoolsDontTeachVideo).not.toBeInViewport();
        await expect(computerScienceIsChangingEverythingVideo).toBeInViewport();
        await expect(introducingHowComputersWorkVideo).toBeInViewport();

        // go back to first page
        const previousButton = component.getByLabel('Previous slide');
        await previousButton.click();

        await expect(howAIWorksVideo).toBeInViewport();
        await expect(whatMostSchoolsDontTeachVideo).toBeInViewport();
        await expect(
          computerScienceIsChangingEverythingVideo,
        ).not.toBeInViewport();
        await expect(introducingHowComputersWorkVideo).not.toBeInViewport();
      });

      // No eyes tests were made for Video Carousel, this is intentional - it relies on YouTube which is subject to change.
      // Instead, Video Carousel is tested in Storybook more rigorously. The scope of this test is to ensure the component
      // renders and basic functionality works.
    });
  });
});
