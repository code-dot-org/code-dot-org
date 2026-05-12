import {type Page} from '@playwright/test';
import path from 'path';

import {expect, test} from '../../shared/fixtures';

/**
 * Manage Assets dialog — Game Lab and WebLab scenarios.
 *
 * Source: dashboard/test/ui/features/star_labs/manage_assets.feature
 *
 * Fixture files live in dashboard/test/fixtures/.
 * The hidden file input (.uitest-hidden-uploader) can receive setInputFiles
 * directly — no need to unhide the element first.
 */

const FIXTURES = path.resolve(
  __dirname,
  '../../../../../../dashboard/test/fixtures',
);

/**
 * Open the Manage Assets dialog from the Game Lab settings cog.
 * Mirrors `I open the Manage Assets dialog` from settings_cog_steps.rb:
 *   click .settings-cog → click first .ui-test-settings-cog-menu-item
 *
 * @param page - Playwright page with a Game Lab level loaded
 */
async function openManageAssetsDialog(page: Page): Promise<void> {
  await page
    .locator('.settings-cog')
    .first()
    .waitFor({state: 'visible', timeout: 15_000});
  await page.locator('.settings-cog').first().click();
  await page
    .locator('.ui-test-settings-cog-menu-item')
    .first()
    .waitFor({state: 'visible', timeout: 10_000});
  await page.locator('.ui-test-settings-cog-menu-item').first().click();
}

test.describe('Manage Assets', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/manage_assets.feature
   * Scenario: The manage assets dialog contains the option to record audio on Chrome
   *
   * The source Cucumber scenario remains @no_firefox, but this Playwright
   * assertion only checks that the record-audio entry point is visible.
   */
  test('manage assets dialog has record audio button', async ({
    studentPage,
  }) => {
    await studentPage.goto('/projects/gamelab/new');
    await studentPage
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await openManageAssetsDialog(studentPage);

    await expect(studentPage.locator('#record-asset')).toBeVisible({
      timeout: 15_000,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/manage_assets.feature
   * Scenario: The manage assets dialog displays the audio preview, and toggles between play and pause button.
   *
   * Upload test_audio.mp3 → row with filename visible → thumbnail visible →
   * play icon visible.
   */
  test('manage assets dialog shows audio preview after upload', async ({
    studentPage,
  }) => {
    await studentPage.goto('/projects/gamelab/new');
    await studentPage
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await openManageAssetsDialog(studentPage);

    await expect(studentPage.locator('#upload-asset')).toBeVisible({
      timeout: 10_000,
    });

    await studentPage
      .locator('.uitest-hidden-uploader')
      .setInputFiles(path.join(FIXTURES, 'test_audio.mp3'));

    await expect(
      studentPage.locator('.assetRow td').filter({hasText: 'test_audio.mp3'}),
    ).toBeVisible({timeout: 20_000});
    await expect(studentPage.locator('.assetThumbnail')).toBeVisible();
    await expect(studentPage.locator('.fa-circle-play')).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: manage_assets.feature
   * "The manage assets dialog displays an image thumbnail and opens in a new
   *  tab when clicked"
   *
   * Upload artist_image_1.png → row with filename visible → click the image
   * thumbnail → new tab URL matches /v3/assets/.* /artist_image_1.png.
   */
  test('manage assets dialog opens image in new tab when thumbnail clicked', async ({
    studentPage,
  }) => {
    await studentPage.goto('/projects/gamelab/new');
    await studentPage
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await openManageAssetsDialog(studentPage);

    await expect(studentPage.locator('#upload-asset')).toBeVisible({
      timeout: 10_000,
    });

    await studentPage
      .locator('.uitest-hidden-uploader')
      .setInputFiles(path.join(FIXTURES, 'artist_image_1.png'));

    await expect(
      studentPage
        .locator('.assetRow td')
        .filter({hasText: 'artist_image_1.png'}),
    ).toBeVisible({timeout: 20_000});

    // Click thumbnail — opens asset URL in a new tab.
    const [newTab] = await Promise.all([
      studentPage.context().waitForEvent('page'),
      studentPage.locator('#ui-image-thumbnail').click(),
    ]);
    await newTab.waitForLoadState('load', {timeout: 20_000});
    expect(newTab.url()).toMatch(/\/v3\/assets\/.*\/artist_image_1\.png/);
  });

  /**
   * Migration status: COMPLETED
   * Source: manage_assets.feature
   * "From WebLab, the manage assets dialog does not contain the option to
   *  record audio."
   *
   * WebLab's add-image button opens the asset manager without the record-audio
   * option (which requires a microphone API available only in Chrome/Safari).
   */
  test('WebLab manage assets dialog has no record audio button', async ({
    studentPage,
  }) => {
    await studentPage.goto('/projects/weblab/new');

    await studentPage
      .locator('#ui-test-add-image')
      .waitFor({state: 'visible', timeout: 30_000});
    await studentPage.locator('#ui-test-add-image').click();

    await expect(studentPage.locator('#record-asset')).not.toBeVisible({
      timeout: 10_000,
    });
  });
});
