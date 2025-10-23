import {expect, Page} from '@playwright/test';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';
import {getSiteType} from './utils/getSiteType';

async function waitForImages(page: Page) {
  const lazyImages = await page.locator('img[loading="lazy"]:visible').all();

  for (const lazyImage of lazyImages) {
    await lazyImage.scrollIntoViewIfNeeded();
    await expect(lazyImage).toHaveJSProperty('complete', true);
  }
}

async function assertFlappyGame(page: Page) {
  await expect(
    page.getByRole('img', {name: 'Make a Flappy game'}),
  ).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Make a Flappy game');
  await expect(page.getByRole('main')).toContainText('Computer Science only');
  const startTutorialButton = page.getByLabel('Make a Flappy game tutorial');

  await expect(startTutorialButton).toBeVisible();
  await expect(startTutorialButton).toHaveAttribute(
    'href',
    'http://studio.code.org/s/flappy/reset',
  );
}

test.describe('Activity Catalog', () => {
  test('should filter activities', {tag: '@csforall'}, async ({page}) => {
    test.skip(getSiteType() !== 'csforall', 'Only runs on csforall site');

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/activities/hour-of-code');

    // Wait for activity catalog to be visible
    await expect(
      page.getByRole('heading', {name: 'Explore Hour of Code Activities'}),
    ).toBeVisible();
    await expect(page.getByPlaceholder('Search...')).toBeVisible();

    // Wait for lazy loaded images to load
    await waitForImages(page);

    // Click the "13-18" label element
    await page.locator('label').filter({hasText: '13-18'}).click();

    // Click the "Computer Science only" check box
    await page.getByLabel('Computer Science only').check();

    // Ensure the query parameters updated with the selected facets
    await page.waitForURL(
      '**/en-US/activities/hour-of-code?term=&ages=13-18&topic=Computer%2520Science%2520only',
    );
    await assertFlappyGame(page);

    // Search for flappy (lower case on purpose to test case insensitivity)
    await page.getByPlaceholder('Search...').fill('flappy');

    await assertFlappyGame(page);

    // Search for something that doesn't exist
    await page.getByPlaceholder('Search...').fill('nonexistentactivity');

    // Ensure no results message is shown
    await expect(page.getByText('No activities found')).toBeVisible();
  });

  test('should deep link to activities', {tag: '@csforall'}, async ({page}) => {
    test.skip(getSiteType() !== 'csforall', 'Only runs on csforall site');

    const marketingPage = new MarketingPage(page);

    await marketingPage.goto(
      '/en-US/activities/hour-of-code?term=&ages=6-8&topic=Computer%2520Science%2520only&languageProgramming=Blocks',
    );

    // Ensure "6-8" checked
    await expect(page.getByLabel('6-8')).toBeChecked();

    // Ensure "Computer Science only" checked
    await expect(page.getByLabel('Computer Science only')).toBeChecked();

    await assertFlappyGame(page);
  });

  test('eyes', {tag: '@csforall'}, async ({page, eyes, browserName}) => {
    test.skip(browserName === 'webkit', 'AVIF does not work on Webkit');
    test.skip(getSiteType() !== 'csforall', 'Only runs on csforall site');

    const marketingPage = new MarketingPage(page);
    await marketingPage.goto('/activities/hour-of-code');

    // Wait for activity catalog to be visible
    await expect(
      page.getByRole('heading', {name: 'Explore Hour of Code Activities'}),
    ).toBeVisible();
    await expect(page.getByPlaceholder('Search...')).toBeVisible();

    // Wait for lazy loaded images to load
    await waitForImages(page);

    // Search for flappy (lower case on purpose to test case insensitivity)
    await page.getByPlaceholder('Search...').fill('flappy');

    await assertFlappyGame(page);

    await eyes.check('Activity Catalog');
  });
});
