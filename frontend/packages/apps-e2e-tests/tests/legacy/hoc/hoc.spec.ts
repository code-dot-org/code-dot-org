import {expect, test} from '@playwright/test';

import {HocLevel} from '../clearpuzzle/HocLevel';

import {TWO_MOVE_FORWARD_BLOCKS} from './blocks';

/**
 * Hour of Code — anonymous client-side progress and state management.
 *
 * Source: dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code.feature
 *         dashboard/test/ui/features/student_learning/hour_of_code/hoc_reset.feature
 *
 * All scenarios run anonymously (no auth).  Progress is stored client-side;
 * hoc/reset clears it to a fresh state before each test.
 *
 * Four scenarios from hour_of_code.feature:
 *   1. Solving puzzle 1 saves progress in header, course overview, and level source.
 *   2. Failing puzzle 1 marks progress as "attempted".
 *   3. Video at puzzle 10 not re-shown after first viewing.
 *   4. Callouts at puzzle 9 not re-shown after first viewing.
 *
 * One scenario from hoc_reset.feature:
 *   5. hoc/reset always clears videos, callouts, and level progress.
 */

test.describe('Hour of Code — anonymous progress tracking', () => {
  test.beforeEach(async ({page}) => {
    // Mirrors: Background "Given I am on http://studio.code.org/hoc/reset"
    await page.goto('/hoc/reset');
  });

  test('solving puzzle 1 saves progress and level source', async ({page}) => {
    const hoc = new HocLevel(page);

    await hoc.loadLevel(1);

    await hoc.loadBlocks(TWO_MOVE_FORWARD_BLOCKS);
    await hoc.run();

    await page.locator('.modal').waitFor({state: 'visible'});
    await expect(page.locator('.modal .congrats')).toContainText(
      'You completed Puzzle 1.',
    );

    // Closing the congrats stays on the same level (no auto-advance for anon).
    await page.locator('#x-close').click();
    await page.locator('.modal').waitFor({state: 'hidden'});
    expect(page.url()).toContain('/hoc/1');

    // Navigate to hoc/2 and verify progress bubble for level 1 is perfect.
    await hoc.loadLevel(2);
    await hoc.expectProgressInHeader(1, 'perfect');

    // Course overview for hourofcode unit 1 should also reflect perfect.
    await page.goto('/courses/hourofcode/units/1');
    await page.locator('.user-stats-block').waitFor({state: 'visible'});
    await hoc.expectProgressOnOverview(1, 1, 'perfect');

    // A different course should show level 1 as not_tried (progress is scoped).
    // Original feature only waits for URL, not #runButton — progress bubbles are
    // in the header which loads before the lab itself.
    await page.goto(
      '/courses/20-hour/units/1/lessons/2/levels/2?noautoplay=true',
    );
    await page.waitForURL(/\/courses\/20-hour\//);
    await page
      .locator('.header_level .progress-bubble')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await hoc.expectProgressInHeader(1, 'not_tried');

    // Back on hoc/1 the solved blocks should still be in the workspace.
    await hoc.loadLevel(1);
    await hoc.expectBlockIsChildOf('moveForward', 'startBlock');

    // After hoc/reset the workspace reverts to the default (no saved blocks).
    await page.goto('/hoc/reset');
    await hoc.loadLevel(1);
    await expect(
      page.locator("g[data-id='startBlock'] g[data-id='moveForward']"),
    ).not.toBeAttached();
  });

  test('failing puzzle 1 shows attempted progress bubble', async ({page}) => {
    const hoc = new HocLevel(page);

    await hoc.loadLevel(1);

    // Run with default (empty) workspace — bird stays put, level fails.
    await hoc.run();
    await page
      .locator('.uitest-topInstructions-inline-feedback')
      .waitFor({state: 'visible'});

    await page.reload();
    await page.locator('#runButton').waitFor({state: 'visible'});
    await hoc.expectProgressInHeader(1, 'attempted');

    // Course overview should also reflect attempted.
    await page.goto('/courses/hourofcode/units/1');
    await page.locator('.user-stats-block').waitFor({state: 'visible'});
    await hoc.expectProgressOnOverview(1, 1, 'attempted');
  });

  test(
    'video at puzzle 10 not re-shown after first viewing',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Level 10 has an intro video — load without noautoplay so it fires.
      await page.goto('/hoc/10');
      await page.locator('.video-modal').waitFor({state: 'visible'});
      await page.locator('#x-close').click();
      await page.locator('.video-modal').waitFor({state: 'hidden'});

      // Navigate away and return.
      await page.goto('/hoc/11');
      await page.waitForURL(/\/hoc\/11/);
      await page.locator('#runButton').waitFor({state: 'visible'});

      await page.goto('/hoc/10');
      await page.waitForURL(/\/hoc\/10/);
      await page.locator('#runButton').waitFor({state: 'visible'});

      // Video must NOT reappear.
      await expect(page.locator('.video-modal')).toBeHidden();

      // Reference-area link is accessible after the auto-video is suppressed.
      await page.locator('.reference_area a').last().click();
    },
  );

  test('callouts at puzzle 9 not re-shown after first viewing', async ({
    page,
  }) => {
    await page.goto('/hoc/9?noautoplay=true');
    await page.locator('#runButton').waitFor({state: 'visible'});

    // The first-visit callout about grey blocks should appear.
    await expect(
      page.locator('.qtip-content', {hasText: 'Blocks that are grey'}),
    ).toBeVisible();

    // Navigate away and return.
    await page.goto('/hoc/10?noautoplay=true');
    await page.waitForURL(/\/hoc\/10/);
    await page.goto('/hoc/9?noautoplay=true');
    await page.waitForURL(/\/hoc\/9/);
    await page.locator('#runButton').waitFor({state: 'visible'});

    // Callout must NOT reappear on second visit.
    await expect(
      page.locator('.qtip-content', {hasText: 'Blocks that are grey'}),
    ).not.toBeAttached();
  });
});

test.describe('Hour of Code — hoc/reset', () => {
  /**
   * Source: hoc_reset.feature
   * hoc/reset always re-triggers the intro video and callouts regardless of
   * prior navigation state.
   */
  test('hoc/reset clears videos, callouts, and level progress', async ({
    page,
  }) => {
    // First visit to hoc/reset: intro video and callout appear.
    await page.goto('/hoc/reset');
    await page.locator('.video-modal').waitFor({state: 'visible'});
    await page.locator('#x-close').click();
    await page.locator('.video-modal').waitFor({state: 'hidden'});
    await expect(page.locator('.cdo-qtips').first()).toBeVisible();

    // Simulate some mid-course navigation.
    await page.goto('/hoc/2');
    await page.waitForURL(/\/hoc\/2/);
    await page.goto('/hoc/1');
    await page.waitForURL(/\/hoc\/1/);

    // Second hoc/reset: video and callout must reappear (state fully cleared).
    await page.goto('/hoc/reset');
    await page.locator('.video-modal').waitFor({state: 'visible'});
    await page.locator('#x-close').click();
    await page.locator('.video-modal').waitFor({state: 'hidden'});
    await expect(page.locator('.cdo-qtips').first()).toBeVisible();
  });
});
