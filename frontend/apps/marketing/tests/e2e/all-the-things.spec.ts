import {AxeBuilder} from '@axe-core/playwright';
import {expect, Locator} from '@playwright/test';

import {EXPECTED_LOCALIZATION_STRINGS} from './config/i18n';
import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';

test.describe('All the things UI e2e test', () => {
  test.describe('a11y', () => {
    test('should have no accessibility violations', async ({page}) => {
      const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
      await allTheThingsPage.goto();

      const accessibilityScanResults = await new AxeBuilder({page}).analyze(); // 4

      // Do not allow any more accessibility errors. If you fixed one, reduce the number below.
      if (accessibilityScanResults.violations.length > 0) {
        // Log out the violations so we can fix them
        // The current allowed violations are:
        // 1. color contrast on overline
        console.warn(
          JSON.stringify(accessibilityScanResults.violations, null, 2),
        );

        expect(accessibilityScanResults.violations.length).toEqual(1);
      }
    });
  });

  test('should have the correct top level SEO metadata', async ({page}) => {
    const allTheThingsPage = new AllTheThingsPage(page, 'en-US');
    await allTheThingsPage.goto();

    expect(await allTheThingsPage.pageTitle).toBe(
      '⛔️ [ENGINEERING ONLY] UI Integration Testing - SEO',
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
    expect(await allTheThingsPage.getOpenGraph('image')).toBe(
      'https://images.ctfassets.net/90t6bu6vlf76/4mNRGSevP1JdG2th62NXfs/9ac89df80ecfc67309b06003f74864ba/ai-and-oceans-cover.png',
    );
    expect(await allTheThingsPage.getOpenGraph('image:width')).toBe('1600');
    expect(await allTheThingsPage.getOpenGraph('image:height')).toBe('900');
    expect(await allTheThingsPage.getOpenGraph('type')).toBe('website');
  });

  Object.entries(EXPECTED_LOCALIZATION_STRINGS).forEach(([locale, entry]) => {
    test.describe(`Localization - ${locale}`, () => {
      let component: Locator;

      test.beforeEach(async ({page}) => {
        const allTheThingsPage = new AllTheThingsPage(page, locale);
        await allTheThingsPage.goto();

        component = allTheThingsPage.getSectionLocator('Localization');
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
      allTheThingsPage = new AllTheThingsPage(page, 'en-US');
      await allTheThingsPage.goto();
    });

    test.describe('action block', () => {
      let component: Locator;

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Action Block');
      });

      test('renders action block', async () => {
        const overline = component.getByText('K-12 Teachers');
        const title = component.getByText('TEST - Self-Paced PL');
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

    test.describe('full width action block', () => {
      let component: Locator;

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator(
          'Full Width Action Block',
        );
      });

      test('renders full width action block', async () => {
        const overline = component.getByText('K-12 Teachers');
        const title = component.getByText('TEST - Self-Paced PL');
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

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Button');
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

    test.describe('divider', () => {
      let component: Locator;

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Divider');
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

    test.describe('heading', () => {
      let component: Locator;

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Heading');
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

    test.describe('image', () => {
      let component: Locator;

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Image');
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

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Overline');
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

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Paragraph');
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

    test.describe('text link', () => {
      let component: Locator;

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Text Link');
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

      test.beforeEach(() => {
        component = allTheThingsPage.getSectionLocator('Video');
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
