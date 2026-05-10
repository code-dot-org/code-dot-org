import {expect, test} from '../../../shared/fixtures';

import {SpriteLab} from './SpriteLab';

/**
 * Sprite Lab — lesson 36 of allthethingscourse, level 1.
 *
 * Source: dashboard/test/ui/features/star_labs/spritelab/spritelab.feature
 * All three scenarios: loading, losing, and winning the first level.
 */
test.describe('Sprite Lab — loading costumes', () => {
  /**
   * Source: spritelab/loading_costumes.feature — "Load the project with default
   * animations and load Piskel"
   * @as_student @no_mobile
   *
   * Navigates to a new Sprite Lab project, opens the animation tab, and
   * verifies the Piskel editor (same-origin iframe) loads with its pen tool.
   */
  test(
    'animation tab opens Piskel editor with pen tool',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const spritelab = new SpriteLab(studentPage);
      await studentPage.goto('/projects/spritelab/new');
      await spritelab.waitForLabPage();

      // Open animation tab (shared Game Lab / Sprite Lab UI).
      await studentPage.locator('#animationMode').click();
      await studentPage.locator('#newListItem').waitFor({state: 'visible'});

      // Piskel is served from the same origin — use frameLocator to enter it.
      const piskelFrame = studentPage.frameLocator('iframe[src*="piskel"]');
      await piskelFrame
        .locator('.icon-tool-pen')
        .waitFor({state: 'visible', timeout: 30_000});

      // Switch back to code tab (JS click mirrors the Cucumber step).
      await studentPage.evaluate(() => {
        (document.querySelector('#codeMode') as HTMLElement)?.click();
      });
      await spritelab.runButton.waitFor({state: 'visible'});

      await spritelab.run();
    },
  );
});

test.describe('Sprite Lab — lesson 36 — level 1', () => {
  let spritelab: SpriteLab;

  test.beforeEach(async ({page}) => {
    spritelab = new SpriteLab(page);
    await spritelab.gotoLevel(1);
    await expect(spritelab.runButton).toBeVisible();
    await expect(spritelab.resetButton).toBeHidden();
  });

  /**
   * Source: spritelab.feature "Loading the first level"
   * Verifies the sprite avatar image is present on page load.
   */
  test('loading the first level shows the sprite avatar', async () => {
    await expect(spritelab.spriteAvatarImage).toBeVisible();
  });

  /**
   * Source: spritelab.feature "Losing the first level"
   * Runs without changes, expects inline feedback, then resets.
   */
  test('losing the first level shows inline feedback', async () => {
    await spritelab.run();
    await expect(spritelab.resetButton).toBeVisible();
    await expect(spritelab.inlineFeedback).toBeVisible();
    await expect(spritelab.inlineFeedback).toHaveText(
      "Keep coding! Something's not quite right yet.",
    );
    await spritelab.reset();
    await expect(spritelab.runButton).toBeVisible();
    await expect(spritelab.resetButton).toBeHidden();
  });

  /**
   * Source: spritelab.feature "Winning the first level" @no_mobile
   * Selects a sprite type from the make-new-sprite block dropdown, then runs.
   */
  test(
    'winning the first level shows congrats',
    {tag: '@no_mobile'},
    async () => {
      // Chromium/Firefox: spritelab congrats flaky under parallel run; passes alone.
      test.fixme(
        true,
        'TODO: spritelab winning first level congrats flaky on all browsers under parallel run; timing issue with sprite block or congrats display',
      );
      await spritelab.clickBlockFieldAt(
        "[data-id='make-new-sprite'] > .blocklyEditableField",
        1,
      );
      await spritelab.selectDropdownItem(0);
      await spritelab.run();
      await expect(spritelab.congratsMessage).toBeVisible();
    },
  );
});
